import { motion } from 'framer-motion'

interface LandingPageProps {
  onStart: () => void
}

// 首页：全屏动态视频背景 + 标题 + "开始认识我"按钮。点击后进入拼图界面。
export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
    >
      {/* 动态视频背景（这里就是你可以替换成自己视频的地方） */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          type="video/mp4"
        />
      </video>

      {/* 深色半透明遮罩，让文字清晰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/65" />

      {/* 柔和光晕点缀 */}
      <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-[#ff7eb6]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#7bd9d5]/30 blur-3xl" />

      {/* 居中内容 */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="relative z-10 px-6 text-center text-white"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-4 text-sm font-black uppercase tracking-[0.42em] text-white/80"
        >
          My Portfolio · 2026
        </motion.p>

        <h1 className="text-5xl font-black leading-tight drop-shadow-lg sm:text-7xl">
          你好，我是
          <span className="block bg-gradient-to-r from-[#ff7eb6] via-[#ffd54a] to-[#7bd9d5] bg-clip-text text-transparent">
            张文霜
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
          欢迎来到我的作品世界。下面的每一块拼图，都藏着我的一段经历。
          把它们拼起来，你会认识完整的我。
        </p>

        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="group relative mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#ffd54a] px-10 py-4 text-lg font-black text-white shadow-[0_20px_45px_rgba(255,126,182,0.5)] transition"
        >
          开始认识我
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </motion.button>
      </motion.div>

      {/* 底部滚动提示 */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/70">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="flex flex-col items-center gap-2 text-xs tracking-[0.25em]"
        >
          <span>滑动拼图 · 认识我</span>
          <span className="text-xl">▼</span>
        </motion.div>
      </div>
    </motion.section>
  )
}
