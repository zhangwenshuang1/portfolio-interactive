import { useCallback, useEffect, useRef, useState } from 'react'

interface ProgressScrubberProps {
  /** 要控制的 <video> 引用 */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** 高亮色（已播放部分） */
  accent: string
}

/**
 * 一条**可直接拖动**的播放进度条。
 * 不依赖 video 的原生控件：鼠标按下即跳转，拖动实时跟随，松手停在目标处。
 */
export default function ProgressScrubber({ videoRef, accent }: ProgressScrubberProps) {
  const barRef = useRef<HTMLSpanElement>(null)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onMeta = () => setDuration(v.duration || 0)
    const onTime = () => setTime(v.currentTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('durationchange', onMeta)
    v.addEventListener('timeupdate', onTime)
    if (v.readyState >= 1) setDuration(v.duration || 0)
    return () => {
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('durationchange', onMeta)
      v.removeEventListener('timeupdate', onTime)
    }
  }, [videoRef])

  const seekTo = useCallback(
    (clientX: number) => {
      const bar = barRef.current
      const v = videoRef.current
      if (!bar || !v || !v.duration) return
      const r = bar.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / Math.max(1, r.width)))
      const t = ratio * v.duration
      v.currentTime = t
      setTime(t)
    },
    [videoRef],
  )

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const v = videoRef.current
    if (!v || !v.duration) return
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    seekTo(e.clientX)
  }

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return
    e.preventDefault()
    e.stopPropagation()
    seekTo(e.clientX)
  }

  const onUp = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* 忽略 */
    }
  }

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0

  return (
    <span
      ref={barRef}
      role="slider"
      tabIndex={0}
      aria-label="播放进度"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={(e) => e.stopPropagation()}
      className="group/scrub relative h-3 flex-1 cursor-pointer touch-none"
    >
      <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${accent},#ffd166)` }}
        />
      </span>
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all group-hover/scrub:h-3 group-hover/scrub:w-3"
        style={{
          left: `calc(${pct}% - 4px)`,
          width: dragging ? 12 : 8,
          height: dragging ? 12 : 8,
        }}
      />
    </span>
  )
}
