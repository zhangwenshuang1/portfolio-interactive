/**
 * AnimeMap —— 动漫风格的手绘地图背景（纯 SVG，无外部依赖）
 *
 * 一张摊开的手绘地图：上方是雪山与云，右下是海与浪，左边森林与松树，
 * 草原上有小鹿、飞鸟与羊群，蜿蜒的小路把各个区域串起来。
 * 只负责「画风景」，兴趣图标由 HobbyStage 叠加在上面。
 */
export default function AnimeMap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 760"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        {/* 天空 → 草原的纵向渐变（羊皮纸暖色调） */}
        <linearGradient id="am-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7e6c4" />
          <stop offset="34%" stopColor="#f2dcb2" />
          <stop offset="62%" stopColor="#e9d5a6" />
          <stop offset="100%" stopColor="#dfc791" />
        </linearGradient>
        {/* 海面 */}
        <linearGradient id="am-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5bb6d6" />
          <stop offset="45%" stopColor="#3f9cc4" />
          <stop offset="100%" stopColor="#2f7fa8" />
        </linearGradient>
        {/* 雪山 */}
        <linearGradient id="am-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbe7f0" />
        </linearGradient>
        {/* 山体（暖灰褐） */}
        <linearGradient id="am-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b99a6e" />
          <stop offset="100%" stopColor="#8f7450" />
        </linearGradient>
        <linearGradient id="am-hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8ac7f" />
          <stop offset="100%" stopColor="#a08757" />
        </linearGradient>
        {/* 草地 */}
        <linearGradient id="am-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ec46a" />
          <stop offset="100%" stopColor="#6f9b45" />
        </linearGradient>
        {/* 沙滩 */}
        <linearGradient id="am-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0dfb0" />
          <stop offset="100%" stopColor="#dcc389" />
        </linearGradient>
        {/* 森林暗色 */}
        <linearGradient id="am-forest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5f8a44" />
          <stop offset="100%" stopColor="#3f6630" />
        </linearGradient>
      </defs>

      {/* ── 底色：像一张旧地图纸 ── */}
      <rect width="1200" height="760" fill="url(#am-sky)" />

      {/* ── 海（右下角） ── */}
      <path
        d="M1200 420 Q1080 400 985 452 Q900 500 962 560 Q1020 616 1200 600 Z"
        fill="url(#am-sea)"
      />
      {/* 沙滩过渡 */}
      <path
        d="M1200 415 Q1080 396 980 448 Q895 496 958 556 Q1016 612 1200 596 L1200 580 Q1030 596 972 548 Q915 500 992 460 Q1080 414 1200 432 Z"
        fill="url(#am-sand)"
        opacity="0.9"
      />
      {/* 海浪线 */}
      <g stroke="#eaf6fb" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65">
        <path d="M1040 470 q14 -12 28 0 q14 12 28 0" />
        <path d="M1095 512 q14 -12 28 0 q14 12 28 0" />
        <path d="M1010 545 q14 -12 28 0 q14 12 28 0" />
        <path d="M1120 570 q14 -12 28 0 q14 12 28 0" />
      </g>
      {/* 小帆船 */}
      <g transform="translate(1085 505)">
        <path d="M0 0 L0 26 L-40 0 Z" fill="#fdf6e4" stroke="#b08a52" strokeWidth="2" />
        <path d="M0 4 L0 26 L34 0 Z" fill="#f6d98f" stroke="#b08a52" strokeWidth="2" />
      </g>

      {/* ── 远山（左上，暖色丘峦） ── */}
      <path d="M0 250 L150 118 L300 250 Z" fill="url(#am-hill2)" />
      <path d="M180 262 L360 96 L560 262 Z" fill="url(#am-hill)" />
      <path d="M470 250 L620 130 L790 250 Z" fill="url(#am-hill2)" />
      {/* 雪顶 */}
      <path d="M360 96 L300 168 L330 158 L352 176 L392 156 L420 168 Z" fill="url(#am-snow)" />
      <path d="M620 130 L576 184 L600 176 L620 190 L648 174 L668 184 Z" fill="url(#am-snow)" />

      {/* 云朵 */}
      <g fill="#fffdf6" opacity="0.92">
        <ellipse cx="470" cy="70" rx="52" ry="24" />
        <ellipse cx="512" cy="62" rx="36" ry="20" />
        <ellipse cx="430" cy="66" rx="30" ry="17" />
        <ellipse cx="880" cy="120" rx="44" ry="21" />
        <ellipse cx="916" cy="112" rx="30" ry="17" />
      </g>

      {/* ── 草地（中下部） ── */}
      <path
        d="M0 300 Q160 270 330 300 Q520 334 700 306 Q900 274 1200 312 L1200 760 L0 760 Z"
        fill="url(#am-grass)"
      />

      {/* ── 森林（左侧） ── */}
      <path
        d="M0 380 Q120 350 250 386 Q360 416 300 470 Q210 512 90 486 Q-10 462 0 380 Z"
        fill="url(#am-forest)"
      />
      {/* 松树 */}
      <g>
        {[
          [70, 372, 1],
          [140, 356, 1.15],
          [212, 376, 0.95],
          [286, 400, 1.05],
          [180, 412, 0.85],
          [110, 430, 1],
          [250, 442, 0.9],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-4" y="10" width="8" height="18" rx="2" fill="#7a5a34" />
            <path d="M0 -34 L26 12 L-26 12 Z" fill="#3f6b34" />
            <path d="M0 -18 L22 12 L-22 12 Z" fill="#4d7d3d" />
            <path d="M0 -4 L18 12 L-18 12 Z" fill="#5b8f47" />
          </g>
        ))}
      </g>

      {/* ── 蜿蜒小路 ── */}
      <path
        d="M352 358 Q430 420 520 380 Q600 346 690 396 Q760 438 860 404"
        fill="none"
        stroke="#e6d3a4"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray="2 16"
        opacity="0.85"
      />

      {/* ── 小动物 ── */}
      {/* 小鹿 */}
      <g transform="translate(430 520)">
        <ellipse cx="0" cy="0" rx="26" ry="15" fill="#c58d54" />
        <circle cx="24" cy="-12" r="9" fill="#c58d54" />
        <path d="M26 -20 l-6 -12 m6 12 l8 -12" stroke="#8a5c30" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="27" cy="-13" r="1.6" fill="#3a2513" />
        <rect x="-22" y="12" width="4" height="14" rx="2" fill="#a9723f" />
        <rect x="14" y="12" width="4" height="14" rx="2" fill="#a9723f" />
      </g>
      {/* 羊群 */}
      <g>
        <g transform="translate(700 560)">
          <ellipse cx="0" cy="0" rx="20" ry="13" fill="#fdfbf2" />
          <circle cx="17" cy="-4" r="7" fill="#e6e0cf" />
        </g>
        <g transform="translate(742 578) scale(0.82)">
          <ellipse cx="0" cy="0" rx="20" ry="13" fill="#fdfbf2" />
          <circle cx="17" cy="-4" r="7" fill="#e6e0cf" />
        </g>
      </g>
      {/* 飞鸟 */}
      <g stroke="#6b5636" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M600 160 q10 -10 20 0 q10 -10 20 0" />
        <path d="M660 196 q8 -8 16 0 q8 -8 16 0" />
        <path d="M548 200 q8 -8 16 0 q8 -8 16 0" />
      </g>
      {/* 小兔子 */}
      <g transform="translate(560 640)">
        <ellipse cx="0" cy="0" rx="14" ry="10" fill="#e9dcc6" />
        <circle cx="12" cy="-7" r="6" fill="#e9dcc6" />
        <path d="M10 -12 l-3 -12 m7 12 l3 -12" stroke="#c9b597" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* 小花点缀 */}
      <g>
        {[
          [380, 600],
          [470, 660],
          [620, 600],
          [860, 620],
          [960, 660],
          [300, 620],
          [790, 680],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="3.6" fill="#f4a6b8" />
            <circle r="1.5" fill="#fff6d8" />
          </g>
        ))}
      </g>

      {/* ── 地图纸边缘做旧 ── */}
      <rect
        x="0"
        y="0"
        width="1200"
        height="760"
        fill="none"
        stroke="#b08a52"
        strokeWidth="26"
        opacity="0.16"
      />
    </svg>
  )
}
