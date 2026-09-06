import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// 摄影作品：封面流（Cover Flow）
//   - 素材：public/photo-works/01.jpg … (按命名顺序，均为竖幅作品)
//   - 交互：点中间“< >”或点左右作品推回中央；中央放大，左右可见上一/下一张。
//   - 自动轮播：间隔前进到末尾停下；把鼠标放在舞台上方可暂停；移开继续。
// ---------------------------------------------------------------------------

const COUNT = 14
const pad = (i: number) => i.toString().padStart(2, '0')
const buildList = Array.from({ length: COUNT }, (_, i) => ({
  src: `/photo-works/${pad(i + 1)}.jpg`,
  num: i + 1,
}))

// 中央卡片尺寸（近似 16:11 裁剪之上的竖幅相框；object-cover 完整铺满）
const CARD_W = 300
const CARD_H = Math.round((CARD_W * 1280) / 960) // 400
const STEP = 190 // 相邻卡片的中心间距

const AUTO_MS = 3400

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
  const prevIdx = useRef(0)

  const canGo = (d: number) => {
    const next = current + d
    return next >= 0 && next <= COUNT - 1
  }

  const goTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(COUNT - 1, next))
    prevIdx.current = current
    setCurrent(clamped)
  }, [current])

  const next = useCallback(() => {
    if (current < COUNT - 1) goTo(current + 1)
  }, [current, goTo])

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1)
  }, [current, goTo])

  // 自动轮播
  useEffect(() => {
    if (paused || current >= COUNT - 1) return
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
        style={{ height: CARD_H + 10 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
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
            // 高层级在前：中央 1 · 紧邻 0.85 · 稍远 0.6 · 其余淡出不参与
            const opac = far === 0 ? 1 : far === 1 ? 0.85 : far === 2 ? 0.6 : 0
            return (
              <motion.div
                key={photo.src}
                className="absolute top-0"
                style={{ left: i * STEP }}
                initial={false}
                animate={{
                  x: 0,
                  scale: active ? 1 : 0.62,
                  opacity: visible ? opac : 0,
                  filter: active ? 'saturate(1.06) brightness(1.02)' : 'saturate(0.85) brightness(0.9)',
                }}
                transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`作品 ${photo.num}`}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') goTo(i)
                  }}
                  className="relative cursor-pointer overflow-hidden rounded-[20px] border-4 border-white/90 shadow-[0_16px_36px_rgba(30,20,40,0.18)] transition-shadow duration-300 hover:shadow-[0_20px_46px_rgba(255,117,170,0.28)]"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    transformOrigin: 'center center',
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
                    <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-black text-gray-700 shadow">
                      {photo.num}
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
          disabled={!canGo(-1)}
          className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-white/70 text-3xl font-black text-gray-700 shadow-lg backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-30"
        >
          ‹
        </button>
        <button
          aria-label="下一张"
          onClick={next}
          disabled={!canGo(1)}
          className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/80 bg-white/70 text-3xl font-black text-gray-700 shadow-lg backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Dot + 序号信息 */}
      <div className="mt-5 flex flex-col items-center gap-2.5">
        <div
          className="flex items-center gap-1.5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {buildList.map((photo, i) => (
            <button
              key={photo.src}
              aria-label={`到第 ${i + 1} 张`}
              onClick={() => goTo(i)}
              className="relative h-2 rounded-full transition-all duration-300"
              style={{
                width: i === current ? 22 : 8,
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
