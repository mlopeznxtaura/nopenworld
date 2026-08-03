import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { useProgressStore } from '../game/progressState'
import { getTerrainHeight } from '../utils/noise'
import { playScrapeSound } from '../audio/spatial'

const FIND_RADIUS = 2.2

type KorokSpot = {
  id: string
  x: number
  z: number
  kind: 'rock' | 'flower' | 'stump'
}

export function KorokSeed({ id, x, z, kind }: KorokSpot) {
  const controls = usePlayerControls()
  const { positionRef } = usePlayerStore()
  const { isKorokFound, findKorok } = useProgressStore()
  const [found, setFound] = useState(isKorokFound(id))
  const cooldown = useRef(0)
  const bob = useRef(0)
  const y = getTerrainHeight(x, z)

  useFrame((_, delta) => {
    bob.current += delta * 4
    if (found) return
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - x, positionRef.current.z - z)
    if (dist > FIND_RADIUS) return
    cooldown.current = 0.5
    findKorok(id)
    setFound(true)
    playScrapeSound()
  })

  if (found) return null

  const hintY = 0.3 + Math.sin(bob.current) * 0.08

  return (
    <group position={[x, y, z]}>
      {kind === 'rock' && (
        <>
          <mesh position={[0, 0.25, 0]} castShadow>
            <dodecahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#5a5850" roughness={0.9} />
          </mesh>
          <mesh position={[0.5, 0.2, 0.3]}>
            <dodecahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial color="#6a6560" roughness={0.9} />
          </mesh>
        </>
      )}
      {kind === 'flower' && (
        <group position={[0, hintY, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial color="#ff6688" emissive="#ff3366" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0.25, 0, 0.2]}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial color="#ff88aa" emissive="#ff4488" emissiveIntensity={1.2} />
          </mesh>
        </group>
      )}
      {kind === 'stump' && (
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.4, 0.4, 6]} />
          <meshStandardMaterial color="#4a4035" roughness={0.95} />
        </mesh>
      )}
      <pointLight position={[0, 0.8, 0]} color="#aaff88" intensity={2} distance={4} decay={2} />
    </group>
  )
}

export const KOROK_SPOTS: KorokSpot[] = [
  { id: 'korok-1', x: 12, z: 8, kind: 'rock' },
  { id: 'korok-2', x: -8, z: -14, kind: 'flower' },
  { id: 'korok-3', x: 22, z: -18, kind: 'stump' },
  { id: 'korok-4', x: -18, z: 22, kind: 'rock' },
  { id: 'korok-5', x: 35, z: 12, kind: 'flower' },
  { id: 'korok-6', x: -35, z: -8, kind: 'stump' },
  { id: 'korok-7', x: 8, z: -28, kind: 'rock' },
  { id: 'korok-8', x: -42, z: 35, kind: 'flower' },
]

export function KorokSeeds() {
  return KOROK_SPOTS.map((k) => <KorokSeed key={k.id} {...k} />)
}
