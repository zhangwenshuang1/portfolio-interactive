import { create } from 'zustand'
import { Puzzle } from '../types'

interface PuzzleState {
  puzzles: Puzzle[]
  completedPuzzles: Set<string>
  hoveredPuzzleId: string | null

  initializePuzzles: () => void
  markPuzzleAsRead: (id: string) => void
  updatePuzzlePosition: (id: string, position: { x: number; y: number }) => void
  snapPuzzleToSlot: (id: string) => void
  resetPuzzlePosition: (id: string, fallbackPosition: { x: number; y: number }) => void
  setHoveredPuzzle: (id: string | null) => void
  isPuzzleRead: (id: string) => boolean
  getReadCount: () => number
  getAllRead: () => boolean
}

const PUZZLE_CATEGORIES = [
  { id: 'photo', title: '摄影', category: 'photography' as const },
  { id: 'entertainment', title: '综艺实习', category: 'entertainment' as const },
  { id: 'documentary', title: '纪录片实习', category: 'documentary' as const },
  { id: 'brand', title: '互联网品牌部实习', category: 'brand' as const },
  { id: 'ai_comic', title: 'AI漫剧实习', category: 'ai_comic' as const },
  { id: 'sports', title: '运动', category: 'sports' as const },
]

const SLOT_POSITIONS = [
  { x: 105, y: 55 },
  { x: 405, y: 55 },
  { x: 705, y: 55 },
  { x: 105, y: 355 },
  { x: 405, y: 355 },
  { x: 705, y: 355 },
]

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  puzzles: [],
  completedPuzzles: new Set(),
  hoveredPuzzleId: null,

  initializePuzzles: () => {
    const initialPuzzles: Puzzle[] = PUZZLE_CATEGORIES.map((cat, index) => ({
      id: cat.id,
      title: cat.title,
      category: cat.category,
      description: `这是关于${cat.title}的拼图`,
      images: [],
      videoUrl: '',
      isRead: false,
      placed: false,
      position: {
        x: SLOT_POSITIONS[index].x + (Math.random() * 180 - 90),
        y: SLOT_POSITIONS[index].y + (Math.random() * 160 - 80),
      },
      slot: SLOT_POSITIONS[index],
    }))

    set({ puzzles: initialPuzzles })
  },

  markPuzzleAsRead: (id: string) => {
    set((state) => {
      const newCompleted = new Set(state.completedPuzzles)
      newCompleted.add(id)

      const updatedPuzzles = state.puzzles.map((p) =>
        p.id === id ? { ...p, isRead: true } : p
      )

      return {
        completedPuzzles: newCompleted,
        puzzles: updatedPuzzles,
      }
    })
  },

  updatePuzzlePosition: (id: string, position: { x: number; y: number }) => {
    set((state) => ({
      puzzles: state.puzzles.map((p) =>
        p.id === id ? { ...p, position } : p
      ),
    }))
  },

  snapPuzzleToSlot: (id: string) => {
    set((state) => ({
      puzzles: state.puzzles.map((p) => {
        if (p.id !== id) return p
        return { ...p, position: p.slot, placed: true }
      }),
    }))
  },

  resetPuzzlePosition: (id: string, fallbackPosition: { x: number; y: number }) => {
    set((state) => ({
      puzzles: state.puzzles.map((p) => {
        if (p.id !== id) return p
        return { ...p, position: fallbackPosition, placed: false }
      }),
    }))
  },

  setHoveredPuzzle: (id: string | null) => {
    set({ hoveredPuzzleId: id })
  },

  isPuzzleRead: (id: string) => {
    return get().completedPuzzles.has(id)
  },

  getReadCount: () => {
    return get().completedPuzzles.size
  },

  getAllRead: () => {
    return get().completedPuzzles.size === PUZZLE_CATEGORIES.length
  },
}))
