// 一次性脚本：从原始素材重建 public/hobby 下的攀岩 / 篮球照片。
// 要求：全部输出为竖屏 webp；横图先按 3:4 居中裁剪，再统一压到长边 1400px。
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
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
  // 关键：.rotate() 不带参数会按照 EXIF orientation 自动摆正。
  // 手机竖拍的照片常以横图存储 + EXIF 旋转标记，必须先摆正再判断方向。
  // 这里先把摆正后的图编码成 buffer，用它的真实尺寸来判断，绝不裁剪。
  const upright = await sharp(src)
    .rotate()
    .resize({ height: 1400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toBuffer()

  const info = await sharp(upright).metadata()
  if (info.height < info.width) {
    throw new Error(
      `${path.basename(src)} 摆正后仍是横图 (${info.width}x${info.height})，请检查原图`,
    )
  }

  await writeFile(outPath, upright)
  return { size: upright.length }
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
      kb: Math.round((r.size ?? 0) / 1024),
    })
  }
}

console.table(report)
