import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import CreateStage from './CreateStage'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 品牌部实习（CREATE）拼图的详情面板：
 * 一整块「创意监看台」——中央主作品窗口播放当前选中的视频，
 * 右侧是作品索引（实拍类 / AI类，点击即切换中央画面，也切换整页氛围），
 * 最右是一条竖向幕后胶片带（6 张工作照）。
 * —— 阅读顺序：主作品 → 作品索引 → 幕后现场。
 */
export default function CreateCarouselPanel({ puzzle, onClose }: PanelProps) {
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
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#070a10]"
    >
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mx-auto w-full max-w-6xl flex-none px-4 pt-4 sm:px-6 lg:px-8"
      >
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#a78bfa]">
              SelectWork · Create
            </p>
            <h1
              className="mt-1 text-2xl font-black text-white drop-shadow-[0_4px_18px_rgba(167,139,250,0.35)] sm:text-3xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              品牌部实习 · 让想法被看见
            </h1>
            <p className="mt-1 max-w-[600px] text-[12px] font-medium text-[#c3c1dd]/70 sm:text-[12.5px]">
              实拍与 AI 两条路径并行 —— 从脚本到成片，把品牌的想法变成能被看见的画面。
            </p>
          </div>
          <span className="font-cartoon-latin hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffd166] sm:inline-block">
            Brand · Create
          </span>
        </div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-6 lg:px-8">
        <CreateStage onClose={handleClose} />
        <p className="mt-2 flex-none pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#8ea3b8]/70">
          点右侧索引切换作品 · 悬停胶片带看幕后现场 · Hover the film strip
        </p>
      </div>
    </motion.div>
  )
}
