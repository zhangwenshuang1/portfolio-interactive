import { motion } from 'framer-motion'

/**
 * 进入摄影轮播前的“场景幕”：
 * 把举起相机 / 在现场拍片的幕后照片完整铺开（不裁切）。
 * 左侧三列照片墙逐张渐清晰，右侧放介绍与“开始”按钮，
 * 因此文字不会遮住任何照片。
 */

const SCENES = [
  { src: '/scene-shots/scene-01.jpg', dy: 0.1, r: -1.5 },
  { src: '/scene-shots/scene-02.jpg', dy: 1.1, r: 1.2 },
  { src: '/scene-shots/scene-03.jpg', dy: 0.4, r: 0.8 },
  { src: '/scene-shots/scene-04.jpg', dy: 1.5, r: -1 },
  { src: '/scene-shots/scene-05.jpg', dy: 0.7, r: -0.6 },
  { src: '/scene-shots/scene-06.jpg', dy: 2.0, r: 0.4 },
  { src: '/scene-shots/scene-07.jpg', dy: 0.9, r: 1.4 },
  { src: '/scene-shots/scene-08.jpg', dy: 1.8, r: -1.2 },
  { src: '/scene-shots/scene-09.jpg', dy: 0.2, r: 0.3 },
  { src: '/scene-shots/scene-10.jpg', dy: 1.3, r: -0.4 },
  { src: '/scene-shots/scene-11.jpg', dy: 2.4, r: 1 },
]

interface Props {
  /** 用户在场景幕点“开始”后唤醒轮播 */
  onBegin: () => void
}

export default function PhotoIntroStage({ onBegin }: Props) {
  return (
    <div
      className="relative my-auto w-full select-none overflow-hidden rounded-[30px] border border-[#f0e0ca]/80 bg-[radial-gradient(120%_120%_at_50%_8%,#fdf8ec_0%,#f3e7d0_52%,#e9dbc0_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_70px_rgba(190,150,110,0.12)]"
      style={{ minHeight: 430, maxHeight: 720 }}
    >
      <div
        className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-3 px-3 py-3 sm:px-5 md:grid-cols-[1.25fr_1fr]"
        style={{ minHeight: 'min(72vh, 680px)' }}
      >
        {/* 左：把全部拍照场景完整铺开，三列并排，逐张浮现且错开角度/次序 */}
        <div className="grid grid-cols-3 gap-3">
          {SCENES.map((it) => (
            <motion.div
              key={it.src}
              className={
                'relative overflow-hidden rounded-[clamp(8px,1.2vw,16px)] border-2 border-white/90 ' +
                (it.r !== 0 ? 'shadow-[0_18px_34px_rgba(110,80,45,0.22)]' : '')
              }
              style={{
                rotate: `${it.r}deg`,
                aspectRatio: '4 / 3',
                background:
                  'linear-gradient(160deg, rgba(255,252,244,0.7), rgba(242,229,204,0.55))',
              }}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: it.dy, type: 'spring', stiffness: 120, damping: 18 }}
            >
              {/* contain：保留整张画面，任何比例都不裁切 */}
              <img
                src={it.src}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-full w-full object-contain"
              />
            </motion.div>
          ))}
        </div>

        {/* 右：热情介绍 + 开始按钮（独立区域，不浮在照片上方） */}
        <div className="relative mx-auto w-full max-w-md py-2 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-[26px] border border-white/80 bg-[rgba(255,252,246,0.9)] px-7 py-8 shadow-[0_22px_46px_rgba(120,85,30,0.16)] backdrop-blur-md sm:rounded-[30px]"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#b97f47]">
              拿起相机的每一刻
            </p>
            <h2 className="mt-3 text-[26px] font-black leading-snug text-[#2c241a] sm:text-3xl">
              摄影，是我在平凡缝隙里捕捉光的方式。
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-[#6b5a43] sm:text-[15px]">
              走到景深处，把转瞬的心动存成一帧看得见的安静 ——
              每一张快门，都是我想让世界慢下来的心意。
            </p>
            <button
              onClick={onBegin}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7eb6] to-[#f3c15f] px-7 py-3.5 text-base font-black text-white shadow-[0_14px_26px_rgba(255,99,164,0.4)] transition hover:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-[#ff9fc6]/50 active:scale-95"
            >
              开始浏览我的摄影作品
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
            <p className="mt-4 text-[11px] font-semibold text-[#b0a18c]">
              25 张照片 · 每 1 秒无缝自动循环 · 鼠标停在画面上即可暂停
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
