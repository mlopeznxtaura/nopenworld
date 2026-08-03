import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'

export const BEACON_X = 80
export const BEACON_Z = -60
export const BEACON_RADIUS = 18

export function Beacon() {
  const y = getTerrainHeight(BEACON_X, BEACON_Z)
  const beamRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const pulse = useRef(0)

  useFrame((_, delta) => {
    pulse.current += delta * 2
    const p = 0.5 + Math.sin(pulse.current) * 0.5
    if (lightRef.current) lightRef.current.intensity = 12 + p * 8
    if (beamRef.current) {
      beamRef.current.material.opacity = 0.15 + p * 0.1
    }
  })

  return (
    <group position={[BEACON_X, y, BEACON_Z]}>
      {/* Beacon pole */}
      <mesh position={[0, 4, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 8, 6]} />
        <meshStandardMaterial color="#3a3530" roughness={0.9} />
      </mesh>
      {/* Glowing beacon head */}
      <mesh position={[0, 8.2, 0]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#e8f4ff" emissiveIntensity={4} />
      </mesh>
      {/* Visible beam */}
      <mesh ref={beamRef} position={[0, 6, 0]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[2.5, 12, 4, 1, true]} />
        <meshStandardMaterial
          color="#c8e8ff"
          emissive="#a0d0ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 8.2, 0]}
        color="#d0e8ff"
        intensity={15}
        distance={BEACON_RADIUS}
        decay={2}
      />
    </group>
  )
}
