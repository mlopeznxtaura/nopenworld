import { useMemo } from 'react'

type ConiferTreeProps = {
  scale?: number
  variant?: number
}

/** Pacific Northwest-style conifer: tall straight trunk, layered needle canopy, optional moss branch. */
export function ConiferTree({ scale = 1, variant = 0 }: ConiferTreeProps) {
  const trunkH = 18 * scale
  const r = 0.42 * scale
  const layers = 6

  return (
    <group>
      <mesh position={[0, trunkH * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.62, r, trunkH, 10]} />
        <meshStandardMaterial color="#3e342c" roughness={0.97} metalness={0.02} />
      </mesh>

      {variant > 0 && (
        <group position={[r * 1.4, trunkH * 0.22, r * 0.3]} rotation={[0.1, variant * 1.2, -0.55]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06 * scale, 0.14 * scale, 2.8 * scale, 6]} />
            <meshStandardMaterial color="#4a3c32" roughness={0.95} />
          </mesh>
          <mesh position={[0, -0.35 * scale, 0]} castShadow>
            <sphereGeometry args={[0.38 * scale, 7, 7]} />
            <meshStandardMaterial color="#3a6b48" roughness={0.92} />
          </mesh>
        </group>
      )}

      {variant > 1 && (
        <group position={[-r * 1.1, trunkH * 0.35, -r * 0.5]} rotation={[0.2, -0.8, 0.45]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05 * scale, 0.1 * scale, 2 * scale, 5]} />
            <meshStandardMaterial color="#4a3c32" roughness={0.95} />
          </mesh>
          <mesh position={[0, -0.2 * scale, 0]}>
            <sphereGeometry args={[0.28 * scale, 6, 6]} />
            <meshStandardMaterial color="#456b52" roughness={0.92} />
          </mesh>
        </group>
      )}

      {Array.from({ length: layers }, (_, i) => {
        const baseY = trunkH - 5.5 * scale + i * 2.6 * scale
        const radius = (3.4 - i * 0.48) * scale
        const height = 3.1 * scale
        const shade = i < 2 ? '#163d2a' : i < 4 ? '#245a3c' : '#2f6b4a'
        return (
          <mesh key={i} position={[0, baseY, 0]} castShadow receiveShadow>
            <coneGeometry args={[radius, height, 9]} />
            <meshStandardMaterial color={shade} roughness={0.86} metalness={0.02} />
          </mesh>
        )
      })}
    </group>
  )
}

type UndergrowthProps = {
  scale?: number
  type?: 'fern' | 'broadleaf'
}

export function Undergrowth({ scale = 1, type = 'fern' }: UndergrowthProps) {
  if (type === 'broadleaf') {
    return (
      <group scale={scale}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1.1, 8, 8]} />
          <meshStandardMaterial color="#6ecf6a" roughness={0.72} />
        </mesh>
        <mesh position={[0.7, 1.4, 0.3]} castShadow>
          <sphereGeometry args={[0.75, 7, 7]} />
          <meshStandardMaterial color="#8ee87a" roughness={0.7} />
        </mesh>
        <mesh position={[-0.6, 1.2, -0.2]} castShadow>
          <sphereGeometry args={[0.8, 7, 7]} />
          <meshStandardMaterial color="#5bc45a" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
          <meshStandardMaterial color="#4a3c32" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  return (
    <group scale={scale}>
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh
          key={i}
          position={[x, 0.55, i * 0.15]}
          rotation={[0.15 + i * 0.1, i * 0.9, 0.1]}
          castShadow
          receiveShadow
        >
          <coneGeometry args={[0.55, 1.4, 6]} />
          <meshStandardMaterial color={i === 1 ? '#7ed957' : '#5cb85c'} roughness={0.78} />
        </mesh>
      ))}
    </group>
  )
}

export function useForestLayout() {
  return useMemo(() => {
    const conifers: Array<{
      position: [number, number, number]
      scale: number
      variant: number
      rotation: number
    }> = []
    const undergrowth: Array<{
      position: [number, number, number]
      scale: number
      type: 'fern' | 'broadleaf'
      rotation: number
    }> = []

    for (let i = 0; i < 55; i++) {
      const x = (Math.random() - 0.5) * 280
      const z = (Math.random() - 0.5) * 280
      if (Math.abs(x) < 18 && Math.abs(z) < 18) continue
      const y = 0 // positioned at terrain height in parent
      const dist = Math.hypot(x, z)
      const scale = 0.75 + Math.random() * 0.55 + (dist > 120 ? 0.15 : 0)
      conifers.push({
        position: [x, y, z],
        scale,
        variant: Math.floor(Math.random() * 3),
        rotation: Math.random() * Math.PI * 2,
      })
    }

    for (let i = 0; i < 70; i++) {
      const x = (Math.random() - 0.5) * 260
      const z = (Math.random() - 0.5) * 260
      if (Math.abs(x) < 12 && Math.abs(z) < 12) continue
      undergrowth.push({
        position: [x, 0, z],
        scale: 0.6 + Math.random() * 0.9,
        type: Math.random() > 0.55 ? 'broadleaf' : 'fern',
        rotation: Math.random() * Math.PI * 2,
      })
    }

    return { conifers, undergrowth }
  }, [])
}
