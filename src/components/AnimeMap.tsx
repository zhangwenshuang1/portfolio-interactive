/**
 * AnimeMap —— 动漫风格的手绘地图背景（纯 SVG，无外部依赖）
 *
 * 一张地形丰富的手绘地图：
 *  - 左上：雪山山脉 + 云海 + 山顶旗杆
 *  - 左侧：针叶森林
 *  - 中部：梯田丘陵、大树、草原
 *  - 中部偏下：湖泊（天鹅 / 芦苇 / 小木船）
 *  - 右侧：海 + 曲折海岸线 + 灯塔 + 沙滩
 *  - 地标：岩石、大树、篮球场、帐篷营地
 *
 * LANDMARKS 里的坐标与 HobbyStage 的兴趣点一一对应，
 * 让「攀岩=岩石」「游泳=湖泊」「篮球=球场」等语义自然对齐。
 */

export const MAP_W = 1200
export const MAP_H = 760

/** 地标坐标（相对 1200×760 画布），供 HobbyStage 定位兴趣图标 */
export const LANDMARKS = {
  /** 雪山山顶（徒步登顶） */
  mountainTop: { x: 346, y: 74 },
  /** 森林里的大树下（音乐） */
  bigTree: { x: 372, y: 612 },
  /** 帐篷营地（烹饪） */
  camp: { x: 880, y: 596 },
  /** 湖泊（游泳） */
  lake: { x: 572, y: 542 },
  /** 篮球场（篮球） */
  court: { x: 760, y: 430 },
  /** 攀岩岩石（攀岩） */
  rock: { x: 1080, y: 620 },
} as const

