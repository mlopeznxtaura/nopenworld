import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export const attackSwingRef = { current: 0 }

/** FPS rig: lantern + axe follow camera — no body capsule (avoids camp NPC look). */
export function PlayerAvatar() {
  const { camera } = useThree()
  const rigRef = useRef<THREE.Group>(null)
  const axeRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!rigRef.current) return
    rigRef.current.position.copy(camera.position)
    rigRef.current.quaternion.copy(camera.quaternion)

    if (axeRef.current) {
      const swing = attackSwingRef.current
      axeRef.current.rotation.x = -0.3 - swing * 1.8
      axeRef.current.rotation.z = -0.15 - swing * 0.4
      if (attackSwingRef.current > 0) attackSwingRef.current -= delta
    }
  })

  return (
    <group ref={rigRef}>
      {/* Lantern — camera-local, no solid hood mesh blocking view */}
      <pointLight
        position={[0.25, -0.15, 0.35]}
        color="#ffcc66"
        intensity={6}
        distance={10}
        decay={2}
      />
      <mesh position={[0.25, -0.15, 0.35]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial
          color="#ffe8a0"
          emissive="#ffcc66"
          emissiveIntensity={2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Axe — lower-right of view */}
      <group ref={axeRef} position={[0.38, -0.32, -0.55]} rotation={[-0.3, 0, -0.15]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.05, 0.38, 0.05]} />
          <meshStandardMaterial color="#2a2218" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.38, 0]} rotation={[0, 0, 0.25]} castShadow>
          <boxGeometry args={[0.22, 0.16, 0.06]} />
          <meshStandardMaterial color="#4a4038" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}
