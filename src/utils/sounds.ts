// 轻量 WebAudio 音效工具：不依赖外部音频文件，纯合成。
// 用于拼图归位的"咔哒"吸附声，以及完成时的"叮"提示音。

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

// 播放一次"咔哒"吸附音（短促、清脆、音量会随剩余块数轻微变化）
export function playSnap(index = 0) {
  const ac = getCtx()
  if (!ac) return
  const t = ac.currentTime

  // 主音：a 稍带音调的短促撞击
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(660 + index * 24, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.35, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.16)

  // 一层高频"咔哒"泛音，更清脆
  const click = ac.createOscillator()
  const clickGain = ac.createGain()
  click.type = 'square'
  click.frequency.setValueAtTime(1800, t)
  clickGain.gain.setValueAtTime(0.10, t)
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
  click.connect(clickGain).connect(ac.destination)
  click.start(t)
  click.stop(t + 0.04)
}

// 完成时播放一段上行"叮"音
export function playMergeChime() {
  const ac = getCtx()
  if (!ac) return
  const t = ac.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + i * 0.11
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.28, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}
