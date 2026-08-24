import { motion } from 'framer-motion'
import { usePuzzleStore } from '../store/puzzleStore'

interface DetailPageProps {
  puzzleId: string
  onClose: () => void
}

export default function DetailPage({ puzzleId, onClose }: DetailPageProps) {
  const { puzzles, markPuzzleAsRead } = usePuzzleStore()
  const puzzle = puzzles.find((p) => p.id === puzzleId)

  if (!puzzle) {
    return null
  }

  const handleClose = () => {
    markPuzzleAsRead(puzzleId)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const demoImages = [
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#fffaf3]"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 flex items-center justify-between rounded-[28px] border-[3px] border-white/80 bg-white/80 p-4 shadow-[0_18px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">My Story</p>
            <h1 className="mt-2 text-3xl font-black text-[#1f2937] sm:text-4xl">{puzzle.title}</h1>
          </div>

          <button
            onClick={handleClose}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#f8d85a] text-xl font-black text-white shadow-lg transition hover:scale-105"
          >
            ✕
          </button>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <motion.section
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-[30px] border-[3px] border-white/80 bg-white/80 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
          >
            <div className="mb-6 rounded-[24px] bg-gradient-to-r from-[#ffedf3] via-[#f4fff9] to-[#eaf8ff] p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-500">Introduction</p>
              <p className="mt-3 text-lg leading-8 text-gray-700">
                {puzzle.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {demoImages.map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="overflow-hidden rounded-[20px] border-[3px] border-white/80 shadow-md"
                >
                  <img src={image} alt={`${puzzle.title}-${index}`} className="h-64 w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.aside
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="rounded-[30px] border-[3px] border-white/80 bg-gradient-to-br from-[#effcf7] via-[#fff8dd] to-[#ffe8f0] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-500">Video</p>
              <div className="mt-4 overflow-hidden rounded-[20px] border-[3px] border-white/80 bg-black">
                <video
                  className="h-60 w-full object-cover"
                  controls
                  onMouseEnter={(event) => event.currentTarget.play()}
                  onMouseLeave={(event) => event.currentTarget.pause()}
                >
                  <source src={puzzle.videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'} type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="rounded-[30px] border-[3px] border-white/80 bg-gradient-to-br from-[#f3f1ff] to-[#eefcff] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-gray-500">Reading Complete</p>
              <div className="mt-4 rounded-[22px] bg-white/80 p-4 text-center">
                <div className="text-4xl">🎨</div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  )
}
