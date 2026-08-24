import { useEffect } from 'react'
import { usePuzzleStore } from '../store/puzzleStore'
import PuzzleBoard from '../components/PuzzleBoard'

interface HomePageProps {
  onSelectPuzzle: (id: string) => void
}

export default function HomePage({ onSelectPuzzle }: HomePageProps) {
  const { initializePuzzles } = usePuzzleStore()

  useEffect(() => {
    initializePuzzles()
  }, [initializePuzzles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-pink-light to-yellow-100 p-6 sm:p-8">
      <PuzzleBoard onSelectPuzzle={onSelectPuzzle} />
    </div>
  )
}
