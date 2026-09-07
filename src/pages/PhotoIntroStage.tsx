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
 * 撒点坐标（% 于整幅画布）。
 * 宽靠 `size`（% of 画布宽），高自然跟随图片比例 h:auto → 绝不裁切。
 * 为了不再“顶上一排 / 底下空一截”，把竖图当“立柱”嵌进左右，把 3:2 大横图分放上/底角，
 * 中部中上则放两张充当过渡带收口。
 */
const TILES: Array<{ top: number; left: number; size: number; rot: number }> = [
  // i0 —001 横·左上大主角
  { top: 3, left: 1.5, size: 21, rot: -5 },
  // i1 —002 横·上方偏左（与左上主角错峰，不贴脸）
  { top: 1, left: 23, size: 13, rot: 4 },
  // i2 —003 竖·左侧立柱上段
  { top: 34, left: 1.5, size: 13.5, rot: 3 },
  // i3 —004 竖·左侧立柱下段
  { top: 60, left: 1, size: 14, rot: -3 },
  // i4 —005 竖·右立柱上段
  { top: 33, left: 85.5, size: 13.5, rot: -2 },
  // i5 —006 横·底部偏左的大图（把下盘撑起来，不再空空如也）
  { top: 63, left: 17.5, size: 20, rot: 2 },
  // i6 —007 竖·最左靠边缘细柱 中
  { top: 36, left: 16.8, size: 9, rot: 5 }, // 宽但窄的占位：让底部与立柱间留呼吸
  // i7 —008 横·上方偏右（对称 001 的右上角）
  { top: 5, left: 51, size: 13, rot: -3 },
  // i8 —009 横·右上第二张大主角（贴着右侧留白）
  { top: 3, left: 65.5, size: 20, rot: 5 },
  // i9 —010 窄竖 9:16·最右侧超高细柱（贯穿中部，真正用满高度）
  { top: 2, left: 86.8, size: 12.5, rot: -4 },
  // i10 —011 竖·右内立柱下段
  { top: 62, left: 59, size: 11, rot: 3 },
  // i11 —012 横·底部偏右大图，与 006 平衡不挤
  { top: 66, left: 71, size: 18, rot: -2 },
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
              style={{
                left: `${tile.left}%`,
                top: `${tile.top}%`,
                width: `${wPct}%`,
                rotate: `${tile.rot}deg`,
              }}
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.03 + i * 0.05,
                type: 'spring',
                stiffness: 140,
                damping: 17,
                mass: 0.65,
              }}
            >
              {/* w-full + h-auto = 原图等比铺满给定宽，绝不拉伸或裁切 */}
              <img
                src={SHOTS[i]}
                alt=""
                width={d.w}
                height={d.h}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-auto w-full rounded-xl drop-shadow-[0_10px_18px_rgba(110,75,30,0.18)]"
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
