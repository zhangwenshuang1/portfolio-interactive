import type { CSSProperties, MouseEvent } from 'react'
import { motion } from 'framer-motion'

/**
 * 进入摄影轮播前的“场景幕”：
 * 把人举起相机/在现场拍片的幕后照片散落铺设，**不按次序**错落分布；
 * 每张从透明逐渐清晰浮现。图层中央压住一句介绍摄影热爱与志向的文字，
 * 底部按钮用于唤出真正的 24 张作品轮播。
 */

const SCENES = [
  // x / y(% 相对画布)、宽、旋转、越晚出现 alpha 延迟越大
  { src: '/scene-shots/scene-01.jpg', x: 1, y: 14, w: 17, r: -6, dy: 0.0, hi: 0.9 },
  { src: '/scene-shots/scene-02.jpg', x: 18, y: 5, w: 15, r: 3, dy: 0.3, hi: 0.85 },
  { src: '/scene-shots/scene-03.jpg', x: 36, y: 8, w: 12, r: -2, dy: 0.5, hi: 0.8 },
  { src: '/scene-shots/scene-04.jpg', x: 50, y: 4, w: 15, r: 4, dy: 0.8, hi: 0.7 },
  { src: '/scene-shots/scene-05.jpg', x: 66, y: 10, w: 16, r: -7, dy: 1.0, hi: 0.9 },
  { src: '/scene-shots/scene-06.jpg', x: 83, y: 7, w: 14, r: 3, dy: 1.3, hi: 0.75 },
  { src: '/scene-shots/scene-07.jpg', x: 7, y: 48, w: 16, r: 5, dy: 1.6, hi: 0.8 },
  { src: '/scene-shots/scene-08.jpg', x: 26, y: 55, w: 14, r: -4, dy: 1.9, hi: 0.9 },
  { src: '/scene-shots/scene-09.jpg', x: 44, y: 60, w: 13, r: 2, dy: 2.2, hi: 0.7 },
  { src: '/scene-shots/scene-10.jpg', x: 60, y: 52, w: 17, r: -5, dy: 2.5, hi: 0.95 },
  { src: '/scene-shots/scene-11.jpg', x: 79, y: 58, w: 15, r: 6, dy: 2.8, hi: 0.8 },
]

interface Props {
  /** 用户在场景幕点“开始”后唤醒轮播 */
  onBegin: () => void
}

export default function PhotoIntroStage({ onBegin }: Props) {
  // 按钮键盘也可触发
  const begin = (e?: MouseEvent) => {
    e?.preventDefault()
    onBegin()
  }

  return (
    <div
      className="relative my-auto flex w-full select-none items-center justify-center overflow-hidden rounded-[30px] border border-[#f0e0ca]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_70px_rgba(190,150,110,0.12)]"
      style={{
        minHeight: 400,
        height: 'min(76vh, 720px)',
        maxHeight: 720,
        background:
          'radial-gradient(120% 120% at 50% 8%, #fdf8ec 0%, #f3e7d0 52%, #e9dbc0 100%)',
      }}
    >
      {/* 散落场景照片：任意位置错落排布，逐张淡入清晰 */}
      {SCENES.map((it, i) => {
        const box: CSSProperties = {
          left: `${it.x}%`,
          top: `${it.y}%`,
          width: `${it.w}%`,
          rotate: `${it.r}deg`,
          zIndex: i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : 2,
        }
        return (
          <motion.div
            key={it.src}
            aria-hidden
            className="pointer-events-none absolute overflow-hidden rounded-[clamp(8px,1.6vw,20px)] border-2 border-white/90 bg-white/70 shadow-[0_14px_32px_rgba(90,60,30,0.28)]"
            style={{
              ...box,
              aspectRatio: '4 / 3',
              paddingBottom: it.w > 0 ? undefined : 0,
              filter: 'brightness(0.92) saturate(1.05)',
            }}
            initial={{ opacity: 0, scale: 0.82, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: it.dy, type: 'spring', stiffness: 90, damping: 17 }}
          >
            <img
              src={it.src}
              alt=""
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
          </motion.div>
        )
      })}

      {/* 中央文字：毛玻璃底板，读得清又不盖掉幕后台前照片 */}
      <div className="relative z-20 mx-auto w-[min(92%,560px)] px-6 py-7 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="rounded-[26px] border border-white/60 bg-[rgba(255,252,246,0.86)] px-6 py-7 shadow-[0_20px_46px_rgba(120,85,30,0.16)] backdrop-blur-md sm:px-9"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#b97f47]">
            拿起相机的每一刻
          </p>
          <h2 className="mt-3 text-2xl font-black leading-snug text-[#2c241a] sm:text-[34px]">
            摄影，是我在平凡缝隙里捕捉光的方式。
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-[#6b5a43] sm:text-base">
            走到景深处，把转瞬的心动存成一帧看得见的安静 ——
            每一张快门，都是我想让世界慢下来的心意。
          </p>
          <button
            onClick={begin}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#f3c15f] px-7 py-3.5 text-base font-black text-white shadow-[0_14px_26px_rgba(255,99,164,0.4)] transition hover:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-[#ff9fc6]/50 active:scale-95"
          >
            开始浏览我的摄影作品
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
          <p className="mt-3 text-[11px] font-semibold text-[#b0a18c]">
            24 张照片 · 每 0.5 秒无缝自动轮播 · 鼠标停留既可暂停
          </p>
        </motion.div>
      </div>
    </div>
  )
}
