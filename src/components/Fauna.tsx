import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'
import { usePlayerStore } from '../game/playerState'
import { playRustleSound } from '../audio/spatial'

export function Deer() {
  const groupRef = useRef<THREE.Group>(null)
  const pathT = useRef(0)
  const y = getTerrainHeight(-25, 18)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    pathT.current += delta * 0.08
    const t = pathT.current
    const x = -25 + Math.sin(t) * 12
    const z = 18 + Math.cos(t * 0.7) * 8
    const gy = getTerrainHeight(x, z)
    groupRef.current.position.set(x, gy, z)
    groupRef.current.rotation.y = Math.atan2(
      Math.cos(t) * 12,
      -Math.sin(t * 0.7) * 8,
    )
  })

  return (
    <group ref={groupRef} position={[-25, y, 18]}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 1.1]} />
        <meshStandardMaterial
          color="#0a1018"
          emissive="#1a3040"
          emissiveIntensity={0.15}
          roughness={0.95}
        />
      </mesh>
      <mesh position={[0, 1.5, 0.5]} castShadow>
        <boxGeometry args={[0.2, 0.35, 0.25]} />
        <meshStandardMaterial color="#0a1018" roughness={0.95} />
      </mesh>
      {/* Faint cyan eye glow */}
      <mesh position={[0.1, 1.55, 0.65]}>
        <sphereGeometry args={[0.04, 4, 4]} />
        <meshStandardMaterial color="#4cc9f0" emissive="#4cc9f0" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

export function Birds() {
  const birdsRef = useRef<THREE.Group>(null)
  const burst = useRef(0)
  const { snapRef } = usePlayerStore()

  useFrame((_, delta) => {
    if (!birdsRef.current) return
    if (snapRef.current.isSprinting && burst.current <= 0) {
      burst.current = 2
      playRustleSound()
    }
    if (burst.current > 0) {
      burst.current -= delta
      birdsRef.current.children.forEach((child, i) => {
        child.position.y += delta * (3 + i * 0.5)
        child.position.x += delta * (i % 2 === 0 ? 2 : -2)
      })
    }
  })

  return (
    <group ref={birdsRef} position={[5, 12, -8]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[i * 0.8, i * 0.3, i * 0.2]}>
          <coneGeometry args={[0.15, 0.4, 4]} />
          <meshStandardMaterial color="#1a2030" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function Fauna() {
  return (
    <>
      <Deer />
      <Birds />
    </>
  )
}
