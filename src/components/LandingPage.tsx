import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface LandingPageProps {
  onStart: () => void
}

// 首页：全屏动态视频背景 + 标题 + "开始认识我"按钮。点击后进入拼图界面。
export default function LandingPage({ onStart }: LandingPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // 慢放：把播放速度设为 0.4，视频会显著放慢（duration 不变，只是播放变慢）
  useEffect(() => {
    const v = videoRef.current
    if (v) v.playbackRate = 0.4
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex h-screen w-full overflow-hidden"
    >
      {/* 动态视频背景（这里就是你可以替换成自己视频的地方）
          慢放 + 只播放一次：playbackRate 放慢速度，不设 loop 播完停在最后一帧 */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
      >
        <source src="/videos/动态封面.mp4" type="video/mp4" />
      </video>

      {/* 浅色轻遮罩：只在上/下缘加一点弱渐变辅助阅读，不破坏视频原有的浅色调 */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35)_0%,transparent_28%,transparent_72%,rgba(255,255,255,0.4)_100%)]" />

      {/* 柔和光晕点缀（呼应视频的冷青/银灰基调） */}
      <div className="pointer-events-none absolute -left-24 -top-16 h-80 w-80 rounded-full bg-[#aee6e0]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#b9c7ef]/25 blur-3xl" />

      {/* 内容：文字移到上方 & 按钮放下方，避开视频中央的人物 */}
      <div className="relative z-10 flex h-full flex-col justify-between px-6 sm:px-12">
        {/* 顶部区域：标题 + 文案（放在偏左/偏右，避免正中央挡人物） */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="pt-[12vh] sm:pt-[16vh]"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-5 text-xs font-black uppercase tracking-[0.42em] text-[#2f5d6e] sm:text-sm"
          >
            My Portfolio · 2026
          </motion.p>

          <h1 className="text-4xl font-black leading-tight text-[#143a4a] sm:text-6xl lg:text-7xl">
            你好，我是
            <span className="block bg-gradient-to-r from-[#2f7d8d] via-[#3f6ca8] to-[#5b7ec0] bg-clip-text text-transparent">
              张文霜
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-[#1f4d5e]/90 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] sm:text-lg">
            欢迎来到我的作品世界。下面的每一块拼图，都藏着我的一段经历。
            把它们拼起来，你会认识完整的我。
          </p>
        </motion.div>

        {/* 底部区域：按钮 */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="pb-[9vh] sm:pb-[11vh]"
        >
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#2f7d8d] to-[#3f6ca8] px-10 py-4 text-lg font-black text-white shadow-[0_20px_45px_rgba(47,125,141,0.45)] transition"
          >
            开始认识我
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        </motion.div>
      </div>

      {/* 底部提示 */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-[#1f4d5e]/70">
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
