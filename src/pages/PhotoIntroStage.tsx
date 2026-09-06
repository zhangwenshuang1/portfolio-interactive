import { motion } from 'framer-motion'

// 场景幕：12 张「我举起相机/现场」照片，按自身比例、等距沿一个外圈环绕中央按钮，
// 不添加随机径向/随机的混乱位置。鼠标始终不会把它们当作按钮，仅作取景展示。
// （素材为 public/intro-shots/001…012.jpg，即使布局照片比例不同也按原比例留白展示。）

// 编号统一补到 3 位：文件就是 intro-shots/001.jpg … 012.jpg，少一位会全 404
const pad = (n: number) => String(n).padStart(3, '0')
const SHOT_COUNT = 12
const SCENES = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-shots/${pad(i + 1)}.jpg`)

/**
 * 「随手贴满一张照片墙」版式：不再排成等距环，避免两两对称/照片都被压小。
 * 每张中心坐标与尺寸都错开（确定性摆几张，不是每次刷新都乱跳），
 * 12 张尽量把四周塞满、露出浓烈的生活拼贴感，中心只留给一行文案+按钮。
 * left/top 用 % 定位父容器；size 直接按父宽取更接近中等的缩放。
 */
const TILES: Array<{ top: number; left: number; size: number; rot: number }> = [
  { top: 11, left: 2, size: 19, rot: -6 },
  { top: 2, left: 24, size: 15, rot: 4 },
  { top: 14, left: 42, size: 18, rot: -2 },
  { top: 3, left: 64, size: 20, rot: 6 },
  { top: 5, left: 84, size: 13, rot: -4 },
  { top: 29, left: 81, size: 17, rot: 2 },
  { top: 44, left: 1, size: 22, rot: 4 },
  { top: 63, left: 42, size: 16, rot: -3 },
  { top: 77, left: 4, size: 18, rot: -8 },
  { top: 79, left: 25, size: 13, rot: 7 },
  { top: 3, left: 6, size: 12, rot: 3 },
  { top: 74, left: 63, size: 18, rot: -5 },
]

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
        {/* --- 随手贴满的外圈“快门墙”：等比自然满幅，不等于同样大小/配对 --- */}
        {TILES.map((tile, i) => (
          <motion.figure
            key={SCENES[i]}
            className="pointer-events-none absolute overflow-hidden rounded-xl border border-white/90 bg-white shadow-[0_12px_26px_rgba(100,70,30,0.16)]"
            style={{
              left: `${tile.left}%`,
              top: `${tile.top}%`,
              width: `${tile.size}%`,
              rotate: `${tile.rot}deg`,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.14 + (i % TILES.length) * 0.045, type: 'spring', stiffness: 150, damping: 17 }}
          >
            {/* contain：保留照片本来的比例，容器内不裁、不改形 */}
            <img
              src={SCENES[i]}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-auto max-h-[420px] w-full object-contain"
            />
          </motion.figure>
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
