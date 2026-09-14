// 把 public/hobby 下的图片转成 PNG 输出到 _preview 目录，便于人工检查裁剪效果
import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const DIR = path.resolve('public/hobby')
const OUT = path.resolve('_preview')
await mkdir(OUT, { recursive: true })

const files = (await readdir(DIR)).filter(
  (f) => f.endsWith('.webp') && /^(climb|ball)-/.test(f),
)
for (const f of files) {
  await sharp(path.join(DIR, f))
    .resize({ width: 360 })
    .png()
    .toFile(path.join(OUT, f.replace('.webp', '.png')))
}
console.log('done:', files.join(', '))
