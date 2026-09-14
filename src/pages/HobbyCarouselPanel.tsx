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
          'radial-gradient(120% 100% at 50% 0%, #fbf1dc 0%, #f2e0bd 40%, #e2c795 76%, #b9995f 100%)',
      }}
    >
      {/* 旧地图纸纹理 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(120,80,40,0.12) 0 2px, transparent 2px 11px)',
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
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#a8763a]">
              Interest Map · Move
            </p>
            <h1
              className="mt-1 text-2xl font-black text-[#3f2e13] drop-shadow-[0_2px_12px_rgba(255,250,235,0.9)] sm:text-3xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              兴趣爱好 · 生活不只有一条赛道
            </h1>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="退出"
            title="退出（Esc）"
            className="grid h-11 w-11 flex-none place-items-center rounded-full border border-[#a8763a]/45 bg-white/70 text-[17px] leading-none text-[#7a5528] shadow-[0_6px_18px_-8px_rgba(90,60,25,0.6)] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c1682f] hover:bg-[#fff3dc] hover:text-[#a34f1c]"
          >
            ✕
          </button>
        </div>
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-6 lg:px-8">
        <HobbyStage onClose={handleClose} />
      </div>
    </motion.div>
  )
}
