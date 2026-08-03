/** Full cycle: 20 minutes. First 12 minutes are daylight. */
export const DAY_CYCLE_SECONDS = 20 * 60
export const DAYLIGHT_SECONDS = 12 * 60
export const NIGHT_SECONDS = DAY_CYCLE_SECONDS - DAYLIGHT_SECONDS
export const SUN_DISTANCE = 220

export type TimeSnapshot = {
  cycleElapsed: number
  cycleProgress: number
  isDaylight: boolean
  nightFactor: number
  orbitProgress: number
  goldenHour: number
}

export function orbitProgressFromElapsed(elapsed: number): number {
  const t = elapsed % DAY_CYCLE_SECONDS

  if (t < DAYLIGHT_SECONDS) {
    const u = t / DAYLIGHT_SECONDS
    return 0.34 + u * 0.28
  }

  const u = (t - DAYLIGHT_SECONDS) / NIGHT_SECONDS

  if (u < 0.2) {
    return 0.62 + (u / 0.2) * (0.76 - 0.62)
  }
  if (u < 0.85) {
    const n = (u - 0.2) / 0.65
    const pos = 0.8 + n * 0.44
    return pos >= 1 ? pos - 1 : pos
  }

  const n = (u - 0.85) / 0.15
  return 0.24 + n * 0.1
}

export function computeTimeSnapshot(elapsed: number): TimeSnapshot {
  const cycleElapsed = elapsed % DAY_CYCLE_SECONDS
  const isDaylight = cycleElapsed < DAYLIGHT_SECONDS
  const nightFactor = isDaylight
    ? 0
    : (cycleElapsed - DAYLIGHT_SECONDS) / NIGHT_SECONDS

  const orbitP = orbitProgressFromElapsed(elapsed)
  const angle = orbitP * Math.PI * 2 - Math.PI / 2
  const elevation = Math.sin(angle)
  const goldenHour = Math.max(
    0,
    Math.min(
      1,
      (Math.sin(angle + 0.3) * 0.5 + 0.5) * (isDaylight ? 0.4 : 0.8),
    ),
  )

  return {
    cycleElapsed,
    cycleProgress: cycleElapsed / DAY_CYCLE_SECONDS,
    isDaylight,
    nightFactor,
    orbitProgress: orbitP,
    goldenHour,
  }
}

/** Updated each frame by TimeProvider for DOM UI outside Canvas. */
export const liveTimeSnapshot: { current: TimeSnapshot } = {
  current: computeTimeSnapshot(0),
}
