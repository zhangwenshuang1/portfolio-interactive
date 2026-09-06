import { motion } from 'framer-motion'

// 场景幕：12 张「我举起相机/现场」照片，按自身比例、等距沿一个外圈环绕中央按钮，
// 不添加随机径向/随机的混乱位置。鼠标始终不会把它们当作按钮，仅作取景展示。
// （素材为 public/intro-shots/001…012.jpg，即使布局照片比例不同也按原比例留白展示。）

const pad = (n: number) => String(n).padStart(2, '0')
const SHOT_COUNT = 12
const SCENES = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-shots/${pad(i + 1)}.jpg`)

/** 按索引放到一个近乎正交的椭圆轨道：轻微错相位让上下不压，
 *  但绝不再用小半径/大偏移把某张抛出环外。 */
const RING = SCENES.map((src, i) => {
  const angle = (Math.PI * 2 * i) / SHOT_COUNT
  const ph = (i % 2 === 0 ? 0 : (Math.PI * 2) / (SHOT_COUNT * 2))
  return {
    src,
    angle: angle + ph,
    tilt: (i % 2 === 0 ? -1 : 1) * (1 + (i % 3)) * 0.9,
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
        {/* --- 外圈环绕一圈、等比且位置确定清晰的场景照片 --- */}
        {RING.map((shot, i) => {
          const r = 46 // 圆心到照片中心的整圈半径（%）
          return (
            <motion.figure
              key={shot.src}
              className="pointer-events-none absolute overflow-hidden rounded-[clamp(6px,1vw,14px)] border border-white/90 bg-white p-[1.5%] shadow-[0_10px_22px_rgba(98,66,32,0.14)]"
              style={{
                left: `${50 + Math.cos(shot.angle) * r}%`,
                top: `${50 + Math.sin(shot.angle) * r}%`,
                width: '15.5%',
                aspectRatio: '4 / 3',
                rotate: `${shot.tilt}deg`,
                transform: 'translate(-50%, -50%)',
                zIndex: i === 0 ? 4 : i % 2 ? 2 : 3,
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: shot.angle / (Math.PI * 2) * 0.5, type: 'spring', stiffness: 150, damping: 18 }}
            >
              {/* contain：永远保持原比例，不在框内被裁掉 */}
              <img
                src={shot.src}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-full w-full object-contain bg-[#fdf6e7]"
              />
            </motion.figure>
          )
        })}

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
