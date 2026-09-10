import { motion } from 'framer-motion'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 纪录片实习（LEAD）「寻找未来的人」
//
// 视觉语法：整页做成一块 **剪辑软件的工作台（NLE）**——
//   • 左上角是「节目监视器」（Program Monitor）：循环播放的预告片，全场最大；
//   • 右上角是「信息/项目面板」：这支片子在拍什么 + 我在这支片子里做了什么（可滚动）；
//   • 下半屏是「素材箱 · BIN」：一排按场记命名的缩略图（拍摄 / 采访 / 编导 / 团队…），
//     鼠标经过像在时间线上掠过一段素材，会亮起并浮起。
//
// 与「综艺」那面墙的区别：这里不是随机撒图，而是**贴近真实剪辑台的功能分区**；
// 照片永远待在素材箱条带里，绝不会跑到监视器上遮住预告片。
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(3, '0')

// —— 纪录片幕后素材库 ——
// 由桌面「纪录片」文件夹导出：按场记语义命名 001..007（顺序即传入顺序）。
// 每张已压到最长边 1100px 的 webp（零裁切，保持原比例），PHYSICAL 记录其真实像素宽高。
const CLIPS = [
  { key: '拍摄', label: '拍摄 · 跟组实录' },
  { key: '采访', label: '采访 · 人物对话' },
  { key: '编导', label: '编导 · 结构梳理' },
  { key: '团队', label: '团队 · 协作现场' },
  { key: '学习', label: '学习 · 素材研读' },
  { key: '团建', label: '团建 · 团队日常' },
  { key: '加班', label: '加班 · 后期深夜' },
]
const SHOWN = CLIPS.length
const SHOTS = Array.from({ length: SHOWN }, (_, i) => `/doc-bts/thumbs/${pad(i + 1)}.webp`)

// 真实像素宽高（服务器上已生成的 001–007），仅用于让 <img> 保持原始比例
const PHYSICAL: Array<[number, number]> = [
  [825, 1100], // 001 竖 3:4
  [1100, 825], // 002 横 4:3
  [1100, 733], // 003 横 3:2
  [1100, 825], // 004 横 4:3
  [825, 1100], // 005 竖 3:4
  [1100, 825], // 006 横 4:3
  [825, 1100], // 007 竖 3:4
]
const NATIVE = PHYSICAL.map(([w, h]) => ({ w, h }))

// —— 介绍文案：这支片子在寻找什么 ——
const THEME = ['年轻人', '创业', '未来', '选择', '不确定性']
const WHY = [
  '我们试图寻找',
  '一个正在寻找未来的人。',
]

// —— 我在这支片子里做了什么（精简版，一屏可见） ——
const DUTIES: Array<{ tag: string; title: string; points: string[] }> = [
  {
    tag: '01',
    title: '项目统筹与内容制作',
    points: ['统筹全流程制作，协调采访、拍摄、后期，推动跨周期项目按期交付。', '筛选与粗剪素材，梳理人物主线，建立清晰素材结构。'],
  },
  {
    tag: '02',
    title: '内容传播与新媒体运营',
    points: ['从 0 到 1 搭建新媒体账号，把长片拆解为短视频矩阵。', '负责多条宣传物料制作，沉淀系列人物故事切片。'],
  },
]

const STATS: Array<{ k: string; v: string }> = [
  { k: '小红书获赞', v: '2000+' },
  { k: '小红书涨粉', v: '600+' },
  { k: 'B站播放', v: '7000+' },
]

/** 素材箱里的一块：缩略图（保持原比例，h 由图片自然高决定） */
interface BinShot {
  x: number
  y: number
  w: number
  h: number
}

