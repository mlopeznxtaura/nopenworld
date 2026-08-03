import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { CharacterConfig } from '../game/characterConfig'

type CharacterModelProps = {
  config: CharacterConfig
  attackSwingRef?: { current: number }
  showAxe?: boolean
}

/** Full silhouette survivor — body, hood, lantern, axe. Used in preview and gameplay. */
export function CharacterModel({
  config,
  attackSwingRef,
  showAxe = true,
}: CharacterModelProps) {
  const buildR = config.build === 'broad' ? 0.42 : 0.35
  const s = config.scale
  const axeRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!axeRef.current || !attackSwingRef) return
    const swing = attackSwingRef.current
    axeRef.current.rotation.x = -0.3 - swing * 1.8
    axeRef.current.rotation.z = -0.15 - swing * 0.4
  })

  return (
    <group scale={s}>
      {/* Torso */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[buildR, 0.85, 6, 10]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.95} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.18, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.12 * s, 0.55, 5, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.95} />
      </mesh>
      <mesh position={[0.18, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.12 * s, 0.55, 5, 8]} />
        <meshStandardMaterial color={config.bodyColor} roughness={0.95} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.52, 0.08]} castShadow>
        <sphereGeometry args={[0.34 * s, 10, 10]} />
        <meshStandardMaterial
          color={config.hoodColor}
          emissive={config.hoodColor}
          emissiveIntensity={0.4}
          roughness={0.8}
        />
      </mesh>
      {/* Lantern */}
      <mesh position={[0.28 * s, 1.12, 0.32 * s]}>
        <sphereGeometry args={[0.11 * s, 8, 8]} />
        <meshStandardMaterial
          color={config.lanternColor}
          emissive={config.lanternColor}
          emissiveIntensity={2}
        />
      </mesh>
      <pointLight
        position={[0.28 * s, 1.12, 0.32 * s]}
        color={config.lanternColor}
        intensity={7}
        distance={11}
        decay={2}
      />

      {showAxe && (
        <group ref={axeRef} position={[0.42 * s, 1.05, 0.18]} rotation={[-0.3, 0, -0.15]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.06, 0.7, 0.06]} />
            <meshStandardMaterial color="#2a2218" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.75, 0]} rotation={[0, 0, 0.3]} castShadow>
            <boxGeometry args={[0.35, 0.25, 0.08]} />
            <meshStandardMaterial color="#4a4038" metalness={0.4} roughness={0.6} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/** Slowly rotates character in customization preview. */
export function CharacterPreviewRig({ config }: { config: CharacterConfig }) {
  const spinRef = useRef<THREE.Group>(null)

  return (
    <group ref={spinRef} position={[0, 0, 0]}>
      <CharacterModel config={config} showAxe />
    </group>
  )
}
