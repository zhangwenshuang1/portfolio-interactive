import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AnimeMap, { LANDMARKS, MAP_W, MAP_H } from '../components/AnimeMap'

interface HobbyStageProps {
  onClose: () => void
}

// 一种兴趣：emoji、中英文名、在地图上的坐标(百分比)、该兴趣的照片
interface Hobby {
  key: string
  emoji: string
  en: string
  cn: string
  /** 圆点在地图上的落点（相对舞台宽/高的百分比） */
  x: number
  y: number
  /** 连接线用的轻微错位，避免所有点排成直线 */
  photos: string[]
  /** 该兴趣的一句话简介 */
  blurb: string
}

/** 把地图画布坐标换算成舞台百分比坐标 */
const pct = (p: { x: number; y: number }) => ({
  x: (p.x / MAP_W) * 100,
  y: (p.y / MAP_H) * 100,
})

/** 每张照片的原始宽高比（宽 / 高），新照片忘了登记也能用运行时实测值兜底 */
const PHOTO_RATIO: Record<string, number> = {
  'music-1': 0.75, 'music-2': 1.453,
  'cook-1': 0.75, 'cook-2': 0.75,
  'climb-1': 0.75, 'climb-2': 0.75, 'climb-3': 0.75,
  'swim-1': 1.777,
  'hike-1': 0.75, 'hike-2': 1.774,
  'ball-1': 0.667, 'ball-2': 0.75, 'ball-3': 0.666,
}

// 一张兴趣地图：六个兴趣点各自落在符合语义的地标上，
// 鼠标移上去会像灯一样亮起，旁边浮出照片。
const HOBBIES: Hobby[] = [
  {
    key: 'music',
    emoji: '🎸',
    en: 'MUSIC',
    cn: '音乐',
    ...pct(LANDMARKS.bigTree),
    photos: ['music-1', 'music-2'],
    blurb: '一把吉他，几个和弦，把日子弹成歌。',
  },
  {
    key: 'cook',
    emoji: '🍳',
    en: 'COOK',
    cn: '烹饪',
    ...pct(LANDMARKS.camp),
    photos: ['cook-1', 'cook-2'],
    blurb: '把食材变成一顿热乎饭，是最踏实的浪漫。',
  },
  {
    key: 'climb',
    emoji: '🧗',
    en: 'CLIMB',
    cn: '攀岩',
    ...pct(LANDMARKS.rock),
    photos: ['climb-1', 'climb-2', 'climb-3'],
    blurb: '往上一步，世界就多开一扇窗。',
  },
  {
    key: 'swim',
    emoji: '🏊',
    en: 'SWIM',
    cn: '游泳',
    ...pct(LANDMARKS.lake),
    photos: ['swim-1'],
    blurb: '水里的安静，是我给大脑开的静音键。',
  },
  {
    key: 'hike',
    emoji: '🏔',
    en: 'HIKE',
    cn: '徒步',
    ...pct(LANDMARKS.mountainTop),
    photos: ['hike-1', 'hike-2'],
    blurb: '把烦恼留在山脚，把风景装进肺里。',
  },
  {
    key: 'ball',
    emoji: '🏀',
    en: 'BALL',
    cn: '篮球',
    ...pct(LANDMARKS.court),
    photos: ['ball-1', 'ball-2', 'ball-3'],
    blurb: '球场上跑起来，风就追不上我了。',
  },
]

