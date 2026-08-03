import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { useProgressStore } from '../game/progressState'
import {
  SHRINE_CATALOG,
  getShrineOffsets,
  type ShrineDefinition,
} from '../game/shrineCatalog'
import { getTerrainHeight } from '../utils/noise'
import { registerMeleeTarget } from './Player'
import { playScrapeSound } from '../audio/spatial'

const TORCH_RADIUS = 3.8
const PLATE_RADIUS = 2.4
const PLATE_STAND_TIME = 0.85
const SPRINT_PLATE_TIME = 0.55
const GLIDE_ZONE_TIME = 0.7

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
  standTime = PLATE_STAND_TIME,
  requireSprint = false,
  requireGlide = false,
}: {
  shrineId: string
  index: number
  offset: [number, number]
  shrineX: number
  shrineZ: number
  standTime?: number
  requireSprint?: boolean
  requireGlide?: boolean
}) {
  const { positionRef, moveStateRef, snapRef } = usePlayerStore()
  const { isShrineComplete, getShrinePuzzle, activateShrinePlate } = useProgressStore()
  const [active, setActive] = useState(
    () => getShrinePuzzle(shrineId).plates?.[index] ?? false,
  )
  const timer = useRef(0)

  useFrame((_, delta) => {
    if (active || isShrineComplete(shrineId)) return
    const px = shrineX + offset[0]
    const pz = shrineZ + offset[1]
    const dist = Math.hypot(positionRef.current.x - px, positionRef.current.z - pz)
    if (dist >= PLATE_RADIUS) {
      timer.current = 0
      return
    }
    if (requireSprint && !moveStateRef.current.isSprinting) {
      timer.current = 0
      return
    }
    if (requireGlide && !snapRef.current.isGliding) {
      timer.current += delta * 0.35
    } else {
      timer.current += delta
    }
    if (timer.current >= standTime) {
      activateShrinePlate(shrineId, index)
      setActive(true)
    }
  })

  const done = active || isShrineComplete(shrineId)
  const progress = Math.min(1, timer.current / standTime)
  const ringColor = requireSprint ? '#ffaa44' : requireGlide ? '#88ccff' : '#88ffaa'

  return (
    <group position={[offset[0], 0.05, offset[1]]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[1.2, 1.3, 0.12, 8]} />
        <meshStandardMaterial
          color={done ? '#4a7c59' : '#3d4a55'}
          emissive={done ? '#2d6a4f' : requireSprint ? '#5a4030' : '#1e3a5f'}
          emissiveIntensity={done ? 1.2 : 0.3 + progress * 1.5}
        />
      </mesh>
      {!done && progress > 0.05 && (
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 1.1, 16, 1, 0, Math.PI * 2 * progress]} />
          <meshStandardMaterial
            color={ringColor}
            emissive={ringColor}
            emissiveIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {!done && requireSprint && (
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.6]} />
          <meshStandardMaterial color="#ffcc66" emissive="#ff8833" emissiveIntensity={1.5} />
        </mesh>
      )}
      {!done && requireGlide && (
        <mesh position={[0, 2.5, 0]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.9, 0.06, 8, 16]} />
          <meshStandardMaterial
            color="#aaddff"
            emissive="#4488ff"
            emissiveIntensity={2}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  )
}

function ShrineBuilding({ complete, def }: { complete: boolean; def: ShrineDefinition }) {
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
        <pointLight position={[0, 3, 0]} color="#66aaff" intensity={6} distance={20} decay={2} />
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

function ShrineInstance({ def }: { def: ShrineDefinition }) {
  const { isShrineComplete } = useProgressStore()
  const complete = isShrineComplete(def.id)
  const y = getTerrainHeight(def.x, def.z)
  const offsets = getShrineOffsets(def)

  return (
    <group position={[def.x, y, def.z]}>
      <ShrineBuilding complete={complete} def={def} />
      {!complete && def.puzzle === 'torch' &&
        offsets.map((o, i) => (
          <ShrineTorch key={i} shrineId={def.id} index={i} offset={o} shrineX={def.x} shrineZ={def.z} />
        ))}
      {!complete && def.puzzle === 'target' &&
        offsets.map((o, i) => (
          <ShrineTarget
            key={i}
            shrineId={def.id}
            index={i}
            offset={o}
            shrineX={def.x}
            shrineZ={def.z}
            shrineY={y}
          />
        ))}
      {!complete && (def.puzzle === 'plates' || def.puzzle === 'sprint-plates' || def.puzzle === 'glide-zone') &&
        offsets.map((o, i) => (
          <ShrinePlate
            key={i}
            shrineId={def.id}
            index={i}
            offset={o}
            shrineX={def.x}
            shrineZ={def.z}
            standTime={def.puzzle === 'sprint-plates' ? SPRINT_PLATE_TIME : def.puzzle === 'glide-zone' ? GLIDE_ZONE_TIME : PLATE_STAND_TIME}
            requireSprint={def.puzzle === 'sprint-plates'}
            requireGlide={def.puzzle === 'glide-zone'}
          />
        ))}
    </group>
  )
}

export function Shrines() {
  return SHRINE_CATALOG.map((def) => <ShrineInstance key={def.id} def={def} />)
}

export function ShrineBeacons() {
  return SHRINE_CATALOG.map((def) => {
    const y = getTerrainHeight(def.x, def.z)
    return (
      <group key={`beacon-${def.id}`} position={[def.x, y, def.z]}>
        <mesh position={[0, 5.5, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 3, 4]} />
          <meshStandardMaterial
            color="#88c8ff"
            emissive="#4488ff"
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight position={[0, 6, 0]} color="#66aaff" intensity={4} distance={14} decay={2} />
      </group>
    )
  })
}
