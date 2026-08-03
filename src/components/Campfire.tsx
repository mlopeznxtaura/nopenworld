import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'

export const CAMPFIRE_POSITION = new THREE.Vector3(0, 0, 0)
export const CAMPFIRE_RADIUS = 14

type CampfireProps = {
  x?: number
  z?: number
}

export function Campfire({ x = 0, z = 0 }: CampfireProps) {
  const y = getTerrainHeight(x, z)
  const fireRef = useRef<THREE.PointLight>(null)
  const flicker = useRef(0)

  useFrame((_, delta) => {
    flicker.current += delta * 12
    if (fireRef.current) {
      fireRef.current.intensity = 18 + Math.sin(flicker.current) * 4 + Math.sin(flicker.current * 2.3) * 2
    }
  })

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 8]} />
        <meshStandardMaterial color="#2a2218" roughness={0.95} />
      </mesh>
      {/* Fire silhouette */}
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.35, 0.9, 6]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.15, 0.75, 0.1]}>
        <coneGeometry args={[0.2, 0.6, 5]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={2.5} />
      </mesh>
      <pointLight
        ref={fireRef}
        color="#ff8833"
        intensity={20}
        distance={CAMPFIRE_RADIUS}
        decay={2}
        castShadow
      />
      {/* Static NPC silhouettes — distinct emissive tint vs player */}
      {[
        [1.8, 0, 0.5],
        [-1.5, 0, -0.8],
        [0.3, 0, -2],
      ].map((p, i) => (
        <group key={i} position={[p[0], 0, p[2]]}>
          <mesh position={[0, 0.85, 0]} castShadow>
            <capsuleGeometry args={[0.25, 0.7, 4, 6]} />
            <meshStandardMaterial
              color="#0a0a12"
              emissive="#1a2838"
              emissiveIntensity={0.12}
              roughness={0.95}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
