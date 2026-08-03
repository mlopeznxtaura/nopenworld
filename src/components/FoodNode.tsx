import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { getTerrainHeight } from '../utils/noise'
import { playRustleSound } from '../audio/spatial'

const GATHER_RADIUS = 2.2

type FoodNodeProps = {
  x: number
  z: number
  id: string
}

export function FoodNode({ x, z, id }: FoodNodeProps) {
  const controls = usePlayerControls()
  const { positionRef, addFood } = usePlayerStore()
  const [gone, setGone] = useState(false)
  const cooldown = useRef(0)
  const y = getTerrainHeight(x, z)

  useFrame((_, delta) => {
    if (gone) return
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - x, positionRef.current.z - z)
    if (dist > GATHER_RADIUS) return
    cooldown.current = 0.5
    addFood(1)
    playRustleSound()
    setGone(true)
  })

  if (gone) return null

  return (
    <group position={[x, y, z]}>
      {/* Berry cluster — rounded silhouette */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.35, 7, 7]} />
        <meshStandardMaterial color="#8b2040" emissive="#6a1030" emissiveIntensity={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0.3, 0.5, 0.15]} castShadow>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color="#a03050" roughness={0.7} />
      </mesh>
      <mesh position={[-0.25, 0.45, -0.1]} castShadow>
        <sphereGeometry args={[0.28, 6, 6]} />
        <meshStandardMaterial color="#7a1840" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.3, 5]} />
        <meshStandardMaterial color="#3a5030" roughness={0.9} />
      </mesh>
    </group>
  )
}

export const FOOD_SPOTS = [
  { id: 'food-1', x: 12, z: 8 },
  { id: 'food-2', x: -10, z: -14 },
  { id: 'food-3', x: 20, z: -8 },
  { id: 'food-4', x: -18, z: 6 },
  { id: 'food-5', x: 5, z: -16 },
]

export function FoodNodes() {
  return FOOD_SPOTS.map((f) => <FoodNode key={f.id} id={f.id} x={f.x} z={f.z} />)
}
