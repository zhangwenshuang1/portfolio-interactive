import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePuzzleStore } from '../store/puzzleStore'
import PuzzlePiece from './PuzzlePiece'

interface PuzzleBoardProps {
  onSelectPuzzle: (id: string) => void
}

export default function PuzzleBoard({ onSelectPuzzle }: PuzzleBoardProps) {
  const {
    puzzles,
    hoveredPuzzleId,
    setHoveredPuzzle,
    updatePuzzlePosition,
    snapPuzzleToSlot,
    resetPuzzlePosition,
  } = usePuzzleStore()

  const boardRef = useRef<HTMLDivElement>(null)
  const [draggedPuzzle, setDraggedPuzzle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const handleMouseDown = (event: React.MouseEvent, puzzleId: string) => {
    const activePuzzle = puzzles.find((p) => p.id === puzzleId)
    if (!activePuzzle || !boardRef.current) return

    const rect = boardRef.current.getBoundingClientRect()
    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top

    setDraggedPuzzle(puzzleId)
    setDragStart({ x: pointerX, y: pointerY })
    setStartPosition({ x: activePuzzle.position.x, y: activePuzzle.position.y })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!boardRef.current) return

    const rect = boardRef.current.getBoundingClientRect()
    setPointer({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })

    if (!draggedPuzzle) return

    const nextX = event.clientX - rect.left - dragStart.x + startPosition.x
    const nextY = event.clientY - rect.top - dragStart.y + startPosition.y

    updatePuzzlePosition(draggedPuzzle, {
      x: nextX,
      y: nextY,
    })
  }

  const handleMouseUp = () => {
    if (!draggedPuzzle) return

    const activePuzzle = puzzles.find((p) => p.id === draggedPuzzle)
    if (!activePuzzle) {
      setDraggedPuzzle(null)
      return
    }

    const dx = activePuzzle.position.x - activePuzzle.slot.x
    const dy = activePuzzle.position.y - activePuzzle.slot.y
    const distance = Math.hypot(dx, dy)

    if (distance < 135) {
      snapPuzzleToSlot(draggedPuzzle)
    } else {
      resetPuzzlePosition(draggedPuzzle, startPosition)
    }

    setDraggedPuzzle(null)
  }

  return (
    <div
      ref={boardRef}
      className="relative mx-auto h-[760px] w-full max-w-[1200px] overflow-hidden rounded-[38px] border-[3px] border-white/80 bg-[linear-gradient(135deg,#fffaf1_0%,#fef4f7_30%,#eefcf8_100%)] shadow-[0_28px_90px_rgba(255,117,170,0.22)]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setPointer({ x: 0, y: 0 })
        handleMouseUp()
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(circle at ${hoveredPuzzleId ? '50%' : '60%'} ${hoveredPuzzleId ? '50%' : '40%'}, rgba(255, 155, 198, 0.28) 0%, transparent 75%)`,
        }}
      />

      <div className="absolute left-8 top-8 h-16 w-16 rotate-12 rounded-full bg-[#f8d85a] opacity-80" />
      <div className="absolute right-14 top-12 h-20 w-20 rounded-full bg-[#7bd9d5] opacity-75" />
      <div className="absolute left-20 bottom-12 h-24 w-24 rotate-12 rounded-[28px] bg-[#ff9c8a] opacity-60" />
      <div className="absolute right-28 bottom-20 h-24 w-24 rounded-full bg-[#d9b7ff] opacity-60" />

      <div className="absolute inset-0">
        {puzzles.map((puzzle) => (
          <PuzzlePiece
            key={puzzle.id}
            puzzle={puzzle}
            pointerShift={{
              x: pointer.x,
              y: pointer.y,
            }}
            onMouseDown={(event) => handleMouseDown(event, puzzle.id)}
            onHover={() => setHoveredPuzzle(puzzle.id)}
            onHoverEnd={() => setHoveredPuzzle(null)}
            onClick={() => {
              setDraggedPuzzle(null)
              onSelectPuzzle(puzzle.id)
            }}
            isDragging={draggedPuzzle === puzzle.id}
            isHovered={hoveredPuzzleId === puzzle.id}
          />
        ))}
      </div>

    </div>
  )
}
