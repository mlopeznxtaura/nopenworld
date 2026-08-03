import { OrbitControls } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CharacterPreviewRig } from './CharacterModel'
import { useCharacter } from '../game/characterState'

type CharacterPreviewSceneProps = {
  onReady?: () => void
}

export function CharacterPreviewScene({ onReady }: CharacterPreviewSceneProps) {
  const { config } = useCharacter()
  const rigRef = useRef<THREE.Group>(null)

  useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <>
      <color attach="background" args={['#8ab4d0']} />
      <fog attach="fog" args={['#c8dce8', 8, 28]} />
      <ambientLight intensity={0.65} color="#f0f4ff" />
      <directionalLight
        position={[6, 12, 8]}
        intensity={1.6}
        color="#fff8e8"
      />
      <directionalLight position={[-4, 6, -2]} intensity={0.35} color="#88b8ff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#5a7a52" roughness={0.92} />
      </mesh>
      <group ref={rigRef}>
        <CharacterPreviewRig config={config} />
      </group>
      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={5.2}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.75, 0]}
      />
    </>
  )
}