/** 可复现伪随机：同一尺寸下位置稳定，不会每次重排 */
function seededRand(seedKey: string) {
  let h = 2166136261
  for (let i = 0; i < seedKey.length; i++) {
    h ^= seedKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    h |= 0
    let t = Math.imul(h ^ (h >>> 15), h | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * 把 7 张素材排成一条**时间线式素材轨**：从左到右按原比例一次排开，
 * 行内底部对齐（矮的沉底、高的顶到上沿），彼此等距、绝不重叠。
 * 若总宽超出条带（窄屏），则整体等比缩小到刚好放下；高度若超高再缩一次。
 */
function layoutBin(BW: number, BH: number, gap: number): BinShot[] {
  const rand = seededRand('doc-bin-1')
  // 竖图约占条带宽 9–11%，横图约占 13–16%（一条轨里横向素材天然更宽）
  const widths: number[] = NATIVE.map((d) => {
    const portrait = d.w / d.h < 1
    return BW * (portrait ? 0.09 + rand() * 0.02 : 0.13 + rand() * 0.03)
  })

  const sumW = widths.reduce((a, b) => a + b, 0) + gap * (SHOWN - 1)
  // 宽度先缩到能一条排下
  let scale = sumW > BW ? BW / sumW : 1

  // 行高（最高的一张定轨高），再按条带高度收紧一次
  const maxH = Math.max(...widths.map((w, i) => (w * scale) / (NATIVE[i].w / NATIVE[i].h)))
  if (maxH > BH) scale *= BH / maxH

  const totalW = widths.reduce((a, b) => a + b * scale, 0) + gap * (SHOWN - 1)
  const trackH = Math.max(...widths.map((w, i) => (w * scale) / (NATIVE[i].w / NATIVE[i].h)))
  const out: BinShot[] = []
  let x = Math.max(0, (BW - totalW) / 2)
  const baseY = Math.max(0, (BH - trackH) / 2)
  for (let i = 0; i < SHOWN; i++) {
    const w = widths[i] * scale
    const h = w / (NATIVE[i].w / NATIVE[i].h)
    // 底部对齐：所有素材踩在同一条基线（= 素材轨的下沿）
    out[i] = { x: Math.round(x), y: Math.round(baseY + trackH - h), w: Math.round(w), h: Math.round(h) }
    x += w + gap
  }
  return out
}

interface StageProps {
  onClose: () => void
}

export default function DocumentaryLeadStage({ onClose }: StageProps) {
  const binRef = useRef<HTMLDivElement>(null)
  const [bin, setBin] = useState<BinShot[]>([])
  const [muted, setMuted] = useState(true)

  const toggleMute = useCallback(() => setMuted((m) => !m), [])

  useLayoutEffect(() => {
    const box = binRef.current
    if (!box) return

    let raf = 0
    let lastKey = ''
    const run = () => {
      const bb = box.getBoundingClientRect()
      if (bb.width < 2 || bb.height < 2) return
      const key = `${Math.round(bb.width)}x${Math.round(bb.height)}`
      if (key === lastKey) return
      lastKey = key
      const gap = Math.max(10, Math.round(bb.width * 0.012))
      setBin(layoutBin(bb.width, bb.height, gap))
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(run)
    }

    schedule()
    const ro = new ResizeObserver(schedule)
    ro.observe(box)
    window.addEventListener('resize', schedule)
    const timers = [0, 120, 360, 800].map((t) => window.setTimeout(schedule, t))
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  return (
    <div
      className="relative my-auto flex w-full select-none flex-col overflow-hidden rounded-[26px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_rgba(4,8,14,0.55)]"
      style={{
        background:
          'radial-gradient(150% 130% at 78% -10%, #1b2637 0%, #101722 44%, #080b11 100%)',
      }}
    >
      {/* —— 顶部：剪辑软件菜单/工程名栏 —— */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5 sm:px-5">
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">
          Project · 寻找未来的人 / LOOKING FOR TOMORROW
        </span>
        <span className="ml-auto hidden items-center gap-2 sm:flex">
          <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7dd3fc]" />
          <span className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#7dd3fc]/80">
            4K · 24fps · Timeline 01
          </span>
        </span>
      </div>

      {/* —— 上半：左「节目监视器」+ 右「项目/信息面板」 —— */}
      <div className="grid gap-4 px-4 pb-3 pt-3.5 sm:px-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* 节目监视器：全场最大 —— 预告片 */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#ffd166]/80">
              Program Monitor
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            <span className="font-cartoon-latin rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-white/55">
              预告片 · TRAILER
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onClick={toggleMute}
            className="group relative cursor-pointer overflow-hidden rounded-[16px] border border-white/15 bg-black shadow-[0_0_0_5px_rgba(255,255,255,0.045),0_26px_60px_rgba(0,0,0,0.7),0_0_70px_rgba(125,211,252,0.22)]"
          >
            <video
              className="block aspect-video w-full object-cover"
              src="/doc-bts/trailer.mp4"
              autoPlay
              loop
              muted={muted}
              playsInline
              preload="metadata"
            />
            {/* 监视器安全框（点缀剪辑台的“画框感”） */}
            <span aria-hidden className="pointer-events-none absolute inset-[6%] rounded-[10px] border border-white/12" />
            {muted && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm">
                🔊 点击开启声音
              </span>
            )}
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_62%,rgba(0,0,0,0.5))]" />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                《 寻找未来的人 》先导预告
              </span>
            </span>
          </motion.div>

          {/* 节目监视器下方的一条“播放头/时码”装饰条 */}
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="font-cartoon-latin text-[10.5px] font-bold tracking-[0.18em] text-[#7dd3fc]/85">
              00:00:00:00
            </span>
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#ffd166]" />
              <i className="absolute -top-[3px] left-1/3 h-[10px] w-[3px] rounded-sm bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </span>
            <span className="font-cartoon-latin text-[10.5px] font-bold tracking-[0.18em] text-white/40">
              TRAILER
            </span>
          </div>
        </div>

        {/* 项目/信息面板：主题 + 我做了什么 */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#ff9ec4]/80">
              Project Notes
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2.5 rounded-[14px] border border-white/10 bg-white/[0.035] p-3.5 sm:p-4">
            {/* WHY HIM / HER? */}
            <div>
              <p className="font-cartoon-latin text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                Why him / her ?
              </p>
              <p
                className="mt-1 text-[16px] font-bold leading-snug text-[#fff6f0] sm:text-[17px]"
                style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
              >
                {WHY[0]}
              </p>
              <p
                className="text-[14.5px] font-bold leading-snug text-[#ffd9a8] sm:text-[15px]"
                style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
              >
                {WHY[1]}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {THEME.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#d8e6f2]/85"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* 我的职责 */}
            {DUTIES.map((d) => (
              <div key={d.tag}>
                <div className="flex items-center gap-2">
                  <span className="font-cartoon-latin flex h-5 w-5 flex-none items-center justify-center rounded-md bg-gradient-to-br from-[#7dd3fc] to-[#ffd166] text-[10.5px] font-black text-[#0a1220]">
                    {d.tag}
                  </span>
                  <h3 className="text-[13px] font-black tracking-wide text-[#fff6f0]">{d.title}</h3>
                </div>
                <ul className="mt-1 space-y-1 pl-1">
                  {d.points.map((p) => (
                    <li key={p} className="flex gap-2 text-[12px] leading-relaxed text-[#cfdae6]/85">
                      <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[#7dd3fc]/70" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* 数据 */}
            <div className="mt-auto grid grid-cols-3 gap-2 pt-1">
              {STATS.map((s) => (
                <div key={s.k} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-center">
                  <div className="font-cartoon-latin text-[14px] font-black text-[#ffd166]">{s.v}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-white/50">{s.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* —— 下半：「素材箱 · BIN」条带 —— */}
      <div className="border-t border-white/10 bg-black/25 px-4 pb-3 pt-2.5 sm:px-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px]">🗂️</span>
          <span className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#9fe0b0]/85">
            Media Bin · 素材箱
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          <span className="font-cartoon-latin text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            {SHOWN} clips · hover to preview
          </span>
        </div>

        <div
          ref={binRef}
          className="relative w-full"
          style={{ height: 'clamp(120px, 19vh, 190px)' }}
        >
          {bin.map((b, i) => {
            const d = NATIVE[i]
            return (
              <motion.figure
                key={SHOTS[i]}
                className="group absolute cursor-zoom-in"
                style={{ left: b.x, top: b.y, width: b.w }}
                initial={{ opacity: 0, y: 14, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -6, scale: 1.045, zIndex: 30 }}
                transition={{ delay: 0.5 + i * 0.08, type: 'spring', stiffness: 140, damping: 20, mass: 0.7 }}
              >
                {/* 被选中的“剪辑高亮”描边 */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-[2px] rounded-[11px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ boxShadow: '0 0 0 2px #ffd166, 0 0 22px rgba(125,211,252,0.55)' }}
                />
                <img
                  src={SHOTS[i]}
                  alt={CLIPS[i].label}
                  width={d.w}
                  height={d.h}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="relative block h-auto w-full rounded-[9px] border border-white/15 object-cover shadow-[0_10px_22px_rgba(0,0,0,0.55)] transition-[filter,transform] duration-300 ease-out group-hover:brightness-110 group-hover:drop-shadow-[0_0_18px_rgba(125,211,252,0.45)]"
                />
                {/* 素材条信息带（贴在图下沿，不遮画面主体） */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 rounded-b-[9px] bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-4">
                  <span className="block truncate text-[10.5px] font-bold text-white/90">{CLIPS[i].label}</span>
                </span>
                {/* 常显编号 */}
                <span className="font-cartoon-latin pointer-events-none absolute left-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-black/50 px-1 text-[10.5px] font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </motion.figure>
            )
          })}
        </div>
      </div>

      {/* 关闭 */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute right-4 top-3.5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#ffd166] text-lg font-black text-[#08131f] shadow-lg ring-1 ring-white/50 transition hover:scale-105"
      >
        ✕
      </button>
    </div>
  )
}
