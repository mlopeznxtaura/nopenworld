import { controlsRef } from '../game/inputState'

/** Read live keys from shared ref — do not use React state per component. */
export function usePlayerControls() {
  return controlsRef.current
}
