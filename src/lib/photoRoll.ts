// 摄影作品源：以 public/photo-works 目录里的实际文件为准。
// 说明：Vite 的 import.meta.glob 不扫描 public/ 下的资源（会得到空数组），
// 因此这里必须用这份“当前实际存在的编号”显式清单。以后在「摄影」目录增删后
// 重新同步并重排成 001…N 时，把下面这段跟着改为一样多即可。

const MANIFEST = Array.from({ length: 14 }, (_, i) => i + 1) // 现在实际 14 张（001–014）

/** 全部作品的路径，从 001 开始按文件名顺序播放 */
export const ROLL = MANIFEST.map((n) => `/photo-works/${String(n).padStart(3, '0')}.jpg`)

/** 当前照片总数 */
export const ROLL_SIZE = ROLL.length

/** 开场环形画面只挑排头的若干张展示（外圈摆不下太多会很挤） */
export const HERO_COUNT = 12

/** 返回第 n 张（1-based）的资源路径,越界自动回绕 */
export const rollAt = (n: number) => ROLL[(((n - 1) % ROLL_SIZE) + ROLL_SIZE) % ROLL_SIZE]

