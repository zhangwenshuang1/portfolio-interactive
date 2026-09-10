import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

// 一张兴趣地图：六个兴趣点散布其上，鼠标移上去会像灯一样亮起，旁边浮出照片。
const HOBBIES: Hobby[] = [
  {
    key: 'music',
    emoji: '🎸',
    en: 'MUSIC',
    cn: '音乐',
    x: 22,
    y: 30,
    photos: ['music-1', 'music-2'],
    blurb: '一把吉他，几个和弦，把日子弹成歌。',
  },
  {
    key: 'cook',
    emoji: '🍳',
    en: 'COOK',
    cn: '烹饪',
    x: 74,
    y: 22,
    photos: ['cook-1', 'cook-2'],
    blurb: '把食材变成一顿热乎饭，是最踏实的浪漫。',
  },
  {
    key: 'climb',
    emoji: '🧗',
    en: 'CLIMB',
    cn: '攀岩',
    x: 30,
    y: 66,
    photos: ['climb-1', 'climb-2'],
    blurb: '往上一步，世界就多开一扇窗。',
  },
  {
    key: 'swim',
    emoji: '🏊',
    en: 'SWIM',
    cn: '游泳',
    x: 60,
    y: 58,
    photos: ['swim-1'],
    blurb: '水里的安静，是我给大脑开的静音键。',
  },
  {
    key: 'hike',
    emoji: '🏔',
    en: 'HIKE',
    cn: '徒步',
    x: 84,
    y: 60,
    photos: ['hike-1', 'hike-2'],
    blurb: '把烦恼留在山脚，把风景装进肺里。',
  },
  {
    key: 'ball',
    emoji: '🏀',
    en: 'BALL',
    cn: '篮球',
    x: 47,
    y: 82,
    photos: ['ball-1', 'ball-2', 'ball-3'],
    blurb: '球场上跑起来，风就追不上我了。',
  },
]

export default function HobbyStage({ onClose }: HobbyStageProps) {
  const [active, setActive] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const activeHobby = useMemo(
    () => HOBBIES.find((h) => h.key === active) ?? null,
    [active],
  )

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
  }
  const leave = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    // 稍微延迟收起，避免鼠标在点与照片面板之间移动时闪烁
    timerRef.current = window.setTimeout(() => setActive(null), 120)
  }

  return (
    <div className="relative min-h-0 flex flex-1 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl border border-[#1e3a5f]/40 bg-[#0b1622] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
        {/* 地图底纹：网格 + 地形等高线氛围 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(120,200,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(120,200,255,0.35) 1px, transparent 1px)',
            backgroundSize: '46px 46px',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #1e6091 0%, transparent 70%)' }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-16 h-[520px] w-[520px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2a9d8f 0%, transparent 70%)' }}
        />

        {/* 标题 */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-4 sm:px-7">
          <div>
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#7fd3ff]">
              Interest Map · MOVE
            </p>
            <h2
              className="mt-1 text-xl font-black text-[#eaf6ff] drop-shadow-[0_3px_14px_rgba(0,0,0,0.6)] sm:text-2xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              我的兴趣地图
            </h2>
          </div>
          <span className="hidden rounded-full border border-[#7fd3ff]/30 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9fd8ff] sm:inline-block">
            把鼠标移到兴趣上
          </span>
        </div>

        {/* 地图主体 */}
        <div className="relative min-h-0 flex-1">
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
              return (
                <line
                  key={h.key}
                  x1={h.x}
                  y1={h.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={on ? 'rgba(127,211,255,0.55)' : 'rgba(127,211,255,0.12)'}
                  strokeWidth={on ? 0.45 : 0.3}
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                />
              )
            })}
          </svg>

          {/* 兴趣节点 */}
          {HOBBIES.map((h) => {
            const isOn = active === h.key
            return (
              <button
                key={h.key}
                type="button"
                onMouseEnter={() => enter(h.key)}
                onMouseLeave={leave}
                onFocus={() => enter(h.key)}
                onBlur={leave}
                onClick={() => enter(h.key)}
                aria-label={`${h.cn} ${h.en}`}
                className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <motion.div
                  animate={{
                    scale: isOn ? 1.12 : 1,
                    boxShadow: isOn
                      ? '0 0 0 6px rgba(127,211,255,0.18), 0 0 34px 6px rgba(127,211,255,0.55)'
                      : '0 0 0 0 rgba(127,211,255,0), 0 0 0 0 rgba(127,211,255,0)',
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-[#7fd3ff]/40 bg-[#0e2135]/80 backdrop-blur sm:h-20 sm:w-20"
                >
                  <span className={`text-2xl sm:text-3xl ${isOn ? 'animate-pulse' : ''}`}>
                    {h.emoji}
                  </span>
                  <span
                    className={`font-cartoon-latin mt-0.5 text-[9px] font-bold tracking-[0.18em] sm:text-[10px] ${
                      isOn ? 'text-[#eaf6ff]' : 'text-[#8fb4cf]'
                    }`}
                  >
                    {h.en}
                  </span>
                </motion.div>
                {/* 未点亮时是暗点，点亮后浮现中文名 */}
                <AnimatePresence>
                  {isOn && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#7fd3ff] px-2.5 py-0.5 text-[11px] font-bold text-[#06121f]"
                    >
                      {h.cn}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
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
                className="absolute left-1/2 top-1/2 z-30 w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2"
              >
                <div className="rounded-3xl border border-[#7fd3ff]/30 bg-[#0a1523]/92 p-3 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.95)] backdrop-blur sm:p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xl">{activeHobby.emoji}</span>
                    <span className="font-cartoon-latin text-sm font-black tracking-[0.16em] text-[#eaf6ff]">
                      {activeHobby.en}
                    </span>
                    <span className="text-sm font-bold text-[#9fd8ff]">{activeHobby.cn}</span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5f89a8]">
                      {activeHobby.photos.length} 张
                    </span>
                  </div>
                  <p className="mb-2.5 text-[12px] font-medium leading-relaxed text-[#a9c6dc]">
                    {activeHobby.blurb}
                  </p>
                  <div
                    className={
                      activeHobby.photos.length === 1
                        ? 'grid grid-cols-1'
                        : activeHobby.photos.length === 2
                          ? 'grid grid-cols-2 gap-2'
                          : 'grid grid-cols-3 gap-2'
                    }
                  >
                    {activeHobby.photos.map((p, i) => (
                      <motion.div
                        key={p}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.06 }}
                        className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
                      >
                        <img
                          src={`/hobby/${p}.webp`}
                          alt={`${activeHobby.cn} ${i + 1}`}
                          loading="lazy"
                          className="block aspect-[4/3] w-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 没有任何兴趣被点亮时的提示 */}
          <AnimatePresence>
            {!activeHobby && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5f89a8]"
              >
                Hover an interest to light it up
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-2 flex-none pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#6b8499]">
        鼠标移到兴趣上点亮 · 也可用键盘 ← → 切换 · Esc 关闭
      </p>
    </div>
  )
}
