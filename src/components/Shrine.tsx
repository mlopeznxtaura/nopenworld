import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { useProgressStore } from '../game/progressState'
import { getTerrainHeight } from '../utils/noise'
import { registerMeleeTarget } from './Player'
import { playScrapeSound } from '../audio/spatial'

export type ShrinePuzzleType = 'torch' | 'target' | 'plates'

export type ShrineSpot = {
  id: string
  x: number
  z: number
  puzzle: ShrinePuzzleType
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const TORCH_RADIUS = 3.8
const PLATE_RADIUS = 2.4
const PLATE_STAND_TIME = 0.85

function ShrineTorch({
  shrineId,
  index,
  offset,
  shrineX,
  shrineZ,
}: {
  shrineId: string
  index: number
  offset: [number, number]
  shrineX: number
  shrineZ: number
}) {
  const controls = usePlayerControls()
  const { positionRef } = usePlayerStore()
  const { isShrineComplete, getShrinePuzzle, lightShrineTorch } = useProgressStore()
  const [lit, setLit] = useState(
    () => getShrinePuzzle(shrineId).torches?.[index] ?? false,
  )
  const cooldown = useRef(0)
  const pulse = useRef(0)
  const tx = shrineX + offset[0]
  const tz = shrineZ + offset[1]

  useFrame((_, delta) => {
    pulse.current += delta * 3
    if (lit || isShrineComplete(shrineId)) return
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - tx, positionRef.current.z - tz)
    if (dist > TORCH_RADIUS) return
    cooldown.current = 0.4
    lightShrineTorch(shrineId, index)
    setLit(true)
    playScrapeSound()
  })

  const done = lit || isShrineComplete(shrineId)
  const hintPulse = 0.5 + Math.sin(pulse.current) * 0.5

  return (
    <group position={[offset[0], 0, offset[1]]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 6]} />
        <meshStandardMaterial color="#3a3530" roughness={0.9} />
      </mesh>
      {done ? (
        <>
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#ffaa44" emissive="#ff6600" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[0, 1.35, 0]} color="#ff8833" intensity={8} distance={10} decay={2} />
        </>
      ) : (
        <>
          <mesh position={[0, 1.25, 0]}>
            <sphereGeometry args={[0.14, 6, 6]} />
            <meshStandardMaterial
              color="#4a4035"
              emissive="#ffaa44"
              emissiveIntensity={0.6 + hintPulse * 0.8}
            />
          </mesh>
          <pointLight
            position={[0, 1.4, 0]}
            color="#ffcc66"
            intensity={2 + hintPulse * 3}
            distance={8}
            decay={2}
          />
        </>
      )}
    </group>
  )
}

function ShrineTarget({
  shrineId,
  index,
  offset,
  shrineX,
  shrineZ,
  shrineY,
}: {
  shrineId: string
  index: number
  offset: [number, number]
  shrineX: number
  shrineZ: number
  shrineY: number
}) {
  const { isShrineComplete, getShrinePuzzle, hitShrineTarget } = useProgressStore()
  const [hit, setHit] = useState(
    () => getShrinePuzzle(shrineId).targets?.[index] ?? false,
  )
  const posVec = useRef(new THREE.Vector3())
  const hitRef = useRef(hit)
  const pulse = useRef(index * 0.5)

  useEffect(() => {
    hitRef.current = hit
  }, [hit])

  useEffect(() => {
    return registerMeleeTarget({
      position: posVec.current,
      radius: 2.2,
      onHit: () => {
        if (hitRef.current || isShrineComplete(shrineId)) return
        hitShrineTarget(shrineId, index)
        setHit(true)
      },
    })
  }, [shrineId, index, hitShrineTarget, isShrineComplete])

  useFrame((_, delta) => {
    pulse.current += delta * 4
    posVec.current.set(shrineX + offset[0], shrineY + 2.5, shrineZ + offset[1])
  })

  const done = hit || isShrineComplete(shrineId)
  const pulseEmissive = 1.5 + Math.sin(pulse.current) * 1.2

  return (
    <group position={[offset[0], 0, offset[1]]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.4, 6]} />
        <meshStandardMaterial color="#4a5568" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.5, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.9, 0.55, 0.05]} />
        <meshStandardMaterial
          color={done ? '#334155' : '#ef4444'}
          emissive={done ? '#000' : '#ff2200'}
          emissiveIntensity={done ? 0 : pulseEmissive}
        />
      </mesh>
      {!done && (
        <pointLight position={[0, 2.5, 0]} color="#ff4422" intensity={4 + pulseEmissive} distance={6} decay={2} />
      )}
    </group>
  )
}

