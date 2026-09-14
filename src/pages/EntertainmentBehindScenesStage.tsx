import { motion } from 'framer-motion'
import { useRef, useState, useLayoutEffect, useCallback } from 'react'
import DraggablePhoto from '../components/DraggablePhoto'

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
// 版面按下面的 NUMBER 显式给出展示顺序（第 10 张已按需求删除）。
// 每张缩略图的真实宽高（服务器上已生成的 001–014）。
// 版面按「横图上下各 2、竖图左右各 3」的环形排布：
//   横图 = 004 011 008 009（原第 4、8、9、11 张，编号见下）
//   竖图 = 001 002 003 005 006 007（原第 1、2、3、5、6、7 张；第 10 张已按需求删除）
// 因此这里不再直接用 001–011 的顺序，而是显式给出「展示顺序」。
const PHYSICAL: Array<[number, number]> = [
  [900, 506], //  ① 011 横 16:9 → 上 1
  [900, 675], //  ② 008 横 4:3  → 上 2
  [900, 600], //  ③ 004 横 3:2  → 下 1
  [900, 675], //  ④ 009 横 4:3  → 下 2
  [675, 900], //  ⑤ 001 竖      → 左 1
  [676, 900], //  ⑥ 002 竖      → 左 2
  [675, 900], //  ⑦ 003 竖      → 左 3
  [675, 900], //  ⑧ 005 竖      → 右 1
  [675, 900], //  ⑨ 006 竖      → 右 2
  [675, 900], //  ⑩ 007 竖      → 右 3
]
// 展示顺序对应的原始编号（1-based，用于角标显示；第 10 张已删）
const NUMBER = [11, 8, 4, 9, 1, 2, 3, 5, 6, 7]
const SHOWN = PHYSICAL.length
const SHOTS = PHYSICAL.map((_, i) => `/ent-bts/thumbs/${pad(NUMBER[i])}.jpg`)
const NATIVE: Array<{ w: number; h: number }> = PHYSICAL.map(([w, h]) => ({ w, h }))

/** 左上锚点 + 像素宽高（px）。高度统一给定，便于排布时间隙保持一致 */
interface Tile {
  x: number
  y: number
  w: number
  h: number
}
interface Rect {
  x0: number
  y0: number
  x1: number
  y1: number
}

/**
 * 把 SHOWN 张照片彼此不重叠地撒到面板空处（绕开中央视频区）。
 */
