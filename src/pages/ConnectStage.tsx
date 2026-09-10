import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// 志愿与连接（CONNECT）「Be part of something.」
//
// 视觉语法：把整页做成一本 **摊开的旅行手账相册**——
//   • 左页：一张真实照片（保持原始比例，绝不裁剪）；
//   • 右页：手写体写下的【地点 / 日期】与这段经历的故事文案；
//   • 中间是一道「书脊」（BOOK SPINE），像真正的书一样把左右两页装订在一起；
//   • 底部是「← PREV」「NEXT →」翻页按钮，点一下就像翻过一页纸。
//
// 每一页 = 一段志愿经历：照片是"证据"，右页的手写字是"心情"。
// ─────────────────────────────────────────────────────────────────────────────

interface Page {
  key: string
  /** 英文地名（大写），如 YUNNAN */
  placeEn: string
  /** 中文地名 */
  placeCn: string
  /** 手写感的日期 */
  date: string
  /** 页码序号，如 01 */
  index: string
  /** 右页故事文案（后面会替换成真实内容） */
  story: string
}

const PHOTO_COUNT = 11

// 先放占位文案，用户之后会提供真实内容替换。
const STORY_PLACEHOLDER =
  '那天的风、那间教室、那些孩子的眼睛，我到现在都还记得。\n' +
  '我们带去的不只是一节课，更像是把一扇窗推开了一点点——\n' +
  '让他们看见外面的世界，也让我重新看见自己。\n' +
  '很多年后回想起来，真正被改变的，其实是我。'

// 地点/日期先按占位给出，之后替换。
const PAGES: Page[] = Array.from({ length: PHOTO_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  const spots = [
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
    { en: 'YUNNAN', cn: '云南 · 拓店' },
  ]
  return {
    key: n,
    placeEn: spots[i].en,
    placeCn: spots[i].cn,
    date: '2025.07',
    index: n,
    story: STORY_PLACEHOLDER,
  }
})

interface StageProps {
  onClose: () => void
}

