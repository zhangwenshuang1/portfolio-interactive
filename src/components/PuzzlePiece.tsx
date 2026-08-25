import { motion } from 'framer-motion'
import { Puzzle } from '../types'

interface PuzzlePieceProps {
  puzzle: Puzzle
  pointerShift: { x: number; y: number }
  onMouseDown: (e: React.MouseEvent) => void
  onHover: () => void
  onHoverEnd: () => void
  onClick: () => void
  isDragging: boolean
  isHovered: boolean
}

// 元素 480×480，主体格在 45..435（390px），四周各留 45px 容纳凸出半圆(r=45)。
// 半圆圆心落在共享中缝上，凸出/凹进半径相同、方向相反 → 相邻拼图完美咬合。
// sweep=1 => 凸出(半圆绕到外侧)，sweep=0 => 凹进(半圆绕到内侧)。
const getPieceShape = (id: string) => {
  const shapes: Record<string, string> = {
    // 左上：右凸(咬综艺)、底凸(咬品牌)，外边界平直
    photo:
      'path("M 45 45 L 435 45 L 435 195 A 45 45 0 0 1 435 285 L 435 435 L 285 435 A 45 45 0 0 1 195 435 L 45 435 Z")',
    // 中上：左凹(配photo)、右凹(配纪录片)、底凸(咬AI漫剧)
    entertainment:
      'path("M 45 45 L 435 45 L 435 195 A 45 45 0 0 0 435 285 L 435 435 L 285 435 A 45 45 0 0 1 195 435 L 45 435 L 45 285 A 45 45 0 0 0 45 195 Z")',
    // 右上：左凸(咬综艺)、底凸(咬运动)，右外平
    documentary:
      'path("M 45 45 L 435 45 L 435 435 L 285 435 A 45 45 0 0 1 195 435 L 45 435 L 45 285 A 45 45 0 0 1 45 195 Z")',
    // 左下：右凸(咬AI漫剧)、顶凹(配摄影)，左/下外平
    brand:
      'path("M 45 45 L 195 45 A 45 45 0 0 0 285 45 L 435 45 L 435 195 A 45 45 0 0 1 435 285 L 435 435 L 45 435 Z")',
    // 中下：左凹、右凹、顶凹(配综艺)
    ai_comic:
      'path("M 45 45 L 195 45 A 45 45 0 0 0 285 45 L 435 45 L 435 195 A 45 45 0 0 0 435 285 L 435 435 L 45 435 L 45 285 A 45 45 0 0 0 45 195 Z")',
    // 右下：左凸(咬AI漫剧)、顶凹(配纪录片)，右/下外平
    sports:
      'path("M 45 45 L 195 45 A 45 45 0 0 0 285 45 L 435 45 L 435 435 L 45 435 L 45 285 A 45 45 0 0 1 45 195 Z")',
  }

  return shapes[id] ?? shapes.photo
}

// 各块主色（用于接缝处 1px 同色微描边，盖住 clip-path 抗锯齿产生的发丝缝隙）
const EDGE_COLOR: Record<string, string> = {
  photo: '#ff4d6d',
  entertainment: '#8b5cf6',
  documentary: '#f59e0b',
  brand: '#2563eb',
  ai_comic: '#fb923c',
  sports: '#22c55e',
}

export default function PuzzlePiece({
  puzzle,
  pointerShift,
  onMouseDown,
  onHover,
  onHoverEnd,
  onClick,
  isDragging,
  isHovered,
}: PuzzlePieceProps) {
  const getColorClass = () => {
    if (puzzle.isRead) {
      switch (puzzle.category) {
        case 'photography':
          return 'from-[#ef233c] via-[#ff4d6d] to-[#ff758f]'
        case 'entertainment':
          return 'from-[#6d28d9] via-[#8b5cf6] to-[#c026d3]'
        case 'documentary':
          return 'from-[#facc15] via-[#f59e0b] to-[#f97316]'
        case 'brand':
          return 'from-[#1677ff] via-[#2563eb] to-[#06b6d4]'
        case 'ai_comic':
          return 'from-[#f97316] via-[#fb923c] to-[#f43f5e]'
        case 'sports':
          return 'from-[#16a34a] via-[#22c55e] to-[#84cc16]'
        default:
          return 'from-[#d1d5db] via-[#c7d2fe] to-[#f3f4f6]'
      }
    }
    return 'from-[#6b7280] via-[#4b5563] to-[#374151]'
  }

  const pieceShape = getPieceShape(puzzle.id)
  const driftX = !puzzle.placed && pointerShift.x ? ((pointerShift.x - 640) / 30) * 0.35 : 0
  const driftY = !puzzle.placed && pointerShift.y ? ((pointerShift.y - 440) / 24) * 0.35 : 0

  const edge = EDGE_COLOR[puzzle.id] ?? '#4b5563'
  // 四向 1px 同色描边：填平相邻凸/凹弧切点附近的抗锯齿发丝缝，视觉上严丝合缝
  const edgeStroke = `drop-shadow(1px 0 0 ${edge}) drop-shadow(-1px 0 0 ${edge}) drop-shadow(0 1px 0 ${edge}) drop-shadow(0 -1px 0 ${edge})`
  const idleShadow = 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.08))'
  const hoverShadow = 'drop-shadow(0 20px 30px rgba(255, 111, 180, 0.32))'

  return (
    <motion.div
      className="absolute h-[480px] w-[480px] cursor-grab select-none active:cursor-grabbing"
      style={{
        left: `${puzzle.position.x}px`,
        top: `${puzzle.position.y}px`,
      }}
      onHoverStart={onHover}
      onHoverEnd={onHoverEnd}
      animate={{
        scale: isHovered && !puzzle.placed ? 1.08 : 1,
        rotate: isDragging ? 6 : isHovered && !puzzle.placed ? -3 : 0,
        x: isDragging ? 10 : driftX,
        y: isDragging ? 12 : driftY,
        filter:
          isHovered && !puzzle.placed
            ? `${edgeStroke} ${hoverShadow}`
            : `${edgeStroke} ${idleShadow}`,
      }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      <motion.button
        onClick={onClick}
        onMouseDown={onMouseDown}
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${getColorClass()} p-3 text-white ${puzzle.isRead ? '' : 'opacity-80'}`}
        style={{ clipPath: pieceShape, borderRadius: '0' }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute left-8 top-5 h-7 w-20 -rotate-6 bg-white/35 shadow-sm" />
        <div className="absolute right-7 bottom-6 text-xl text-white/75">✦</div>
        <div className="absolute left-7 bottom-7 text-base text-white/70">〰</div>

        <div className="relative z-10 text-center">
          <div className="mb-2 text-4xl leading-none">
            {puzzle.id === 'photo' && '📸'}
            {puzzle.id === 'entertainment' && '🎬'}
            {puzzle.id === 'documentary' && '🎥'}
            {puzzle.id === 'brand' && '💼'}
            {puzzle.id === 'ai_comic' && '🤖'}
            {puzzle.id === 'sports' && '⚽'}
          </div>
          <div className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-white/90">
            {puzzle.title}
          </div>
        </div>

        {!puzzle.isRead && (
          <motion.div
            className="absolute inset-0 bg-black/15"
            animate={{ opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        )}

        {isHovered && (
          <motion.div
            className="absolute inset-0 border-[3px] border-white/95"
            animate={{ boxShadow: ['0 0 0 2px rgba(255,255,255,0.6)', '0 0 0 14px rgba(255,255,255,0.18)'] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.button>
    </motion.div>
  )
}
