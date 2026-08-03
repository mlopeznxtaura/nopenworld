import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { getTerrainHeight } from '../utils/noise'
import { playScrapeSound } from '../audio/spatial'

const GATHER_RADIUS = 2.5

type StoneNodeProps = {
  x: number
  z: number
  id: string
}

export function StoneNode({ x, z, id }: StoneNodeProps) {
  const controls = usePlayerControls()
  const { positionRef, addStone } = usePlayerStore()
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
    addStone(1)
    playScrapeSound()
    setGone(true)
  })

  if (gone) return null

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#5a5850" roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[0.5, 0.25, 0.3]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.35]} />
        <meshStandardMaterial color="#6a6560" roughness={0.9} />
      </mesh>
      <mesh position={[-0.4, 0.2, -0.2]} castShadow>
        <boxGeometry args={[0.35, 0.25, 0.3]} />
        <meshStandardMaterial color="#555048" roughness={0.9} />
      </mesh>
    </group>
  )
}

export const STONE_SPOTS = [
  { id: 'stone-1', x: 18, z: -12 },
  { id: 'stone-2', x: -20, z: 15 },
  { id: 'stone-3', x: 25, z: 20 },
  { id: 'stone-4', x: -15, z: -18 },
]

export function StoneNodes() {
  return STONE_SPOTS.map((s) => <StoneNode key={s.id} id={s.id} x={s.x} z={s.z} />)
}
