import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import { CharacterModel } from './CharacterModel'

export const attackSwingRef = { current: 0 }

/** Eye height — matches Player.tsx PLAYER_HEIGHT */
const PLAYER_HEIGHT = 1.75
/** Soldier.glb feet sit slightly below local origin; lift to plant on terrain */
const MODEL_FOOT_OFFSET = 0.02

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * t
}

/** Full 3D character — visible in third person; hidden in first person. */
export function PlayerAvatar() {
  const { positionRef, moveStateRef } = usePlayerStore()
  const { config, viewModeRef } = useCharacter()
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const facing = useRef(0)
  const bobPhase = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return

    const camera = state.camera
    const move = moveStateRef.current
    const targetFacing = move.isMoving ? move.moveYaw : camera.rotation.y
    facing.current = lerpAngle(facing.current, targetFacing, Math.min(1, 14 * delta))

    groupRef.current.position.set(
      positionRef.current.x,
      positionRef.current.y - PLAYER_HEIGHT + MODEL_FOOT_OFFSET,
      positionRef.current.z,
    )
    groupRef.current.rotation.y = facing.current + Math.PI

    const bob = move.isMoving
      ? Math.sin(bobPhase.current) * 0.035 * Math.min(1, move.speed / 4)
      : 0
    if (move.isMoving) bobPhase.current += delta * (move.isSprinting ? 14 : 10)
    else bobPhase.current = 0

    bodyRef.current.position.y = bob

    bodyRef.current.visible = viewModeRef.current === 'third'

    if (attackSwingRef.current > 0) attackSwingRef.current -= delta
  })

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <CharacterModel
          config={config}
          attackSwingRef={attackSwingRef}
          showWeapon
        />
      </group>
    </group>
  )
}
