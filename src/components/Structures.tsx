import { getTerrainHeight } from '../utils/noise'
import { InstancedForest } from './InstancedForest'

/** Static world scenery — GPU-instanced forest (not per-mesh trees). */
export const Structures = () => {
  return (
    <group>
      <InstancedForest />
      {/* Keep a few hand-placed landmark trees near spawn for depth cue */}
      <LandmarkGrove />
    </group>
  )
}

function LandmarkGrove() {
  const spots = [
    { x: -22, z: 18, s: 1.15 },
    { x: 24, z: -12, s: 1.05 },
    { x: -18, z: -20, s: 0.95 },
  ]
  return (
    <group>
      {spots.map((p, i) => {
        const y = getTerrainHeight(p.x, p.z)
        const trunkH = 16 * p.s
        return (
          <group key={i} position={[p.x, y, p.z]}>
            <mesh position={[0, trunkH * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.28 * p.s, 0.4 * p.s, trunkH, 8]} />
              <meshStandardMaterial color="#3e342c" roughness={0.95} />
            </mesh>
            {[0, 1, 2, 3].map((L) => (
              <mesh
                key={L}
                position={[0, trunkH - 4 * p.s + L * 2.4 * p.s, 0]}
                castShadow
              >
                <coneGeometry args={[(2.8 - L * 0.45) * p.s, 2.8 * p.s, 8]} />
                <meshStandardMaterial
                  color={L < 2 ? '#1a4a32' : '#2f6b4a'}
                  roughness={0.75}
                />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}
