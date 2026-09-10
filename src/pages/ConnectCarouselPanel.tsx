import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Puzzle } from '../types'
import { usePuzzleStore } from '../store/puzzleStore'
import ConnectStage from './ConnectStage'

interface PanelProps {
  puzzle: Puzzle
  onClose: () => void
}

/**
 * 志愿与连接（CONNECT）拼图的详情面板：
 * 一整本「摊开的旅行手账相册」——左页是照片，右页是手写体的地点 / 日期 / 故事，
 * 中间一道书脊把两页装订起来，底部用「← PREV / NEXT →」翻页。
 * —— 阅读顺序：翻页 → 看照片 → 读手写字。
 */
export default function ConnectCarouselPanel({ puzzle, onClose }: PanelProps) {
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
          'radial-gradient(120% 100% at 50% 0%, #fdf6e6 0%, #f3e2c2 34%, #d9b98a 72%, #8a6a44 100%)',
      }}
    >
      {/* 桌面纹理 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(90,60,20,0.10) 0 2px, transparent 2px 9px)',
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
            <p className="font-cartoon-latin text-[11px] font-bold uppercase tracking-[0.3em] text-[#a8894f]">
              PhotoAlbum · Connect
            </p>
            <h1
              className="mt-1 text-2xl font-black text-[#3f3122] drop-shadow-[0_3px_12px_rgba(255,255,255,0.5)] sm:text-3xl"
              style={{ fontFamily: "'ZCOOL KuaiLe','Microsoft YaHei',sans-serif" }}
            >
              志愿与连接 · 成为故事的一部分
            </h1>
            <p className="mt-1 max-w-[620px] text-[12px] font-medium text-[#6b5636]/80 sm:text-[12.5px]">
              翻开这本手账，每一页都藏着一段走过的路 —— 左页是照片，右页是当时写下的心情。
            </p>
          </div>
          <span className="font-cartoon-latin hidden rounded-full border border-[#b4925a]/30 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8a6a44] sm:inline-block">
            Connect · Album
          </span>
        </div>
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 pb-3 pt-2 sm:px-6 lg:px-8">
        <ConnectStage onClose={handleClose} />
        <p className="mt-2 flex-none pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#6b5636]/70">
          点 NEXT / PREV 翻页 · 也可用键盘 ← → · Flip the page to travel
        </p>
      </div>
    </motion.div>
  )
}