function layoutWall(
  BW: number,
  BH: number,
  freeRect: Rect,
  _gap: number,
  _seedKey: string,
): Tile[] {
  // 这一次不再“随机撒点”，而是按用户指定的**环形秩序**摆放：
  //        ┌──────── 上：横图 2 张 ────────┐
  //        │         11        08           │
  //   左   01                              05  右
  //   竖   02        [ 中央视频 ]         06  竖
  //   图   03                              07  图
  //        │         04        09           │
  //        └──────── 下：横图 2 张 ────────┘
  // 目标：四周任何相邻两张照片之间的空隙尽量一致。
  const out: Tile[] = []

  const padOut = Math.max(10, Math.round(BW * 0.012))
  const edgeMinX = padOut
  const edgeMaxX = BW - padOut
  const edgeMinY = padOut
  const edgeMaxY = BH - padOut

  const Ht = (idx: number, w: number) =>
    Math.round(w / (NATIVE[idx].w / NATIVE[idx].h))

  const innerLeft = freeRect.x0
  const innerRight = freeRect.x1
  const innerTop = freeRect.y0
  const innerBottom = freeRect.y1

  // ─────────────────────────────────────────────────────────────────────────
  // 统一间隙思路：
  //   竖列内部、横排内部、以及照片到板边，都用同一个间隙 G，视觉上最整齐。
  //   先按「照片尽量大」定出横图 / 竖图的尺寸，再看剩余空间能给出多大的 G，
  //   取两者的较小值，最后按该 G 落位。这样既不会把照片压得太小，
  //   又能让各处空隙尽量接近。
  // ─────────────────────────────────────────────────────────────────────────
  const topIdx = [0, 1]
  const botIdx = [2, 3]
  const leftIdx = [4, 5, 6]
  const rightIdx = [7, 8, 9]

  const topBandH = Math.max(0, innerTop - edgeMinY)
  const botBandH = Math.max(0, edgeMaxY - innerBottom)
  const leftBandW = Math.max(0, innerLeft - edgeMinX)
  const rightBandW = Math.max(0, edgeMaxX - innerRight)
  const fullH = edgeMaxY - edgeMinY
  const innerW = innerRight - innerLeft

  const rowArMin = Math.min(...[...topIdx, ...botIdx].map((i) => NATIVE[i].w / NATIVE[i].h))
  const colArMin = Math.min(...[...leftIdx, ...rightIdx].map((i) => NATIVE[i].w / NATIVE[i].h))

  // ─────────────────────────────────────────────────────────────────────────
  // 目标：相邻两张照片之间的间隙尽量一致，记为 G（横排内水平、竖列内垂直）。
  //   照片保持原始比例（不裁切），高度由宽度决定，所以 G 与尺寸互相牵制：
  //     · 横排：横图高 rowH = rowW / rowArMin，必须 ≤ 横带高 − 2G（否则会压到视频）
  //     · 竖列：竖图宽 colW = colH · colArMin，必须 ≤ 竖带宽 − 2G
  //   取一个理想 G（约板宽 2.4%），再逐步缩小直到两个约束都满足。
  //   排布时不硬撑满内宽/板高，两端留白交给居中对齐，视觉更松弛。
  // ─────────────────────────────────────────────────────────────────────────
  const Gtarget = Math.round(BW * 0.02)

  let G = Gtarget
  let rowW = 0
  let colH = 0
  let colW = 0
  const bandRowMax = Math.max(0, Math.min(topBandH, botBandH))
  const bandColMax = Math.max(0, Math.min(leftBandW, rightBandW))
  for (; G >= 8; G -= 1) {
    // 横图：高度优先用满横带（留 2G 上下余量），宽度再受内框宽度约束
    const rowH = Math.min(bandRowMax - 2 * G, (innerW - 3 * G) / 2 / rowArMin)
    rowW = rowH * rowArMin
    // 竖图：宽度优先用满竖带（留 2G 左右余量），高度再受板高约束
    colW = Math.min(bandColMax - 2 * G, (fullH - 4 * G) / 3 * colArMin)
    colH = colW / colArMin
    const rowOk = rowW >= BW * 0.16 && rowH >= BW * 0.06
    const colOk = colW >= BW * 0.11 && colH >= BW * 0.15
    if (rowOk && colOk) break
  }
  if (G < 8) G = 8

  rowW = Math.round(rowW)
  const rowH = Math.round(rowW / rowArMin)
  colW = Math.round(colW)
  colH = Math.round(colW / colArMin)

  // 横排内部用更大的间隙：中央视频上下留白充足，两张横图可以排得更宽松。
  //   先按竖列的 G 定横图大小，再把内框剩余宽度均分成 3 段作为横排间隙（两端各留半段）。
  const GROW = Math.max(G, Math.round((innerW - 2 * rowW) / 3))

  const solvedRow = { w: rowW, h: rowH }
  const solvedCol = { w: colW, h: colH }

  // ── 1) 上下两条横带：各 2 张横图，水平间隙 GROW，整排在内框宽度内居中 ──
  const placeRow = (idxs: number[], bandTop: number, bandBottom: number) => {
    if (!idxs.length) return
    const bh = Math.max(0, bandBottom - bandTop)
    const w = solvedRow.w
    const h = solvedRow.h
    const contentW = w * idxs.length + GROW * (idxs.length - 1)
    const startX = Math.round(edgeMinX + (BW - 2 * edgeMinX - contentW) / 2)
    const y = Math.round(bandTop + (bh - h) / 2)
    idxs.forEach((idx, n) => {
      const x = Math.round(startX + n * (w + GROW))
      out[idx] = { x, y, w, h }
    })
  }
  placeRow(topIdx, edgeMinY, innerTop)
  placeRow(botIdx, innerBottom, edgeMaxY)

  // ── 2) 左右两条竖带：各 3 张竖图，垂直间隙 G，整列在板高内居中 ──
  const placeCol = (idxs: number[], bandLeft: number, bandRight: number, align: 'left' | 'right') => {
    if (!idxs.length) return
    const bw = Math.max(0, bandRight - bandLeft)
    const w = solvedCol.w
    const h = solvedCol.h
    const totalH = h * idxs.length + G * (idxs.length - 1)
    // 竖列整体与板面垂直居中，四组照片围成一圈更整齐
    const startY = Math.round(edgeMinY + (BH - 2 * edgeMinY - totalH) / 2)
    const x =
      align === 'left'
        ? Math.round(edgeMinX + Math.max(0, (bw - w) / 2))
        : Math.round(edgeMaxX - Math.max(0, (bw - w) / 2) - w)
    idxs.forEach((idx, n) => {
      const y = Math.round(startY + n * (h + G))
      out[idx] = { x, y, w, h }
    })
  }
  placeCol(leftIdx, edgeMinX, innerLeft, 'left')
  placeCol(rightIdx, innerRight, edgeMaxX, 'right')

  // ── 3) 兜底：任何一张若缺失，补一个合法位置 ──
  for (let i = 0; i < SHOWN; i++) {
    if (out[i]) continue
    const w = Math.max(48, Math.round(BW * 0.12))
    out[i] = { x: edgeMinX, y: edgeMinY, w, h: Math.round(w / rowArMin) }
  }
  void Ht

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

    let raf = 0
    let lastKey = ''
    const run = () => {
      const bb = board.getBoundingClientRect()
      const cb = center.getBoundingClientRect()
      // 仅在尺寸真正稳定后才排版：视频未渲染出高度时 cb.height 为 0，直接跳过等下一帧
      if (bb.width < 2 || bb.height < 2 || cb.width < 2 || cb.height < 2) return
      const key = `${Math.round(bb.width)}x${Math.round(bb.height)}|${Math.round(cb.left - bb.left)}x${Math.round(cb.top - bb.top)}x${Math.round(cb.width)}x${Math.round(cb.height)}`
      if (key === lastKey) return
      lastKey = key
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
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(run)
    }

    schedule()
    // 字体/视频元数据/页面转场都可能改变版心尺寸：持续监听，尺寸一变就重排
    const ro = new ResizeObserver(schedule)
    ro.observe(board)
    ro.observe(center)
    window.addEventListener('resize', schedule)
    const v = center.querySelector('video')
    if (v) {
      v.addEventListener('loadedmetadata', schedule)
      v.addEventListener('loadeddata', schedule)
    }
    // 兜底：转场结束后再校准一次
    const timers = [0, 120, 360, 800].map((t) => window.setTimeout(schedule, t))

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      if (v) {
        v.removeEventListener('loadedmetadata', schedule)
        v.removeEventListener('loadeddata', schedule)
      }
      timers.forEach((t) => clearTimeout(t))
    }
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
            className="relative overflow-hidden rounded-[18px] border border-white/20 bg-black shadow-[0_0_0_6px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.65),0_0_60px_rgba(122,162,255,0.28)]"
          >
            <video
              className="block aspect-video w-full object-cover"
              src="/ent-bts/yzd-trailer.mp4"
              autoPlay
              loop
              muted={muted}
              playsInline
              controls
              preload="metadata"
            />
            {/* 中央第一个“静音”提示：点一下开始听到舞台的声音 */}
            {muted && (
              <button
                type="button"
                onClick={toggleMute}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition hover:bg-black/65"
              >
                🔊 点击开启声音
              </button>
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

        {/* —— 幕后照片层：绕开中央视频，绝不遮挡「节目」—— 可拖动 + 点击放大 —— */}
        {tiles.map((tile, i) => {
          const d = NATIVE[i]
          const num = NUMBER[i]
          return (
            <DraggablePhoto
              key={SHOTS[i]}
              src={SHOTS[i]}
              persistId={`ent-bts-${i + 1}`}
              alt={`第 ${num} 张幕后照片`}
              nativeW={d.w}
              nativeH={d.h}
              x={tile.x}
              y={tile.y}
              w={tile.w}
              h={tile.h}
              delay={1.15 + i * 0.18}
              from="rise"
              glow="neon"
              imgClassName="rounded-xl border border-white/20 drop-shadow-[0_10px_18px_rgba(0,0,0,0.5)] group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_18px_rgba(255,120,160,0.5)]"
            >
              {/* 常显编号（左上角浅底数字）：方便你按编号告知我每张背后的故事 */}
              <span className="font-cartoon-latin pointer-events-none absolute left-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-black/45 px-1 text-[10.5px] font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
                {String(num).padStart(2, '0')}
              </span>
            </DraggablePhoto>
          )
        })}
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
