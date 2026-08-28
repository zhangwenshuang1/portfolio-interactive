import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playMergeChime } from '../utils/sounds'

interface PuzzleFinaleProps {
  onReplay: () => void
  onReveal: () => void // 翻转背面展示时告知上层（可选）
}

// ★ 个人照片：把这里换成你自己的照片地址即可。
// 建议放到 public/ 下，例如 '/my-photo.jpg'。
const FINALE_PHOTO = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'

// 拼接 3×2 马赛克分块（用同一张图的不同裁切模拟"碎片逐渐汇合成照片"）
function Mosaic() {
  const tiles = [
    '0% 0% / 50% 50%',
    '100% 0% / 50% 50%',
    '200% 0% / 50% 50%',
    '0% 100% / 50% 50%',
    '100% 100% / 50% 50%',
    '200% 100% / 50% 50%',
  ]
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-2 overflow-hidden">
      {tiles.map((pos, i) => (
        <motion.div
          key={i}
          className="h-full w-full overflow-hidden"
          initial={{ opacity: 0, scale: 1.8, y: 1.8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: [0.2, 0.8, 0.3, 1] }}
        >
          <img
            src={FINALE_PHOTO}
            alt=""
            style={{ backgroundPosition: pos, backgroundSize: '300% 200%' }}
            className="block h-[calc(100%*3)] w-[calc(100%*2)] object-cover"
            draggable={false}
          />
        </motion.div>
      ))}
    </div>
  )
}

// 拼接完成后：整张清晰照片浮现（马赛克块淡出 → 清晰照淡入）
function RevealPhoto() {
  return (
    <div className="relative h-full w-full">
      {/* 马赛克碎片层：淡出 */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.9, delay: 1.4 }}
      >
        <Mosaic />
      </motion.div>
      {/* 清晰照片层：淡入 */}
      <motion.div
        className="absolute inset-0 overflow-hidden bg-black"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 1.4, ease: 'easeOut' }}
      >
        <img
          src={FINALE_PHOTO}
          alt="完整照片"
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* 轻扫的高光 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-110%' }}
          animate={{ x: '110%' }}
          transition={{ duration: 1, delay: 1.6 }}
        />
      </motion.div>
    </div>
  )
}

function PuzzleFinale({ onReplay, onReveal }: PuzzleFinaleProps) {
  const [stage, setStage] = useState<'photo' | 'missing' | 'replay'>('photo')
  const revealed = useRef(false)

  // 时间轴驱动阶段推进（这是"网站最后的叙事"，不是系统报错）
  // photo: 六块拼图已凝成一张完整照片 → 停留约 2 秒
  // missing: 猛然弹出 "ONE PIECE IS MISSING"，一块空白拼图缓缓翻转露出背面文字 → 停留 5 秒
  // replay: 出现 "重新认识我" 按钮
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => playMergeChime(), 300))
    timers.push(setTimeout(() => setStage('missing'), 4400)) // 照片停留 2 秒后突然转入缺失叙事
    timers.push(setTimeout(() => setStage('replay'), 9600)) // 缺失画面停留 5.2 秒后出现按钮
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
            className="absolute inset-0"
            exit={{ opacity: 0 }}
          >
            <RevealPhoto />
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
