import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// 摄影封面流（Cover Flow）
//   - 素材：public/photo-works/001.jpg … 024.jpg（共24张，命名顺序即播放顺序）
//   - 循环：每张停留 0.5s 自动换下一张，播完 24 接着从第 1 张再开始；
//   - 交互：鼠标停到画面 / 下方指示上会暂停，移开继续；点图或 ‹ › 可手动切换。
// ---------------------------------------------------------------------------

const COUNT = 24
const pad = (i: number) => i.toString().padStart(3, '0')
const buildList = Array.from({ length: COUNT }, (_, i) => ({
  src: `/photo-works/${pad(i + 1)}.jpg`,
  num: i + 1,
}))

// 中央卡片尺寸（竖幅，object-cover 铺满；放大到能作为整块视觉焦点）
const CARD_W = 430
const CARD_H = Math.round((CARD_W * 1280) / 960) // ≈ 574
// 卡片间距留出间隙：邻卡不会碰到放大后的中央
const STEP = Math.round(CARD_W * 1.06)
// 越远越小，把主次拉开
const NEAR = 0.9
const T2 = 0.72
const T3 = 0.5
const T4 = 0.32

// 每张仅在屏幕上停留 0.5 秒，随后无缝进入下一张
const AUTO_MS = 500

function useStageWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return { ref, width }
}

interface Props {
  className?: string
}

export default function PhotoCoverFlow({ className = '' }: Props) {
  const { ref: stageRef, width: stageW } = useStageWidth<HTMLDivElement>()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  // 轮播的上一张/下一张：两端做无缝循环（14 之后回到 1，1 之前到 14）
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % COUNT)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + COUNT) % COUNT)
  }, [])

  // 自动轮播：循环往复，到尾自动回到开头，不强停
  useEffect(() => {
    if (paused) return
    const t = window.setTimeout(next, AUTO_MS)
    return () => window.clearTimeout(t)
  }, [current, paused, next])

  const deco = (num: number) => (num % 4 === 0 ? '照片分享' : '')

  // 舞台中央坐标：用来决定“平移多少 px 让第 current 张居中”
  const centered = stageW > 0
  const laneX = centered ? -current * STEP + stageW / 2 - CARD_W / 2 : 0

  return (
    <div className={className}>
        <div
          ref={stageRef}
          className="relative select-none overflow-hidden"
          style={{ height: CARD_H + 10, maxHeight: 'calc(92vh - 220px)' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
      >
        {/* 米白衬底：暖色底板把整行作品框起来，大页面上不显得空（仿首页拼图那块米白底） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-0 right-0 z-0 rounded-[30px] border border-[#f0e4d2]/70 bg-[linear-gradient(180deg,#fdfaf4,#f6efe1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_26px_70px_rgba(190,155,115,0.14)]"
        />
        {/* 移动轨道：所有作品沿横轴排成一行，靠平移把当前张送到舞台中央 */}
        <motion.div
          className="relative top-0 h-full"
          style={{ width: '100%', willChange: 'transform' }}
          animate={{ x: laneX }}
          transition={{ type: 'spring', stiffness: 190, damping: 26, mass: 0.6 }}
        >
          {buildList.map((photo, i) => {
            const rel = i - current
            const far = Math.abs(rel)
            const visible = far <= 4
            const active = rel === 0
            // 主从表：中央 1:1 · 贴邻 .9 · 隔一张 .72 · 再外 .5/.32，其后淡出
            const scale = active ? 1 : far === 1 ? NEAR : far === 2 ? T2 : far === 3 ? T3 : T4
            const opac = far === 0 ? 1 : far === 1 ? 0.92 : far === 2 ? 0.8 : far === 3 ? 0.62 : 0.36
            // 层叠：中央压到同一轨道最前面；两侧会推远下沉，因此绝不遮挡中心
            const zidx = far === 0 ? 500 : far === 1 ? 2 : 0
            const f = (s: number, b: number) => `saturate(${s}) brightness(${b})`
            const filter = active
              ? f(1.07, 1.04)
              : far === 1
              ? f(0.98, 0.97)
              : far === 2
              ? f(0.9, 0.94)
              : f(0.8, 0.9)
            return (
              <motion.div
                key={photo.src}
                className="absolute top-0"
                style={{ left: i * STEP }}
                initial={false}
                animate={{
                  x: 0,
                  scale,
                  opacity: visible ? opac : 0,
                  zIndex: visible ? zidx : 0,
                  filter,
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`作品 ${photo.num}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setCurrent(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setCurrent(i)
                  }}
                  className="relative cursor-pointer overflow-hidden rounded-[20px] border-4 border-white/90 shadow-[0_16px_36px_rgba(30,20,40,0.18)] transition-shadow duration-300 hover:shadow-[0_20px_46px_rgba(255,117,170,0.28)]"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transformOrigin: 'center center',
                    boxShadow: active
                      ? '0 0 0 7px rgba(255,119,171,0.34), 0 30px 64px rgba(30,15,42,0.42)'
                      : '0 14px 30px rgba(30,20,45,0.16)',
                  }}
                >
                  <img
                    src={photo.src}
                    alt={`摄影作品 ${photo.num}`}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                  {/* 轻微暗脚，区分前景 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-80" />
                  {active && (
                    <span className="pointer-events-none absolute left-3 top-3 flex items-baseline gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-gray-800 shadow-[0_8px_20px_rgba(255,80,160,0.4)] ring-2 ring-[#ff7eb6]/40">
                      {photo.num}
                      <span className="text-[11px] font-extrabold text-gray-400">
                        / {COUNT}
                      </span>
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* 左右导向箭头（覆盖，不挡点击；到两端自动禁用） */}
        <button
          aria-label="上一张"
          onClick={prev}
          className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-white/70 text-3xl font-black text-gray-700 shadow-lg backdrop-blur transition hover:bg-white"
        >
          ‹
        </button>
        <button
          aria-label="下一张"
          onClick={next}
          className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-white/70 text-3xl font-black text-gray-700 shadow-lg backdrop-blur transition hover:bg-white"
        >
          ›
        </button>
      </div>

      {/* 指示小点（24 个位置略�挤，用紧凑小点并允许换行） */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div
          className="flex max-w-[560px] flex-wrap items-center justify-center gap-x-1.5 gap-y-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {buildList.map((photo, i) => (
            <button
              key={photo.src}
              aria-label={`到第 ${i + 1} 张`}
              onClick={() => setCurrent(i)}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 16 : 6,
                background: i === current ? '#ff7eb6' : '#d9b8cc',
              }}
            />
          ))}
        </div>

        <div className="flex items-baseline gap-2 text-gray-600">
          <span className="font-mono text-base font-black text-gray-700">
            {String(current + 1).padStart(2, '0')}
          </span>
          <span className="text-xs font-bold opacity-60">/ {String(COUNT).padStart(2, '0')}</span>
          <span className="ml-3 text-xs text-gray-400">{deco(current + 1)}</span>
        </div>
      </div>
    </div>
  )
}
