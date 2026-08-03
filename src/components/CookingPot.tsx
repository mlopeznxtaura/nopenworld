import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { getTerrainHeight } from '../utils/noise'
import { CAMPFIRE_RADIUS } from './Campfire'
import { playScrapeSound } from '../audio/spatial'

export function CookingPot() {
  const controls = usePlayerControls()
  const { positionRef, consumeFood, snapRef } = usePlayerStore()
  const cooldown = useRef(0)
  const y = getTerrainHeight(0, 0)

  useFrame((_, delta) => {
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x, positionRef.current.z)
    if (dist > CAMPFIRE_RADIUS) return
    if (!consumeFood(1)) return
    cooldown.current = 1.2
    snapRef.current.hunger = Math.max(0, snapRef.current.hunger - 50)
    snapRef.current.health = Math.min(
      snapRef.current.maxHealth,
      snapRef.current.health + 1,
    )
    snapRef.current.cold = Math.max(0, snapRef.current.cold - 30)
    playScrapeSound()
  })

  return (
    <group position={[1.8, y, 1.2]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.3, 0.5, 8]} />
        <meshStandardMaterial color="#3a3530" roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial
          color="#8a6040"
          emissive="#ff6622"
          emissiveIntensity={0.8}
          roughness={0.7}
        />
      </mesh>
      <pointLight position={[0, 0.8, 0]} color="#ff8833" intensity={4} distance={6} decay={2} />
    </group>
  )
}
