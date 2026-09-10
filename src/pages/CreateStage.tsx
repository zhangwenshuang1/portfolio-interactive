import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 品牌部实习（CREATE）「Make ideas visible.」
//
// 视觉语法：整页做成一块 **创意工作室的监看台**——
//   • 中央是「主作品展示窗口」：播放当前被选中的作品（默认第一支）；
//   • 右侧是「作品索引」：分成【实拍类 / AI类】两组，点选即切换中央窗口；
//   • 最右是一条竖向的 **幕后胶片带（BTS FILM STRIP）**：6 张工作照像一格一格胶片连成一条，
//     悬停微微放大并浮出标签 —— 它们是"证据"，视觉上永远让位于作品本身。
//
// 与 LEAD 的区别：LEAD 是"把长片剪成故事"，CREATE 是"让想法被看见"——
// 所以这里是**作品索引 + 幕后胶片**，两种模式（AI / 实拍）在右侧索引里切换氛围。
// ─────────────────────────────────────────────────────────────────────────────

// —— 作品清单：分「实拍类」与「AI类」 ——
export type WorkMode = 'live' | 'ai'

interface Work {
  key: string
  title: string
  cn: string
  mode: WorkMode
  tag: string
}

const WORKS: Work[] = [
  // 实拍类
  { key: 'tan-dian-muke', title: '《暮刻书坊》', cn: '探店短片', mode: 'live', tag: '实拍' },
  { key: 'live-anniv', title: '实拍周年活动', cn: '品牌活动记录', mode: 'live', tag: '实拍' },
  // AI 类
  { key: 'long-restaurant', title: '《欢迎来到龙餐馆》', cn: 'AI 短片', mode: 'ai', tag: 'AI' },
  { key: 'foreign-shop', title: '《老外的上海宝藏小店》', cn: 'AI 短片', mode: 'ai', tag: 'AI' },
  { key: 'anniv-13', title: '收钱吧十三周年庆', cn: 'AI 品牌片', mode: 'ai', tag: 'AI' },
  { key: 'father-flower', title: '《父亲的花》', cn: '父亲节特辑 · AI', mode: 'ai', tag: 'AI' },
]

// —— 幕后胶片带：6 张工作照（压到最长边 1400px 的 webp） ——
interface Bts {
  src: string
  en: string
  cn: string
}

const BTS: Bts[] = [
  { src: '/brand/bts/001.webp', en: 'SHOOTING DAY', cn: '品牌视频拍摄现场' },
  { src: '/brand/bts/002.webp', en: 'STORYBOARD', cn: '分镜与脚本讨论' },
  { src: '/brand/bts/003.webp', en: 'ON SET', cn: '跟组拍摄花絮' },
  { src: '/brand/bts/004.webp', en: 'AI WORKFLOW', cn: 'AI 生成流程调试' },
  { src: '/brand/bts/005.webp', en: 'ANNUAL EVENT', cn: '品牌年度活动现场' },
  { src: '/brand/bts/006.webp', en: 'TEAM', cn: '团队协作日常' },
]

const PHYSICAL: Array<[number, number]> = [
  [933, 1400],
  [1050, 1400],
  [1050, 1400],
  [1050, 1400],
  [1050, 1400],
  [1050, 1400],
]

const MODES: Record<WorkMode, { label: string; en: string; accent: string; hint: string }> = {
  ai: { label: 'AI 模式', en: 'AI MODE', accent: '#a78bfa', hint: '数字生成 · 流动 · 实验' },
  live: { label: '实拍模式', en: 'LIVE MODE', accent: '#7dd3fc', hint: '真实影像 · 现场 · 记录' },
}

interface StageProps {
  onClose: () => void
}

