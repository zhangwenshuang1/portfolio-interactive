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
  movePuzzleTo: (id: string, position: { x: number; y: number }) => void
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

// 6 块拼图初始槽位：阅读前以 3 列 × 2 行排布，但每块之间留出明显空隙、
// 绝不重叠（每块 440，列/行间距都比 440 大）。每个故事看完后用户可把该块
// 拖回其槽位，全部读完后再统一"飞向中央聚拢咬合"成一张完整大拼图。
const SLOT_POSITIONS = [
  { x: 24, y: 32 }, //   photo（左上）
  { x: 500, y: 32 }, //  ent（中上）
  { x: 976, y: 32 }, //  doc（右上）
  { x: 24, y: 516 }, //  brand（左下）
  { x: 976, y: 516 }, // sports（右下）
  { x: 500, y: 516 }, //  ai_comic（中下）
]

// 读完所有故事后：六块拼图飞向中央聚拢成的"完整长方形"紧密布局。
// 块元素 440，水平/垂直相邻间距均为 440（元素边界相切）→ 凸起凹槽正好互相咬合，
// 合成一块完整的大拼图（3 列 × 2 行，宽 1320 × 高 880），整体居中于板面(720,490)。
export const ASSEMBLY_POSITIONS = [
  { x: 60, y: 50 }, //   photo（左上）
  { x: 500, y: 50 }, //  ent（中上）
  { x: 940, y: 50 }, //  doc（右上）
  { x: 60, y: 490 }, //  brand（左下）
  { x: 940, y: 490 }, // sports（右下）——其形状=左凸顶凹右/下平，放右下角
  { x: 500, y: 490 }, //  ai_comic（中下）——其形状=左凹右凹顶凹下平，放中间列
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
        x: SLOT_POSITIONS[index].x,
        y: SLOT_POSITIONS[index].y,
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
        return { ...p, position: p.slot, placed: true, placedAt: Date.now() }
      }),
    }))
  },

  // 把拼图移动到指定位置（用于读完所有故事后向中心聚拢拼接），并标记为已归位。
  movePuzzleTo: (id: string, position: { x: number; y: number }) => {
    set((state) => ({
      puzzles: state.puzzles.map((p) => {
        if (p.id !== id) return p
        return { ...p, position, placed: true, placedAt: Date.now() }
      }),
    }))
  },

  resetPuzzlePosition: (id: string, fallbackPosition: { x: number; y: number }) => {
    set((state) => ({
      puzzles: state.puzzles.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          position: fallbackPosition,
          placed: false,
          placedAt: undefined,
        }
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
