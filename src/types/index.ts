export interface Puzzle {
  id: string
  title: string
  emoji: string
  englishTitle: string
  tagline: string
  keywords: string[]
  category: 'photography' | 'entertainment' | 'documentary' | 'brand' | 'ai_comic' | 'sports'
  description: string
  images: string[]
  videoUrl: string
  isRead: boolean
  placed: boolean
  position: { x: number; y: number }
  slot: { x: number; y: number }
}

export interface AppState {
  puzzles: Puzzle[]
  completedPuzzles: Set<string>
  isPuzzleHovered: string | null
}

export interface DetailPageContent {
  title: string
  subtitle: string
  description: string
  images: { url: string; caption?: string }[]
  videoUrl: string
  content: string
}
