import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'
import * as THREE from 'three'

export type PlayerSnapshot = {
  position: THREE.Vector3
  health: number
  maxHealth: number
  stamina: number
  maxStamina: number
  wood: number
  stone: number
  food: number
  hunger: number
  cold: number
  isSprinting: boolean
  isMoving: boolean
  isGliding: boolean
  hitFlash: number
  screenShake: number
  weaponDurability: number
  maxWeaponDurability: number
}

export type MoveState = {
  isMoving: boolean
  isSprinting: boolean
  moveYaw: number
  speed: number
}

type PlayerStore = {
  snapRef: { current: PlayerSnapshot }
  snapshot: PlayerSnapshot
  positionRef: THREE.Vector3
  moveStateRef: { current: MoveState }
  setPosition: (x: number, y: number, z: number) => void
  addWood: (n: number) => void
  addStone: (n: number) => void
  addFood: (n: number) => void
  damage: (n: number) => void
  useStamina: (n: number) => boolean
  regenStamina: (n: number) => void
  setSprinting: (v: boolean) => void
  setMoving: (v: boolean) => void
  triggerHitFlash: () => void
  triggerScreenShake: (amount: number) => void
  tickSurvival: (hungerRate: number, coldRate: number) => void
  useWeaponDurability: (n: number) => boolean
  repairWeapon: () => void
  addHeartContainer: () => void
  consumeFood: (n: number) => boolean
  setGliding: (v: boolean) => void
}

const PlayerContext = createContext<PlayerStore | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const positionRef = useRef(new THREE.Vector3(0, 10, 0))
  const moveStateRef = useRef<MoveState>({
    isMoving: false,
    isSprinting: false,
    moveYaw: 0,
    speed: 0,
  })
  const snapRef = useRef<PlayerSnapshot>({
    position: positionRef.current,
    health: 5,
    maxHealth: 5,
    stamina: 100,
    maxStamina: 100,
    wood: 0,
    stone: 0,
    food: 0,
    hunger: 0,
    cold: 0,
    isSprinting: false,
    isMoving: false,
    isGliding: false,
    hitFlash: 0,
    screenShake: 0,
    weaponDurability: 100,
    maxWeaponDurability: 100,
  })

  const setPosition = useCallback((x: number, y: number, z: number) => {
    positionRef.current.set(x, y, z)
  }, [])

  const addWood = useCallback((n: number) => {
    snapRef.current.wood += n
  }, [])

  const addStone = useCallback((n: number) => {
    snapRef.current.stone += n
  }, [])

  const addFood = useCallback((n: number) => {
    snapRef.current.food += n
    snapRef.current.hunger = Math.max(0, snapRef.current.hunger - n * 15)
  }, [])

  const damage = useCallback((n: number) => {
    snapRef.current.health = Math.max(0, snapRef.current.health - n)
    snapRef.current.hitFlash = 1
    snapRef.current.screenShake = 0.15
  }, [])

  const useStamina = useCallback((n: number) => {
    if (snapRef.current.stamina < n) return false
    snapRef.current.stamina -= n
    return true
  }, [])

  const regenStamina = useCallback((n: number) => {
    snapRef.current.stamina = Math.min(
      snapRef.current.maxStamina,
      snapRef.current.stamina + n,
    )
  }, [])

  const setSprinting = useCallback((v: boolean) => {
    snapRef.current.isSprinting = v
  }, [])

  const setMoving = useCallback((v: boolean) => {
    snapRef.current.isMoving = v
  }, [])

  const triggerHitFlash = useCallback(() => {
    snapRef.current.hitFlash = 1
  }, [])

  const triggerScreenShake = useCallback((amount: number) => {
    snapRef.current.screenShake = amount
  }, [])

  const tickSurvival = useCallback((hungerRate: number, coldRate: number) => {
    snapRef.current.hunger = Math.min(100, snapRef.current.hunger + hungerRate)
    snapRef.current.cold = Math.min(100, snapRef.current.cold + coldRate)
    if (snapRef.current.hunger >= 100) {
      snapRef.current.health = Math.max(0, snapRef.current.health - 0.02)
    }
    if (snapRef.current.cold >= 100) {
      snapRef.current.health = Math.max(0, snapRef.current.health - 0.03)
    }
    if (snapRef.current.hitFlash > 0) snapRef.current.hitFlash -= 0.05
    if (snapRef.current.screenShake > 0) snapRef.current.screenShake *= 0.85
  }, [])

  const useWeaponDurability = useCallback((n: number) => {
    if (snapRef.current.weaponDurability < n) return false
    snapRef.current.weaponDurability -= n
    return true
  }, [])

  const repairWeapon = useCallback(() => {
    snapRef.current.weaponDurability = snapRef.current.maxWeaponDurability
  }, [])

  const addHeartContainer = useCallback(() => {
    snapRef.current.maxHealth += 1
    snapRef.current.health = snapRef.current.maxHealth
  }, [])

  const consumeFood = useCallback((n: number) => {
    if (snapRef.current.food < n) return false
    snapRef.current.food -= n
    return true
  }, [])

  const setGliding = useCallback((v: boolean) => {
    snapRef.current.isGliding = v
  }, [])

  const store: PlayerStore = {
    snapRef,
    snapshot: snapRef.current,
    positionRef,
    moveStateRef,
    setPosition,
    addWood,
    addStone,
    addFood,
    damage,
    useStamina,
    regenStamina,
    setSprinting,
    setMoving,
    triggerHitFlash,
    triggerScreenShake,
    tickSurvival,
    useWeaponDurability,
    repairWeapon,
    addHeartContainer,
    consumeFood,
    setGliding,
  }

  return <PlayerContext.Provider value={store}>{children}</PlayerContext.Provider>
}

export function usePlayerStore() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayerStore outside PlayerProvider')
  return ctx
}
