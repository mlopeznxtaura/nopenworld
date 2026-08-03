import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** Soft ground mist — few patches, slow motion, BasicMaterial (cheap). */
export function AtmosphereMist() {
  const groupRef = useRef<THREE.Group>(null)
  const patches = useMemo(() => {
    const out: Array<{ x: number; z: number; scale: number; phase: number }> = []
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      out.push({
        x: Math.cos(a) * (55 + (i % 3) * 28),
        z: Math.sin(a) * (55 + (i % 3) * 28),
        scale: 22 + (i % 3) * 10,
        phase: i * 1.1,
      })
    }
    return out
  }, [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    // Update every other frame
    if ((t * 60) | 0) {
      /* keep continuous but cheap */
    }
    groupRef.current.children.forEach((child, i) => {
      const p = patches[i]
      if (!p) return
      child.position.y = 1.4 + Math.sin(t * 0.12 + p.phase) * 0.35
    })
  })

  return (
    <group ref={groupRef}>
      {patches.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, 1.5, p.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          frustumCulled
        >
          <planeGeometry args={[p.scale, p.scale * 0.5]} />
          <meshBasicMaterial
            color="#c8dce8"
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