function ShrinePlate({
  shrineId,
  index,
  offset,
  shrineX,
  shrineZ,
}: {
  shrineId: string
  index: number
  offset: [number, number]
  shrineX: number
  shrineZ: number
}) {
  const { positionRef } = usePlayerStore()
  const { isShrineComplete, getShrinePuzzle, activateShrinePlate } = useProgressStore()
  const [active, setActive] = useState(
    () => getShrinePuzzle(shrineId).plates?.[index] ?? false,
  )
  const standTime = useRef(0)

  useFrame((_, delta) => {
    if (active || isShrineComplete(shrineId)) return
    const px = shrineX + offset[0]
    const pz = shrineZ + offset[1]
    const dist = Math.hypot(positionRef.current.x - px, positionRef.current.z - pz)
    if (dist < PLATE_RADIUS) {
      standTime.current += delta
      if (standTime.current >= PLATE_STAND_TIME) {
        activateShrinePlate(shrineId, index)
        setActive(true)
      }
    } else {
      standTime.current = 0
    }
  })

  const done = active || isShrineComplete(shrineId)
  const progress = Math.min(1, standTime.current / PLATE_STAND_TIME)

  return (
    <group position={[offset[0], 0.05, offset[1]]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.12, 8]} />
        <meshStandardMaterial
          color={done ? '#4a7c59' : '#3d4a55'}
          emissive={done ? '#2d6a4f' : '#1e3a5f'}
          emissiveIntensity={done ? 1.2 : 0.3 + progress * 1.5}
        />
      </mesh>
      {!done && progress > 0.05 && (
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 1.1, 16, 1, 0, Math.PI * 2 * progress]} />
          <meshStandardMaterial color="#88ffaa" emissive="#44ff88" emissiveIntensity={2} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

function ShrineBuilding({ complete, name }: { complete: boolean; name: string }) {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 3, 5]} />
        <meshStandardMaterial
          color={complete ? '#2a3545' : '#1e2a3a'}
          emissive={complete ? '#4488cc' : '#224466'}
          emissiveIntensity={complete ? 0.8 : 0.4}
          roughness={0.85}
        />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[3.5, 0.8, 3.5]} />
        <meshStandardMaterial color="#1a2535" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.8, 2.6]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[2.2, 2.5, 0.15]} />
        <meshStandardMaterial
          color="#88c8ff"
          emissive="#4488ff"
          emissiveIntensity={complete ? 2 : 1}
          transparent
          opacity={0.7}
        />
      </mesh>
      {!complete && (
        <pointLight position={[0, 3, 0]} color="#66aaff" intensity={6} distance={18} decay={2} />
      )}
      {complete && (
        <mesh position={[0, 2, 0]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#88ddff" emissive="#44aaff" emissiveIntensity={4} />
        </mesh>
      )}
    </group>
  )
}

export function Shrine({ id, x, z, puzzle, name }: ShrineSpot) {
  const { isShrineComplete } = useProgressStore()
  const complete = isShrineComplete(id)
  const y = getTerrainHeight(x, z)

  // Easy: torches close to shrine entrance
  const torchOffsets: [number, number][] = [
    [-2.5, -2],
    [2.5, -2],
    [0, 2.5],
  ]
  // Medium: targets in a triangle — walk closer to each (3m from center)
  const targetOffsets: [number, number][] = [
    [-3, 0],
    [3, 0],
    [0, -3],
  ]
  // Hard: plates farther apart — must visit each corner
  const plateOffsets: [number, number][] = [
    [-3, 2.5],
    [3, 2.5],
    [0, -3],
  ]

  return (
    <group position={[x, y, z]}>
      <ShrineBuilding complete={complete} name={name} />
      {!complete && puzzle === 'torch' &&
        torchOffsets.map((o, i) => (
          <ShrineTorch
            key={i}
            shrineId={id}
            index={i}
            offset={o}
            shrineX={x}
            shrineZ={z}
          />
        ))}
      {!complete && puzzle === 'target' &&
        targetOffsets.map((o, i) => (
          <ShrineTarget
            key={i}
            shrineId={id}
            index={i}
            offset={o}
            shrineX={x}
            shrineZ={z}
            shrineY={y}
          />
        ))}
      {!complete && puzzle === 'plates' &&
        plateOffsets.map((o, i) => (
          <ShrinePlate
            key={i}
            shrineId={id}
            index={i}
            offset={o}
            shrineX={x}
            shrineZ={z}
          />
        ))}
    </group>
  )
}

export const SHRINE_SPOTS: ShrineSpot[] = [
  { id: 'shrine-forest', x: -16, z: -8, puzzle: 'torch', name: 'Forest Trial', difficulty: 'easy' },
  { id: 'shrine-ruins', x: -42, z: 22, puzzle: 'target', name: 'Ruins Trial', difficulty: 'medium' },
  { id: 'shrine-hill', x: 50, z: -32, puzzle: 'plates', name: 'Hill Trial', difficulty: 'hard' },
]

export function Shrines() {
  return SHRINE_SPOTS.map((s) => <Shrine key={s.id} {...s} />)
}
