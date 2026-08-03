let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration)
  osc.stop(ac.currentTime + duration)
}

export function playChopSound(distance = 0) {
  const ac = getCtx()
  const g = ac.createGain()
  g.gain.value = Math.max(0.05, 0.25 - distance * 0.002)
  const osc = ac.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(180, ac.currentTime)
  osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.08)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + 0.12)
}

export function playTreeFallSound() {
  playTone(60, 0.4, 'sawtooth', 0.15)
  setTimeout(() => playTone(40, 0.5, 'sawtooth', 0.12), 80)
}

export function playGrowlSound() {
  playTone(90, 0.3, 'sawtooth', 0.1)
  setTimeout(() => playTone(70, 0.4, 'sawtooth', 0.08), 120)
}

export function playHitSound() {
  playTone(220, 0.08, 'square', 0.12)
}

export function playClangSound() {
  playTone(400, 0.06, 'triangle', 0.1)
}

export function playRustleSound() {
  playTone(300, 0.05, 'triangle', 0.04)
}

export function playScrapeSound() {
  playTone(120, 0.1, 'sawtooth', 0.06)
}

let sprintOsc: OscillatorNode | null = null
let sprintGain: GainNode | null = null

export function startSprintLoop() {
  const ac = getCtx()
  if (sprintOsc) return
  sprintOsc = ac.createOscillator()
  sprintGain = ac.createGain()
  sprintOsc.type = 'sawtooth'
  sprintOsc.frequency.value = 55
  sprintGain.gain.value = 0.03
  sprintOsc.connect(sprintGain)
  sprintGain.connect(ac.destination)
  sprintOsc.start()
}

export function stopSprintLoop() {
  if (sprintOsc) {
    sprintOsc.stop()
    sprintOsc.disconnect()
    sprintOsc = null
    sprintGain = null
  }
}
