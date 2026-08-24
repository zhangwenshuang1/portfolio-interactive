import { useState } from 'react'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'

function App() {
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-pink-light to-yellow-100">
      <HomePage onSelectPuzzle={setCurrentPuzzleId} />
      {currentPuzzleId && (
        <DetailPage
          puzzleId={currentPuzzleId}
          onClose={() => setCurrentPuzzleId(null)}
        />
      )}
    </div>
  )
}

export default App
