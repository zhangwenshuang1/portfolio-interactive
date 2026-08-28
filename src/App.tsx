import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import HomePage from './pages/HomePage'
import DetailPage from './pages/DetailPage'

function App() {
  const [view, setView] = useState<'landing' | 'puzzle'>('landing')
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string | null>(null)

  // 首次挂载锁定滚动高度，保证拼图界面一屏展示
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-pink-light to-yellow-100">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <LandingPage
            key="landing"
            onStart={() => setView('puzzle')}
          />
        ) : (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5 }}
          >
            <HomePage onSelectPuzzle={setCurrentPuzzleId} onReplay={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>

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
