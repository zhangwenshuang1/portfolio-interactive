import { motion } from 'framer-motion'

interface StartButtonProps {
  onClick: () => void
}

export default function StartButton({ onClick }: StartButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="px-12 py-4 bg-gradient-to-r from-pink-vibrant via-coral to-yellow rounded-full
                 text-white font-bold text-lg shadow-2xl
                 hover:shadow-3xl transition-all duration-300
                 relative overflow-hidden group"
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 背景动画 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow via-coral to-pink-vibrant opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0 }}
      />

      {/* 文字 */}
      <motion.span
        className="relative z-10 flex items-center gap-2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        开始了解我
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          →
        </motion.span>
      </motion.span>

      {/* 脉冲效果 */}
      <motion.div
        className="absolute inset-0 bg-white rounded-full"
        animate={{
          scale: [1, 1.5, 2],
          opacity: [1, 0.5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </motion.button>
  )
}
