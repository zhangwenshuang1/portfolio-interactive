import { motion } from 'framer-motion'

// 场景幕：12 张「我举起相机/现场」照片，按自身比例、等距沿一个外圈环绕中央按钮，
// 不添加随机径向/随机的混乱位置。鼠标始终不会把它们当作按钮，仅作取景展示。
// （素材为 public/intro-shots/001…012.jpg，即使布局照片比例不同也按原比例留白展示。）

// 编号统一补到 3 位：文件就是 intro-shots/001.jpg … 012.jpg，少一位会全 404
const pad = (n: number) => String(n).padStart(3, '0')
const SHOT_COUNT = 12
const SCENES = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-shots/${pad(i + 1)}.jpg`)

/**
 * 设计为「等焦点的若干排片墙」——不是一个等距圆环（那样两两成对、偏小），
 * 也不是纯随机撒点（那样会互相压、或挡中央按钮）。
 *
 * 约束（本阶段重点修好的几何安全性）：
 *  1. 每张照片都是一个「有确定宽高比的相片框」（aspectRatio 固定），不是靠
 *     bare <img> 的原生高度撑页面——这样无论横图/竖图，占位都精确可控、彼此不叠。
 *  2. 中央保护带（文章区/按钮，约在横向 34–66%）永远留空：
 *     每张相框中心都落在四个角落带里，且宽度 ≤ 15%，即使旋转也在保护带外。
 *  3. 只做很轻的随机旋转（-9..9°），仍然是“随手贴”浓度，但绝不压中间的文案。
 *  相框里用 object-contain 保留照片本身比例（不裁切），相框外留白由白色纸片填充。
 */
const TILES: Array<{ top: number; left: number; size: number; rot: number }> = [
  // —— 顶部条带：整宽散布（下方文案区垂直居中，顶部 0–13% 不会被文字盖到）——
  { top: 2, left: 3, size: 11, rot: -6 },
  { top: 1.5, left: 18, size: 8, rot: 3 },
  { top: 2, left: 34, size: 9, rot: -2 },
  { top: 1, left: 48, size: 8, rot: 4 },
  { top: 2, left: 62, size: 9, rot: -3 },
  { top: 1.5, left: 76, size: 8, rot: 5 },
  { top: 2, left: 89, size: 8, rot: -6 },
  // —— 中部只摆在左右两端（保证中央按钮区干净）——
  { top: 33, left: 1, size: 12, rot: 4 },
  { top: 58, left: 1, size: 11, rot: -5 },
  { top: 33, left: 86, size: 12, rot: -4 },
  { top: 58, left: 86, size: 11, rot: 5 },
  // —— 底部条带：整宽稀疏散布，进一步填满又不压内容区 ——
  { top: 80, left: 46, size: 9, rot: 3 },
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
            className="pointer-events-none absolute overflow-hidden rounded-lg bg-[#fffdf7] shadow-[0_10px_22px_rgba(100,70,30,0.18)]"
            style={{
              // 相框左右撑满 tile.size%，再配一个 4:3 白边比例，让占位高度完全可算
              left: `${tile.left}%`,
              top: `${tile.top}%`,
              width: `${tile.size}%`,
              aspectRatio: '4 / 3',
              rotate: `${tile.rot}deg`,
              padding: '2.8%',
              boxSizing: 'border-box',
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + (i % TILES.length) * 0.05, type: 'spring', stiffness: 160, damping: 18 }}
          >
            {/* contain：照片在白色护边内等比缩放到最大，居中、不外裁、不改形 */}
            <img
              src={SCENES[i]}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full rounded-sm object-contain"
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
