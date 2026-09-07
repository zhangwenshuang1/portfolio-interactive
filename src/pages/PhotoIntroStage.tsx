import { motion } from 'framer-motion'
import { useRef, useState, useLayoutEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 摄影「开场墙」：一大块中性面板，9 张随照围绕中央文案 / CTA 自然散布。
//
// 这一版追求的体验：
//  •  "照片是把它们随机摆在这块板的空处" —— 不要排成整齐网格，也不要再挤成一圈；
//  •  竖图竖直 / 横图横平（rotate:0，绝不“放倒”）；
//  •  **互不遮挡**、绕中央文案留一圈空白不被盖住；
//  •  布局是在浏览器里真实测量后生成的 px（左上锚定），任何屏幕都保证成立，
//     而不是拿一组拍脑袋的百分比去赌。
//
// 算法一句话：在中央一个略外扩的“禁入矩形”之外，对每张图随机试放并做矩形碰撞检测
// （重试 / 必要时缩小），生成 9 张互不接触、永不侵入中央留白的位置。
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(3, '0')
const SHOT_COUNT = 9
const SHOTS = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-thumbs/${pad(i + 1)}.jpg`)

// 每张的原始宽高（仅用于让 <img> 保持原始比例；显示层永远 h-auto，零裁切零拉伸）
// 顺序即桌面「拍照」文件夹顺序（已删掉两张）
const NATIVE: Array<{ w: number; h: number }> = [
  { w: 2133, h: 1600 }, // 001 横 4:3
  { w: 1212, h: 810 }, //  002 横 3:2
  { w: 1080, h: 1440 }, // 003 竖 3:4
  { w: 3072, h: 4096 }, // 004 竖 3:4
  { w: 6000, h: 4000 }, // 005 横 3:2
  { w: 3024, h: 4032 }, // 006 竖 3:4
  { w: 4032, h: 3024 }, // 007 横 4:3
  { w: 2268, h: 4032 }, // 008 竖 9:16（窄长）
  { w: 2448, h: 3264 }, // 009 竖 3:4
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
  seedKey: string,
): Tile[] {
  const rand = seededRand(seedKey)
  // 面板四周留白放大些：让最外圈相纸离板边有一段清清爽爽的呼吸带，彼此更好分辨
  const padOut = Math.max(10, Math.round(BW * 0.016))
  const out: Tile[] = []

  // 可用范围（一个闭环：中央禁入矩形），四周边缘留 padOut 的呼吸带
  const edgeMinX = padOut
  const edgeMaxX = BW - padOut
  const edgeMinY = padOut
  const edgeMaxY = BH - padOut

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
    // 起始尺寸留有余裕：竖图宽约 18–23%板宽、横图约 23–28%，
    // 四周留白较多、彼此间隙拉大 —— 九张“各占一席、绝不挤碰”的摊开册页质感。
    const w0 =
      BW *
      (isPortrait ? 0.18 + rand() * 0.05 : 0.23 + rand() * 0.05)
    let w = w0
    // 竖图纵深更高、更吃空间：把它最小步进放宽些，便于塞进外围空带又不至于遮挡
    const minW = Math.max(54, w0 * (isPortrait ? 0.45 : 0.52))

    let placed = false
    // 缩小曲线更长、更诚实：一路小幅减宽直到彻底撞不上，让主循环几乎总能成功，
    // 而不是提前放弃跳到兜底（兜底一旦被绕过，候选中没有预留 occ 就会叠在同一点）。
    for (let shrink = 0; shrink < 28 && !placed; shrink++) {
      if (w < minW) {
        w = minW
      }
      if (w > edgeMaxX - edgeMinX) w = edgeMaxX - edgeMinX
      const h = w / ar
      if (h > edgeMaxY - edgeMinY) {
        w = (edgeMaxY - edgeMinY) * ar
        continue
      }
      // 在可放空间中随机采样，拒绝侵入留白或与已有重叠的候选
      const tries =
        3200 +
        Math.ceil((BW * BH) / (w * h)) * 60
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
      if (!placed) w *= 0.94 // 放不下：小幅减宽后继续撒
    }

    if (!placed) {
      // 真正的终极兜底：任何一张在这一版几乎都不该进来，但即便走到这，仍要在板的
      // 空带里找唯一不在留白、不碰任何已占盒的候选，并且把“这次占用的位置”写回 occ，
      // 这样后续图绝不会再把同一坐标重复放出来 —— 从根上杜绝“三张叠一起”。
      let w2 = minW
      // 从 minW 再退化试探，地板只到约 10% 板宽 —— 决不让竖图缩成「细横线」失掉竖构图
      let found = false
      for (let deg = 0; deg < 8 && !found; deg++) {
        w2 = Math.max(BW * 0.10, Math.round(w2 * 0.9))
        if (w2 > edgeMaxX - edgeMinX) w2 = edgeMaxX - edgeMinX
        const h2 = w2 / ar
        if (h2 > edgeMaxY - edgeMinY) continue
        const tries = 4200
        for (let t = 0; t < tries && !found; t++) {
          const x = edgeMinX + rand() * (edgeMaxX - edgeMinX - w2)
          const y = edgeMinY + rand() * (edgeMaxY - edgeMinY - h2)
          if (inFree(x, y, x + w2, y + h2)) continue
          if (collides(x, y, x + w2, y + h2)) continue
          occ.push({
            l: x - gap,
            t: y - gap,
            r: x + w2 + gap,
            b: y + h2 + gap,
          })
          out.push({
            x: Math.round(x),
            y: Math.round(y),
            w: Math.round(w2),
          })
          placed = true
          found = true
        }
      }
      // 理论上上面一定会找到；极端兜底再备一层：沿上缘均匀错开、保证坐标互异后放
      if (!found) {
        const bw = Math.max(
          Math.max(48, Math.round(BW * 0.085)),
          Math.min(w2, (edgeMaxX - edgeMinX - gap) / 3),
        )
        const bh = bw / ar
        let pickedOnce = false
        for (let k = 0; k < edgeMaxX - edgeMinX && !pickedOnce; k++) {
          const x0c = edgeMinX + k
          const y0c = edgeMinY
          if (
            x0c + bw <= edgeMaxX &&
            y0c + bh <= edgeMaxY &&
            !inFree(x0c, y0c, x0c + bw, y0c + bh) &&
            !collides(x0c, y0c, x0c + bw, y0c + bh)
          ) {
            occ.push({
              l: x0c - gap,
              t: y0c - gap,
              r: x0c + bw + gap,
              b: y0c + bh + gap,
            })
            out.push({ x: Math.round(x0c), y: Math.round(y0c), w: Math.round(bw) })
            placed = true
            pickedOnce = true
          }
        }
        if (!pickedOnce) {
          // 板面极小或全部占满——至少保证不叠在同一像素（逐左移扫到可放的坐标）
          out.push({ x: edgeMinX, y: edgeMaxY - Math.min(bh / 1, edgeMaxY - edgeMinY), w: Math.min(bw, (edgeMaxX - edgeMinX) / 1) })
        }
      }
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
      // 更贴近中央的“贴纸式”构图：呼吸空隙收得更紧，让围绕文案的一圈不留大空洞，
      // 但仍保证任何相纸都不压到文字
      // breath 也放大些：文字周围留的呼吸带允许相纸离得较远，绝无任何一张贴上文案
      const breath = Math.max(16, Math.round(bb.width * 0.018))
      const avoid: Rect = {
        x0: cb.left - bb.left - breath,
        x1: cb.right - bb.left + breath,
        y0: cb.top - bb.top - breath,
        y1: cb.bottom - bb.top + breath,
      }
      // 相纸彼此的最小空隙放大：保证九张各自独立、边缘绝不接触/压到（视觉上也留出清爽间隔）
      const gap = Math.max(14, Math.round(bb.width * 0.013))
      // 相纸彼此的空隙收得更紧，让墙更有“铺满”感但仍留像素级安全边

      // —— 均衡构造（这一版改成「对角相框四角取样」）：同一布局算法用多个随机种子各排一遍，
      // 挑一个让 4 个对角角落区（左上/右上/左下/右下）都尽量有相纸、且每角都试着横竖错位
      // 的解，把画面撑成一本合拢的“纪念册”——四角堆叠、中央对齐的文案像书脊一样被托住。 ——
      const qW = bb.width / 2
      const qH = bb.height / 2
      const isH = (i: number) => NATIVE[i].w / NATIVE[i].h > 1
      // —— 每张图按几何中心归到某个角落（四等分）；角内用位掩码记它含横/竖 ——
      const score = (cand: Tile[]) => {
        const bit: number[] = [0, 0, 0, 0] // 四角各一个掩码：1=含横,2=含竖（先填H）
        let nPer: number[] = [0, 0, 0, 0]
        cand.forEach((tl, i) => {
          const ar = NATIVE[i].w / NATIVE[i].h
          const hh = tl.w / ar
          const cx = tl.x + tl.w / 2
          const cy = tl.y + hh / 2
          let c = 0
          if (cx < qW && cy < qH) c = 0
          else if (cx >= qW && cy < qH) c = 1
          else if (cx < qW && cy >= qH) c = 2
          else c = 3
          bit[c] |= isH(i) ? 1 : 2
          nPer[c]++
        })
        // 4 角都要有最少一张 → 只把牌摊到四角的才留；四角各自越丰富分越高
        let total = 0
        for (let c = 0; c < 4; c++) {
          if (nPer[c] === 0) return -100 // 某角空了 → 直接劣化
          total += 3 + nPer[c] // 每角保底 3 分 + 每多一张+1
          if (bit[c] === 3) total += 3 // 该角落横竖都有再多 3 分
        }
        // 让四角每张都不至于挤到边角顶出超大洞：照顾上下/左右对称的大方向（弱偏好）
        const u = nPer[0] + nPer[1] // 上
        const dwn = nPer[2] + nPer[3]
        const L = nPer[0] + nPer[2]
        const R = nPer[1] + nPer[3]
        const sy = Math.min(u, dwn) >= 2 ? 1 : 0 // 上下各≥2
        const sx = Math.min(L, R) >= 2 ? 1 : 0
        return total + sy * 4 + sx * 4
      }

      let best: Tile[] = layoutWall(bb.width, bb.height, avoid, gap, 'album-base')
      let bestS = -Infinity
      for (let s = 0; s < 240; s++) {
        const cand = layoutWall(
          bb.width,
          bb.height,
          avoid,
          gap,
          'album-clear-' + s,
        )
        const sc = score(cand)
        if (sc > bestS) {
          bestS = sc
          best = cand
          if (sc >= 40) break
        }
      }
      setTiles(best)
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
              className="group pointer-events-auto absolute cursor-zoom-in"
              style={{ left: tile.x, top: tile.y, width: tile.w }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.99 }}
              transition={{
                delay: 0.04 + i * 0.045,
                type: 'spring',
                stiffness: 150,
                damping: 20,
                mass: 0.7,
              }}
            >
              {/* hover 微光：紧贴相纸边缘的暖色晕圈，随悬停淡入 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-[1.5px] rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(120% 120% at 50% 50%, rgba(255,190,90,0) 60%, rgba(255,150,70,0.45) 84%, rgba(255,215,130,0.45) 92%, rgba(255,205,120,0) 100%)',
                  filter: 'blur(4px)',
                }}
              />
              <img
                src={SHOTS[i]}
                alt=""
                width={d.w}
                height={d.h}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="relative block h-auto w-full rounded-xl drop-shadow-[0_10px_16px_rgba(110,75,30,0.16)] transition-[filter,transform] duration-300 ease-out group-hover:scale-[1.03] group-hover:brightness-110 group-hover:saturate-125 group-hover:drop-shadow-[0_0_16px_rgba(255,150,80,0.6)]"
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
            <span className="rounded-full bg-[rgba(255,252,245,0.62)] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.42em] text-[#8a5a2a] shadow-sm ring-1 ring-white/60 backdrop-blur-[6px]">
              胶片上的 · 九封信
            </span>
            <h2 className="max-w-[470px] text-[clamp(17px,3.05vw,25px)] font-black leading-snug tracking-wide text-[#241c10] [filter:drop-shadow(0_2px_12px_rgba(255,248,236,0.95))]">
              趁还没被风吹散，
              <br className="sm:hidden" />
              我把舍不得的都叠进
              <span className="bg-gradient-to-r from-[#0f9b8e] via-[#3b8fd9] to-[#b0395f] bg-clip-text text-transparent antialiased">
                方寸之间
              </span>
            </h2>
            <p className="max-w-[400px] text-[13.5px] font-semibold leading-7 tracking-wide text-[#3b2f1e] [filter:drop-shadow(0_1px_8px_rgba(255,250,242,0.95))]">
              一张相纸，是一个被我轻轻合上的片段——
              你若翻开，请慢一点。
            </p>
            <button
              onClick={onBegin}
              className="pointer-events-auto group mt-1 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff2d78] via-[#ff5d3a] to-[#ffb020] px-7 py-3 text-[15px] font-black text-white shadow-[0_14px_28px_rgba(242,60,90,0.45),inset_0_1px_0_rgba(255,255,255,0.55)] ring-2 ring-white/80 backdrop-blur-[4px] transition hover:scale-[1.06] hover:shadow-[0_18px_36px_rgba(242,60,90,0.55)] focus:outline-none focus:ring-4 focus:ring-[#ff5d3a]/50 active:scale-95"
            >
              开始浏览我的作品
              <span className="translate-x-0 text-[17px] transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
