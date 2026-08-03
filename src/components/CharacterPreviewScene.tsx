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
      <color attach="background" args={['#7eb4d8']} />
      <fog attach="fog" args={['#b8d4ec', 10, 32]} />
      <ambientLight intensity={0.55} color="#e8f0ff" />
      <hemisphereLight intensity={0.65} color="#a8d8f0" groundColor="#4a6a48" />
      <directionalLight position={[6, 12, 8]} intensity={1.8} color="#fff8e8" castShadow />
      <directionalLight position={[-5, 4, -3]} intensity={0.45} color="#88b8ff" />
      <pointLight position={[2, 2, 3]} intensity={12} color="#ffe8c8" distance={8} decay={2} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#4a7a52" roughness={0.82} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.94, 0]}>
        <circleGeometry args={[4.2, 64]} />
        <meshBasicMaterial color="#88b8d8" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <group ref={rigRef}>
        <CharacterPreviewRig
          key={[
            config.skinTone,
            config.hairColor,
            config.tunicColor,
            config.trimColor,
            config.gemColor,
            config.build,
            config.scale,
          ].join('|')}
          config={config}
        />
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
