import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import PhotoCoverFlow from '../components/PhotoCoverFlow'
import PhotoIntroStage from './PhotoIntroStage'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 摄影拼图的详情面板，分两幕：
 * 1) 场景幕：左半边完整铺开(不裁剪)“拍照现场”幕后照，右半边集中介绍+开始按钮；文字不遮挡照片。
 * 2) 进入后为封面流环形轮播，浏览全部作品：每 1s 自动前进、无缝循环、鼠标悬停可暂停。
 */
export default function PhotographyCarouselPanel({ puzzle, onClose }: PanelProps) {
  const markPuzzleAsRead = usePuzzleStore((s) => s.markPuzzleAsRead)
  const [leaving, setLeaving] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

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
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#fffaf3]"
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

        {showGallery && (
          <div className="mt-2 text-xs font-semibold text-gray-400 sm:text-sm">
            点击左右画面或者 ‹ › 都能切换图片，鼠标停在画面上时轮播会暂停，移开则继续播放。
          </div>
        )}
      </motion.div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        {showGallery ? (
          <div className="my-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <PhotoCoverFlow />
            </motion.div>
          </div>
        ) : (
          <PhotoIntroStage onBegin={() => setShowGallery(true)} />
        )}
      </div>
    </motion.div>
  )
}