export default function HobbyStage({ onClose }: HobbyStageProps) {  const [active, setActive] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const [rolled, setRolled] = useState(false)
  const [vp, setVp] = useState({ w: 1440, h: 900 })
  // 每张照片的原始宽高比（宽 / 高），用来在不改变比例的前提下计算它能占多宽
  const [ratios, setRatios] = useState<Record<string, number>>({})
  // 已「读取」过的兴趣：一旦点亮过就永久保持高亮
  const [seen, setSeen] = useState<Record<string, boolean>>({})

  // 一打开就播放「卷轴展开」动画
  useEffect(() => {
    const t = window.setTimeout(() => setRolled(true), 120)
    return () => window.clearTimeout(t)
  }, [])

  // 记录视口尺寸，用于计算照片高度（保证照片不变形且不超出屏幕）
  useEffect(() => {
    const sync = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  // 记录地图面板的实际尺寸：方框必须完全落在面板内
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [panel, setPanel] = useState({ w: 1088, h: 753 })
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const sync = () => {
      const r = el.getBoundingClientRect()
      setPanel({ w: r.width, h: r.height })
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const activeHobby = useMemo(
    () => HOBBIES.find((h) => h.key === active) ?? null,
    [active],
  )

  // 图片加载时记录它真实的原始宽高比，保证计算时的比例 100% 准确
  const rememberRatio = (img: HTMLImageElement | null, key: string) => {
    if (!img || !img.naturalHeight) return
    const r = img.naturalWidth / img.naturalHeight
    setRatios((cur) => (cur[key] === r ? cur : { ...cur, [key]: r }))
  }

  // 已知则用实测原始比例，否则回退到照片尺寸表
  const ratioOf = (p: string) => ratios[p] ?? PHOTO_RATIO[p] ?? 1

  // 图标向内收缩：把落在画面边缘的图标拉进安全区（保证完整可见，不压边、不溢出） */
  const NODE_HALF = 56 // 图标半径（80px 移动端 / 112px 桌面端取大者的一半）
  const safe = {
    x: ((NODE_HALF + 14) / Math.max(1, panel.w)) * 100,
    y: ((NODE_HALF + 14) / Math.max(1, panel.h)) * 100,
  }
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const nodePos = (p: { x: number; y: number }) => ({
    // 把地标坐标往画面中心收 8%，同时强制落在安全区内
    x: clamp(p.x + (50 - p.x) * 0.08, safe.x, 100 - safe.x),
    y: clamp(p.y + (50 - p.y) * 0.08, safe.y, 100 - safe.y),
  })

  // 照片统一高度：宽度由图片自身比例决定，所以比例永远不会被改变；
  // 弹窗（方框）不用预估宽度，而是按内容收缩，恰好框住照片。
  // 高度从基准值逐步降低，直到同时满足：所有照片并排一行放得下、
  // 方框不超过面板宽度、也不超过面板高度（所以攀岩/篮球的三张竖图也永远是一行）。
  const photoH = useMemo(() => {
    const base = Math.min(440, Math.round(0.42 * vp.h))
    const list = activeHobby?.photos ?? []
    const pad = (vp.w >= 640 ? 16 : 12) * 2 + 6 // 卡片内边距 + 边框
    const availW = Math.round(panel.w * 0.98) - pad
    const availH = Math.round(panel.h * 0.92)
    const gaps = Math.max(0, list.length - 1) * 16
    const extraH = 484 - 378 // 标题 + 简介等固定内容高度
    const fits = (h: number) => {
      const rowW = list.reduce((a, p) => a + Math.round(ratioOf(p) * h), 0) + gaps
      return rowW <= availW && h + extraH <= availH
    }
    let h = base
    while (h > 120 && !fits(h)) h -= 8
    return h
  }, [vp, activeHobby, ratios, panel])

  // 键盘：Esc 关闭；← → 在兴趣之间切换，方便无鼠标浏览
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        setActive((cur) => {
          const i = HOBBIES.findIndex((h) => h.key === cur)
          const dir = e.key === 'ArrowRight' ? 1 : -1
          const nextI = i < 0 ? 0 : (i + dir + HOBBIES.length) % HOBBIES.length
          return HOBBIES[nextI].key
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const enter = (key: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setActive(key)
    // 一旦读取过，就永久点亮（不会因为鼠标移开而熄灭）
    setSeen((cur) => (cur[key] ? cur : { ...cur, [key]: true }))
  }
  const leave = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    // 稍微延迟收起，避免鼠标在点与照片面板之间移动时闪烁
    timerRef.current = window.setTimeout(() => setActive(null), 120)
  }

  return (
    <div className="relative min-h-0 flex flex-1 flex-col">
      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border-[3px] border-[#8a6a44]/70 bg-[#e6d0a4] shadow-[0_30px_80px_-30px_rgba(60,40,20,0.8)]"
      >
        {/* ══ 卷轴画布：左右各有一根卷轴杆，地图像画轴一样从中间向两边展开 ══ */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: 'inset(0% 50% 0% 50%)' }}
          animate={{ clipPath: rolled ? 'inset(0% 0% 0% 0%)' : 'inset(0% 50% 0% 50%)' }}
          transition={{ duration: 1.05, ease: [0.22, 0.8, 0.25, 1] }}
        >
          {/* 动漫风手绘地图（山 / 海 / 湖 / 梯田 / 地标） */}
          <AnimeMap className="pointer-events-none absolute inset-0 h-full w-full" />

          {/* 地图纸的柔和暗角，让图标更突出 */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(120,80,40,0.22)]"
          />
        </motion.div>

        {/* 展开中的两圈卷轴纸卷 */}
        {[0, 1].map((side) => (
          <motion.div
            key={side}
            aria-hidden
            className="pointer-events-none absolute top-0 z-20 h-full w-4 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #b98c50 0%, #f0dcb2 35%, #fffaf0 50%, #f0dcb2 65%, #b98c50 100%)',
              boxShadow: '0 0 20px rgba(80,50,20,0.4)',
            }}
            initial={{ left: '50%', opacity: 1 }}
            animate={{
              left: rolled ? (side === 0 ? '-1%' : '97%') : '50%',
              opacity: rolled ? 0 : 1,
            }}
            transition={{ duration: 1.05, ease: [0.22, 0.8, 0.25, 1] }}
          />
        ))}

        {/* 标题 */}
        <div className="pointer-events-none relative z-10 flex items-start justify-between px-5 pt-4 sm:px-7">
          <div>
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#8a5a2b]">
              Interest Map · MOVE
            </p>
            <h2
              className="mt-1 text-xl font-black text-[#4a3417] drop-shadow-[0_2px_10px_rgba(255,250,235,0.85)] sm:text-2xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              我的兴趣地图
            </h2>
          </div>
        </div>

        {/* 地图主体 */}
        <div className="absolute inset-0">
          {/* 连接线：把相邻兴趣点连成一张"地图网络"，点亮时高亮 */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {HOBBIES.map((h, i) => {
              const next = HOBBIES[(i + 1) % HOBBIES.length]
              const on = active === h.key || active === next.key
              const lit = !!seen[h.key] && !!seen[next.key]
              const a = nodePos(h)
              const b = nodePos(next)
              return (
                <line
                  key={h.key}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={on ? 'rgba(180,86,43,0.75)' : lit ? 'rgba(214,150,70,0.5)' : 'rgba(120,85,40,0.22)'}
                  strokeWidth={on ? 0.5 : lit ? 0.4 : 0.3}
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                />
              )
            })}
          </svg>

          {/* 兴趣节点 */}
          {HOBBIES.map((h, i) => {
            const isOn = active === h.key
            const isSeen = !!seen[h.key]
            const pos = nodePos(h)
            return (
              <motion.button
                key={h.key}
                type="button"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: rolled ? 1 : 0,
                  scale: rolled ? 1 : 0.4,
                }}
                transition={{ delay: rolled ? 0.85 + i * 0.09 : 0, duration: 0.4, ease: 'backOut' }}
                onMouseEnter={() => enter(h.key)}
                onMouseLeave={leave}
                onFocus={() => enter(h.key)}
                onBlur={leave}
                onClick={() => enter(h.key)}
                aria-label={`${h.cn} ${h.en}`}
                className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {/* 上下轻微浮动：让整块图标像悬在地图上，错开相位避免齐刷刷 */}
                <motion.div
                  animate={{ y: rolled ? [0, -7, 0] : 0 }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.42,
                  }}
                >
                {/* 已读取图标外圈：两圈持续扩散的光环波纹 */}
                {isSeen && (
                  <>
                    {[0, 1].map((r) => (
                      <motion.span
                        key={r}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[26px] border-2 border-[#f0b45a]"
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{ opacity: [0.55, 0, 0.55], scale: [1, 1.85, 1] }}
                        transition={{
                          duration: isOn ? 2.2 : 3.4,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: r * (isOn ? 1.1 : 1.7) + i * 0.2,
                        }}
                      />
                    ))}
                  </>
                )}
                <motion.div
                  animate={
                    isOn
                      ? {
                          scale: 1.14,
                          rotate: [0, -2.5, 2.5, 0],
                          boxShadow:
                            '0 0 0 8px rgba(255,196,88,0.4), 0 0 52px 14px rgba(246,180,62,0.95)',
                        }
                      : isSeen
                        ? {
                            scale: 1,
                            boxShadow:
                              '0 0 0 5px rgba(255,212,130,0.32), 0 0 30px 7px rgba(246,190,90,0.7)',
                          }
                        : {
                            scale: 1,
                            boxShadow: '0 4px 14px 0 rgba(80,50,20,0.25)',
                          }
                  }
                  transition={{
                    boxShadow: { type: 'spring', stiffness: 320, damping: 22 },
                    scale: { type: 'spring', stiffness: 320, damping: 22 },
                    rotate: { duration: 1.8, repeat: isOn ? Infinity : 0, ease: 'easeInOut' },
                  }}
                  className={`relative flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-[22px] border-[3px] backdrop-blur-sm transition-colors duration-300 sm:h-28 sm:w-28 ${
                    isOn
                      ? 'border-[#f0a93c] bg-[#fff8e6]/95'
                      : isSeen
                        ? 'border-[#e2b96a] bg-[#fff6df]/92'
                        : 'border-[#b9b1a4]/70 bg-[#e8e3d8]/80'
                  }`}
                >
                  {/* 已读取的图标持续发光：柔和的呼吸光晕 */}
                  {isSeen && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[22px]"
                      animate={{
                        opacity: isOn ? [0.85, 1, 0.85] : [0.5, 0.85, 0.5],
                        boxShadow: isOn
                          ? '0 0 40px 12px rgba(246,180,62,0.85)'
                          : '0 0 22px 5px rgba(246,190,90,0.55)',
                      }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  {/* 高光斜扫：已读取的图标每隔几秒掠过一道光 */}
                  {isSeen && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                      initial={{ left: '-40%' }}
                      animate={{ left: ['-40%', '120%'] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: isOn ? 1.6 : 3.4,
                        ease: 'easeInOut',
                        delay: i * 0.5,
                      }}
                    />
                  )}
                  <motion.span
                    className={`text-4xl transition-all duration-300 sm:text-5xl ${
                      isSeen ? '' : 'grayscale opacity-45'
                    }`}
                    animate={
                      isOn
                        ? { scale: [1, 1.22, 1], rotate: [0, 8, -6, 0] }
                        : isSeen
                          ? { scale: [1, 1.07, 1], rotate: [0, 3, -3, 0] }
                          : {}
                    }
                    transition={{
                      duration: isOn ? 1.1 : 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                  >
                    {h.emoji}
                  </motion.span>
                  <span
                    className={`font-cartoon-latin mt-0.5 text-[11px] font-black tracking-[0.18em] transition-colors duration-300 sm:text-[13px] ${
                      isOn
                        ? 'text-[#8a4a12]'
                        : isSeen
                          ? 'text-[#a07a3c]'
                          : 'text-[#9a958c]'
                    }`}
                  >
                    {h.en}
                  </span>
                </motion.div>
                </motion.div>
                {/* 未点亮时是暗点，点亮后浮现中文名 */}
                <AnimatePresence>
                  {isOn && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#d9743a] px-2.5 py-0.5 text-[11px] font-bold text-[#fff8e6] shadow-lg"
                    >
                      {h.cn}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}

          {/* 浮出的照片面板：跟着当前点亮的兴趣 */}
          <AnimatePresence>
            {activeHobby && (
              <motion.div
                key={activeHobby.key}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.28 }}
                onMouseEnter={() => enter(activeHobby.key)}
                onMouseLeave={leave}
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
              >
                <div
                  className="pointer-events-auto block max-w-full"
                  onMouseEnter={() => enter(activeHobby.key)}
                  onMouseLeave={leave}
                  style={{ '--photo-h': `${photoH}px` } as React.CSSProperties}
                >
                <div className="inline-block rounded-3xl border-[3px] border-[#b08a52]/70 bg-[#fffdf6]/96 p-3 shadow-[0_24px_70px_-20px_rgba(60,40,20,0.75)] backdrop-blur sm:p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xl">{activeHobby.emoji}</span>
                    <span className="font-cartoon-latin text-sm font-black tracking-[0.16em] text-[#4a3417]">
                      {activeHobby.en}
                    </span>
                    <span className="text-sm font-bold text-[#c1682f]">{activeHobby.cn}</span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a68a5c]">
                      {activeHobby.photos.length} 张
                    </span>
                  </div>
                  <p className="mb-2.5 text-[12px] font-medium leading-relaxed text-[#6f5a3c]">
                    {activeHobby.blurb}
                  </p>
                  <div className="flex flex-nowrap items-center justify-center gap-4 whitespace-nowrap">
                    {activeHobby.photos.map((p, i) => (
                      <motion.div
                        key={p}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.06 }}
                        className="shrink-0 overflow-hidden rounded-xl border border-[#d8c49a] bg-[#f4ead4]"
                      >
                        <img
                          ref={(el) => rememberRatio(el, p)}
                          src={`/hobby/${p}.webp`}
                          alt={`${activeHobby.cn} ${i + 1}`}
                          loading="lazy"
                          className="block w-auto max-w-none object-contain"
                          style={{ height: 'var(--photo-h)' }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
