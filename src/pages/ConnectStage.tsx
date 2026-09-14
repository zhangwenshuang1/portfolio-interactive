import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  /** 右页故事文案 */
  story: string
  /** 小标题（英文大写），如 THE FIRST FILM */
  titleEn: string
  /** 对应的照片文件名（不含扩展名）。用于把照片重新排序到指定页 */
  photo: string
}

const PHOTO_COUNT = 11

// ─────────────────────────────────────────────────────────────────────────────
// 11 段文字（与照片编号无关，单独编号，方便与用户核对）
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  // 1 · 第一次小组作业，全英文短片
  t1:
    '第一次小组作业，我们决定拍一条全英文的短片。\n' +
    '那也是我第一次把一个模糊的想法，一步步变成眼前的画面：写剧本、画分镜、准备道具，再到现场拍摄。\n' +
    '那时的自己还不成熟，但正是在一次次讨论、修改和临场应变里，我第一次真切地感受到：把想法变成画面，本身就很有趣。\n' +
    '也是从那时开始，我越来越确定，自己想做的事情就是讲好一个故事。',

  // 2 · 侵华日军遇难同胞纪念馆 · 志愿（上）
  t2:
    '在纪念馆做志愿的那天，我们在入口附近，和一位又一位前来参观的人聊起他们对这段历史的印象。\n' +
    '原本以为是在记录别人的答案，真正开始交流之后，才发现每一个回答背后，都藏着不同的记忆与情绪。',

  // 3 · 侵华日军遇难同胞纪念馆 · 志愿（下）
  t3:
    '那些被反复提起的名字与故事，不再只是课本里的文字。听人们谈起这段历史，我才第一次具体地感受到，所谓「记住」，是一个个真实的人留下的痕迹。\n' +
    '有些记忆之所以需要被留下，是因为总有人愿意认真地听见，并把它继续传下去。',

  // 4 · 第一次站上讲台，读现代诗
  t5:
    '第一次站上讲台，面对的是一群比我想象中更有想象力的孩子。那天，我们一起读现代诗，没有标准答案，也没有规定要写成什么样。\n' +
    '最后让我惊喜的，是他们写出来的诗——有些句子很稚拙，却有一种成年人很难再拥有的真诚。\n' +
    '我原以为那天是我在教他们一些东西，后来才发现，连接并不是单向的。我们把一点知识递给彼此，也在彼此身上发现新的东西。',

  // 5 · 家访
  t6:
    '离开教室，我们走进了孩子们真正生活的地方。家访的路比想象中更长，我们和家人聊天，看看他们每天生活的环境，也听他们讲起孩子的成长。\n' +
    '有些细节很安静，却让我记了很久。原来一个孩子在课堂上的沉默、兴奋，背后都有着属于自己的生活。\n' +
    '真正认识一个人，不只是知道他的名字，而是愿意走近一点，看看他从哪里来，又是怎样长成现在的模样。',

  // 6 · 第一次班会，聊未来
  t7:
    '第一次班会，我们一起玩游戏，也坐下来聊了很多：聊喜欢什么，聊以后想做什么，聊他们眼里的未来。那些还没成形的梦想，被很认真地说出来，天真，却也格外真实。\n' +
    '那时我一直在想，我究竟希望他们以后变成什么样的人？好像并不是一定要去很远的地方，拥有一份看起来很「成功」的人生。\n' +
    '我只是希望，他们有一天能凭自己的努力走出去看看，知道生活原来有很多种可能，然后依然可以按自己的意愿，选择想要的生活。',

  // 7 · 支教伙伴，革命友谊
  t8:
    '支教的日子里，我们白天一起上课、吃饭，也为各种琐事忙碌；到了晚上，又挤在一起熬夜看乒乓球比赛。一场比赛、一阵欢呼，就能让所有人重新热闹起来。\n' +
    '没有刻意去建立关系，只是一起做事、一起吃饭、一起熬夜，久而久之，就有了一种很难被替代的「革命友谊」。\n' +
    '支教结束后，我们各自回到原来的生活。有些人只陪你走过一小段路，却会成为青春里很长久的记忆。',

  // 8 · 操场踢足球
  t9:
    '支教的时候，我也会和孩子们一起跑到操场上踢足球。没有规则，也没有人在意谁踢得好不好。一个球，一片操场，追着跑、摔倒了再爬起来，进了球就开心地欢呼。\n' +
    '那一刻我忽然觉得，他们的快乐真的很简单。其实我也没有比他们大多少，却有一点羡慕。\n' +
    '我也希望自己能一直保留一点这样的能力，认真地喜欢一件小事，也认真地享受当下的快乐。',

  // 9 · 最后的全班合照
  t10:
    '这是我们最后的全班合照。\n' +
    '从第一天起，我就努力记住每一个人的名字，害怕还没真正认识他们，就已经要离开。可到了现在，我已经忘记了很多人的名字。\n' +
    '但很奇怪，我依然记得他们笑起来的样子，记得他们在操场上奔跑的身影，也记得他们看着我时那种毫无防备的眼神。\n' +
    '与其说那段时间是我们去陪伴他们，不如说，是他们用自己的真诚，治愈了那个奔波在生活里的我。',

  // 10 · 48 小时绿皮火车
  t11:
    '从南京到云南，我们坐了整整 48 个小时的绿皮火车。\n' +
    '车厢随着铁轨轻轻晃动，窗外的风景一点一点向后退，我们就这样在漫长的旅途中备课、聊天、唱歌。\n' +
    '那时的我们都带着很鲜明的年轻感，愿意为了一件自己相信的事，坐上两天两夜，去一个很远的地方。那趟火车很慢，却载着一群年轻人，向着各自还没有抵达的未来。',

  // 11 · 站在讲台上的日子
  t12:
    '站在讲台上的那段时间，可能是我大学四年里最无忧的一段日子。\n' +
    '云南的天气很好，风吹过来总是很轻。课间抬头看看远处的山和天空，会突然忘记自己原本还在南京，被课程、论文和实习填满的生活。\n' +
    '我只是带着一颗很简单的心来到这里，没想过要留下什么，只是认真地备课，认真地和孩子们相处，在一堂又一堂课里，慢慢认识他们，也慢慢认识那个暂时不用考虑那么多的自己。\n' +
    '每天有孩子们的笑声，有阳光，有风，有一群志同道合的人，也有一种很久没有感受到的轻松。真正治愈我的，不只是云南的风景，而是我重新拥有了一段时间，可以什么都不急着证明，只是认真地生活。',
}

