import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { playMergeChime } from '../utils/sounds'

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
  onReveal: () => void // 翻转背面展示时告知上层（可选）
  photoBounds?: PhotoBounds
}

// ★ 个人照片：把这里换成你自己的照片地址即可。
// 建议放到 public/ 下，例如 '/my-photo.jpg'。
const FINALE_PHOTO = '/full-photo.png'

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

// 拼接完成后：整张拼好的长方形像卡片一样 3D 翻转，背面揭露出完整照片。
// 正面是"六块碎块拼合的马赛克面"，翻转 180° 后背面就是那张清晰照片。
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
        perspective: 1600,
      }}
    >
      {/* 翻转卡片：正面马赛克拼图 → 翻转露出背面照片 */}
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 180 }}
        transition={{ duration: 1.5, ease: [0.4, 0.05, 0.1, 0.9], delay: 1.8 }}
      >
        {/* 正面：六块拼图碎片拼成的马赛克面 */}
        <motion.div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Mosaic />
        </motion.div>

        {/* 背面：完整照片（翻转后才可见） */}
        <motion.div
          className="absolute inset-0 overflow-hidden bg-black"
          style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
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
            transition={{ duration: 1, delay: 2.2 }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function PuzzleFinale({
  onReplay,
  onReveal,
  photoBounds = { left: 180, top: 120, width: 1320, height: 880 },
}: PuzzleFinaleProps) {
  const [stage, setStage] = useState<'photo' | 'missing' | 'replay'>('photo')
  const revealed = useRef(false)

  // 时间轴驱动阶段推进（这是"网站最后的叙事"，不是系统报错）
  // photo: 聚拢好的拼图卡片翻转成完整照片 → 停留片刻
  // missing: 猛然弹出 "ONE PIECE IS MISSING"，一块空白拼图缓缓翻转露出背面文字 → 停留 5 秒
  // replay: 出现 "重新认识我" 按钮
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => playMergeChime(), 300))
    timers.push(setTimeout(() => setStage('missing'), 6100)) // 翻转(1.8s后开始,1.5s翻完≈4.8s)后停留片刻再转入缺失叙事
    timers.push(setTimeout(() => setStage('replay'), 11300)) // 缺失画面停留 5.2 秒后出现按钮
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
