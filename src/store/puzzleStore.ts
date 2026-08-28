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
  resetAllPuzzles: () => void
  setHoveredPuzzle: (id: string | null) => void
  isPuzzleRead: (id: string) => boolean
  getReadCount: () => number
  getAllRead: () => boolean
}

const PUZZLE_CATEGORIES = [
  {
    id: 'photo',
    title: '摄影',
    emoji: '📷',
    englishTitle: 'SEE',
    tagline: 'Finding beauty in between.',
    keywords: ['摄影', '人像', '风光', '运动'],
    category: 'photography' as const,
  },
  {
    id: 'entertainment',
    title: '综艺实习',
    emoji: '🎬',
    englishTitle: 'DO',
    tagline: 'Make it happen.',
    keywords: ['综艺现场', '嘉宾对接', '幕后工作'],
    category: 'entertainment' as const,
  },
  {
    id: 'documentary',
    title: '纪录片实习',
    emoji: '🎞️',
    englishTitle: 'LEAD',
    tagline: 'From idea to story.',
    keywords: ['纪录片', '项目统筹', '采访拍摄'],
    category: 'documentary' as const,
  },
  {
    id: 'brand',
    title: '品牌部实习',
    emoji: '🤖',
    englishTitle: 'CREATE',
    tagline: 'Make ideas visible.',
    keywords: ['品牌策划', '视频剪辑', 'AI创作'],
    category: 'brand' as const,
  },
  {
    id: 'sports',
    title: '运动',
    emoji: '🏀',
    englishTitle: 'MOVE',
    tagline: 'Go. Try. Keep going.',
    keywords: ['篮球', '健身', '攀岩'],
    category: 'sports' as const,
  },
  {
    id: 'ai_comic',
    title: '志愿与连接',
    emoji: '🌱',
    englishTitle: 'CONNECT',
    tagline: 'Be part of something.',
    keywords: ['支教', '社团', '志愿活动'],
    category: 'ai_comic' as const,
  },
]

// 6 块拼图槽位：3×2，块元素 440，列距 480、行距 420。
// 间距均大于拼图主体(360)，初始摆放六块彼此分离、呼吸感强、互不堆叠。
const SLOT_POSITIONS = [
  { x: 40, y: 50 },
  { x: 520, y: 50 },
  { x: 1000, y: 50 },
  { x: 40, y: 470 },
  { x: 520, y: 470 },
  { x: 1000, y: 470 },
]

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  puzzles: [],
  completedPuzzles: new Set(),
  hoveredPuzzleId: null,

  initializePuzzles: () => {
    const initialPuzzles: Puzzle[] = PUZZLE_CATEGORIES.map((cat, index) => ({
      id: cat.id,
      title: cat.title,
      emoji: cat.emoji,
      englishTitle: cat.englishTitle,
      tagline: cat.tagline,
      keywords: cat.keywords,
      category: cat.category,
      description: `这是关于${cat.title}的拼图`,
      images: [],
      videoUrl: '',
      isRead: false,
      placed: false,
      position: {
        x: SLOT_POSITIONS[index].x + (Math.random() * 60 - 30),
        y: SLOT_POSITIONS[index].y + (Math.random() * 40 - 20),
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

  resetAllPuzzles: () => {
    get().initializePuzzles()
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