export default function AnimeMap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="am-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8e9c8" />
          <stop offset="30%" stopColor="#f3ddb4" />
          <stop offset="58%" stopColor="#ecd7a4" />
          <stop offset="100%" stopColor="#e0c88f" />
        </linearGradient>
        <linearGradient id="am-sea" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#6cc3dd" />
          <stop offset="40%" stopColor="#3f9cc4" />
          <stop offset="100%" stopColor="#256b92" />
        </linearGradient>
        <linearGradient id="am-lake" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#8fd6e8" />
          <stop offset="55%" stopColor="#54a9cc" />
          <stop offset="100%" stopColor="#3a86ad" />
        </linearGradient>
        <linearGradient id="am-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d7e5ef" />
        </linearGradient>
        <linearGradient id="am-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3a170" />
          <stop offset="100%" stopColor="#8f7450" />
        </linearGradient>
        <linearGradient id="am-hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d3b884" />
          <stop offset="100%" stopColor="#a48758" />
        </linearGradient>
        <linearGradient id="am-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8cb74" />
          <stop offset="60%" stopColor="#84ab55" />
          <stop offset="100%" stopColor="#658f3f" />
        </linearGradient>
        <linearGradient id="am-terrace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe0a4" />
          <stop offset="100%" stopColor="#9dbb6a" />
        </linearGradient>
        <linearGradient id="am-forest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a9450" />
          <stop offset="100%" stopColor="#3d6330" />
        </linearGradient>
        <radialGradient id="am-beach-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff4d0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff4d0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 底色 */}
      <rect width={MAP_W} height={MAP_H} fill="url(#am-sky)" />

      {/* ══════════ 海（右侧） ══════════ */}
      <path
        d="M1200 250 Q1080 246 1000 300 Q928 350 972 420 Q1012 486 1108 512 Q1160 526 1200 534 Z"
        fill="url(#am-sea)"
      />
      <path
        d="M1200 534 Q1140 520 1085 496 Q1010 462 986 408 Q962 350 1024 314 Q1092 274 1200 280 L1200 250 Q1076 244 998 300 Q924 354 968 422 Q1006 484 1104 510 Q1160 524 1200 532 Z"
        fill="#e9d7a6"
        opacity="0.5"
      />
      {/* 波浪 */}
      <g stroke="#eaf6fb" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M1046 350 q13 -11 26 0 q13 11 26 0" />
        <path d="M1092 396 q13 -11 26 0 q13 11 26 0" />
        <path d="M1030 438 q13 -11 26 0 q13 11 26 0" />
        <path d="M1108 470 q13 -11 26 0 q13 11 26 0" />
        <path d="M1152 328 q13 -11 26 0 q13 11 26 0" />
      </g>
      {/* 灯塔 */}
      <g transform="translate(1158 206)">
        <path d="M-16 8 L0 -66 L16 8 Z" fill="#fdf6e4" stroke="#a9803f" strokeWidth="2.5" />
        <rect x="-14" y="-30" width="28" height="12" fill="#d9694a" />
        <rect x="-18" y="4" width="36" height="10" rx="3" fill="#8a6a44" />
        <circle cx="0" cy="-76" r="9" fill="#ffe08a" stroke="#a9803f" strokeWidth="2.5" />
      </g>
      {/* 小帆船 */}
      <g transform="translate(1094 356)">
        <path d="M0 0 L0 26 L-38 0 Z" fill="#fdf6e4" stroke="#b08a52" strokeWidth="2" />
        <path d="M0 4 L0 26 L32 0 Z" fill="#f6d98f" stroke="#b08a52" strokeWidth="2" />
      </g>

      {/* ══════════ 远山山脉（左上） ══════════ */}
      <path d="M0 236 L132 108 L268 236 Z" fill="url(#am-hill2)" />
      <path d="M168 250 L346 78 L556 250 Z" fill="url(#am-hill)" />
      <path d="M452 236 L604 120 L776 236 Z" fill="url(#am-hill2)" />
      <path d="M660 226 L788 138 L922 226 Z" fill="url(#am-hill)" />
      {/* 雪顶 */}
      <path d="M346 78 L294 152 L322 140 L346 162 L374 138 L398 152 Z" fill="url(#am-snow)" />
      <path d="M604 120 L562 176 L586 168 L604 184 L630 166 L650 176 Z" fill="url(#am-snow)" />
      <path d="M788 138 L760 174 L776 168 L788 180 L806 166 L818 174 Z" fill="url(#am-snow)" />
      {/* 山顶旗杆（HIKE 徒步登顶） */}
      <g transform="translate(346 78)">
        <line x1="0" y1="0" x2="0" y2="-34" stroke="#7a5a34" strokeWidth="3" strokeLinecap="round" />
        <path d="M0 -34 L24 -26 L0 -18 Z" fill="#e0574a" />
      </g>
      {/* 山脊雪线 */}
      <path d="M168 250 L346 78" stroke="#f2f7fb" strokeWidth="3" fill="none" opacity="0.45" />
      <path d="M452 236 L604 120" stroke="#f2f7fb" strokeWidth="3" fill="none" opacity="0.45" />

      {/* 云海 */}
      <g fill="#fffdf6" opacity="0.92">
        <ellipse cx="470" cy="66" rx="54" ry="25" />
        <ellipse cx="516" cy="58" rx="37" ry="20" />
        <ellipse cx="428" cy="62" rx="31" ry="17" />
        <ellipse cx="900" cy="112" rx="46" ry="22" />
        <ellipse cx="940" cy="104" rx="31" ry="17" />
        <ellipse cx="120" cy="150" rx="44" ry="21" />
      </g>

      {/* ══════════ 草原基面 ══════════ */}
      <path
        d="M0 288 Q180 252 360 288 Q560 328 760 296 Q980 262 1200 300 L1200 760 L0 760 Z"
        fill="url(#am-grass)"
      />
      {/* 梯田丘陵 */}
      <g>
        <path
          d="M210 356 Q330 322 452 356 Q560 388 470 424 Q348 448 250 420 Q180 396 210 356 Z"
          fill="url(#am-terrace)"
          stroke="#7ea24f"
          strokeWidth="2"
        />
        <path
          d="M244 372 Q346 346 440 372 Q520 396 456 420 Q360 440 288 418 Q232 400 244 372 Z"
          fill="#c2d897"
          stroke="#87ab58"
          strokeWidth="2"
        />
        <path
          d="M262 390 Q348 368 428 390 Q486 406 440 422 Q360 436 300 418 Q252 404 262 390 Z"
          fill="#d2e3ac"
        />
      </g>

      {/* ══════════ 湖泊（SWIM） ══════════ */}
      <g>
        <path
          d="M468 548 Q450 500 512 486 Q590 468 650 498 Q710 528 678 568 Q644 606 566 602 Q494 598 468 548 Z"
          fill="url(#am-lake)"
          stroke="#2f7ba1"
          strokeWidth="2.5"
        />
        <g stroke="#eaf8fd" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.75">
          <path d="M508 520 q10 -9 20 0 q10 9 20 0" />
          <path d="M562 550 q10 -9 20 0 q10 9 20 0" />
          <path d="M504 570 q10 -9 20 0 q10 9 20 0" />
        </g>
        {/* 芦苇 */}
        <g stroke="#5d8a3c" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M484 542 q-4 -20 2 -32" />
          <path d="M496 548 q-2 -22 4 -34" />
          <path d="M508 554 q-3 -20 1 -30" />
        </g>
        {/* 小木船 */}
        <g transform="translate(630 526) rotate(-12)">
          <path d="M-22 0 Q0 16 22 0 Z" fill="#c98f4e" stroke="#8a5c30" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="-14" stroke="#8a5c30" strokeWidth="2" />
        </g>
      </g>

      {/* ══════════ 森林（左侧） ══════════ */}
      <path
        d="M0 396 Q128 358 262 396 Q382 430 312 490 Q214 534 92 502 Q-12 472 0 396 Z"
        fill="url(#am-forest)"
      />
      <g>
        {[
          [64, 388, 1.05],
          [136, 368, 1.2],
          [210, 390, 0.98],
          [282, 414, 1.08],
          [176, 428, 0.88],
          [104, 448, 1.02],
          [248, 456, 0.92],
          [38, 452, 0.86],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-4" y="10" width="8" height="18" rx="2" fill="#7a5a34" />
            <path d="M0 -40 L26 12 L-26 12 Z" fill="#3d6b34" />
            <path d="M0 -22 L22 12 L-22 12 Z" fill="#4c7d3d" />
            <path d="M0 -6 L18 12 L-18 12 Z" fill="#5c9047" />
          </g>
        ))}
      </g>

      {/* ══════════ 大树（MUSIC） ══════════ */}
      <g transform="translate(372 612)">
        <rect x="-9" y="0" width="18" height="52" rx="4" fill="#8a5c30" />
        <path d="M-9 14 L-30 -6" stroke="#8a5c30" strokeWidth="7" strokeLinecap="round" />
        <path d="M9 14 L30 -6" stroke="#8a5c30" strokeWidth="7" strokeLinecap="round" />
        <circle cx="0" cy="-26" r="46" fill="#6a9c4a" />
        <circle cx="-34" cy="-8" r="30" fill="#5d8f41" />
        <circle cx="34" cy="-8" r="30" fill="#5d8f41" />
        <circle cx="0" cy="-52" r="27" fill="#78aa54" />
        <circle cx="-14" cy="-30" r="16" fill="#84b75e" opacity="0.85" />
      </g>

      {/* ══════════ 帐篷营地（COOK） ══════════ */}
      <g transform="translate(880 596)">
        <path d="M0 -54 L40 6 L-40 6 Z" fill="#e8825a" stroke="#a9502c" strokeWidth="2.5" />
        <path d="M0 -54 L14 6 L-14 6 Z" fill="#f4a074" />
        <line x1="0" y1="-58" x2="0" y2="-64" stroke="#8a5c30" strokeWidth="2.5" />
        {/* 篝火 */}
        <g transform="translate(74 0)">
          <path d="M-14 0 L14 -6" stroke="#8a5c30" strokeWidth="5" strokeLinecap="round" />
          <path d="M-12 -6 L12 4" stroke="#8a5c30" strokeWidth="5" strokeLinecap="round" />
          <path d="M0 -4 Q-10 -20 0 -30 Q10 -20 0 -4 Z" fill="#f2a33c" />
          <path d="M0 -6 Q-5 -16 0 -22 Q5 -16 0 -6 Z" fill="#ffd465" />
        </g>
        {/* 野餐桌 */}
        <g transform="translate(-78 0)">
          <rect x="-26" y="-14" width="52" height="7" rx="2" fill="#b9803f" />
          <rect x="-22" y="-7" width="6" height="14" fill="#8a5c30" />
          <rect x="16" y="-7" width="6" height="14" fill="#8a5c30" />
        </g>
      </g>

      {/* ══════════ 篮球场（BALL） ══════════ */}
      <g transform="translate(760 430)">
        <rect x="-52" y="-38" width="104" height="68" rx="6" fill="#d9a35e" stroke="#a9803f" strokeWidth="3" />
        <line x1="0" y1="-38" x2="0" y2="30" stroke="#fdf6e4" strokeWidth="2.5" />
        <circle cx="0" cy="-4" r="13" fill="none" stroke="#fdf6e4" strokeWidth="2.5" />
        <g transform="translate(-52 -10)">
          <line x1="0" y1="0" x2="0" y2="-30" stroke="#6b5636" strokeWidth="4" strokeLinecap="round" />
          <rect x="-2" y="-38" width="16" height="12" fill="#fdf6e4" stroke="#6b5636" strokeWidth="2" />
          <path d="M4 -26 L14 -26 L11 -16 L7 -16 Z" fill="none" stroke="#e07a3c" strokeWidth="2" />
        </g>
      </g>

      {/* ══════════ 攀岩岩石（CLIMB） ══════════ */}
      <g transform="translate(1080 620)">
        <path
          d="M-70 20 Q-64 -34 -34 -44 Q-16 -56 -4 -30 Q8 -8 26 -18 Q46 -30 54 2 Q60 22 42 26 Q0 34 -42 30 Q-66 28 -70 20 Z"
          fill="#9c8b74"
          stroke="#6f6152"
          strokeWidth="3"
        />
        <path d="M-34 -44 Q-24 -20 -30 2 Q-36 20 -42 26" stroke="#7d6f5d" strokeWidth="2.5" fill="none" />
        <path d="M-4 -30 Q6 -8 4 12" stroke="#7d6f5d" strokeWidth="2.5" fill="none" />
        <path d="M26 -18 Q34 0 30 20" stroke="#7d6f5d" strokeWidth="2.5" fill="none" />
        <circle cx="-22" cy="-16" r="4" fill="#e0574a" />
        <circle cx="2" cy="-24" r="3.5" fill="#4f86c6" />
        <circle cx="24" cy="4" r="4" fill="#e0a13c" />
        <circle cx="-34" cy="16" r="3.5" fill="#57a05a" />
      </g>

      {/* ══════════ 多分支小路 ══════════ */}
      <g fill="none" stroke="#eadcae" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
        <path d="M330 322 Q430 380 520 348 Q620 314 700 380 Q760 428 800 470 Q862 528 918 546" />
        <path d="M520 348 Q560 420 566 500" />
        <path d="M800 470 Q900 500 1010 566" />
        <path d="M330 322 Q300 380 268 420" />
        <path d="M918 546 Q1000 520 1060 480" />
        <path d="M268 420 Q320 500 372 560" />
      </g>
      <g fill="none" stroke="#c9b489" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 14" opacity="0.85">
        <path d="M330 322 Q430 380 520 348 Q620 314 700 380 Q760 428 800 470 Q862 528 918 546" />
        <path d="M520 348 Q560 420 566 500" />
        <path d="M800 470 Q900 500 1010 566" />
        <path d="M268 420 Q320 500 372 560" />
      </g>

      {/* ══════════ 小动物 ══════════ */}
      <g transform="translate(560 668)">
        <ellipse cx="0" cy="0" rx="26" ry="15" fill="#c58d54" />
        <circle cx="24" cy="-12" r="9" fill="#c58d54" />
        <path d="M26 -20 l-6 -12 m6 12 l8 -12" stroke="#8a5c30" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="27" cy="-13" r="1.6" fill="#3a2513" />
        <rect x="-22" y="12" width="4" height="14" rx="2" fill="#a9723f" />
        <rect x="14" y="12" width="4" height="14" rx="2" fill="#a9723f" />
      </g>
      <g>
        <g transform="translate(676 700)">
          <ellipse cx="0" cy="0" rx="20" ry="13" fill="#fdfbf2" />
          <circle cx="17" cy="-4" r="7" fill="#e6e0cf" />
        </g>
        <g transform="translate(718 716) scale(0.82)">
          <ellipse cx="0" cy="0" rx="20" ry="13" fill="#fdfbf2" />
          <circle cx="17" cy="-4" r="7" fill="#e6e0cf" />
        </g>
      </g>
      {/* 天鹅 */}
      <g transform="translate(602 560)">
        <ellipse cx="0" cy="4" rx="17" ry="9" fill="#fdfbf2" />
        <path
          d="M12 0 Q22 -6 18 -20 Q16 -28 24 -28"
          stroke="#fdfbf2"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="25" cy="-29" r="3" fill="#f2a33c" />
      </g>
      <g stroke="#6b5636" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M640 170 q10 -10 20 0 q10 -10 20 0" />
        <path d="M700 206 q8 -8 16 0 q8 -8 16 0" />
        <path d="M586 210 q8 -8 16 0 q8 -8 16 0" />
        <path d="M980 170 q9 -9 18 0 q9 -9 18 0" />
      </g>
      <g transform="translate(300 700)">
        <ellipse cx="0" cy="0" rx="14" ry="10" fill="#e9dcc6" />
        <circle cx="12" cy="-7" r="6" fill="#e9dcc6" />
        <path d="M10 -12 l-3 -12 m7 12 l3 -12" stroke="#c9b597" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* 小花 */}
      <g>
        {[
          [400, 706],
          [500, 726],
          [840, 692],
          [966, 664],
          [220, 664],
          [1012, 706],
          [642, 646],
          [120, 626],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="3.6" fill="#f4a6b8" />
            <circle r="1.5" fill="#fff6d8" />
          </g>
        ))}
      </g>

      <ellipse cx="1010" cy="520" rx="150" ry="90" fill="url(#am-beach-glow)" opacity="0.55" />

      <rect
        x="0"
        y="0"
        width={MAP_W}
        height={MAP_H}
        fill="none"
        stroke="#b08a52"
        strokeWidth="28"
        opacity="0.14"
      />
    </svg>
  )
}
