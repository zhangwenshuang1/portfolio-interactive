import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// 摄影「开场墙」：环绕中央文案，16:9 的可加高画布四边放 12 张随拍。
//
// 一个版本的既定目标：
// 1) 「更大」而不再“小邮票” —— 每张照片尽量给足宽度；
// 2) 「按原图比例、零裁剪」—— 外层不设 aspect/裁切，直接用 <img> 自身宽高比占位
//    （w 由布局决定、h-auto），所见即这张原图全部内容；
// 3) 「上下均衡、别只在上面挤一条」—— 布局把上、中柱、底排都撑开、密度分散；
// 4) 「加载不卡」—— 只引用 intro-thumbs（每张 ~60–77KB 缩略，首屏总量 <1MB，而非
//     原图的 10MB+ 原文件）。浏览器内的 60MB → 数千 % 提速。轮播大图与这批相互独立。
//
// 只要保证 central x∈[33..67]、y∈[27..59] 完全留空，中央徽章/标题/按钮永远可读。
// ─────────────────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(3, '0')
const SHOT_COUNT = 12
const SHOTS = Array.from({ length: SHOT_COUNT }, (_, i) => `/intro-thumbs/${pad(i + 1)}.jpg`)

/** 每张的原始像素尺寸（抓源头文件得到；仅用来转换 % 宽 - > 原比例高，不参与显示裁剪） */
const NATIVE: Array<{ w: number; h: number }> = [
  { w: 2133, h: 1600 }, // 001 横 3:2
  { w: 1212, h: 810 }, //  002 横 3:2
  { w: 1080, h: 1440 }, // 003 竖 3:4
  { w: 3024, h: 4032 }, // 004 竖 3:4
  { w: 3072, h: 4096 }, // 005 竖 3:4
  { w: 6000, h: 4000 }, // 006 横 3:2
  { w: 3024, h: 4032 }, // 007 竖 3:4
  { w: 4032, h: 3024 }, // 008 横 4:3
  { w: 5328, h: 4000 }, // 009 横 4:3
  { w: 2268, h: 4032 }, // 010 竖 9:16（窄长）
  { w: 2448, h: 3264 }, // 011 竖 3:4
  { w: 4288, h: 2848 }, // 012 横 3:2
]

/**
 * 「环形、直立、均匀留缝」—— 不再用随机高差拼贴，也绝不“放倒”任何一张。
 *
 * 核心规则：
 *  •  **竖直直立**：全部照片 rotate:0 —— 竖图永远正着站、横图老实躺着，绝无倾斜感；
 *  •  **均匀分布 / 均匀空隙**：12 张照片的「中心」按 360°/12 = 30° 等角绕一个椭圆排成
 *     一圈（angle start 置顶）。用纯「极坐标 + translate(-50%,-50%)」生成，所有相邻的空隙
 *     天生相等 —— 不会一堆挤在一起、另一边空一坨；中央椭圆正好为徽章/标题/按钮透明让位；
 *  •  每张仍以原图比例 w-full h-auto 铺底（见渲染段），竖、横各自保持自然形状，零裁切；
 *  •  环形不占满四角——左右、上下自然留出与画布等距的边缘，视觉上环绕均衡。
 *
 * 用 <k> 直接即时生成坐标，而不是写死 12 组散点坐标，改缝隙只需要调 RX / RY / RING_SHARE。
 */
const RX = 37 // 椭圆横半轴：占画布宽 %
const RY = 23 // 椭圆纵半轴 %（画布较矮时须整体收窄，保证竖图不进中央文案、也不越上下边缘）
const STEP = 30 // 每相邻两张的圆心夹角（deg）== 360/12 —— 等距

const angleOf = (i: number) => ((i * STEP - 90) * Math.PI) / 180 // k 从 "顶/正上方" 起绕一圈
const centerTiles = Array.from({ length: 12 }, (_, i) => {
  const a = angleOf(i)
  return {
    // 圆心在椭圆上、±影进中心环形空腔；X,Y 语义即 figure 的 center
    leftPct: 50 + RX * Math.cos(a),
    topPct: 50 + RY * Math.sin(a),
  }
})
/** 视觉等比例统一放置：横半轴对应 board 高更长的方向，让每张不大不小的匀称 */
const TILES: Array<{ top: number; left: number; size: number }> = centerTiles.map((c) => ({
  top: Number(c.topPct.toFixed(2)),
  left: Number(c.leftPct.toFixed(2)),
  // 每张给一个适中的宽度（% 于整幅画布宽）。这里把每 30° 弧长切分后留一档做间隙：
  // 不设超大“主角”，使相邻之间始终有相同呼吸。
  size: 11,
})) as Array<{ top: number; left: number; size: number }>

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
        className="relative mx-auto w-full max-w-[1200px]"
        style={{ height: 'clamp(620px, 88vh, 960px)' }}
      >
        {TILES.map((tile, i) => {
          const d = NATIVE[i]
          const wPct = tile.size
          return (
            <motion.figure
              key={SHOTS[i]}
              className="pointer-events-none absolute"
              // 0° 直立：布局坐标为「圆心」，用独立 CSS translate 把图片中心移到该点上 ——
              // 因为 CSS `translate` 与 framer 的 `transform` 互不覆盖，竖图永不歪放。
              style={{
                left: `${tile.left}%`,
                top: `${tile.top}%`,
                width: `${wPct}%`,
                translate: '-50% -50%',
                willChange: 'transform',
              }}
              initial={{ opacity: 0, scale: 0.55 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.03 + i * 0.05,
                type: 'spring',
                stiffness: 160,
                damping: 20,
                mass: 0.6,
              }}
            >
              {/* w-full + h-auto = 原图等比铺满给定宽，绝不拉伸或裁切、绝不放倒 */}
              <img
                src={SHOTS[i]}
                alt=""
                width={d.w}
                height={d.h}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-auto w-full rounded-xl drop-shadow-[0_10px_18px_rgba(110,75,30,0.16)]"
              />
            </motion.figure>
          )
        })}

        {/* 中央文案 + CTA :: 体积克制，四周全留白，绝不让相纸盖住 */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[clamp(296px,58%,560px)] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="rounded-full bg-[rgba(255,252,245,0.5)] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#8a5a2a] shadow-sm ring-1 ring-white/60 backdrop-blur-[6px]">
              拿起相机的每一刻
            </span>
            <h2 className="max-w-[460px] text-[clamp(17px,3.4vw,25px)] font-black leading-snug text-[#241c10] [filter:drop-shadow(0_2px_12px_rgba(255,248,236,0.95))]">
              摄影，是我在平凡缝隙里捕捉光的方式
            </h2>
            <p className="max-w-[390px] text-[13px] font-semibold leading-6 text-[#3b2f1e] [filter:drop-shadow(0_1px_8px_rgba(255,250,242,0.95))]">
              走到景深处，让快门替万物放慢。
            </p>
            <button
              onClick={onBegin}
              className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6]/92 to-[#f3c15f]/92 px-5 py-2.5 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(120,60,30,0.2)] ring-2 ring-white/70 backdrop-blur-[4px] transition hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-[#ff9fc6]/55 active:scale-95"
            >
              开始浏览摄影作品
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
