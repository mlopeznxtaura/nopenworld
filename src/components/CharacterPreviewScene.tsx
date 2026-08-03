import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { CharacterPreviewRig } from './CharacterModel'
import { useCharacter } from '../game/characterState'

export function CharacterPreviewScene() {
  const { config } = useCharacter()
  const rigRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (rigRef.current) rigRef.current.rotation.y += delta * 0.45
  })

  return (
    <>
      <color attach="background" args={['#0d1218']} />
      <ambientLight intensity={0.45} color="#c8d8e8" />
      <directionalLight position={[4, 8, 5]} intensity={1.2} color="#ffe8c0" castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.35} color="#4cc9f0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#1a2228" roughness={0.95} />
      </mesh>
      <group ref={rigRef}>
        <CharacterPreviewRig config={config} />
      </group>
      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.1, 0]}
      />
    </>
  )
}