export default function ConnectStage({ onClose }: StageProps) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)

  const page = PAGES[idx]
  const total = PAGES.length

  const go = useCallback(
    (next: number, d: 1 | -1) => {
      if (next < 0 || next >= total) return
      setDir(d)
      setIdx(next)
    },
    [total],
  )

  const prev = useCallback(() => go(idx - 1, -1), [go, idx])
  const next = useCallback(() => go(idx + 1, 1), [go, idx])

  // 键盘左右翻页
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  const progress = useMemo(() => (idx + 1) / total, [idx, total])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* —— 书页主体 —— */}
      <div className="relative min-h-0 flex-1">
        <motion.div
          key={page.key}
          initial={{ opacity: 0, x: dir * 60, rotateY: dir * -8 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid min-h-0 h-full gap-0 overflow-hidden rounded-[18px] border border-[#e7dcc6]/70 bg-[#fbf4e6] shadow-[0_30px_70px_rgba(60,40,20,0.35)] lg:grid-cols-[minmax(0,1fr)_2px_minmax(0,0.85fr)]"
          style={{ perspective: 1200 }}
        >
          {/* 左页：照片 */}
          <div className="relative flex min-h-0 flex-col bg-[#f7efdd] p-4 sm:p-5">
            {/* 相册纸质感（细网格 + 内阴影） */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(120,90,50,0.06) 0 1px, transparent 1px 26px),repeating-linear-gradient(90deg, rgba(120,90,50,0.06) 0 1px, transparent 1px 26px)',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(120,80,40,0.12)]"
            />
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[10px] border-[6px] border-white bg-white shadow-[0_10px_30px_rgba(80,60,30,0.28)]">
              {/* 照片：object-contain 保持原始比例，绝不裁剪 */}
              <img
                key={page.key}
                src={`/connect/${page.key}.webp`}
                alt={`${page.placeCn} · 志愿回忆 ${page.index}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-full w-full object-contain"
              />
            </div>
            {/* 照片下方的手写备注条 */}
            <div className="relative mt-2 flex items-center gap-2">
              <span className="font-cartoon-latin text-[10px] font-bold uppercase tracking-[0.28em] text-[#a8894f]">
                Memory
              </span>
              <span className="h-px flex-1 bg-[#d8c7a3]" />
              <span
                className="text-[12px] text-[#6b5636]"
                style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
              >
                {page.placeCn}
              </span>
            </div>
          </div>

          {/* 书脊 BOOK SPINE */}
          <div className="relative hidden lg:block">
            <span
              aria-hidden
              className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(180deg, rgba(180,150,100,0) 0%, rgba(150,115,65,0.55) 12%, rgba(150,115,65,0.55) 88%, rgba(180,150,100,0) 100%)',
              }}
            />
            <span
              aria-hidden
              className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(90deg, rgba(120,85,40,0.10), rgba(120,85,40,0) 40%, rgba(120,85,40,0) 60%, rgba(120,85,40,0.10))',
              }}
            />
            {/* 装订线 */}
            {Array.from({ length: 14 }).map((_, i) => (
              <i
                key={i}
                className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#c9b489] ring-1 ring-white/70"
                style={{ top: `${8 + i * 6.4}%` }}
              />
            ))}
          </div>

          {/* 右页：手写地点 / 日期 / 故事 */}
          <div className="relative flex min-h-0 flex-col overflow-hidden bg-[#fbf6ea] p-5 sm:p-6">
            {/* 右页淡淡的横线，像信纸 */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0 33px, rgba(150,115,65,0.18) 33px 34px)',
                backgroundPosition: '0 12px',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-10"
              style={{
                background:
                  'linear-gradient(90deg, rgba(120,85,40,0.10), rgba(120,85,40,0))',
              }}
            />

            <div className="relative flex min-h-0 flex-1 flex-col pl-3">
              {/* 顶部：地名 / 序号 */}
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="font-cartoon-latin text-[12px] font-black uppercase tracking-[0.34em] text-[#b4925a]"
                  >
                    {page.placeEn} / {page.index}
                  </p>
                  <p
                    className="mt-1 text-[26px] leading-tight text-[#3f3122] sm:text-[30px]"
                    style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
                  >
                    {page.date}
                  </p>
                  <p
                    className="mt-0.5 text-[15px] text-[#7a6647]"
                    style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
                  >
                    {page.placeCn}
                  </p>
                </div>
                <span className="font-cartoon-latin text-[46px] font-black leading-none text-[#e2cfa6]">
                  {page.index}
                </span>
              </div>

              {/* 分隔小装饰 */}
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#ddcaa4]" />
                <span className="text-[12px] text-[#c0a877]">✦</span>
                <span className="h-px flex-1 bg-[#ddcaa4]" />
              </div>

              {/* 手写故事文案 */}
              <div className="relative mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <p
                  className="whitespace-pre-line text-[16px] leading-[2.1] text-[#4a3a28] sm:text-[17px]"
                  style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
                >
                  {page.story}
                </p>
              </div>

              {/* 右下角落款 */}
              <div className="mt-4 flex items-end justify-end">
                <span
                  className="text-[13px] text-[#9c8358]"
                  style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
                >
                  —— 记于 {page.placeCn}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* —— 底部翻页控制 —— */}
      <div className="mt-3 flex flex-none items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#e9dcc2] transition enabled:hover:scale-[1.03] enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="text-base transition-transform group-enabled:group-hover:-translate-x-1">←</span>
          Prev
        </button>

        {/* 进度点 */}
        <div className="flex items-center gap-2">
          {PAGES.map((p, i) => (
            <button
              key={p.key}
              onClick={() => go(i, i > idx ? 1 : -1)}
              aria-label={`第 ${i + 1} 页`}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === idx ? 22 : 8,
                background: i === idx ? '#e9c67f' : 'rgba(255,255,255,0.22)',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={idx === total - 1}
          className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#e9dcc2] transition enabled:hover:scale-[1.03] enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
          <span className="text-base transition-transform group-enabled:group-hover:translate-x-1">→</span>
        </button>
      </div>

      {/* 细进度条（书签带） */}
      <div className="mt-2 h-[3px] flex-none overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#e9c67f,#c99a4a)' }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <span className="sr-only">{Math.round(progress * 100)}%</span>
      </div>

      <span className="sr-only">共 {total} 页，当前第 {idx + 1} 页</span>
    </div>
  )
}
