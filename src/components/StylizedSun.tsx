import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'

type StylizedSunProps = {
  positionRef: RefObject<THREE.Vector3>
  goldenHourRef: RefObject<number>
}

/** Compact sun disc — fewer spheres than before, still reads as a bright sky disc. */
export function StylizedSun({ positionRef, goldenHourRef }: StylizedSunProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreMat = useRef<THREE.MeshBasicMaterial>(null)
  const glowMat = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(() => {
    if (groupRef.current && positionRef.current) {
      groupRef.current.position.copy(positionRef.current)
      groupRef.current.lookAt(0, 0, 0)
    }
    const gh = goldenHourRef.current ?? 0
    if (coreMat.current) {
      coreMat.current.color.set(gh > 0.35 ? '#fff8e8' : '#ffffff')
    }
    if (glowMat.current) {
      glowMat.current.color.set(gh > 0.35 ? '#ffb84a' : '#ffe8a8')
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[48, 12, 12]} />
        <meshBasicMaterial color="#b8d8f8" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[28, 12, 12]} />
        <meshBasicMaterial
          ref={glowMat}
          color="#ffe8a8"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[14, 12, 12]} />
        <meshBasicMaterial ref={coreMat} color="#ffffff" />
      </mesh>
    </group>
  )
}
