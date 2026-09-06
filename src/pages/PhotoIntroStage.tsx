import { motion } from 'framer-motion'

// 场景幕：展示「我拍照/举起相机」的现场照片，沿外圈松散环绕中央文案；
// 不是标准等距圆，径向与相位有轻微差异——像随手贴起的宝丽来，让人感觉自然。
// 里圈素材单独放在 public/intro-shots，由「拍照」目录整理而来。

const pad = (n: number) => String(n).padStart(2, '0')
const SHOT_COUNT = 12
const SCENES = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-shots/${pad(i + 1)}.jpg`)
const N = SCENES.length

const PRE_ANGLES = [
  0,
  Math.PI * 0.47,
  Math.PI * 0.91,
  Math.PI * 1.38,
  Math.PI * 1.86,
  Math.PI * 2.23,
  Math.PI * 2.7,
  Math.PI * 3.12,
  Math.PI * 3.61,
  Math.PI * 4.03,
  Math.PI * 4.49,
  Math.PI * 4.96,
  Math.PI * 5.41,
  Math.PI * 5.9,
].map((x) => x - Math.PI / 2)

// 每条随机化径向权重与相位，把“正圆/标准椭圆”打散成自然散布
const RING = SCENES.map((src, i) => {
  const seed = (i % 3) / 3 // 0 ~ 0.66 做轻微错开
  const a = PRE_ANGLES[i % PRE_ANGLES.length] + seed * 0.16
  // 径向不是同一个半径：第 i 张在 0%~44% 范围内来回深浅
  const radial = 0.5 + 0.2 * ((i * 7 + 3) % 5)
  const rx = 46 * radial
  const ry = rx * (i % 2 ? 1.32 : 1)
  return {
    src,
    x: 50 + Math.cos(a) * (rx / 1.05 + (i % 4 === 0 ? 6 : i % 4 === 2 ? -5 : 0)),
    y: 50 + Math.sin(a) * (ry / 1.95 + (i % 3 === 0 ? 7 : i % 3 === 2 ? -4 : 0)),
    r: -14 + i * (30 / N),
    dy: 0.32 + i * 0.055,
  }
})

interface Props {
  /** 用户在场景幕点“开始”后唤醒轮播 */
  onBegin: () => void
}

export default function PhotoIntroStage({ onBegin }: Props) {
  return (
    <div
      className="relative my-auto w-full select-none overflow-hidden rounded-[30px] border border-[#f0e0ca]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_70px_rgba(190,150,110,0.14)]"
      style={{
        background:
          'radial-gradient(125% 125% at 50% 0%, #fdf8ed 0%, #f4e8d2 46%, #eadcbf 100%)',
      }}
    >
      <div
        className="relative mx-auto w-full max-w-[1000px]"
        style={{ height: 'clamp(440px, 72vh, 660px)' }}
      >
        {/* --- 外圈环绕一圈的场景照片 --- */}
        {RING.map((it, i) => (
          <motion.div
            key={it.src}
            className="pointer-events-none absolute overflow-hidden rounded-[clamp(8px,1.4vw,18px)] border-2 border-white/95 bg-white/80 shadow-[0_12px_28px_rgba(98,66,32,0.2)]"
            style={{
              left: `${it.x - 8.5}%`,
              top: `${it.y - 5.6}%`,
              width: '17%',
              aspectRatio: '4 / 3', // 取景框，内部 contain 完整保留整张画面
              rotate: `${it.r}deg`,
              zIndex: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1,
            }}
            initial={{ opacity: 0, scale: 0.55, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: it.dy, type: 'spring', stiffness: 130, damping: 17 }}
          >
            <img
              src={it.src}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </motion.div>
        ))}

        {/* --- 中央只放轻量文案 + 开始按钮；不再用白色实底卡片压住中央照片，
             改成极浅磨砂文字区，让外圈作品能透过半透明区域自然透出 --- */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[clamp(300px,60%,560px)] -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4 text-center"
          >
            {/* 微型眉题：半透明白细胶囊，几乎不遮图 */}
            <span className="rounded-full bg-[rgba(255,252,245,0.5)] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#8a5a2a] shadow-sm ring-1 ring-white/60 backdrop-blur-[6px]">
              拿起相机的每一刻
            </span>

            {/* 主文案：不用不透明底板，用深色文字 + 柔黑影保证在照片上可读 */}
            <h2 className="max-w-[460px] text-[clamp(17px,3.6vw,26px)] font-black leading-snug text-[#241c10] [filter:drop-shadow(0_2px_10px_rgba(255,248,238,0.9))]">
              摄影，是我在平凡缝隙里捕捉光的方式
            </h2>
            <p className="max-w-[400px] text-[13px] font-semibold leading-6 text-[#3b2f1e] [filter:drop-shadow(0_1px_6px_rgba(255,250,242,0.9))]">
              走到景深处，让快门替万物放慢。
            </p>

            {/* CTA：仍旧醒目，但用更小胶囊体积，四周留出空气不遮满 */}
            <button
              onClick={onBegin}
              className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6]/92 to-[#f3c15f]/92 px-5 py-2.5 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(120,60,30,0.2)] ring-2 ring-white/70 backdrop-blur-[4px] transition hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-[#ff9fc6]/55 active:scale-95"
            >
              开始浏览摄影作品
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>

            <p className="text-[11px] font-semibold text-[#4c3f2a] [filter:drop-shadow(0_1px_4px_rgba(255,249,241,0.95))]">
              轻点按钮，逐张翻阅我的取景与按下快门的瞬间
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
