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

const getPieceShape = (id: string) => {
  const shapes: Record<string, string> = {
    photo: 'path("M 30 30 H 330 V 120 C 363.14 120 390 146.86 390 180 C 390 213.14 363.14 240 330 240 V 330 H 210 C 210 296.86 183.14 270 150 270 C 116.86 270 90 296.86 90 330 H 30 Z")',
    entertainment: 'path("M 30 30 H 330 V 120 C 363.14 120 390 146.86 390 180 C 390 213.14 363.14 240 330 240 V 330 H 210 C 210 296.86 183.14 270 150 270 C 116.86 270 90 296.86 90 330 H 30 V 240 C 63.14 240 90 213.14 90 180 C 90 146.86 63.14 120 30 120 Z")',
    documentary: 'path("M 30 30 H 330 V 330 H 210 C 210 296.86 183.14 270 150 270 C 116.86 270 90 296.86 90 330 H 30 V 240 C 63.14 240 90 213.14 90 180 C 90 146.86 63.14 120 30 120 Z")',
    brand: 'path("M 30 30 H 150 C 150 -3.14 176.86 -30 210 -30 C 243.14 -30 270 -3.14 270 30 H 330 V 120 C 363.14 120 390 146.86 390 180 C 390 213.14 363.14 240 330 240 V 330 H 30 Z")',
    ai_comic: 'path("M 30 30 H 150 C 150 -3.14 176.86 -30 210 -30 C 243.14 -30 270 -3.14 270 30 H 330 V 330 H 210 C 210 363.14 183.14 390 150 390 C 116.86 390 90 363.14 90 330 H 30 V 240 C 63.14 240 90 213.14 90 180 C 90 146.86 63.14 120 30 120 Z")',
    sports: 'path("M 30 30 H 150 C 150 -3.14 176.86 -30 210 -30 C 243.14 -30 270 -3.14 270 30 H 330 V 330 H 90 C 90 296.86 116.86 270 150 270 C 183.14 270 210 296.86 210 330 H 30 V 240 C -3.14 240 -30 213.14 -30 180 C -30 146.86 -3.14 120 30 120 Z")',
  }

  return shapes[id] ?? shapes.photo
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
  const driftX = !puzzle.placed && pointerShift.x ? ((pointerShift.x - 600) / 30) * 0.35 : 0
  const driftY = !puzzle.placed && pointerShift.y ? ((pointerShift.y - 380) / 24) * 0.35 : 0

  return (
    <motion.div
      className="absolute h-[390px] w-[390px] cursor-grab select-none active:cursor-grabbing"
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
        filter: isHovered && !puzzle.placed ? 'drop-shadow(0 20px 30px rgba(255, 111, 180, 0.32))' : 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.08))',
      }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      <motion.button
        onClick={onClick}
        onMouseDown={onMouseDown}
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden border-[3px] border-white/80 bg-gradient-to-br ${getColorClass()} p-3 text-white ${puzzle.isRead ? '' : 'opacity-80'}`}
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
