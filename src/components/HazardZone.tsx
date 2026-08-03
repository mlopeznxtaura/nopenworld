import { useRef } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'

const HAZARD_X = -40
const HAZARD_Z = 40

export function HazardZone() {
  const y = getTerrainHeight(HAZARD_X, HAZARD_Z)

  return (
    <group position={[HAZARD_X, y, HAZARD_Z]}>
      {/* Behemoth carcass skeleton */}
      <group rotation={[0, 0.6, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[8, 2, 3]} />
          <meshStandardMaterial color="#2a2830" roughness={0.95} />
        </mesh>
        <mesh position={[4, 2.5, 0]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.3, 0.5, 4, 6]} />
          <meshStandardMaterial color="#353038" roughness={0.95} />
        </mesh>
        <mesh position={[-3.5, 1.8, 0.8]} rotation={[0.3, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.25, 0.4, 3.5, 6]} />
          <meshStandardMaterial color="#353038" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.8, -1.5]} castShadow>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshStandardMaterial color="#2a2830" roughness={0.95} />
        </mesh>
      </group>

      {/* Fog pocket — localized dense fog plane */}
      <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial
          color="#8a9aaa"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Loot crate removed — use Chest in WorldContent */}
    </group>
  )
}

export function BackgroundHills() {
  const hills = useRef([
    { x: -200, z: -150, scale: 1.2 },
    { x: 180, z: -180, scale: 1.5 },
    { x: -160, z: 200, scale: 1.0 },
    { x: 220, z: 120, scale: 1.3 },
  ]).current

  return (
    <group>
      {hills.map((h, i) => (
        <mesh
          key={i}
          position={[h.x, getTerrainHeight(h.x, h.z) + 15 * h.scale, h.z]}
          scale={[40 * h.scale, 30 * h.scale, 25 * h.scale]}
        >
          <coneGeometry args={[1, 1, 6]} />
          <meshStandardMaterial color="#1a2838" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}
