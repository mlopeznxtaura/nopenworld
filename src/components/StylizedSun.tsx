import { useFrame } from '@react-three/fiber'
import { useRef, type RefObject } from 'react'
import * as THREE from 'three'

type StylizedSunProps = {
  positionRef: RefObject<THREE.Vector3>
  goldenHour: number
}

/** Layered sun disc + lens-flare rings matching reference (white core, soft halo, pale bloom). */
export function StylizedSun({ positionRef, goldenHour }: StylizedSunProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current && positionRef.current) {
      groupRef.current.position.copy(positionRef.current)
      groupRef.current.lookAt(0, 0, 0)
    }
  })

  const coreColor = goldenHour > 0.35 ? '#fff8e8' : '#ffffff'
  const innerGlow = goldenHour > 0.35 ? '#ffe566' : '#fff4c8'
  const midGlow = goldenHour > 0.35 ? '#ffb84a' : '#ffe8a8'
  const outerGlow = '#b8d8f8'

  return (
    <group ref={groupRef}>
      {/* Soft outer bloom — pale blue halo */}
      <mesh>
        <sphereGeometry args={[72, 32, 32]} />
        <meshBasicMaterial color={outerGlow} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[52, 32, 32]} />
        <meshBasicMaterial color={outerGlow} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* Warm mid glow */}
      <mesh>
        <sphereGeometry args={[36, 32, 32]} />
        <meshBasicMaterial color={midGlow} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[24, 32, 32]} />
        <meshBasicMaterial color={innerGlow} transparent opacity={0.32} depthWrite={false} />
      </mesh>

      {/* Bright white core disc */}
      <mesh>
        <sphereGeometry args={[14, 32, 32]} />
        <meshBasicMaterial color={coreColor} />
      </mesh>

      {/* Lens flare rings (offset to the right of the sun) */}
      <group position={[38, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <torusGeometry args={[1.8, 0.12, 8, 48]} />
          <meshBasicMaterial color="#c8dce8" transparent opacity={0.55} depthWrite={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[4.2, 0.16, 8, 48]} />
          <meshBasicMaterial color="#b0cce0" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[7.5, 0.2, 8, 48]} />
          <meshBasicMaterial color="#98b8d4" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
