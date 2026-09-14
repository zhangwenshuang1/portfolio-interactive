// 一次性脚本：从原始素材重建 public/hobby 下的攀岩 / 篮球照片。
// 要求：全部输出为竖屏 webp；横图先按 3:4 居中裁剪，再统一压到长边 1400px。
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = {
  climb: [
    'C:/Users/Jack/Desktop/vb code/运动/攀岩/微信图片_20260910152052_61_127.jpg',
    'C:/Users/Jack/Desktop/vb code/运动/攀岩/微信图片_20260912112039_83_127.jpg',
    'C:/Users/Jack/Desktop/vb code/运动/攀岩/攀岩.jpg',
  ],
  ball: [
    'C:/Users/Jack/Desktop/vb code/运动/篮球/篮球.jpg',
    'C:/Users/Jack/Desktop/vb code/运动/篮球/篮球2.jpg',
    'C:/Users/Jack/Desktop/vb code/运动/篮球/篮球3.jpg',
  ],
}

const OUT_DIR = path.resolve('public/hobby')

async function buildOne(src, outPath) {
  const meta = await sharp(src).metadata()
  const isPortrait = meta.height >= meta.width

  // 目标：输出固定为竖屏 3:4（宽 1050 × 高 1400）。
  // - 横图 / 方图：用 cover + attention 自动聚焦主体做居中裁剪，永不拉伸。
  // - 竖图：先用 contain 完整放进 3:4 画布，多余区域留白补边，同样不改变画面比例。
  const W = 1050
  const H = 1400

  const pipeline = sharp(src)
    .resize(W, H, {
      fit: isPortrait ? 'contain' : 'cover',
      position: isPortrait ? 'center' : 'attention',
      background: { r: 244, g: 234, b: 212, alpha: 1 }, // 与卡片底色一致，补边不显突兀
      withoutEnlargement: false,
    })
    .webp({ quality: 82, effort: 5 })

  const out = await pipeline.toFile(outPath)
  return out
}

await mkdir(OUT_DIR, { recursive: true })

const report = []
for (const [hobby, files] of Object.entries(SRC)) {
  for (let i = 0; i < files.length; i++) {
    const out = path.join(OUT_DIR, `${hobby}-${i + 1}.webp`)
    const r = await buildOne(files[i], out)
    const m = await sharp(out).metadata()
    const portrait = m.height >= m.width
    report.push({
      file: `${hobby}-${i + 1}.webp`,
      w: m.width,
      h: m.height,
      ratio: +(m.width / m.height).toFixed(3),
      orientation: portrait ? '竖屏' : '横屏',
      kb: Math.round(r.size / 1024),
    })
  }
}

console.table(report)
