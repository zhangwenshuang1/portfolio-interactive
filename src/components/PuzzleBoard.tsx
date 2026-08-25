import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePuzzleStore } from '../store/puzzleStore'
import PuzzlePiece from './PuzzlePiece'

interface PuzzleBoardProps {
  onSelectPuzzle: (id: string) => void
}

// 拼图逻辑设计尺寸（板内坐标基于此），通过 transform:scale 自适应窗口
const DESIGN_W = 1440
const DESIGN_H = 980

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
  const [scale, setScale] = useState(1)
  const [draggedPuzzle, setDraggedPuzzle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    const el = boardRef.current
    if (!el) return
    const update = () => {
      const w = el.getBoundingClientRect().width
      setScale(Math.min(1, w / DESIGN_W))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 把屏幕坐标换算为板内逻辑坐标
  const toLogical = (clientX: number, clientY: number) => {
    const rect = boardRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    }
  }

  const handleMouseDown = (event: React.MouseEvent, puzzleId: string) => {
    const activePuzzle = puzzles.find((p) => p.id === puzzleId)
    if (!activePuzzle || !boardRef.current) return

    const p = toLogical(event.clientX, event.clientY)
    setDraggedPuzzle(puzzleId)
    setDragStart({ x: p.x, y: p.y })
    setStartPosition({ x: activePuzzle.position.x, y: activePuzzle.position.y })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!boardRef.current) return

    const raw = toLogical(event.clientX, event.clientY)
    setPointer({ x: raw.x, y: raw.y })

    if (!draggedPuzzle) return

    updatePuzzlePosition(draggedPuzzle, {
      x: raw.x - dragStart.x + startPosition.x,
      y: raw.y - dragStart.y + startPosition.y,
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
      className="relative mx-auto w-full max-w-[1440px] overflow-hidden rounded-[38px] border-[3px] border-white/80 bg-[linear-gradient(135deg,#fffaf1_0%,#fef4f7_30%,#eefcf8_100%)] shadow-[0_28px_90px_rgba(255,117,170,0.22)]"
      style={{ height: DESIGN_H * scale }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setPointer({ x: 0, y: 0 })
        handleMouseUp()
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: DESIGN_W,
          height: DESIGN_H,
          position: 'relative',
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
    </div>
  )
}
