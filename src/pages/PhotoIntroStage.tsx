import { motion } from 'framer-motion'

// 场景幕：把举着相机 / 现场拍照的幕后照片沿外圈椭圆铺满，
// 中间完全留空给「一句话定位 + 开始按钮」——照片不会被中心挡住、
// 彼此也不互压，任何窗口窄都会自动缩放绕圈半径。

const SCENES = [
  '/scene-shots/scene-01.jpg',
  '/scene-shots/scene-02.jpg',
  '/scene-shots/scene-03.jpg',
  '/scene-shots/scene-04.jpg',
  '/scene-shots/scene-05.jpg',
  '/scene-shots/scene-06.jpg',
  '/scene-shots/scene-07.jpg',
  '/scene-shots/scene-08.jpg',
  '/scene-shots/scene-09.jpg',
  '/scene-shots/scene-10.jpg',
  '/scene-shots/scene-11.jpg',
  '/scene-shots/scene-12.jpg', // 新增：+.jpg
]

const N = SCENES.length
// 每条照片沿椭圆外圈循环定位（径向留出半张卡片到中心），主/次轴不对称制造深度感
const RAD = 46
const RING = SCENES.map((src, i) => {
  // 顶部(12 点方向)开始顺时针铺一整圈，让每张都大概朝向圆心
  const a = (i / N) * Math.PI * 2 - Math.PI / 2
  return {
    src,
    x: 50 + (RAD / 1.05) * Math.cos(a),
    y: 50 + (RAD / 1.8) * Math.sin(a),
    r: -14 + i * (30 / N), // 微错开就不呆板
    dy: 0.3 + i * 0.08,
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

        {/* --- 中心只放文案 + 开始按钮（照片全在外圈，不会互相遮挡） --- */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70%,420px)] -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55, ease: 'easeOut' }}
            className="pointer-events-auto rounded-[30px] border border-white/70 bg-[rgba(255,252,245,0.82)] px-6 py-7 text-center shadow-[0_24px_70px_rgba(120,80,25,0.2)] backdrop-blur-[10px] sm:px-8"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b97f47]">
              拿起相机的每一刻
            </p>
            <h2 className="mt-2 text-2xl font-black leading-snug text-[#2c241a] sm:text-[30px]">
              摄影，是我在平凡缝隙里捕捉光的方式。
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-[#6a5842]">
              走到景深处，每一张快门，都是我想让世界慢下来的心意。
            </p>
            <button
              onClick={onBegin}
              className="group mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#f3c15f] px-6 py-3 text-[15px] font-black text-white shadow-[0_14px_26px_rgba(255,99,164,0.42)] transition hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-[#ff9fc6]/55 active:scale-95"
            >
              开始浏览我的摄影作品
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            <p className="mt-4 text-[11px] font-semibold text-[#b09a80]">
              25 张作品 · 自动无缝循环 · 鼠标悬停画面即可暂停
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