export default function CreateStage({ onClose }: StageProps) {
  const [activeKey, setActiveKey] = useState(WORKS[0].key)
  const [mode, setMode] = useState<WorkMode>('live')
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const active = useMemo(
    () => WORKS.find((w) => w.key === activeKey) ?? WORKS[0],
    [activeKey],
  )
  const accent = MODES[mode].accent

  const selectWork = useCallback((w: Work) => {
    setActiveKey(w.key)
    setMode(w.mode)
  }, [])

  const toggleMute = useCallback(() => setMuted((m) => !m), [])

  // 切换作品后从 0 开始播放
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    void v.play().catch(() => {})
  }, [activeKey])

  const grouped: Array<{ mode: WorkMode; works: Work[] }> = [
    { mode: 'live', works: WORKS.filter((w) => w.mode === 'live') },
    { mode: 'ai', works: WORKS.filter((w) => w.mode === 'ai') },
  ]

  return (
    <div
      className="relative my-auto flex w-full select-none flex-col overflow-hidden rounded-[26px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_rgba(4,8,14,0.55)]"
      style={{
        background:
          'radial-gradient(150% 130% at 78% -10%, #211b37 0%, #12131f 44%, #080b11 100%)',
      }}
    >
      {/* —— 顶部：工作室菜单栏 —— */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5 sm:px-5">
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">
          Project · 品牌部实习 / CREATE — Make ideas visible.
        </span>
        <span className="ml-auto hidden items-center gap-2 sm:flex">
          <i className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />
          <span
            className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {MODES[mode].en} · {active.tag}
          </span>
        </span>
      </div>

      {/* —— 主体：中央主窗口 | 右侧索引 | 幕后胶片带 —— */}
      <div className="grid min-h-0 gap-4 px-4 pb-3.5 pt-3.5 sm:px-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.95fr)_minmax(0,0.62fr)]">
        {/* 中央：主作品展示窗口 */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.24em]"
              style={{ color: accent }}
            >
              Main Window
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            <span className="font-cartoon-latin rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-white/55">
              主作品 · {active.tag}
            </span>
          </div>

          <motion.div
            key={activeKey}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.985 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onClick={toggleMute}
            className="group relative min-h-0 flex-1 cursor-pointer overflow-hidden rounded-[16px] border border-white/15 bg-black"
            style={{ boxShadow: `0 0 0 5px rgba(255,255,255,0.045),0_26px_60px_rgba(0,0,0,0.7),0_0_70px ${accent}44` }}
          >
            <video
              ref={videoRef}
              key={active.key}
              className="absolute inset-0 h-full w-full object-cover"
              src={`/brand/video/${active.key}.mp4`}
              poster={`/brand/poster/${active.key}.jpg`}
              autoPlay
              loop
              muted={muted}
              playsInline
              preload="metadata"
            />
            <span aria-hidden className="pointer-events-none absolute inset-[6%] rounded-[10px] border border-white/12" />
            {muted && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm">
                🔊 点击开启声音
              </span>
            )}
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_62%,rgba(0,0,0,0.55))]" />
              <span className="absolute bottom-3 left-3 max-w-[80%]">
                <span className="block text-[13px] font-black text-white drop-shadow">{active.title}</span>
                <span className="block text-[10.5px] font-semibold tracking-[0.16em] text-white/70">{active.cn}</span>
              </span>
            </span>
          </motion.div>

          {/* 播放进度装饰条 */}
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5">
            <span className="font-cartoon-latin text-[10.5px] font-bold tracking-[0.18em]" style={{ color: accent }}>
              {active.tag === 'AI' ? 'AI · GENERATED' : 'LIVE · CAPTURED'}
            </span>
            <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="absolute inset-y-0 left-0 w-1/3 rounded-full"
                style={{ background: `linear-gradient(90deg,${accent},#ffd166)` }}
              />
            </span>
            <span className="font-cartoon-latin text-[10.5px] font-bold tracking-[0.18em] text-white/40">
              {active.cn}
            </span>
          </div>
        </div>

        {/* 右侧：作品索引（含模式切换） */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#ff9ec4]/80">
              Work Index
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[14px] border border-white/10 bg-white/[0.035] p-2.5">
            {grouped.map(({ mode: gmode, works }) => {
              const gm = MODES[gmode]
              const isOn = mode === gmode
              return (
                <div key={gmode} className="flex min-h-0 flex-col">
                  {/* 分组头 = 模式切换按钮 */}
                  <button
                    onClick={() => setMode(gmode)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors"
                    style={{
                      background: isOn ? `${gm.accent}1f` : 'transparent',
                      boxShadow: isOn ? `inset 0 0 0 1px ${gm.accent}66` : 'none',
                    }}
                  >
                    <i className="h-1.5 w-1.5 rounded-full" style={{ background: gm.accent }} />
                    <span
                      className="font-cartoon-latin text-[11px] font-black uppercase tracking-[0.16em]"
                      style={{ color: isOn ? gm.accent : 'rgba(255,255,255,0.5)' }}
                    >
                      {gm.label}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold text-white/40">{gm.hint}</span>
                  </button>

                  {/* 该组作品 */}
                  <div className="mt-1 flex flex-col gap-1.5">
                    {works.map((w) => {
                      const on = w.key === activeKey
                      return (
                        <button
                          key={w.key}
                          onClick={() => selectWork(w)}
                          className="group flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-all"
                          style={{
                            borderColor: on ? `${gm.accent}aa` : 'rgba(255,255,255,0.1)',
                            background: on ? `${gm.accent}1a` : 'rgba(255,255,255,0.03)',
                          }}
                        >
                          <span
                            className="relative h-9 w-12 flex-none overflow-hidden rounded-md border border-white/15 bg-black"
                          >
                            <img
                              src={`/brand/poster/${w.key}.jpg`}
                              alt={w.title}
                              loading="lazy"
                              decoding="async"
                              draggable={false}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-bold text-white/90">{w.title}</span>
                            <span className="block truncate text-[10.5px] font-semibold text-white/45">{w.cn}</span>
                          </span>
                          {on && (
                            <span
                              className="font-cartoon-latin flex-none text-[9.5px] font-black uppercase tracking-[0.14em]"
                              style={{ color: gm.accent }}
                            >
                              ON AIR
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 最右：幕后胶片带 BTS FILM STRIP */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[11px]">🎞️</span>
            <span className="font-cartoon-latin text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#9fe0b0]/85">
              BTS Strip
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-white/10 bg-black/30 p-1.5">
            {/* 上下齿孔装饰 */}
            <span aria-hidden className="pointer-events-none absolute inset-y-1 left-0.5 w-1.5 opacity-40">
              {Array.from({ length: 18 }).map((_, i) => (
                <i key={i} className="mb-1.5 block h-2 w-1.5 rounded-[1px] bg-white/40" />
              ))}
            </span>
            <div className="flex min-h-0 flex-1 flex-col gap-1.5 pl-2.5">
              {BTS.map((b, i) => {
                const d = PHYSICAL[i]
                return (
                  <motion.figure
                    key={b.src}
                    className="group relative min-h-0 flex-1 cursor-zoom-in overflow-hidden rounded-[8px] border border-white/12"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <img
                      src={b.src}
                      alt={b.cn}
                      width={d[0]}
                      height={d[1]}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover transition-[filter,transform] duration-400 ease-out group-hover:brightness-110"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />
                    <span className="font-cartoon-latin pointer-events-none absolute left-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded bg-black/50 px-1 text-[9px] font-bold text-white ring-1 ring-white/25">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1 px-1.5 pb-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="font-cartoon-latin block truncate text-[9px] font-black uppercase tracking-[0.14em] text-[#9fe0b0]">
                        {b.en}
                      </span>
                      <span className="block truncate text-[10px] font-bold text-white/90">{b.cn}</span>
                    </span>
                  </motion.figure>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 关闭 */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute right-4 top-3.5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#a78bfa] to-[#ffd166] text-lg font-black text-[#08131f] shadow-lg ring-1 ring-white/50 transition hover:scale-105"
      >
        ✕
      </button>

      <AnimatePresence />
    </div>
  )
}
