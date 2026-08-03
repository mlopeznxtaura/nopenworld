import { useEffect, useState } from 'react'

export const usePlayerControls = () => {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    attack: false,
    interact: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setMovement((m) => ({ ...m, forward: true })); break
        case 'KeyS': setMovement((m) => ({ ...m, backward: true })); break
        case 'KeyA': setMovement((m) => ({ ...m, left: true })); break
        case 'KeyD': setMovement((m) => ({ ...m, right: true })); break
        case 'Space': setMovement((m) => ({ ...m, jump: true })); break
        case 'ShiftLeft':
        case 'ShiftRight': setMovement((m) => ({ ...m, sprint: true })); break
        case 'KeyE': setMovement((m) => ({ ...m, attack: true })); break
        case 'KeyF': setMovement((m) => ({ ...m, interact: true })); break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setMovement((m) => ({ ...m, forward: false })); break
        case 'KeyS': setMovement((m) => ({ ...m, backward: false })); break
        case 'KeyA': setMovement((m) => ({ ...m, left: false })); break
        case 'KeyD': setMovement((m) => ({ ...m, right: false })); break
        case 'Space': setMovement((m) => ({ ...m, jump: false })); break
        case 'ShiftLeft':
        case 'ShiftRight': setMovement((m) => ({ ...m, sprint: false })); break
        case 'KeyE': setMovement((m) => ({ ...m, attack: false })); break
        case 'KeyF': setMovement((m) => ({ ...m, interact: false })); break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return movement
}
