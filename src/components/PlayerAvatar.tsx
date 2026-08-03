import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { usePlayerStore } from '../game/playerState'

export const attackSwingRef = { current: 0 }

export function PlayerAvatar() {
  const { positionRef } = usePlayerStore()
  const groupRef = useRef<THREE.Group>(null)
  const axeRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.copy(positionRef.current)
    groupRef.current.position.y -= 1.6

    if (axeRef.current) {
      const swing = attackSwingRef.current
      axeRef.current.rotation.z = -0.4 - swing * 2.5
      if (attackSwingRef.current > 0) attackSwingRef.current -= delta
    }
  })

  return (
    <group ref={groupRef}>
      {/* Body silhouette */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.9, 4, 8]} />
        <meshStandardMaterial color="#0a0a12" roughness={0.95} />
      </mesh>
      {/* Glowing hood */}
      <mesh position={[0, 1.45, 0.1]} castShadow>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial
          color="#1a2838"
          emissive="#4cc9f0"
          emissiveIntensity={0.35}
          roughness={0.8}
        />
      </mesh>
      {/* Lantern */}
      <mesh position={[0.25, 1.1, 0.35]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffe8a0" emissive="#ffcc66" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0.25, 1.1, 0.35]} color="#ffcc66" intensity={8} distance={12} decay={2} />

      {/* Axe */}
      <group ref={axeRef} position={[0.45, 1.0, 0.2]} rotation={[0, 0, -0.4]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#2a2218" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.75, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.35, 0.25, 0.08]} />
          <meshStandardMaterial color="#4a4038" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
