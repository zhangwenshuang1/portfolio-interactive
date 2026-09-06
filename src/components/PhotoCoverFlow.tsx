import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { rollAt, ROLL_SIZE } from '../lib/photoRoll'

// ---------------------------------------------------------------------------
// 摄影封面流（Cover Flow）
//   - 素材：public/photo-works/*.jpg（现 001 …按序；数量跟着你的「拍照」目录走）
//   - 循环：每张停留 1s 自动换下一张，播完再回到第 1 张；
//   - 交互：鼠标停到画面 / 下方指示上会暂停，移开继续；点图或 ‹ › 可手动切换。
// ---------------------------------------------------------------------------

const COUNT = ROLL_SIZE
const buildList = Array.from({ length: COUNT }, (_, i) => ({
  src: rollAt(i + 1),
  num: i + 1,
}))

// 中央卡片尺寸（竖幅，object-cover 铺满；放大到能作为整块视觉焦点）
const CARD_W = 430
const CARD_H = Math.round((CARD_W * 1280) / 960) // ≈ 574
// 卡片间距留出间隙：邻卡不会碰到放大后的中央
const STEP = Math.round(CARD_W * 1.06)
// 环形舞台一次看到的张数（正中央及其左右各三张）
const VIEW_W = 7
// 越远越小，把主次拉开
const NEAR = 0.9
const T2 = 0.72
const T3 = 0.5
const T4 = 0.32

// 每张停留 1 秒后自动进入下一张
const AUTO_MS = 1000

interface Props {
  className?: string
}

export default function PhotoCoverFlow({ className = '' }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  // 上一张 / 下一张：无缝循环，末尾的下一张回到第 1 张
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

  // 也响应键盘左右键，方便只用方向键手动播放/切换
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  return (
    <div className={className}>
        {/* 舞台本身不监听悬停：若在“点击开始后鼠标留在原地”也算暂停，画幅永远不动。
            此处于鼠标移入舞台的空白边缘也得让轮播继续。 */}
        <div className="relative select-none overflow-hidden" style={{ height: CARD_H + 16 }}>
        {/* 米白衬底：暖色底板把整行作品框起来，大页面上不显得空（仿首页拼图那块米白底） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-0 right-0 z-0 rounded-[30px] border border-[#f0e4d2]/70 bg-[linear-gradient(180deg,#fdfaf4,#f6efe1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_26px_70px_rgba(190,155,115,0.14)]"
        />
        {/* 环形作品台：当前位置左右各取几张，用 % 算出真正的“第 N+1 张”，
            因此中央永远是相册里挨着排序的下一张；最后一张的右侧直接回落到第 1 张。 */}
        {Array.from({ length: VIEW_W }, (_, k) => {
          const rel = k - Math.floor(VIEW_W / 2)
          const idx = (((current + rel) % COUNT) + COUNT) % COUNT
          const far = Math.abs(rel)
          const active = rel === 0
          // 主从表：中央 1:1 · 贴邻 .92 · 隔一张 .74 · 更远 .5/.34，最外淡出
          const scale = active ? 1 : far === 1 ? NEAR : far === 2 ? T2 : far === 3 ? T3 : T4
          const opac = active ? 1 : far === 1 ? 0.94 : far === 2 ? 0.82 : far === 3 ? 0.66 : 0.4
          const zidx = active ? 500 : far === 1 ? 2 : 0
          const f = (s: number, b: number) => `saturate(${s}) brightness(${b})`
          const filter = active
            ? f(1.07, 1.04)
            : far === 1
            ? f(0.97, 0.97)
            : far === 2
            ? f(0.9, 0.95)
            : f(0.82, 0.92)
          const id = idx + 1
          return (
            <motion.div
              key={id}
              className="absolute"
              // 让 rel=0 的那一张停在正中央
              style={{ left: `calc(50% - ${CARD_W / 2}px + ${rel * STEP}px)`, top: (CARD_H - CARD_H) / 2 - 0 }}
              initial={false}
              animate={{ scale, opacity: opac, zIndex: zidx, filter }}
              transition={{ type: 'spring', stiffness: 220, damping: 30 }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-label={`作品 ${id}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => setCurrent(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setCurrent(idx)
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
                  src={rollAt(id)}
                  alt={`摄影作品 ${id}`}
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
                {/* 轻微暗脚，区分前景（数字角标已按需求移除，只留小点） */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-80" />
              </div>
            </motion.div>
          )
        })}

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

      {/* 指示小点（只保留小点，不要“第几张/共几张”数字） */}
      <div className="mt-4 flex items-center justify-center">
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
      </div>
    </div>
  )
}
