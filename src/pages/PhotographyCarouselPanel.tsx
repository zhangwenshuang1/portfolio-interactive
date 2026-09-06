import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import PhotoCoverFlow from '../components/PhotoCoverFlow'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 摄影拼图的“直接进入作品集”详情面板。
 * 与通用 DetailPage 保持同一套视觉语言，但主体是一整条封面流，
 * 不再显示通用模板里的占位照片 / 演示视频。
 */
export default function PhotographyCarouselPanel({ puzzle, onClose }: PanelProps) {
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
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#fffaf3]"
    >
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mx-auto w-full max-w-6xl flex-none px-4 pt-6 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between rounded-[28px] border-[3px] border-white/80 bg-white/80 p-4 shadow-[0_18px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              My Photography
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#1f2937] sm:text-4xl">
              {puzzle.emoji} {puzzle.title}作品集
            </h1>
          </div>
          <button
            onClick={handleClose}
            aria-label="关闭作品集"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#f8d85a] text-xl font-black text-white shadow-lg transition hover:scale-105"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm font-semibold tracking-wide text-gray-400">
          摄影，是我在平凡缝隙里捕捉光的方式 —— 左右滑动，或轻轻点下，看每一张被记住的瞬间走到台前。
        </p>
      </motion.div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.45 }}
        >
          <PhotoCoverFlow />
        </motion.div>

        <p className="mt-5 text-center text-xs font-semibold text-gray-400">
          把鼠标停在画面上可暂停轮播，用 ‹ › 键或点两侧作品可手动切换
        </p>
      </div>
    </motion.div>
  )
}
