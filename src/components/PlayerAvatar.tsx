import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import { CharacterModel } from './CharacterModel'

export const attackSwingRef = { current: 0 }

const PLAYER_HEIGHT = 1.75

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return a + diff * t
}

/** Full 3D character — faces movement direction, animated walk/run. */
export function PlayerAvatar() {
  const { positionRef, moveStateRef } = usePlayerStore()
  const { config } = useCharacter()
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
      positionRef.current.y - PLAYER_HEIGHT,
      positionRef.current.z,
    )
    groupRef.current.rotation.y = facing.current

    if (move.isMoving) {
      bobPhase.current += delta * (move.isSprinting ? 14 : 10)
      const bob = Math.sin(bobPhase.current) * 0.04 * Math.min(1, move.speed / 4)
      bodyRef.current.position.y = -0.92 + bob
    } else {
      bodyRef.current.position.y = -0.92
      bobPhase.current = 0
    }

    if (attackSwingRef.current > 0) attackSwingRef.current -= delta
  })

  return (
    <group ref={groupRef}>
      <group ref={bodyRef} position={[0, -0.92, 0]}>
        <CharacterModel
          config={config}
          attackSwingRef={attackSwingRef}
          showWeapon
        />
      </group>
    </group>
  )
}
