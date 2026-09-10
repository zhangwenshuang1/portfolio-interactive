import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import DocumentaryLeadStage from './DocumentaryLeadStage'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 纪录片实习（LEAD）拼图的详情面板：
 * 一整块「剪辑工作台」——左上节目监视器播预告片，右上项目笔记讲我正在找什么/做了什么，
 * 下半屏是素材箱条带（拍摄/采访/编导/团队…）。
 * —— 阅读顺序：预告片 → 我在找的人 → 我做的事 → 素材。
 */
export default function DocumentaryCarouselPanel({ puzzle, onClose }: PanelProps) {
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
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#7dd3fc]">
              SelectWork · Looking For Tomorrow
            </p>
            <h1
              className="mt-1 text-2xl font-black text-white drop-shadow-[0_4px_18px_rgba(125,211,252,0.35)] sm:text-3xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              纪录片实习《寻找未来的人》 · 项目统筹
            </h1>
            <p className="mt-1 max-w-[560px] text-[12px] font-medium text-[#c6d3e2]/70 sm:text-[12.5px]">
              年轻人 · 创业 · 未来 · 选择 · 不确定性 —— 我把一路拍下的素材，剪成一个可以交付的故事。
            </p>
          </div>
          <span className="font-cartoon-latin hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffd166] sm:inline-block">
            Documentary · Lead
          </span>
        </div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-6 lg:px-8">
        <DocumentaryLeadStage onClose={handleClose} />
        <p className="mt-2 flex-none pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#8ea3b8]/70">
          素材箱里的每一格，都是一段被留下来的现场 · Hover to preview
        </p>
      </div>
    </motion.div>
  )
}
