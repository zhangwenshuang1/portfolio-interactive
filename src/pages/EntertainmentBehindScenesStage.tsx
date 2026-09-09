import { motion } from 'framer-motion'
import { useRef, useState, useLayoutEffect, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 综艺实习（DO）「一站到底 · 舞台内外」
//
// 视觉语法：先看见「节目」，再发现「幕后」，最后意识到「这些幕后记录来自我」。
//   • 中央是一台正在自动播放的《一站到底》宣传片（节目 / THE SHOW）；
//   • 四周随播放逐渐浮现幕后照片（幕后 / ON SET）；
//   • 每张相纸悬停会浮起一圈舞台侧光的霓虹光晕（你在人群里认出“我的机位”）。
//
// 这里刻意做了三件与摄影墙不同的事以服务另一种叙事：
//   • 板面是深色“夜色演播厅”而非暖色相纸背景 —— 让中央的彩色预告片像舞台那样亮起来；
//   • 中央不是文案而是视频 —— 一圈呼吸带内绝不落照片，保证画面永远第一眼是「节目」；
//   • 照片用「延迟波次」逐渐浮现（先外侧几张、再靠近中央几张），像从暗处一点点被灯光找到。
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(3, '0')

// —— 幕后照片素材库 ——
// 每张缩略图导入时已压到最长边 900px 并依次命名 001..014，宽高遵循原图比例（零裁切）。
// 顺序对应桌面「综艺」文件夹里照片的按名排序；编号固定，之后你提到的“第几张”都以此为准。
// 目前版面先展示其中的 11 张（见 SHOWN = 001..011），末尾的 012–014 备用轮换。
const THUMBS = Array.from({ length: 14 }, (_, i) => ({
  src: `/ent-bts/thumbs/${pad(i + 1)}.jpg`,
  w: 0,
  h: 0,
}))
// 每张缩略图的真实宽高（服务器上已生成的 001–014）：
const PHYSICAL: Array<[number, number]> = [
  [675, 900], //  001 竖
  [676, 900], //  002 竖
  [675, 900], //  003 竖
  [900, 600], //  004 横 3:2
  [675, 900], //  005 竖
  [675, 900], //  006 竖
  [675, 900], //  007 竖
  [900, 675], //  008 横 4:3
  [900, 675], //  009 横 4:3
  [675, 900], //  010 竖
  [900, 506], //  011 横 16:9
  [900, 675], //  012 横 4:3
  [675, 900], //  013 竖
  [675, 900], //  014 竖
]
// 本版稳定展示的张数（在 001–014 中取前 SHOWN_AB 张，编号可见且固定）
const SHOWN = 11
const SHOTS = THUMBS.slice(0, SHOWN).map((t) => t.src)
const NATIVE: Array<{ w: number; h: number }> = PHYSICAL.slice(0, SHOWN).map(
  ([w, h]) => ({ w, h }),
)

/** 左上锚点 + 像素宽（px）。高交给 <img> + h-auto 自然推算 */
interface Tile {
  x: number
  y: number
  w: number
}
interface Rect {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** 可复现伪随机：同一尺寸下照片位置稳定，不会每次重排 */
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
 * 把 SHOWN 张照片彼此不重叠地撒到面板空处（绕开中央视频区）。
 */
function layoutWall(
  BW: number,
  BH: number,
  freeRect: Rect,
  gap: number,
  seedKey: string,
): Tile[] {
  const rand = seededRand(seedKey)
  const padOut = Math.max(10, Math.round(BW * 0.012))
  const out: Tile[] = []

  const edgeMinX = padOut
  const edgeMaxX = BW - padOut
  const edgeMinY = padOut
  const edgeMaxY = BH - padOut

  const occ: Array<{ l: number; t: number; r: number; b: number }> = []

  const inFree = (x0: number, y0: number, x1: number, y1: number) =>
    x0 < freeRect.x1 && x1 > freeRect.x0 && y0 < freeRect.y1 && y1 > freeRect.y0
  const collides = (x0: number, y0: number, x1: number, y1: number) =>
    occ.some(
      (q) =>
        x0 - gap < q.r && x1 + gap > q.l && y0 - gap < q.b && y1 + gap > q.t,
    )

  for (let i = 0; i < SHOWN; i++) {
    const ar = NATIVE[i].w / NATIVE[i].h
    const isPortrait = ar < 1
    // 张数变多后把基准纸幅调小一些：竖图约占板宽 15–21%、横图约占 17–23%，
    // 让 10 张尽量摊满四周空白又保持中央视频仍是绝对主角
    const w0 = BW * (isPortrait ? 0.15 + rand() * 0.06 : 0.17 + rand() * 0.06)
    let w = w0
    const minW = Math.max(52, w0 * (isPortrait ? 0.45 : 0.52))

    let placed = false
    for (let shrink = 0; shrink < 30 && !placed; shrink++) {
      if (w < minW) w = minW
      if (w > edgeMaxX - edgeMinX) w = edgeMaxX - edgeMinX
      const h = w / ar
      if (h > edgeMaxY - edgeMinY) {
        w = (edgeMaxY - edgeMinY) * ar
        continue
      }
      const tries = 3200 + Math.ceil((BW * BH) / (w * h)) * 60
      for (let t = 0; t < tries && !placed; t++) {
        const x = edgeMinX + rand() * (edgeMaxX - edgeMinX - w)
        const y = edgeMinY + rand() * (edgeMaxY - edgeMinY - h)
        if (inFree(x, y, x + w, y + h)) continue
        if (collides(x, y, x + w, y + h)) continue
        occ.push({ l: x - gap, t: y - gap, r: x + w + gap, b: y + h + gap })
        out.push({ x: Math.round(x), y: Math.round(y), w: Math.round(w) })
        placed = true
        break
      }
      if (!placed) w *= 0.94
    }

    if (!placed) {
      let w2 = minW
      let found = false
      for (let deg = 0; deg < 8 && !found; deg++) {
        w2 = Math.max(BW * 0.1, Math.round(w2 * 0.9))
        if (w2 > edgeMaxX - edgeMinX) w2 = edgeMaxX - edgeMinX
        const h2 = w2 / ar
        if (h2 > edgeMaxY - edgeMinY) continue
        const tries = 4200
        for (let t = 0; t < tries && !found; t++) {
          const x = edgeMinX + rand() * (edgeMaxX - edgeMinX - w2)
          const y = edgeMinY + rand() * (edgeMaxY - edgeMinY - h2)
          if (inFree(x, y, x + w2, y + h2)) continue
          if (collides(x, y, x + w2, y + h2)) continue
          occ.push({ l: x - gap, t: y - gap, r: x + w2 + gap, b: y + h2 + gap })
          out.push({ x: Math.round(x), y: Math.round(y), w: Math.round(w2) })
          placed = true
          found = true
        }
      }
      if (!found) {
        // 逐左移找可放坐标（极端兜底，几乎不会走到）
        const bw = Math.max(Math.max(42, Math.round(BW * 0.08)), minW * 0.5)
        const bh = bw / ar
        let placedEdge = false
        for (let k = 0; k < edgeMaxX - edgeMinX - bw && !placedEdge; k++) {
          const x0c = edgeMinX + k
          const y0c = edgeMinY
          if (
            y0c + bh <= edgeMaxY &&
            !inFree(x0c, y0c, x0c + bw, y0c + bh) &&
            !collides(x0c, y0c, x0c + bw, y0c + bh)
          ) {
            occ.push({ l: x0c - gap, t: y0c - gap, r: x0c + bw + gap, b: y0c + bh + gap })
            out.push({ x: Math.round(x0c), y: Math.round(y0c), w: Math.round(bw) })
            placedEdge = true
          }
        }
        if (!placedEdge) {
          out.push({ x: edgeMinX, y: Math.max(padOut, edgeMaxY - bh), w: Math.round(bw) })
        }
      }
    }
  }
  return out
}

interface StageProps {
  onClose: () => void
}

export default function EntertainmentBehindScenesStage({ onClose }: StageProps) {
  const boxRef = useRef<HTMLDivElement>(null) // 整张板
  const videoRef = useRef<HTMLDivElement>(null) // 中央视频外包（用来量呼吸区）
  const [tiles, setTiles] = useState<Tile[]>([])
  const [muted, setMuted] = useState(true)

  // 视频默认静音自动播放；点一次解除静音、再点回到静音（controls 极简）
  const toggleMute = useCallback(() => setMuted((m) => !m), [])

  useLayoutEffect(() => {
    const board = boxRef.current
    const center = videoRef.current
    if (!board || !center) return
    const frame = requestAnimationFrame(() => {
      const bb = board.getBoundingClientRect()
      const cb = center.getBoundingClientRect()
      const breath = Math.max(18, Math.round(bb.width * 0.02))
      const avoid: Rect = {
        x0: cb.left - bb.left - breath,
        x1: cb.right - bb.left + breath,
        y0: cb.top - bb.top - breath,
        y1: cb.bottom - bb.top + breath,
      }
      const gap = Math.max(16, Math.round(bb.width * 0.014))
      const cand = layoutWall(bb.width, bb.height, avoid, gap, 'zongyi-stage-1')
      setTiles(cand)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className="relative my-auto w-full select-none overflow-hidden rounded-[30px] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_80px_rgba(10,10,20,0.5)]"
      style={{
        background:
          'radial-gradient(140% 120% at 50% 0%, #242036 0%, #14101f 46%, #0a0812 100%)',
      }}
    >
      {/* 顶部“舞台氛围”光带 + 底部杂志字条：节目已被主角托起，字只做最轻的点缀 */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      >
        <defs>
          <radialGradient id="beam" cx="50%" cy="8%" r="85%">
            <stop offset="0%" stopColor="#ff5d8f" stopOpacity="0.5" />
            <stop offset="42%" stopColor="#7aa2ff" stopOpacity="0.16" />
            <stop offset="72%" stopColor="#ffd166" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0000" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#beam)" />
      </svg>

      <div
        ref={boxRef}
        className="relative mx-auto w-full max-w-[1120px]"
        style={{ height: 'clamp(560px, 82vh, 940px)' }}
      >
        {/* —— 中央正在播放的《一站到底》宣传片：第一眼是「节目」 —— */}
        <div
          ref={videoRef}
          className="group absolute left-1/2 top-1/2 w-[clamp(300px,52%,620px)] max-w-full -translate-x-1/2 -translate-y-1/2"
        >
          {/* 台标式眉标：叠在视频框上方的浅影带（不用超出容器的空定位以免被裁） */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="pointer-events-none absolute inset-x-0 -top-0.5 z-20 flex justify-center pt-0.5"
          >
            <span className="rounded-t-xl bg-[#0a0812]/55 px-3 py-1 font-cartoon-latin text-[10px] font-bold uppercase tracking-[0.28em] text-white/80 backdrop-blur-[2px]">
              Now Playing ·《一站到底》
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            onClick={toggleMute}
            className="relative cursor-pointer overflow-hidden rounded-[18px] border border-white/20 bg-black shadow-[0_0_0_6px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.65),0_0_60px_rgba(122,162,255,0.28)]"
          >
            <video
              className="block aspect-video w-full object-cover"
              src="/ent-bts/yzd-trailer.mp4"
              autoPlay
              loop
              muted={muted}
              playsInline
              preload="metadata"
            />
            {/* 中央第一个“静音”提示：点一下开始听到舞台的声音 */}
            {muted && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm">
                🔊 点击开启声音
              </span>
            )}
            {/* hover 出现播放栏入口（轻量，不喧宾夺主） */}
            <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_60%,rgba(0,0,0,0.45))]" />
              <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                《 一站到底 》宣传片 · 一期先导
              </span>
            </span>
          </motion.div>
        </div>

        {/* —— 幕后照片层：绕开中央视频，绝不遮挡「节目」 —— */}
        {tiles.map((tile, i) => {
          const d = NATIVE[i]
          return (
            <motion.figure
              key={SHOTS[i]}
              className="group absolute pointer-events-auto cursor-zoom-in"
              style={{ left: tile.x, top: tile.y, width: tile.w }}
              initial={{ opacity: 0, scale: 0.72, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.99 }}
              // 波次浮现：分散些步长，让 10 张在开场后依次被“灯”找到
              transition={{
                delay: 1.15 + i * 0.24,
                type: 'spring',
                stiffness: 120,
                damping: 18,
                mass: 0.7,
              }}
            >
              {/* 侧光霓虹晕圈 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-[2px] rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(120% 120% at 50% 50%, rgba(122,162,255,0) 58%, rgba(255,93,143,0.4) 82%, rgba(125,211,252,0.35) 94%, rgba(0,0,0,0) 100%)',
                  filter: 'blur(5px)',
                }}
              />
              <img
                src={SHOTS[i]}
                alt={`第 ${i + 1} 张幕后照片`}
                width={d.w}
                height={d.h}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="relative block h-auto w-full rounded-xl border border-white/20 drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)] transition-[filter,transform] duration-300 ease-out group-hover:scale-[1.03] group-hover:brightness-110 group-hover:drop-shadow-[0_0_18px_rgba(255,120,160,0.5)]"
              />
              {/* 常显编号（左上角浅底数字）：方便你按编号告知我每张背后的故事 */}
              <span className="font-cartoon-latin pointer-events-none absolute left-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-black/45 px-1 text-[10.5px] font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
                {String(i + 1).padStart(2, '0')}
              </span>
            </motion.figure>
          )
        })}

        {/* —— 底部一句话：揭示「这是我的幕后」 —— */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 0.7 }}
          className="pointer-events-none absolute bottom-2 left-1/2 w-full max-w-[560px] -translate-x-1/2 px-4 text-center"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#ffd6e3]/55 sm:text-xs">
            Behind The Scenes · On-Site Intern
          </p>
          <p
            className="mt-1 text-[15px] font-bold text-[#fff6f0] [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.7))] sm:text-[17px]"
            style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
          >
            舞台侧光之外，是我按下快门的机位 ——
          </p>
        </motion.div>
      </div>

      {/* 关闭：走通详情页统一关闭逻辑（在 wrapper 里处理 markAsRead） */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff5d8f] to-[#ffd166] text-lg font-black text-white shadow-lg ring-1 ring-white/60 transition hover:scale-105"
      >
        ✕
      </button>
    </div>
  )
}
