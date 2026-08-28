import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePuzzleStore } from '../store/puzzleStore'
import { ASSEMBLY_POSITIONS } from '../store/puzzleStore'
import PuzzlePiece from './PuzzlePiece'
import PuzzleFinale from './PuzzleFinale'
import { playSnap } from '../utils/sounds'

interface PuzzleBoardProps {
  onSelectPuzzle: (id: string) => void
  onReplay?: () => void
}

// 拼图逻辑设计尺寸（板内坐标基于此），通过 transform:scale 自适应窗口
const DESIGN_W = 1440
const DESIGN_H = 980

// 六块拼图聚拢后组成的 3×2 完整方形（与 ASSEMBLY_POSITIONS 对应）：
// 每块 440×440，左上角 (60,50)，整体 1320×880，居中于板面。照片精确出现在这个方块上。
const PHOTO_BOUNDS = { left: 60, top: 50, width: 1320, height: 880 }

export default function PuzzleBoard({ onSelectPuzzle, onReplay }: PuzzleBoardProps) {
  const {
    puzzles,
    hoveredPuzzleId,
    setHoveredPuzzle,
    updatePuzzlePosition,
    snapPuzzleToSlot,
    movePuzzleTo,
    resetPuzzlePosition,
    resetAllPuzzles,
  } = usePuzzleStore()

  const boardRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [draggedPuzzle, setDraggedPuzzle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  // 记录本次交互是否真的发生了拖动(移动超过阈值)，用于在拖拽后抑制 click，
  // 避免 "拼好一块就弹出详情页" 的误触。
  const didDragRef = useRef(false)
  // 最近一次归位的拼图 id：用来触发轻微物理"吸附"弹跳 + 提示音
  const [snapPulseId, setSnapPulseId] = useState<string | null>(null)

  // 统计已归位块数，每当新增一块就播放吸附声、并触发该块的弹跳
  const placedCount = puzzles.filter((p) => p.placed).length
  const placedCountRef = useRef(placedCount)
  useEffect(() => {
    if (placedCount > placedCountRef.current) {
      const diff = placedCount - placedCountRef.current
      playSnap(placedCount + diff - 1)
      const lastPlaced = puzzles
        .filter((p) => p.placed)
        .sort((a, b) => (b.placedAt ?? 0) - (a.placedAt ?? 0))[0]
      const id = lastPlaced ? lastPlaced.id : null
      setSnapPulseId(id)
      if (id) {
        const t = setTimeout(() => setSnapPulseId((cur) => (cur === id ? null : cur)), 350)
        return () => clearTimeout(t)
      }
    }
    placedCountRef.current = placedCount
  }, [placedCount, puzzles])

  useLayoutEffect(() => {
    const el = boardRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      // 同时考虑宽和高，保证整块拼图不用滚动即可一屏展示
      setScale(Math.min(rect.width / DESIGN_W, rect.height / DESIGN_H))
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
    didDragRef.current = false
    setDragStart({ x: p.x, y: p.y })
    setStartPosition({ x: activePuzzle.position.x, y: activePuzzle.position.y })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!boardRef.current) return

    const raw = toLogical(event.clientX, event.clientY)
    setPointer({ x: raw.x, y: raw.y })

    if (!draggedPuzzle) return

    // 指针相对按下点移动超过阈值 → 判定为一次真正的拖动
    if (!didDragRef.current) {
      const moved =
        Math.abs(raw.x - dragStart.x) > 8 || Math.abs(raw.y - dragStart.y) > 8
      if (moved) didDragRef.current = true
    }

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

  // 全部六块拼好 → 展示完成画面（需读完全部 story 才播放）
  const allPlaced = puzzles.length > 0 && puzzles.every((p) => p.placed)
  const allRead = puzzles.length > 0 && puzzles.every((p) => p.isRead)
  // 读完最后一个 story 后：六块拼图向中心聚拢——逐块飞向中央，
  // 凸起凹槽交错咬合，拼成一个完整的方形，再浮现照片。
  const assembleStartedRef = useRef(false)
  useEffect(() => {
    if (!allRead) {
      assembleStartedRef.current = false
      return
    }
    if (assembleStartedRef.current) return
    assembleStartedRef.current = true
    puzzles.forEach((p, i) => {
      setTimeout(() => movePuzzleTo(p.id, ASSEMBLY_POSITIONS[i]), 200 + i * 260)
    })
  }, [allRead, puzzles, movePuzzleTo])

  const unreadCount = puzzles.filter((p) => !p.isRead).length

  return (
    <div
      ref={boardRef}
      className="relative mx-auto h-full w-full max-w-[1440px] overflow-hidden rounded-[38px] border-[3px] border-white/80 bg-[linear-gradient(135deg,#fffaf1_0%,#fef4f7_30%,#eefcf8_100%)] shadow-[0_28px_90px_rgba(255,117,170,0.22)]"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setPointer({ x: 0, y: 0 })
        handleMouseUp()
      }}
    >
      {/* 定位于中心的逻辑尺寸容器：先按 scale 缩到可视尺寸，再水平垂直居中 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: DESIGN_W * scale,
          height: DESIGN_H * scale,
          transform: 'translate(-50%, -50%)',
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

        <div className={`absolute inset-0 ${allRead ? 'pointer-events-none' : ''}`}>
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
                // 刚才是拖动而不是点击 → 不打开详情，避免误触
                if (didDragRef.current) {
                  didDragRef.current = false
                  return
                }
                onSelectPuzzle(puzzle.id)
              }}
              isDragging={draggedPuzzle === puzzle.id}
              isHovered={hoveredPuzzleId === puzzle.id}
              snapPulse={snapPulseId === puzzle.id && puzzle.placed}
            />
          ))}
        </div>

        {/* 拼图全部完成（看完所有 story 并归位）后的叙事结尾：
            六块拼图聚拢成方形 → 方块上浮现照片 → 缺一块 → 翻转 → 重新认识我 */}
        <AnimatePresence>
          {allRead && allPlaced && (
            <PuzzleFinale
              key="finale"
              photoBounds={PHOTO_BOUNDS}
              onReveal={() => {
                // 背面文字出现时，做什么（如需）可在这里接入
              }}
              onReplay={() => {
                resetAllPuzzles()
                onReplay?.()
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>

      {/* 拼图已归位但仍有故事未读：温柔提醒去补齐/或等自动归位 */}
      <AnimatePresence>
        {allPlaced && !allRead && (
          <motion.div
            key="read-hint"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-white/85 px-6 py-3 text-center shadow-lg backdrop-blur-sm"
          >
            <span className="text-base font-bold text-[#7a4a63]">
              还差 {unreadCount} 块故事没看，全部看完拼图会自动合上 ✨
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
