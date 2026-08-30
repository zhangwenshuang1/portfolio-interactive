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
  snapPulse?: boolean
}

// 元素 440×440，整块铺满 0..440，拼成 3×2 长方形。
// 每个内部接缝做成"凸凹互补"：一条边上一个圆帽(凸)或圆坑(凹)，
// 相邻块在相同位置一一互补（这一块凸，邻块就凹）→ 完美契合并严丝合缝。
// 每个圆帽半径 R=40，圆心落在共享中缝（即该边边界 0 或 440），跨越该边中段。
// 外缘(无邻居的边)全部平直，保证外围拼成规则的完整长方形。
// 凸/凹方向规则（顺时针绕行）：
//   右边界 x=440：凸=`L 440 180 A 40 40 0 0 1 440 260` 凹=sweep0
//   左边界 x=0  ：凸=`L 0 260 A 40 40 0 0 1 0 180`      凹=sweep0
//   下边界 y=440：凸=`L 260 440 A 40 40 0 0 1 180 440`   凹=sweep0
//   上边界 y=0  ：凸=`L 180 0 A 40 40 0 0 1 260 0`       凹=sweep0
const getPieceShape = (id: string) => {
  const shapes: Record<string, string> = {
    // 第1块 photo：下方=凹陷、右方=凸起；左/上外平
    photo:
      'path("M 0 0 L 440 0 L 440 180 A 40 40 0 0 1 440 260 L 440 440 L 260 440 A 40 40 0 0 0 180 440 L 0 440 L 0 0 Z")',
    // 第2块 entertainment：左边=凹陷、下边=凹陷、右边=凸起；上外平
    entertainment:
      'path("M 0 0 L 440 0 L 440 180 A 40 40 0 0 1 440 260 L 440 440 L 260 440 A 40 40 0 0 0 180 440 L 0 440 L 0 260 A 40 40 0 0 0 0 180 Z")',
    // 第3块 documentary：左边=凹陷、下方=凹陷；右/上外平
    documentary:
      'path("M 0 0 L 440 0 L 440 440 L 260 440 A 40 40 0 0 0 180 440 L 0 440 L 0 260 A 40 40 0 0 0 0 180 Z")',
    // 第4块 brand：上方=凸起、右方=凸起；左/下外平
    brand:
      'path("M 0 0 L 180 0 A 40 40 0 0 1 260 0 L 440 0 L 440 180 A 40 40 0 0 1 440 260 L 440 440 L 0 440 Z")',
    // 第5块 ai_comic：左边=凹陷、右边=凹陷、上方=凸起；下外平
    ai_comic:
      'path("M 0 0 L 180 0 A 40 40 0 0 1 260 0 L 440 0 L 440 180 A 40 40 0 0 0 440 260 L 440 440 L 0 440 L 0 260 A 40 40 0 0 0 0 180 Z")',
    // 第6块 sports：左边=凸起、上边=凸起；右/下外平
    sports:
      'path("M 0 0 L 180 0 A 40 40 0 0 1 260 0 L 440 0 L 440 440 L 0 440 L 0 260 A 40 40 0 0 1 0 180 Z")',
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
  snapPulse = false,
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

  const idleShadow = 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.08))'
  const hoverShadow = 'drop-shadow(0 20px 30px rgba(255, 111, 180, 0.32))'

  return (
    <motion.div
      className="absolute h-[440px] w-[440px] cursor-grab select-none active:cursor-grabbing"
      style={{
        left: `${puzzle.position.x}px`,
        top: `${puzzle.position.y}px`,
      }}
      onHoverStart={onHover}
      onHoverEnd={onHoverEnd}
      animate={{
        scale: snapPulse ? [1, 1.07, 0.99, 1] : isHovered && !puzzle.placed ? 1.08 : 1,
        rotate: isDragging ? 6 : isHovered && !puzzle.placed ? -3 : 0,
        x: isDragging ? 10 : driftX,
        y: isDragging ? 12 : driftY,
        filter: isHovered && !puzzle.placed ? hoverShadow : idleShadow,
      }}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
    >
      <motion.button
        onClick={onClick}
        onMouseDown={onMouseDown}
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${getColorClass()} p-3 text-white ${puzzle.isRead ? '' : 'opacity-80'}`}
        style={{ clipPath: pieceShape, borderRadius: '0' }}
        whileHover={puzzle.placed ? { scale: 1 } : { scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute left-8 top-5 h-7 w-20 -rotate-6 bg-white/35 shadow-sm" />
        <div className="absolute right-7 bottom-6 text-xl text-white/75">✦</div>
        <div className="absolute left-7 bottom-7 text-base text-white/70">〰</div>

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
          {/* 图标 */}
          <div className="mb-3 text-5xl leading-none drop-shadow-md">{puzzle.emoji}</div>

          {/* 英文大标题（卡通字体，去加粗，显细） */}
          <div className="font-cartoon-latin text-4xl font-medium tracking-[0.08em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.28)]">
            {puzzle.englishTitle}
          </div>

          {/* 一行小字副标题 */}
          <div className="font-cartoon-latin mt-1.5 text-base italic tracking-wide text-white/95">
            {puzzle.tagline}
          </div>

          {/* 关键词：已读后永久显示；未读时只在 hover 时浮现（中文卡通字体） */}
          <div
            className={`mt-4 flex max-w-[300px] flex-wrap items-center justify-center gap-2 ${
              isHovered || puzzle.isRead ? '' : 'hidden'
            }`}
          >
            {puzzle.keywords.map((kw) => (
              <span
                key={kw}
                className="font-cartoon-cn rounded-full bg-white/30 px-3 py-1 text-base font-normal text-white shadow-sm backdrop-blur-sm"
              >
                {kw}
              </span>
            ))}
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
