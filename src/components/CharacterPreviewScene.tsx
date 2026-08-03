import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { CharacterPreviewRig } from './CharacterModel'
import { useCharacter } from '../game/characterState'

export function CharacterPreviewScene() {
  const { config } = useCharacter()
  const rigRef = useRef<THREE.Group>(null)

  return (
    <>
      <color attach="background" args={['#1a2228']} />
      <ambientLight intensity={0.55} color="#d8e4f0" />
      <directionalLight
        position={[5, 10, 6]}
        intensity={1.35}
        color="#fff0d8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 4, -3]} intensity={0.45} color="#88c8ff" />
      <pointLight position={[-2, 2, 3]} intensity={12} color="#5eb8ff" distance={8} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3.5, 48]} />
        <meshStandardMaterial color="#252a30" roughness={0.92} />
      </mesh>
      <group ref={rigRef}>
        <CharacterPreviewRig config={config} />
      </group>
      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={5.5}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.05, 0]}
      />
    </>
  )
}
