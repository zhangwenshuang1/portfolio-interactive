import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import HobbyStage from './HobbyStage'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 兴趣爱好（MOVE）拼图的详情面板：
 * 一张「兴趣地图」—— 六个兴趣点散布在地图上，鼠标移到某个兴趣上，
 * 它就会像被点亮的图标一样亮起来，并把该兴趣的照片浮现在地图中央。
 * —— 阅读顺序：点亮 → 看照片 → 换下一个兴趣。
 */
export default function HobbyCarouselPanel({ puzzle, onClose }: PanelProps) {
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
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 100% at 50% 0%, #14293f 0%, #0d1c2b 42%, #08111b 78%, #04080d 100%)',
      }}
    >
      {/* 夜色地图纹理 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(120,200,255,0.08) 0 2px, transparent 2px 11px)',
        }}
      />

      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative mx-auto w-full max-w-6xl flex-none px-4 pt-4 sm:px-6 lg:px-8"
      >
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#7fd3ff]">
              Interest Map · Move
            </p>
            <h1
              className="mt-1 text-2xl font-black text-[#eaf6ff] drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)] sm:text-3xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              兴趣爱好 · 生活不只有一条赛道
            </h1>
            <p className="mt-1 max-w-[620px] text-[12px] font-medium text-[#9fbdd6]/80 sm:text-[12.5px]">
              这不是一张普通的地图 —— 每个坐标都是一个让我着迷的兴趣，把鼠标移上去，它就亮起来。
            </p>
          </div>
          <span className="font-cartoon-latin hidden rounded-full border border-[#7fd3ff]/30 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9fd8ff] sm:inline-block">
            Move · Map
          </span>
        </div>
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-6 lg:px-8">
        <HobbyStage onClose={handleClose} />
      </div>
    </motion.div>
  )
}
