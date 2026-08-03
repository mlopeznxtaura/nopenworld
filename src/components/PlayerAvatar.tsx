import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import { CharacterModel } from './CharacterModel'

export const attackSwingRef = { current: 0 }

const PLAYER_HEIGHT = 2

/** Full 3D character at world position — visible in first & third person. */
export function PlayerAvatar() {
  const { positionRef } = usePlayerStore()
  const { config } = useCharacter()
  const groupRef = useRef<THREE.Group>(null)
  const yawRef = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const camera = state.camera
    yawRef.current = camera.rotation.y

    groupRef.current.position.set(
      positionRef.current.x,
      positionRef.current.y - PLAYER_HEIGHT,
      positionRef.current.z,
    )
    groupRef.current.rotation.y = yawRef.current

    if (attackSwingRef.current > 0) attackSwingRef.current -= delta
  })

  return (
    <group ref={groupRef}>
      <group position={[0, -0.92, 0]}>
        <CharacterModel
          config={config}
          attackSwingRef={attackSwingRef}
          showWeapon
        />
      </group>
    </group>
  )
}