/**
 * 每一页 = 一张照片 + 一段文字。
 *
 * `photo` 决定这一页显示哪张照片（对应 /connect/{photo}.webp），
 * `story` 决定右页写什么。两者独立编号，互不影响。
 */
const PAGES: Page[] = [
  { key: 'p01', photo: '01', index: '01', titleEn: 'THE FIRST FILM', placeEn: 'NANJING UNIVERSITY · GULOU', placeCn: '南京大学鼓楼校区', date: '2023.10.15', story: T.t1 },
  { key: 'p02', photo: '02', index: '02', titleEn: 'TO REMEMBER', placeEn: 'MEMORIAL HALL', placeCn: '侵华日军南京大屠杀遇难同胞纪念馆', date: '2023.12.13', story: T.t2 },
  { key: 'p03', photo: '03', index: '03', titleEn: 'TO REMEMBER · II', placeEn: 'MEMORIAL HALL', placeCn: '侵华日军南京大屠杀遇难同胞纪念馆', date: '2023.12.13', story: T.t3 },
  { key: 'p04', photo: '04', index: '04', titleEn: '48 HOURS', placeEn: 'NANJING RAILWAY STATION', placeCn: '南京站', date: '2024.07.08', story: T.t11 },
  { key: 'p05', photo: '05', index: '05', titleEn: 'A POEM IN SUMMER', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.12', story: T.t5 },
  { key: 'p06', photo: '06', index: '06', titleEn: 'BEYOND THE CLASSROOM', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.14', story: T.t6 },
  { key: 'p07', photo: '07', index: '07', titleEn: 'SEE THE WORLD', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.16', story: T.t7 },
  { key: 'p08', photo: '08', index: '08', titleEn: 'THE PEOPLE I MET', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.18', story: T.t8 },
  { key: 'p09', photo: '09', index: '09', titleEn: 'THE JOY OF PLAY', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.19', story: T.t9 },
  { key: 'p10', photo: '10', index: '10', titleEn: 'A LITTLE WHILE', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.20', story: T.t10 },
  { key: 'p11', photo: '11', index: '11', titleEn: 'ON THE PODIUM', placeEn: 'YUNNAN', placeCn: '云南 · 妥甸中学', date: '2024.07.21', story: T.t12 },
]

// 确保始终有 11 页（避免调整导致页数不符）
if (PAGES.length !== PHOTO_COUNT) {
  throw new Error(`PAGES 数量应为 ${PHOTO_COUNT}，当前为 ${PAGES.length}`)
}

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

  // ── 右页文案自适应缩放：保证整段文字一屏读完，绝不出现滚动条 ──
  const storyBoxRef = useRef<HTMLDivElement | null>(null)
  const storyTextRef = useRef<HTMLParagraphElement | null>(null)
  const [storyScale, setStoryScale] = useState(1)

  useEffect(() => {
    const box = storyBoxRef.current
    const text = storyTextRef.current
    if (!box || !text) return

    const fit = () => {
      // 先按基准字号量一次，再按“可容纳高度 / 实际高度”等比缩小
      setStoryScale(1)
      requestAnimationFrame(() => {
        const b = storyBoxRef.current
        const t = storyTextRef.current
        if (!b || !t) return
        const avail = b.clientHeight
        const need = t.scrollHeight
        if (need > avail && need > 0) {
          setStoryScale(Math.max(0.72, avail / need)) // 最多缩到 72%
        }
      })
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(box)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [idx])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* —— 右上角退出按钮 —— */}
      <button
        onClick={onClose}
        aria-label="退出"
        title="退出（Esc）"
        className="absolute right-1 top-1 z-30 flex h-9 items-center gap-2 rounded-full border border-[#b4925a]/40 bg-white/70 px-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#6b5636] shadow-[0_4px_14px_rgba(80,60,30,0.18)] backdrop-blur transition hover:scale-[1.04] hover:bg-white"
      >
        <span className="text-base leading-none">✕</span>
        退出
      </button>

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
                src={`/connect/${page.photo}.webp`}
                alt={`${page.placeCn} · ${page.titleEn}`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="block h-full w-full object-contain"
              />
            </div>
            {/* 照片下方的手写备注条 */}
            <div className="relative mt-2 flex items-center gap-2">
              <span className="font-cartoon-latin text-[10px] font-bold uppercase tracking-[0.28em] text-[#a8894f]">
                {page.index} · Memory
              </span>
              <span className="h-px flex-1 bg-[#d8c7a3]" />
              <span
                className="font-cartoon-latin text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6f3f]"
              >
                {page.titleEn}
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
              {/* 顶部：序号 / 标题 / 地名 */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-cartoon-latin text-[11px] font-black uppercase tracking-[0.34em] text-[#b4925a]">
                    {page.index} / Memory
                  </p>
                  <p
                    className="font-cartoon-latin mt-1.5 text-[19px] font-black uppercase leading-tight tracking-[0.04em] text-[#3f3122] sm:text-[22px]"
                  >
                    {page.titleEn}
                  </p>
                  <p
                    className="mt-1.5 text-[20px] text-[#7a6647] sm:text-[22px]"
                    style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
                  >
                    {page.placeCn}
                  </p>
                  {page.date && (
                    <p
                      className="mt-0.5 text-[18px] text-[#9c8358] sm:text-[20px]"
                      style={{ fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif" }}
                    >
                      {page.date}
                    </p>
                  )}
                </div>
                <span className="font-cartoon-latin flex-none text-[46px] font-black leading-none text-[#e2cfa6]">
                  {page.index}
                </span>
              </div>

              {/* 分隔小装饰 */}
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#ddcaa4]" />
                <span className="text-[12px] text-[#c0a877]">✦</span>
                <span className="h-px flex-1 bg-[#ddcaa4]" />
              </div>

              {/* 手写故事文案（自适应缩放，确保不出现滚动条） */}
              <div ref={storyBoxRef} className="relative mt-3 min-h-0 flex-1 overflow-hidden pr-1">
                <p
                  ref={storyTextRef}
                  className="whitespace-pre-line leading-[2.3] text-[#4a3a28]"
                  style={{
                    fontFamily: "'Ma Shan Zheng','Kaiti SC',KaiTi,serif",
                    fontSize: `${16 * storyScale}px`,
                  }}
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
