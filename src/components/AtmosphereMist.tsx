import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** Low-cost horizon mist — ref-driven, no React state. */
export function AtmosphereMist() {
  const groupRef = useRef<THREE.Group>(null)
  const patches = useMemo(() => {
    const out: Array<{ x: number; z: number; scale: number; phase: number }> = []
    for (let i = 0; i < 10; i++) {
      out.push({
        x: (Math.random() - 0.5) * 220,
        z: (Math.random() - 0.5) * 220,
        scale: 18 + Math.random() * 28,
        phase: Math.random() * Math.PI * 2,
      })
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.children.forEach((child, i) => {
      const p = patches[i]
      if (!p) return
      child.position.y = 1.2 + Math.sin(t * 0.15 + p.phase) * 0.4
      child.rotation.z = Math.sin(t * 0.08 + p.phase) * 0.02
    })
  })

  return (
    <group ref={groupRef}>
      {patches.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 1.5, p.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[p.scale, p.scale * 0.55]} />
          <meshBasicMaterial
            color="#c8dce8"
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
