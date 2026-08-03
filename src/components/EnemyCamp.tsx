import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { registerMeleeTarget } from './Player'
import { usePlayerStore } from '../game/playerState'
import { getTerrainHeight } from '../utils/noise'
import { playHitSound } from '../audio/spatial'
import { Chest } from './Chest'

type BokoblinProps = {
  id: string
  offsetX: number
  offsetZ: number
  campX: number
  campZ: number
  onDeath: () => void
}

function Bokoblin({ id, offsetX, offsetZ, campX, campZ, onDeath }: BokoblinProps) {
  const { positionRef, damage } = usePlayerStore()
  const [dead, setDead] = useState(false)
  const [hits, setHits] = useState(0)
  const posVec = useRef(new THREE.Vector3())
  const groupRef = useRef<THREE.Group>(null)
  const patrol = useRef(0)
  const damageCooldown = useRef(0)

  useEffect(() => {
    if (dead) return
    return registerMeleeTarget({
      position: posVec.current,
      radius: 1.4,
      onHit: () => {
        setHits((h) => {
          const next = h + 1
          playHitSound()
          if (next >= 2) {
            setDead(true)
            onDeath()
          }
          return next
        })
      },
    })
  }, [dead, onDeath])

  useFrame((_, delta) => {
    if (dead) return
    if (damageCooldown.current > 0) damageCooldown.current -= delta
    patrol.current += delta
    const px = campX + offsetX + Math.sin(patrol.current * 0.8) * 2
    const pz = campZ + offsetZ + Math.cos(patrol.current * 0.6) * 2
    const py = getTerrainHeight(px, pz)
    posVec.current.set(px, py + 1.2, pz)
    if (groupRef.current) {
      groupRef.current.position.set(px, py, pz)
      const toPlayer = new THREE.Vector3(
        positionRef.current.x - px,
        0,
        positionRef.current.z - pz,
      )
      if (toPlayer.lengthSq() > 0.01) {
        groupRef.current.rotation.y = Math.atan2(toPlayer.x, toPlayer.z)
      }
    }
    const dist = Math.hypot(positionRef.current.x - px, positionRef.current.z - pz)
    if (dist < 1.5 && damageCooldown.current <= 0) {
      damage(1)
      damageCooldown.current = 0.9
    }
  })

  if (dead) return null

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4a3528" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.55, 0.3]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.08]} />
        <meshStandardMaterial color="#6a5040" roughness={0.85} />
      </mesh>
      <mesh position={[0.35, 1.3, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#5a4535" roughness={0.85} />
      </mesh>
      <mesh position={[-0.35, 1.3, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#5a4535" roughness={0.85} />
      </mesh>
      <mesh position={[0.2, 0.4, 0.15]} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="#4a3828" roughness={0.9} />
      </mesh>
    </group>
  )
}

type CampSpot = {
  id: string
  x: number
  z: number
  enemies: number
}

function EnemyCampSite({ id, x, z, enemies }: CampSpot) {
  const y = getTerrainHeight(x, z)
  const deadCount = useRef(0)
  const offsets = [
    [2, 0],
    [-2, 1.5],
    [0, -2],
  ]

  const onDeath = () => {
    deadCount.current += 1
  }

  return (
    <group position={[x, y, z]}>
      {/* Camp fire ring */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3.2, 0.1, 12]} />
        <meshStandardMaterial color="#3a3028" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.6, 6]} />
        <meshStandardMaterial color="#2a2218" roughness={0.95} />
      </mesh>
      <pointLight position={[0, 1, 0]} color="#ff6622" intensity={6} distance={12} decay={2} />
      {/* Skull totem */}
      <mesh position={[2.5, 1, 0]} castShadow>
        <sphereGeometry args={[0.4, 6, 6]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.8} />
      </mesh>
      <mesh position={[2.5, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 4]} />
        <meshStandardMaterial color="#4a4035" roughness={0.9} />
      </mesh>
      {offsets.slice(0, enemies).map((o, i) => (
        <Bokoblin
          key={`${id}-e${i}`}
          id={`${id}-e${i}`}
          offsetX={o[0]}
          offsetZ={o[1]}
          campX={x}
          campZ={z}
          onDeath={onDeath}
        />
      ))}
      <Chest
        id={`chest-camp-${id}`}
        x={x - 1.5}
        z={z + 2}
        loot={{ rupees: 15, wood: 2, repair: true }}
      />
    </group>
  )
}

export const CAMP_SPOTS: CampSpot[] = [
  { id: 'camp-east', x: 45, z: 30, enemies: 2 },
  { id: 'camp-west', x: -30, z: -35, enemies: 2 },
]

export function EnemyCamps() {
  return CAMP_SPOTS.map((c) => <EnemyCampSite key={c.id} {...c} />)
}
