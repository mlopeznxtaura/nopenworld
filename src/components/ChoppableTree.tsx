import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { useWorldStore } from '../game/worldState'
import { getTerrainHeight } from '../utils/noise'
import { playChopSound, playTreeFallSound } from '../audio/spatial'

const CHOPS_NEEDED = 4
const INTERACT_RADIUS = 3.5

type ChoppableTreeProps = {
  id: string
  x: number
  z: number
  scale?: number
}

export function ChoppableTree({ id, x, z, scale = 0.85 }: ChoppableTreeProps) {
  const controls = usePlayerControls()
  const { positionRef, addWood } = usePlayerStore()
  const { emitChop, markTreeChopped, isTreeChopped } = useWorldStore()
  const [chops, setChops] = useState(0)
  const [falling, setFalling] = useState(false)
  const [gone, setGone] = useState(isTreeChopped(id))
  const trunkRef = useRef<THREE.Group>(null)
  const flashRef = useRef(0)
  const fallAngle = useRef(0)
  const interactCooldown = useRef(0)
  const y = getTerrainHeight(x, z)

  useFrame((_, delta) => {
    if (gone) return

    if (interactCooldown.current > 0) {
      interactCooldown.current -= delta
    }

    if (flashRef.current > 0) {
      flashRef.current -= delta * 4
    }

    if (falling && trunkRef.current) {
      fallAngle.current += delta * 1.2
      trunkRef.current.rotation.z = -fallAngle.current
      if (fallAngle.current > 1.4) {
        setGone(true)
        markTreeChopped(id)
      }
      return
    }

    if (!controls.interact || interactCooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - x, positionRef.current.z - z)
    if (dist > INTERACT_RADIUS) return

    interactCooldown.current = 0.35

    flashRef.current = 1
    playChopSound(dist)
    const next = chops + 1
    setChops(next)

    if (next >= CHOPS_NEEDED) {
      setFalling(true)
      addWood(1)
      playTreeFallSound()
      emitChop(x, y + 8, z, true)
    } else {
      emitChop(x, y + 4, z, false)
    }
  })

  if (gone) return null

  const trunkH = 14 * scale
  const r = 0.32 * scale

  return (
    <group position={[x, y, z]} scale={scale}>
      <group ref={trunkRef}>
        {/* Thin branching silhouette — distinct from static forest */}
        <mesh position={[0, trunkH * 0.5, 0]} castShadow>
          <cylinderGeometry args={[r * 0.5, r * 0.7, trunkH, 8]} />
          <meshStandardMaterial
            color={flashRef.current > 0 ? '#e8e8f0' : '#2a2218'}
            roughness={0.95}
          />
        </mesh>
        <mesh position={[r * 1.2, trunkH * 0.35, 0.2]} rotation={[0, 0.5, -0.6]} castShadow>
          <cylinderGeometry args={[0.04 * scale, 0.08 * scale, 2 * scale, 5]} />
          <meshStandardMaterial color="#3a3028" roughness={0.95} />
        </mesh>
        <mesh position={[-r * 0.9, trunkH * 0.5, -0.3]} rotation={[0.2, -0.4, 0.5]} castShadow>
          <cylinderGeometry args={[0.03 * scale, 0.06 * scale, 1.6 * scale, 5]} />
          <meshStandardMaterial color="#3a3028" roughness={0.95} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, trunkH - 3 + i * 2, 0]} castShadow>
            <coneGeometry args={[(2.2 - i * 0.4) * scale, 2.5 * scale, 7]} />
            <meshStandardMaterial color="#1a4a32" roughness={0.88} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export const CHOPPABLE_TREE_SPOTS: Array<{ id: string; x: number; z: number }> = [
  { id: 'tree-1', x: -8, z: 12 },
  { id: 'tree-2', x: 10, z: -6 },
  { id: 'tree-3', x: -12, z: -8 },
  { id: 'tree-4', x: 6, z: 14 },
  { id: 'tree-5', x: -5, z: -10 },
  { id: 'tree-6', x: 14, z: 8 },
  { id: 'tree-7', x: -15, z: 5 },
]

export function ChoppableTrees() {
  return (
    <>
      {CHOPPABLE_TREE_SPOTS.map((t) => (
        <ChoppableTree key={t.id} id={t.id} x={t.x} z={t.z} />
      ))}
    </>
  )
}
