import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { CharacterConfig } from '../game/characterConfig'
import {
  buildArcaneSword,
  buildBelt,
  buildChainSleeve,
  buildGauntlet,
  buildHair,
  buildSheathedBlades,
  buildTabard,
  buildTail,
  findBone,
  tintHumanBase,
} from './adventurerGear'

useGLTF.preload('/models/Soldier.glb')

type CharacterModelProps = {
  config: CharacterConfig
  attackSwingRef?: { current: number }
  showWeapon?: boolean
}

export function CharacterModel({
  config,
  attackSwingRef,
  showWeapon = true,
}: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const swordRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF('/models/Soldier.glb')
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene])
  const { actions } = useAnimations(animations, groupRef)

  const broad = config.build === 'broad' ? 1.08 : 1

  useEffect(() => {
    tintHumanBase(clone, config)
  }, [clone, config])

  useEffect(() => {
    const idle = actions.Idle ?? actions['Character_Idle'] ?? Object.values(actions)[0]
    if (idle) {
      idle.reset().fadeIn(0.2).play()
    }
  }, [actions])

  useEffect(() => {
    const cleanups: Array<() => void> = []

    const hips = findBone(clone, 'Hips')
    const head = findBone(clone, 'Head')
    const spine = findBone(clone, 'Spine2') ?? findBone(clone, 'Spine1') ?? findBone(clone, 'Spine')
    const rightHand = findBone(clone, 'RightHand')
    const leftHand = findBone(clone, 'LeftHand')
    const rightForeArm = findBone(clone, 'RightForeArm')
    const leftForeArm = findBone(clone, 'LeftForeArm')
    const rightArm = findBone(clone, 'RightArm')
    const leftArm = findBone(clone, 'LeftArm')

    if (hips) {
      const tail = buildTail(config)
      hips.add(tail)
      tailRef.current = tail
      cleanups.push(() => hips.remove(tail))

      const belt = buildBelt(config)
      hips.add(belt)
      cleanups.push(() => hips.remove(belt))

      const sheaths = buildSheathedBlades()
      hips.add(sheaths)
      cleanups.push(() => hips.remove(sheaths))
    }

    if (head) {
      const hair = buildHair(config)
      head.add(hair)
      cleanups.push(() => head.remove(hair))
    }

    if (spine) {
      const tabard = buildTabard(config)
      spine.add(tabard)
      cleanups.push(() => spine.remove(tabard))
    }

    if (rightArm) {
      const sleeve = buildChainSleeve()
      sleeve.position.y = -0.18
      rightArm.add(sleeve)
      cleanups.push(() => rightArm.remove(sleeve))
    }
    if (leftArm) {
      const sleeve = buildChainSleeve()
      sleeve.position.y = -0.18
      leftArm.add(sleeve)
      cleanups.push(() => leftArm.remove(sleeve))
    }

    if (rightForeArm) {
      const gauntlet = buildGauntlet(config.gemColor)
      rightForeArm.add(gauntlet)
      gauntlet.position.set(0, -0.12, 0.04)
      cleanups.push(() => rightForeArm.remove(gauntlet))
    }
    if (leftForeArm) {
      const gauntlet = buildGauntlet(config.gemColor)
      leftForeArm.add(gauntlet)
      gauntlet.position.set(0, -0.12, 0.04)
      cleanups.push(() => leftForeArm.remove(gauntlet))
    }

    if (rightHand && showWeapon) {
      const sword = buildArcaneSword(config.gemColor)
      rightHand.add(sword)
      swordRef.current = sword
      sword.position.set(0, 0.08, 0.1)
      cleanups.push(() => {
        rightHand.remove(sword)
        swordRef.current = null
      })
    }

    return () => cleanups.forEach((fn) => fn())
  }, [clone, config, showWeapon])

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.x =
        0.15 + Math.sin(state.clock.elapsedTime * 1.1) * 0.05
    }
    if (swordRef.current && attackSwingRef) {
      const swing = attackSwingRef.current
      swordRef.current.rotation.x = 0.2 - swing * 2.6
      swordRef.current.rotation.z = -0.2 - swing * 0.5
    }
  })

  return (
    <group ref={groupRef} scale={config.scale * broad * 0.95} rotation={[0, Math.PI, 0]}>
      <primitive object={clone} />
    </group>
  )
}

export function CharacterPreviewRig({ config }: { config: CharacterConfig }) {
  return (
    <group position={[0, -0.95, 0]}>
      <CharacterModel config={config} showWeapon />
    </group>
  )
}
