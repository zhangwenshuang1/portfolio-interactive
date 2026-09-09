import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import EntertainmentBehindScenesStage from './EntertainmentBehindScenesStage'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 综艺实习（DO）拼图的详情面板：
 * 中央自动播放《一站到底》宣传片，四周逐渐浮现 7 张我拍下的幕后照片
 * —— 阅读顺序：节目 → 幕后 → 我的工作。
 */
export default function EntertainmentCarouselPanel({ puzzle, onClose }: PanelProps) {
  const markPuzzleAsRead = usePuzzleStore((s) => s.markPuzzleAsRead)
  const [leaving, setLeaving] = useState(false)

  const handleClose = () => {
    if (leaving) return
    setLeaving(true)
    markPuzzleAsRead(puzzle.id)
    setTimeout(() => onClose(), 260)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0b0a12]"
    >
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mx-auto w-full max-w-6xl flex-none px-4 pt-6 sm:px-6 lg:px-8"
      >
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffb3c9]">
              SelectWork · Inside The Studio
            </p>
            <h1
              className="mt-1 text-3xl font-black text-white drop-shadow-[0_4px_18px_rgba(122,162,255,0.35)] sm:text-4xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              综艺实习《一站到底》 · 幕后记录
            </h1>
            <p className="mt-1 max-w-[520px] text-[12.5px] font-medium text-[#d8d3ec]/70 sm:text-sm">
              把舞台侧光之外的它们，留作我自己的正片。
            </p>
          </div>
          <span className="font-cartoon-latin hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffe9a8] sm:inline-block">
            7 shots on set
          </span>
        </div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <EntertainmentBehindScenesStage onClose={handleClose} />
        <p className="mt-4 pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#8d87ab]/70">
          Hover the photos to peek· 每一个角落都是我的机位
        </p>
      </div>
    </motion.div>
  )
}
