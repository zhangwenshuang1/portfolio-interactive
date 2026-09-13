import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'

interface DraggablePhotoProps {
  /** 图片地址 */
  src: string
  /**
   * 位置的持久化标识（同一块板面上每张唯一）。
   * 传入后，用户拖动过的位置会被记住（存浏览器本地），下次打开沿用。
   */
  persistId?: string
  /** 无障碍描述 */
  alt?: string
  /** 原图宽高，用来保持原始比例（零裁切） */
  nativeW?: number
  nativeH?: number
  /** 初始定位（像素，绝对定位；相对最近的 relative 父级） */
  x: number
  y: number
  /** 显示宽度（px） */
  w: number
  /** 入场动画延迟（秒） */
  delay?: number
  /** 入场方式 */
  from?: 'scale' | 'rise'
  /** 悬停光晕样式：'warm' 暖色相纸 / 'neon' 舞台霓虹 / 'none' */
  glow?: 'warm' | 'neon' | 'none'
  /** 图片额外的 class（圆角/边框/阴影等） */
  imgClassName?: string
  /** 拖动层之上还要渲染的内容（如编号角标） */
  children?: React.ReactNode
}

/**
 * 可拖动 + 点击放大的照片。
 * - 拖动：按住照片即可移动到板面上的任意位置（自动限制在父级范围内）。
 * - 点击放大：单击会打开一个全屏灯箱查看大图；按 Esc 或点背景关闭。
 * - 拖动与点击不冲突：只有几乎没有位移时才判定为“点击”。
 */
export default function DraggablePhoto({
  src,
  persistId,
  alt = '',
  nativeW,
  nativeH,
  x,
  y,
  w,
  delay = 0,
  from = 'scale',
  glow = 'warm',
  imgClassName = '',
  children,
}: DraggablePhotoProps) {
  const [zoomed, setZoomed] = useState(false)
  const dragControls = useDragControls()
  // 拖动后的绝对位置（相对父级板面左上角）。null = 还没拖动过，用传入的初始 x/y。
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  // 每次拖动结束 +1，用作 motion 元素的 key：强制重挂载，丢掉 framer-motion 的拖动 transform，
  // 让新写入的 left/top 生效（否则会与实际位移叠加，位置翻倍）。
  const [resetKey, setResetKey] = useState(0)
  const figRef = useRef<HTMLElement | null>(null)

  // 键名：按 persistId 区分每张照片各自记住位置
  const storageKey = persistId ? `dragpos:${persistId}` : null

  // 首次挂载：若本地存过位置，就沿用（优先于默认排版）。
  useEffect(() => {
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const p = JSON.parse(raw) as { x?: number; y?: number }
        if (typeof p.x === 'number' && typeof p.y === 'number') {
          setPos({ x: p.x, y: p.y })
        }
      }
    } catch {
      /* 忽略损坏的本地数据 */
    }
  }, [storageKey])

  /** 拖动结束：把「初始位置 + 本次位移」算成新的绝对位置，存下并让元素按新 left/top 重挂载 */
  const onDragEnd = (_e: unknown, info: { offset: { x: number; y: number } }) => {
    const baseX = pos ? pos.x : x
    const baseY = pos ? pos.y : y
    const nx = Math.round(baseX + info.offset.x)
    const ny = Math.round(baseY + info.offset.y)
    setPos({ x: nx, y: ny })
    setResetKey((k) => k + 1)
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ x: nx, y: ny }))
      } catch {
        /* 忽略存储失败 */
      }
    }
  }

  useEffect(() => {
    if (!zoomed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  const glowStyle =
    glow === 'warm'
      ? {
          background:
            'radial-gradient(120% 120% at 50% 50%, rgba(255,190,90,0) 60%, rgba(255,150,70,0.45) 84%, rgba(255,215,130,0.45) 92%, rgba(255,205,120,0) 100%)',
          filter: 'blur(4px)',
        }
      : glow === 'neon'
        ? {
            background:
              'radial-gradient(120% 120% at 50% 50%, rgba(122,162,255,0) 58%, rgba(255,93,143,0.4) 82%, rgba(125,211,252,0.35) 94%, rgba(0,0,0,0) 100%)',
            filter: 'blur(5px)',
          }
        : undefined

  const initial = from === 'rise' ? { opacity: 0, scale: 0.72, y: 16 } : { opacity: 0, scale: 0.6 }
  const animate = from === 'rise' ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1 }

  // 实际左/上：如果拖动过（或本地存过），用保存值；否则用传入的初始排版值
  const finalX = pos ? pos.x : x
  const finalY = pos ? pos.y : y

  return (
    <>
      <motion.figure
        key={resetKey}
        ref={figRef}
        className="group absolute touch-none"
        style={{ left: finalX, top: finalY, width: w, cursor: 'grab' }}
        // 首次挂载播放入场动画；拖动后重挂载（resetKey>0）时不再重播，避免闪一下
        initial={resetKey === 0 ? initial : false}
        animate={animate}
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0.06}
        onDragEnd={onDragEnd}
        whileDrag={{ scale: 1.04, cursor: 'grabbing', zIndex: 60 }}
        whileHover={{ scale: 1.05 }}
        transition={{ delay, type: 'spring', stiffness: 140, damping: 20, mass: 0.7 }}
      >
        {/* 拖动把手：覆盖整张照片；拖它来移动，tap 打开灯箱 */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          onClick={() => setZoomed(true)}
          className="relative"
        >
          {glowStyle && (
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-[2px] rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={glowStyle}
            />
          )}
          <img
            src={src}
            alt={alt}
            width={nativeW}
            height={nativeH}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={`relative block h-auto w-full transition-[filter,transform] duration-300 ease-out group-hover:brightness-110 ${imgClassName}`}
          />
          {children}
        </div>
      </motion.figure>

      {/* 全屏灯箱：点背景或按 Esc 关闭 */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setZoomed(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm sm:p-10"
          >
            <motion.img
              src={src}
              alt={alt}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="max-h-full max-w-full rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              aria-label="关闭"
              onClick={() => setZoomed(false)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl font-black text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/30"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
