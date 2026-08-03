export type ControlsSnapshot = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
  attack: boolean
  interact: boolean
}

export const controlsRef: { current: ControlsSnapshot } = {
  current: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    attack: false,
    interact: false,
  },
}

let listenersInstalled = false

export function installKeyboardListeners(): () => void {
  if (listenersInstalled) return () => {}
  listenersInstalled = true

  const set = (patch: Partial<ControlsSnapshot>) => {
    Object.assign(controlsRef.current, patch)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': set({ forward: true }); break
      case 'KeyS': set({ backward: true }); break
      case 'KeyA': set({ left: true }); break
      case 'KeyD': set({ right: true }); break
      case 'Space': set({ jump: true }); break
      case 'ShiftLeft':
      case 'ShiftRight': set({ sprint: true }); break
      case 'KeyE': set({ attack: true }); break
      case 'KeyF': set({ interact: true }); break
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': set({ forward: false }); break
      case 'KeyS': set({ backward: false }); break
      case 'KeyA': set({ left: false }); break
      case 'KeyD': set({ right: false }); break
      case 'Space': set({ jump: false }); break
      case 'ShiftLeft':
      case 'ShiftRight': set({ sprint: false }); break
      case 'KeyE': set({ attack: false }); break
      case 'KeyF': set({ interact: false }); break
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  return () => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
    listenersInstalled = false
    set({
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      attack: false,
      interact: false,
    })
  }
}
