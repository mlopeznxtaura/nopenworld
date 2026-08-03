import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { CharacterConfig } from '../game/characterConfig'

type CharacterModelProps = {
  config: CharacterConfig
  attackSwingRef?: { current: number }
  showWeapon?: boolean
}

function skinMat(color: string) {
  return <meshStandardMaterial color={color} roughness={0.62} metalness={0.02} />
}

function chainMat() {
  return (
    <meshStandardMaterial
      color="#6a7278"
      roughness={0.55}
      metalness={0.55}
    />
  )
}

function leatherMat(color = '#4a3428') {
  return <meshStandardMaterial color={color} roughness={0.88} metalness={0.05} />
}

function gemMat(color: string) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={2.2}
      roughness={0.3}
      metalness={0.2}
    />
  )
}

function swordBladeMat(color: string) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={1.8}
      roughness={0.25}
      metalness={0.65}
    />
  )
}

/** Human fantasy adventurer — tabard, chainmail, draconic tail, arcane sword. */
export function CharacterModel({
  config,
  attackSwingRef,
  showWeapon = true,
}: CharacterModelProps) {
  const s = config.scale
  const broad = config.build === 'broad' ? 1.12 : 1
  const swordArmRef = useRef<THREE.Group>(null)

  const hairSpikes = useMemo(
    () =>
      [
        [0, 0.22, 0.06, 0.35],
        [0.1, 0.2, 0.04, -0.2],
        [-0.1, 0.2, 0.04, 0.25],
        [0.14, 0.15, 0.3, -0.5],
        [-0.14, 0.15, 0.3, 0.45],
        [0.05, 0.24, 0.2, 0.1],
        [-0.06, 0.22, 0.25, -0.15],
        [0, 0.18, 0.4, 0.35],
      ] as const,
    [],
  )

  useFrame(() => {
    if (!swordArmRef.current || !attackSwingRef) return
    const swing = attackSwingRef.current
    swordArmRef.current.rotation.x = -0.35 - swing * 2.4
    swordArmRef.current.rotation.z = -0.55 - swing * 0.35
  })

  return (
    <group scale={s}>
      {/* Draconic tail */}
      {Array.from({ length: 9 }, (_, i) => {
        const taper = 1 - i * 0.09
        const shade = i % 2 === 0 ? '#3d5248' : '#2f4038'
        return (
          <mesh
            key={`tail-${i}`}
            position={[0, 0.88 - i * 0.02, -0.18 - i * 0.2]}
            rotation={[0.45 + i * 0.09, 0, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.1 * taper * broad, 0.22, 5, 8]} />
            <meshStandardMaterial color={shade} roughness={0.82} />
          </mesh>
        )
      })}

      {/* Boots */}
      <mesh position={[-0.14 * broad, 0.12, 0.04]} castShadow>
        <boxGeometry args={[0.16 * broad, 0.22, 0.28]} />
        {leatherMat('#4a3428')}
      </mesh>
      <mesh position={[0.14 * broad, 0.12, 0.04]} castShadow>
        <boxGeometry args={[0.16 * broad, 0.22, 0.28]} />
        {leatherMat('#4a3428')}
      </mesh>

      {/* Legs — chainmail */}
      <mesh position={[-0.14 * broad, 0.52, 0]} castShadow>
        <capsuleGeometry args={[0.11 * broad, 0.5, 6, 10]} />
        {chainMat()}
      </mesh>
      <mesh position={[0.14 * broad, 0.52, 0]} castShadow>
        <capsuleGeometry args={[0.11 * broad, 0.5, 6, 10]} />
        {chainMat()}
      </mesh>

      {/* Pelvis / belt */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <boxGeometry args={[0.38 * broad, 0.18, 0.24 * broad]} />
        {leatherMat('#3a2a20')}
      </mesh>

      {/* Tabard torso */}
      <mesh position={[0, 1.18, 0.02]} castShadow>
        <boxGeometry args={[0.42 * broad, 0.55, 0.22 * broad]} />
        <meshStandardMaterial color={config.tunicColor} roughness={0.78} />
      </mesh>
      {/* Gold trim bands */}
      <mesh position={[0, 1.38, 0.13 * broad]}>
        <boxGeometry args={[0.44 * broad, 0.06, 0.02]} />
        <meshStandardMaterial color={config.trimColor} roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0.13 * broad]}>
        <boxGeometry args={[0.44 * broad, 0.05, 0.02]} />
        <meshStandardMaterial color={config.trimColor} roughness={0.45} metalness={0.6} />
      </mesh>

      {/* Chainmail under-tunic shoulders */}
      <mesh position={[-0.28 * broad, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.13 * broad, 8, 8]} />
        {chainMat()}
      </mesh>
      <mesh position={[0.28 * broad, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.13 * broad, 8, 8]} />
        {chainMat()}
      </mesh>

      {/* Left arm (static) */}
      <group position={[-0.34 * broad, 1.22, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.09 * broad, 0.32, 6, 8]} />
          {chainMat()}
        </mesh>
        <mesh position={[0, -0.42, 0.02]} castShadow>
          <boxGeometry args={[0.11 * broad, 0.22, 0.11 * broad]} />
          {leatherMat('#4a3428')}
        </mesh>
        <mesh position={[0, -0.42, 0.08 * broad]}>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          {gemMat(config.gemColor)}
        </mesh>
        <mesh position={[0, -0.52, 0.04]} castShadow>
          <sphereGeometry args={[0.07 * broad, 6, 6]} />
          {skinMat(config.skinTone)}
        </mesh>
      </group>

      {/* Sheathed blades on left hip */}
      <group position={[-0.22 * broad, 0.95, 0.1]} rotation={[0.2, 0.4, 0.35]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.42, 0.06]} />
          <meshStandardMaterial color="#8a9098" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0.06, -0.02, 0.02]} castShadow>
          <boxGeometry args={[0.04, 0.38, 0.06]} />
          <meshStandardMaterial color="#7a8088" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[-0.02, -0.2, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          {leatherMat()}
        </mesh>
        <mesh position={[0.04, -0.18, 0.02]}>
          <boxGeometry args={[0.05, 0.1, 0.05]} />
          {leatherMat()}
        </mesh>
      </group>

      {/* Right arm + arcane sword */}
      <group ref={swordArmRef} position={[0.34 * broad, 1.22, 0]}>
        <mesh position={[0, -0.18, 0]} castShadow>
          <capsuleGeometry args={[0.09 * broad, 0.32, 6, 8]} />
          {chainMat()}
        </mesh>
        <mesh position={[0, -0.42, 0.02]} castShadow>
          <boxGeometry args={[0.11 * broad, 0.22, 0.11 * broad]} />
          {leatherMat('#4a3428')}
        </mesh>
        <mesh position={[0, -0.42, 0.08 * broad]}>
          <boxGeometry args={[0.08, 0.1, 0.03]} />
          {gemMat(config.gemColor)}
        </mesh>
        <mesh position={[0, -0.52, 0.04]} castShadow>
          <sphereGeometry args={[0.07 * broad, 6, 6]} />
          {skinMat(config.skinTone)}
        </mesh>

        {showWeapon && (
          <group position={[0, -0.55, 0.12]} rotation={[0.2, 0, -0.15]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.06, 0.78, 0.14]} />
              {swordBladeMat(config.gemColor)}
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[0.22, 0.04, 0.08]} />
              <meshStandardMaterial color={config.trimColor} metalness={0.7} roughness={0.35} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[0.05, 0.14, 0.05]} />
              {leatherMat('#3a2a20')}
            </mesh>
            <pointLight
              position={[0, 0.5, 0]}
              color={config.gemColor}
              intensity={4}
              distance={5}
              decay={2}
            />
          </group>
        )}
      </group>

      {/* Neck */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <capsuleGeometry args={[0.09 * broad, 0.1, 6, 8]} />
        {skinMat(config.skinTone)}
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.68, 0.02]} castShadow>
        <sphereGeometry args={[0.15 * broad, 12, 12]} />
        {skinMat(config.skinTone)}
      </mesh>

      {/* Spiky hair */}
      {hairSpikes.map(([x, y, rz, ry], i) => (
        <mesh
          key={i}
          position={[x * broad, 1.68 + y, 0.02]}
          rotation={[0, ry, rz]}
          castShadow
        >
          <coneGeometry args={[0.045 * broad, 0.22, 4]} />
          <meshStandardMaterial color={config.hairColor} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

export function CharacterPreviewRig({ config }: { config: CharacterConfig }) {
  return (
    <group position={[0, 0, 0]}>
      <CharacterModel config={config} showWeapon />
    </group>
  )
}
