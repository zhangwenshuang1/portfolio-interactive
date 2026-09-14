import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// 六块拼图聚拢成的完整方形区块（在 1440×980 逻辑坐标下）：
// 3×2，每块 440，左上角在 (60,50)，整体 1320×880 —— 正好覆盖 ASSEMBLY_POSITIONS
interface PhotoBounds {
  left: number
  top: number
  width: number
  height: number
}

interface PuzzleFinaleProps {
  onReplay: () => void
  onReveal: () => void // 背面文字展示时告知上层（可选）
  photoBounds?: PhotoBounds
}

// ★ 你要替换的"最终合照"：放到项目 public/ 目录后换成对应路径即可。
//    例如在 public/final-me.png 就写 '/final-me.png'；也可以放 /src/assets 后 import 引入。
const FINALE_PHOTO = '/full-photo.png'

// 拼合完成的叙事：
// 六块拼图刚拼好时还是各自五颜六色的色块；下面这张最终合照在同一块长方形区域里
// 由透明慢慢浮现（opacity 0→1）。而六块彩色拼图会被 PuzzleBoard 在其上叠加的
// .fade-colour 同节奏淡出，于是得到"五彩色块…渐渐让位给照片"的交叉显现。
function RevealPhoto({ bounds }: { bounds: PhotoBounds }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        position: 'absolute',
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {/* 完整照片（无翻转，直接淡入浮现） */}
      <motion.img
        src={FINALE_PHOTO}
        alt="完整照片"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut', delay: 0.15 }}
      />
      {/* 浮现结束后的柔和高光掠过 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        initial={{ x: '-115%' }}
        animate={{ x: '115%' }}
        transition={{ duration: 1.1, delay: 1.5, ease: 'easeInOut' }}
      />
    </div>
  )
}

// 第七块拼图：和前面六块完全同源的拼图形状（440×440，四周带凸齿/凹槽），
// 尺寸也与六块一致，看起来就是同一套拼图里的最后一块。
const PIECE_SHAPE =
  'path("M 0 0 L 180 0 A 40 40 0 0 1 260 0 L 440 0 L 440 180 A 40 40 0 0 1 440 260 L 440 440 L 260 440 A 40 40 0 0 0 180 440 L 0 440 L 0 260 A 40 40 0 0 0 0 180 Z")'

function PuzzleFinale({
  onReplay,
  onReveal,
  photoBounds = { left: 60, top: 50, width: 1320, height: 880 },
}: PuzzleFinaleProps) {
  const [stage, setStage] = useState<'photo' | 'piece' | 'replay'>('photo')
  const revealed = useRef(false)

  // 时间轴驱动阶段推进（这是"网站最后的叙事"，不是系统报错）
  // photo:  聚拢好的拼图卡片翻转成完整照片 → 停留片刻
  // piece:  整块照片翻过去，露出第七块拼图的背面文字 → 停留片刻
  // replay: 出现 "重新认识我" 按钮
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    // 照片浮现(延时0.15+淡入1.1≈1.3s)后留足 2s 看合照，再翻转
    timers.push(setTimeout(() => setStage('piece'), 3300))
    timers.push(setTimeout(() => setStage('replay'), 9100)) // 背面文字停留
    return () => timers.forEach(clearTimeout)
  }, [])

  // 翻转完成 → 通知上层（可在背面文字露出的同时触发）
  useEffect(() => {
    if (stage === 'piece' && !revealed.current) {
      const t = setTimeout(() => {
        revealed.current = true
        onReveal?.()
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [stage, onReveal])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {/* 阶段一：六块碎块汇合成一张完整照片，停留片刻 */}
        {stage === 'photo' && (
          <motion.div
            key="photo"
            className="absolute inset-0 z-10"
            exit={{ opacity: 0 }}
          >
            <RevealPhoto bounds={photoBounds} />
          </motion.div>
        )}

        {/* 阶段二：整块照片作为"第七块拼图"翻转，背面只有一句话 */}
        {stage === 'piece' && (
          <motion.div
            key="piece"
            className="relative flex h-full w-full items-center justify-center bg-[#f6f3ee]/92"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative h-[440px] w-[440px]"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180 }}
              transition={{ duration: 2.2, ease: [0.6, 0.05, 0.1, 0.9], delay: 0.4 }}
            >
              {/* 正面：完好的拼图（与前面六块同一套暖色质感） */}
              <div
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden', clipPath: PIECE_SHAPE }}
              >
                <div className="h-full w-full bg-gradient-to-br from-[#f7d6a4] via-[#f0b45a] to-[#e2943c]" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
              </div>

              {/* 背面：翻到底才露出的那句话 */}
              <div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  clipPath: PIECE_SHAPE,
                }}
              >
                <div className="h-full w-full bg-gradient-to-br from-[#1f2430] to-[#0f1118]" />
                <div className="absolute inset-0 flex items-center justify-center px-10 text-center">
                  <p className="font-cartoon-latin text-xl font-bold leading-snug text-[#f5efe2] sm:text-2xl">
                    The next piece is still being made.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 阶段三：重新认识我 */}
      <AnimatePresence>
        {stage === 'replay' && (
          <motion.div
            key="replay"
            className="absolute inset-0 z-40 flex items-center justify-center bg-[#f6f3ee]/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center px-6 text-center"
            >
              <span className="text-5xl">🔁</span>
              <p className="mt-4 max-w-md text-xl font-bold leading-relaxed text-[#33302b]">
                这块拼图永远留着一角空白，
                <br />
                因为我的故事，还有无限可能。
              </p>
              <button
                onClick={onReplay}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#ffd54a] px-9 py-4 text-lg font-black text-white shadow-[0_16px_30px_rgba(255,126,182,0.4)] transition hover:scale-105"
              >
                ✨ 重新认识我
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PuzzleFinale
