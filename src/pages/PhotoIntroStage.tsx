import { motion } from 'framer-motion'
import { useRef, useState, useLayoutEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 摄影「开场墙」：一大块中性面板，12 张随照围绕中央文案 / CTA 自然散布。
//
// 这一版追求的体验：
//  •  "照片是把它们随机摆在这块板的空处" —— 不要排成整齐网格，也不要再挤成一圈；
//  •  竖图竖直 / 横图横平（rotate:0，绝不“放倒”）；
//  •  **互不遮挡**、绕中央文案留一圈空白不被盖住；
//  •  布局是在浏览器里真实测量后生成的 px（左上锚定），任何屏幕都保证成立，
//     而不是拿一组拍脑袋的百分比去赌。
//
// 算法一句话：在中央一个略外扩的“禁入矩形”之外，对每张图随机试放并做矩形碰撞检测
// （重试 / 必要时缩小），生成 12 张互不接触、永不侵入中央留白的位置。
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(3, '0')
const SHOT_COUNT = 12
const SHOTS = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-thumbs/${pad(i + 1)}.jpg`)

// 每张的原始宽高（仅用于让 <img> 保持原始比例；显示层永远 h-auto，零裁切零拉伸）
const NATIVE: Array<{ w: number; h: number }> = [
  { w: 2133, h: 1600 }, // 001 横 3:2
  { w: 1212, h: 810 }, //  002 横 3:2
  { w: 1080, h: 1440 }, // 003 竖 3:4
  { w: 3024, h: 4032 }, // 004 竖 3:4
  { w: 3072, h: 4096 }, // 005 竖 3:4
  { w: 6000, h: 4000 }, // 006 横 3:2
  { w: 3024, h: 4032 }, // 007 竖 3:4
  { w: 4032, h: 3024 }, // 008 横 4:3
  { w: 5328, h: 4000 }, // 009 横 4:3
  { w: 2268, h: 4032 }, // 010 竖 9:16（窄长）
  { w: 2448, h: 3264 }, // 011 竖 3:4
  { w: 4288, h: 2848 }, // 012 横 3:2
]

/** 左上锚点 + 像素宽（px）。
 *  height 不在这里给：直接交给 <img> width=w height=h 之后 CSS h-auto → 得到真实自然高，
 *  所以此处模型里的 “h”只需在碰撞检测阶段用它估算（w × 原图 h/w）*/
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

/** 可复现伪随机（FNV-1a 哈希灌入线性同余），打开页面后照片位置稳定不重排 */
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
 * 把 12 张随机、彼此不重叠地放到面板空处。
 * @param gap       照片间最小空隙（px）
 * @param freeRect  中央文案/CTA 外包留白（外扩后）
 */
function layoutWall(
  BW: number,
  BH: number,
  freeRect: Rect,
  gap: number,
): Tile[] {
  const rand = seededRand('wall-2026')
  const pad = Math.max(14, Math.round(BW * 0.022)) // 面板四周留白；先放进逻辑也可于板外则换边
  const out: Tile[] = []

  // 可用范围（一个闭环：中央禁入矩形），四周边缘留 pad
  const edgeMinX = pad
  const edgeMaxX = BW - pad
  const edgeMinY = pad
  const edgeMaxY = BH - pad

  // 累积已占用的“扩展盒”（每个都加上 gap 以便宽松判定）
  const occ: Array<{ l: number; t: number; r: number; b: number }> = []

  // —— 主循环：全身板范围（挖掉中央留白）做“随机撒点+拒绝采样” ——
  // 这样天然能在四面八方铺开，没固定成一圈或两行；图片彼此至少远离 gap。
  const inFree = (x0: number, y0: number, x1: number, y1: number) =>
    x0 < freeRect.x1 && x1 > freeRect.x0 && y0 < freeRect.y1 && y1 > freeRect.y0
  const collides = (x0: number, y0: number, x1: number, y1: number) =>
    occ.some(
      (q) =>
        x0 - gap < q.r && x1 + gap > q.l && y0 - gap < q.b && y1 + gap > q.t,
    )

  for (let i = 0; i < SHOT_COUNT; i++) {
    const ar = NATIVE[i].w / NATIVE[i].h
    const isPortrait = ar < 1
    // 起始尺寸：竖图宽约 16–19%板宽、横图约 20–25% —— 相对整块大墙明显放大，
    // 让每张真正“当家”，而不是贴一首小签。
    const w0 = BW * (isPortrait ? 0.165 + rand() * 0.035 : 0.2 + rand() * 0.05)
    let w = w0

    let placed = false
    // 从大到小试着放；多轮缩小仍尽量只到 w0 的 ~2/3 就接受，避免变成细长小签
    for (let shrink = 0; shrink < 14 && !placed && w >= w0 * 0.6; shrink++) {
      if (w > edgeMaxX - edgeMinX) w = edgeMaxX - edgeMinX
      const h = w / ar
      if (h > edgeMaxY - edgeMinY) {
        w = (edgeMaxY - edgeMinY) * ar
        continue
      }
      // 在可放空间中随机采样，拒绝侵入留白或与已有重叠的候选
      const tries = Math.max(2400, Math.ceil((BW * BH) / (w * h)) * 48)
      for (let t = 0; t < tries && !placed; t++) {
        const x = edgeMinX + rand() * (edgeMaxX - edgeMinX - w)
        const y = edgeMinY + rand() * (edgeMaxY - edgeMinY - h)
        if (inFree(x, y, x + w, y + h)) continue
        if (collides(x, y, x + w, y + h)) continue
        occ.push({ l: x - gap, t: y - gap, r: x + w + gap, b: y + h + gap })
        out.push({ x: Math.round(x), y: Math.round(y), w: Math.round(w) })
        placed = true
      }
      if (!placed) w *= 0.94 // 放不下：小幅减宽后继续撒
    }

    if (!placed) {
      // 兜底 —— 仍争取更大的尺寸放到右侧纵列，而非缩小到看不清
      w = Math.max(w0 * 0.7, w)
      const hf = w / ar
      if (hf > edgeMaxY - edgeMinY) w = (edgeMaxY - edgeMinY) * ar
      const cx = Math.max(edgeMinX, freeRect.x1 + gap)
      const tryList = [0.2, 0.6, 0.85, 0.4].map((k) => k * (edgeMaxX - w - cx) + cx)
      let cy = edgeMinY
      for (const dx of tryList) {
        const candY = edgeMinY + Math.min(edgeMaxY - w / ar - edgeMinY, rand() * (BH - 2 * pad))
        if (!collides(dx, candY, dx + w, candY + w / ar) && !inFree(dx, candY, dx + w, candY + w / ar)) {
          cy = candY
          break
        }
      }
      out.push({ x: Math.round(cx), y: Math.round(cy), w: Math.round(w) })
    }
  }

  // 后处理：微调个别重心太高导致顶部空旷不平衡 → 不做了，拒绝采样已自然均匀
  return out
}

interface Props {
  onBegin: () => void
}

export default function PhotoIntroStage({ onBegin }: Props) {
  const boxRef = useRef<HTMLDivElement>(null) // 整张板（用来做全局坐标系）
  const centerRef = useRef<HTMLDivElement>(null) // 中央文案/按钮，测量它的外包
  const [tiles, setTiles] = useState<Tile[]>([])

  // 中央文案渲染后再量一次真实外包 → 用 px 绝对坐标精排相纸
  useLayoutEffect(() => {
    const board = boxRef.current
    const center = centerRef.current
    if (!board || !center) return
    const frame = requestAnimationFrame(() => {
      const bb = board.getBoundingClientRect()
      const cb = center.getBoundingClientRect()
      // 远离中心一点：允许相纸贴近文案，但保持合理呼吸空隙
      const breath = Math.max(20, Math.round(bb.width * 0.034))
      const avoid: Rect = {
        x0: cb.left - bb.left - breath,
        x1: cb.right - bb.left + breath,
        y0: cb.top - bb.top - breath,
        y1: cb.bottom - bb.top + breath,
      }
      const gap = Math.min(20, Math.max(12, Math.round(bb.width * 0.014)))
      setTiles(layoutWall(bb.width, bb.height, avoid, gap))
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className="relative my-auto w-full select-none overflow-hidden rounded-[30px] border border-[#f0e0ca]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_70px_rgba(190,150,110,0.14)]"
      style={{
        background:
          'radial-gradient(125% 125% at 50% 0%, #fdf8ed 0%, #f4e8d2 46%, #eadcbf 100%)',
      }}
    >
      <div
        ref={boxRef}
        className="relative mx-auto w-full max-w-[1200px]"
        style={{ height: 'clamp(620px, 88vh, 960px)' }}
      >
        {/* 相纸层（绝对定位 px · 左上锚 · 全部 rotate:0 直立 · 零裁切） */}
        {tiles.map((tile, i) => {
          const d = NATIVE[i]
          return (
            <motion.figure
              key={SHOTS[i]}
              className="pointer-events-none absolute"
              style={{ left: tile.x, top: tile.y, width: tile.w }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.04 + i * 0.045,
                type: 'spring',
                stiffness: 150,
                damping: 20,
                mass: 0.7,
              }}
            >
              <img
                src={SHOTS[i]}
                alt=""
                width={d.w}
                height={d.h}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-auto w-full rounded-xl drop-shadow-[0_10px_16px_rgba(110,75,30,0.16)]"
              />
            </motion.figure>
          )
        })}

        {/* 中央文案 + CTA :: 外围留一圈呼吸空隙，相纸不盖住它 */}
        <div
          ref={centerRef}
          className="pointer-events-none absolute left-1/2 top-1/2 w-[clamp(280px,50%,540px)] -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="rounded-full bg-[rgba(255,252,245,0.58)] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#8a5a2a] shadow-sm ring-1 ring-white/60 backdrop-blur-[6px]">
              拿起相机的每一刻
            </span>
            <h2 className="max-w-[440px] text-[clamp(16px,3.2vw,24px)] font-black leading-snug text-[#241c10] [filter:drop-shadow(0_2px_12px_rgba(255,248,236,0.95))]">
              摄影，是我在平凡缝隙里捕捉光的方式
            </h2>
            <p className="max-w-[360px] text-[13px] font-semibold leading-6 text-[#3b2f1e] [filter:drop-shadow(0_1px_8px_rgba(255,250,242,0.95))]">
              走到景深处，让快门替万物放慢。
            </p>
            <button
              onClick={onBegin}
              className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6]/92 to-[#f3c15f]/92 px-5 py-2.5 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(120,60,30,0.2)] ring-2 ring-white/70 backdrop-blur-[4px] transition hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-[#ff9fc6]/55 active:scale-95"
            >
              开始浏览摄影作品
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
