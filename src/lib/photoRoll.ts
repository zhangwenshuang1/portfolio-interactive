/// <reference types="vite/client" />

// 摄影作品源：以 public/photo-works 目录里的实际文件为准。
// 你在「拍照」目录增删照片后同步到这里，这里会自动跟着数量变化，
// 无需再改任何组件里的数字 001、25 之类。

// Vite 会在编译期扫描出目录中现有的 jpg，键形如 "/photo-works/001.jpg"
const LUT = import.meta.glob('/photo-works/*.jpg')
const keys = Object.keys(LUT).sort()

/** 全部作品的路径，从 001 开始按文件名顺序播放 */
export const ROLL = keys

/** 当前照片总数 */
export const ROLL_SIZE = ROLL.length

/** 开场环形画面只挑排头的若干张展示（外圈摆不下太多会很挤） */
export const HERO_COUNT = 12

/** 返回第 n 张（1-based）的资源路径,越界自动回绕 */
export const rollAt = (n: number) => ROLL[(((n - 1) % ROLL_SIZE) + ROLL_SIZE) % ROLL_SIZE]
