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

function PuzzleFinale({
  onReplay,
  onReveal,
  photoBounds = { left: 60, top: 50, width: 1320, height: 880 },
}: PuzzleFinaleProps) {
  const [stage, setStage] = useState<'photo' | 'missing' | 'replay'>('photo')
  const revealed = useRef(false)

  // 时间轴驱动阶段推进（这是"网站最后的叙事"，不是系统报错）
  // photo: 聚拢好的拼图卡片翻转成完整照片 → 停留片刻
  // missing: 猛然弹出 "ONE PIECE IS MISSING"，一块空白拼图缓缓翻转露出背面文字 → 停留 5 秒
  // replay: 出现 "重新认识我" 按钮
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    // 照片浮现(延时0.15+淡入1.1≈1.3s)后留足 2s 看合照，再转入“缺一块”叙事
    timers.push(setTimeout(() => setStage('missing'), 3300))
    timers.push(setTimeout(() => setStage('replay'), 9100)) // 缺失叙事停留
    return () => timers.forEach(clearTimeout)
  }, [])

  // 翻转完成 → 通知上层（可在背面文字露出的同时触发）
  useEffect(() => {
    if (stage === 'missing' && !revealed.current) {
      const t = setTimeout(() => {
        revealed.current = true
        onReveal?.()
      }, 2600)
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

        {/* 阶段二：一块拼图不见了——弹出叙事字幕 + 空白拼图缓缓翻转 */}
        {stage === 'missing' && (
          <motion.div
            key="missing"
            className="relative flex h-full w-full flex-col items-center justify-center bg-[#f6f3ee]/92"
            style={{ perspective: 1200 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* "最后一格"叙事弹窗：让它像电影落幕，而不是系统出错 */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="relative z-10 mb-10 flex flex-col items-center rounded-[28px] bg-gradient-to-br from-[#1f2430] to-[#0f1118] px-12 py-9 text-center shadow-[0_30px_70px_rgba(15,17,24,0.5)]"
            >
              <div className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5d5d] text-base text-white shadow-lg">
                ⋁
              </div>
              <span className="text-3xl">🧩</span>
              <p className="mt-3 text-3xl font-black uppercase tracking-[0.18em] text-[#f5efe2]">
                One&nbsp;Piece&nbsp;Is&nbsp;Missing.
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#9aa7bd]">
                我的故事还差最后一块。<br />不是遗失，而是它，正在被制作。
              </p>
            </motion.div>

            {/* 空白拼图：缓慢翻转，背面只有一句话 */}
            <motion.div
              className="relative flex aspect-square w-[300px] items-center justify-center"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180 }}
              transition={{ duration: 2.2, ease: [0.6, 0.05, 0.1, 0.9], delay: 0.6 }}
            >
              {/* 正面：空白拼图（缺掉的一格，刻意留白） */}
              <motion.div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: 'hidden',
                  clipPath:
                    'path("M 30 30 L 310 30 A 30 30 0 0 0 310 90 L 310 310 L 200 310 A 30 30 0 0 1 140 310 L 30 310 Z")',
                }}
              >
                <div className="h-full w-full bg-gradient-to-br from-[#efe9df] to-[#e0d9cd] shadow-inner" />
              </motion.div>

              {/* 背面：翻到底才露出的那句话 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  rotateY: 180,
                  clipPath:
                    'path("M 30 30 L 310 30 A 30 30 0 0 1 310 90 L 310 310 L 200 310 A 30 30 0 0 0 140 310 L 30 310 Z")',
                }}
              >
                <div className="h-full w-full bg-gradient-to-br from-[#1f2430] to-[#0f1118]" />
                <div className="absolute px-8 text-center">
                  <p className="text-2xl font-bold leading-snug text-[#f5efe2]">
                    The next piece is still being made.
                  </p>
                </div>
              </motion.div>
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
              <p className="mt-4 max-w-sm text-xl font-bold leading-relaxed text-[#33302b]">
                故事未完待续。
                <br />
                但有关于我的这一块，已经在这里了。
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
