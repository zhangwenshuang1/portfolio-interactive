import { useCallback, useEffect, useRef, useState } from 'react'

interface SeekBarVideoProps {
  src: string
  className?: string
  /** 是否自动播放（默认 true） */
  autoPlay?: boolean
  /** 是否循环（默认 true） */
  loop?: boolean
  /** 是否静音（受控）。不传则组件内部自管理 */
  muted?: boolean
  /** 静音变化回调（配合 muted 受控时使用；点击画面切换） */
  onToggleMute?: () => void
  /** 进度条样式：'dark' 深色舞台 / 'light' 浅色相纸 */
  tone?: 'dark' | 'light'
  /** 进度条区域的额外 class（内边距等） */
  barClassName?: string
  /** 视频画面容器的额外 class（圆角/裁切等） */
  frameClassName?: string
  /** 是否显示「点击开启声音」的中央提示 */
  showMuteHint?: boolean
}

const fmt = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * 带「可拖动进度条」的视频组件。
 *
 * 设计目标：让视频看起来不像系统原生播放器（原生控件样式跟作品集风格不搭），
 * 但保留最核心的交互 —— **拖动进度条任意跳转** + 点击播放/暂停 + 音量开关。
 *
 * - 进度条：鼠标按下即开始拖拽（pointer capture），松手前实时跟随，松手后跳转。
 * - 缓冲：进度条上会显示已缓冲区间。
 * - 进度条下方的圆点会随鼠标 hover 放大，方便对准。
 */
export default function SeekBarVideo({
  src,
  className = '',
  autoPlay = true,
  loop = true,
  muted: mutedProp,
  onToggleMute,
  tone = 'dark',
  barClassName = '',
  frameClassName = '',
  showMuteHint = false,
}: SeekBarVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const [internalMuted, setInternalMuted] = useState(true)
  const muted = mutedProp === undefined ? internalMuted : mutedProp

  const [playing, setPlaying] = useState(autoPlay)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [dragging, setDragging] = useState(false)

  const toggleMute = useCallback(() => {
    if (onToggleMute) onToggleMute()
    else setInternalMuted((m) => !m)
  }, [onToggleMute])

  // 同步播放状态 / 进度 / 缓冲
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onMeta = () => setDuration(v.duration || 0)
    const onTime = () => setTime(v.currentTime)
    const onProgress = () => {
      try {
        if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
      } catch {
        /* 忽略 */
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('durationchange', onMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('progress', onProgress)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    if (v.readyState >= 1) setDuration(v.duration || 0)
    return () => {
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('durationchange', onMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('progress', onProgress)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  /** 根据指针位置算出目标时间 */
  const timeFromEvent = useCallback((clientX: number) => {
    const bar = barRef.current
    const v = videoRef.current
    if (!bar || !v || !v.duration) return 0
    const r = bar.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / Math.max(1, r.width)))
    return ratio * v.duration
  }, [])

  const onBarPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const v = videoRef.current
      if (!v || !v.duration) return
      setDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      const t = timeFromEvent(e.clientX)
      v.currentTime = t
      setTime(t)
    },
    [timeFromEvent],
  )

  const onBarPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      e.preventDefault()
      e.stopPropagation()
      const v = videoRef.current
      if (!v) return
      const t = timeFromEvent(e.clientX)
      v.currentTime = t
      setTime(t)
    },
    [dragging, timeFromEvent],
  )

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* 忽略 */
    }
  }, [dragging])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play().catch(() => {})
    else v.pause()
  }, [])

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0
  const bufPct = duration ? Math.min(100, (buffered / duration) * 100) : 0

  const trackBg = tone === 'light' ? 'bg-black/15' : 'bg-white/15'
  const bufBg = tone === 'light' ? 'bg-black/20' : 'bg-white/25'
  const fillBg =
    tone === 'light'
      ? 'bg-gradient-to-r from-[#f4a259] to-[#f7d08a]'
      : 'bg-gradient-to-r from-[#7dd3fc] to-[#ffd166]'
  const headBg = tone === 'light' ? 'bg-[#f4a259]' : 'bg-white'

  return (
    <div ref={wrapRef} className="relative">
      <div className={`group/vid relative ${frameClassName}`}>
        {/* 视频本体：点击播放/暂停 */}
        <button
          type="button"
          onClick={togglePlay}
          className="block w-full cursor-pointer border-0 bg-transparent p-0"
          aria-label={playing ? '暂停' : '播放'}
        >
          <video
            ref={videoRef}
            className={className}
            src={src}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            preload="metadata"
          />
        </button>

        {/* 中央静音提示（可选） */}
        {showMuteHint && muted && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleMute()
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition hover:bg-black/65"
          >
            🔊 点击开启声音
          </button>
        )}
      </div>

      {/* —— 可拖动进度条 —— */}
      <div className={`flex items-center gap-2.5 ${barClassName || 'pt-2'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          aria-label={playing ? '暂停' : '播放'}
          className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10 text-[9px] text-white/85 ring-1 ring-white/20 transition hover:bg-white/20"
        >
          {playing ? '❚❚' : '▶'}
        </button>

        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label="播放进度"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={(e) => e.stopPropagation()}
          className="group/bar relative flex-1 cursor-pointer touch-none py-2"
          style={{ outline: 'none' }}
        >
          <span className={`relative block h-[5px] w-full overflow-hidden rounded-full ${trackBg}`}>
            <span
              className={`absolute inset-y-0 left-0 rounded-full ${bufBg}`}
              style={{ width: `${bufPct}%` }}
            />
            <span
              className={`absolute inset-y-0 left-0 rounded-full ${fillBg}`}
              style={{ width: `${pct}%` }}
            />
          </span>
          {/* 播放头：拖拽中更大，方便对准 */}
          <span
            className={`absolute top-1/2 -translate-y-1/2 rounded-full ${headBg} shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-[width,height] ${
              dragging ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5 group-hover/bar:h-3.5 group-hover/bar:w-3.5'
            }`}
            style={{ left: `calc(${pct}% - ${dragging ? 7 : 5}px)` }}
          />
        </div>

        <span
          className={`font-cartoon-latin flex-none text-[10.5px] font-bold tracking-[0.12em] tabular-nums ${
            tone === 'light' ? 'text-black/55' : 'text-white/55'
          }`}
        >
          {fmt(time)} / {fmt(duration)}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            toggleMute()
          }}
          aria-label={muted ? '开启声音' : '静音'}
          className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10 text-[10px] text-white/85 ring-1 ring-white/20 transition hover:bg-white/20"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}
