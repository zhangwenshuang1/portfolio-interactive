import { useEffect } from 'react'
import { usePuzzleStore } from '../store/puzzleStore'
import PuzzleBoard from '../components/PuzzleBoard'

interface HomePageProps {
  onSelectPuzzle: (id: string) => void
  onReplay?: () => void
}

export default function HomePage({ onSelectPuzzle, onReplay }: HomePageProps) {
  const { initializePuzzles } = usePuzzleStore()

  useEffect(() => {
    initializePuzzles()
  }, [initializePuzzles])

  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cream via-pink-light to-yellow-100 p-3 sm:p-5">
      <PuzzleBoard onSelectPuzzle={onSelectPuzzle} onReplay={onReplay} />
    </div>
  )
}
