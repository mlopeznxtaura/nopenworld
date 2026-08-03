import { useMemo } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'
import { BEACON_X, BEACON_Z } from './Beacon'

const CABIN_X = 80
const CABIN_Z = -60

export function HillCabinHub() {
  const y = getTerrainHeight(CABIN_X, CABIN_Z)

  const pathPoints = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const steps = 24
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = t * CABIN_X + Math.sin(t * Math.PI * 2) * 4
      const z = t * CABIN_Z + Math.cos(t * Math.PI * 1.5) * 3
      pts.push(new THREE.Vector3(x, getTerrainHeight(x, z) + 0.05, z))
    }
    return pts
  }, [])

  const pathGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pathPoints)
    return new THREE.TubeGeometry(curve, 48, 0.35, 6, false)
  }, [pathPoints])

  return (
    <group>
      {/* Worn path to hill */}
      <mesh geometry={pathGeo} receiveShadow>
        <meshStandardMaterial color="#3a3428" roughness={0.95} />
      </mesh>

      {/* Path markers */}
      {pathPoints.filter((_, i) => i % 4 === 0).map((p, i) => (
        <mesh key={i} position={[p.x, p.y + 0.15, p.z]}>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#5a5048" roughness={0.9} />
        </mesh>
      ))}

      {/* Cabin */}
      <group position={[CABIN_X, y, CABIN_Z]} rotation={[0, -0.4, 0]}>
        {/* Walls */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5, 3, 4]} />
          <meshStandardMaterial color="#2a2420" roughness={0.95} />
        </mesh>
        {/* Peaked roof */}
        <mesh position={[0, 3.6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[4, 2.2, 4]} />
          <meshStandardMaterial color="#1a1815" roughness={0.95} />
        </mesh>
        {/* Glowing window */}
        <mesh position={[0, 1.6, 2.01]}>
          <boxGeometry args={[1.2, 1, 0.05]} />
          <meshStandardMaterial
            color="#ffe8c0"
            emissive="#ffcc88"
            emissiveIntensity={3}
          />
        </mesh>
        <pointLight
          position={[0, 1.6, 2.5]}
          color="#ffcc88"
          intensity={10}
          distance={12}
          decay={2}
        />
        {/* Base tier marker — upgradeable outpost */}
        <mesh position={[2.8, 0.3, -1.5]}>
          <boxGeometry args={[1.2, 0.6, 0.8]} />
          <meshStandardMaterial color="#3a3530" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

export function getSanctuaryDistance(px: number, pz: number): number {
  const fire = Math.hypot(px, pz)
  const beacon = Math.hypot(px - BEACON_X, pz - BEACON_Z)
  const cabin = Math.hypot(px - CABIN_X, pz - CABIN_Z)
  return Math.min(fire, beacon, cabin)
}
