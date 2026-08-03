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
}

const INTERACT_RADIUS = 3.5
const PLATE_RADIUS = 1.8

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
  const tx = shrineX + offset[0]
  const tz = shrineZ + offset[1]

  useFrame((_, delta) => {
    if (lit || isShrineComplete(shrineId)) return
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - tx, positionRef.current.z - tz)
    if (dist > 2) return
    cooldown.current = 0.4
    lightShrineTorch(shrineId, index)
    setLit(true)
    playScrapeSound()
  })

  const done = lit || isShrineComplete(shrineId)

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
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#2a2820" roughness={0.9} />
        </mesh>
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

  useEffect(() => {
    hitRef.current = hit
  }, [hit])

  useEffect(() => {
    return registerMeleeTarget({
      position: posVec.current,
      radius: 1.2,
      onHit: () => {
        if (hitRef.current || isShrineComplete(shrineId)) return
        hitShrineTarget(shrineId, index)
        setHit(true)
      },
    })
  }, [shrineId, index, hitShrineTarget, isShrineComplete])

  useFrame(() => {
    posVec.current.set(shrineX + offset[0], shrineY + 2.5, shrineZ + offset[1])
  })

  const done = hit || isShrineComplete(shrineId)

  return (
    <group position={[offset[0], 0, offset[1]]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.4, 6]} />
        <meshStandardMaterial color="#4a5568" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.5, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial
          color={done ? '#334155' : '#ef4444'}
          emissive={done ? '#000' : '#ff2200'}
          emissiveIntensity={done ? 0 : 2}
        />
      </mesh>
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
      if (standTime.current >= 1.2) {
        activateShrinePlate(shrineId, index)
        setActive(true)
      }
    } else {
      standTime.current = 0
    }
  })

  const done = active || isShrineComplete(shrineId)

  return (
    <group position={[offset[0], 0.05, offset[1]]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.12, 8]} />
        <meshStandardMaterial
          color={done ? '#4a7c59' : '#3d4a55'}
          emissive={done ? '#2d6a4f' : '#1e3a5f'}
          emissiveIntensity={done ? 1.2 : 0.3}
        />
      </mesh>
    </group>
  )
}

function ShrineBuilding({ complete }: { complete: boolean }) {
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

  const torchOffsets: [number, number][] = [
    [-3, -2],
    [3, -2],
    [0, 3],
  ]
  const targetOffsets: [number, number][] = [
    [-4, 0],
    [4, 0],
    [0, -4],
  ]
  const plateOffsets: [number, number][] = [
    [-2.5, 2],
    [2.5, 2],
    [0, -2.5],
  ]

  return (
    <group position={[x, y, z]}>
      <ShrineBuilding complete={complete} />
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
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[name.length * 0.15 + 1, 0.4, 0.05]} />
        <meshStandardMaterial color="#0a1520" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export const SHRINE_SPOTS: ShrineSpot[] = [
  { id: 'shrine-forest', x: -25, z: -10, puzzle: 'torch', name: 'Forest Trial' },
  { id: 'shrine-ruins', x: -55, z: 25, puzzle: 'target', name: 'Ruins Trial' },
  { id: 'shrine-hill', x: 60, z: -40, puzzle: 'plates', name: 'Hill Trial' },
]

export function Shrines() {
  return SHRINE_SPOTS.map((s) => <Shrine key={s.id} {...s} />)
}
