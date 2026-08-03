import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { AnimationAction } from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import type { CharacterConfig } from '../game/characterConfig'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import {
  buildArcaneSword,
  buildBelt,
  buildChainSleeve,
  buildGauntlet,
  buildHair,
  buildSheathedBlades,
  buildSkinNeck,
  buildTabard,
  buildTail,
  findBone,
  tintHumanBase,
} from './adventurerGear'

useGLTF.preload('/models/Soldier.glb')

const WALK_ANIM_SPEED = 4.6
const RUN_ANIM_SPEED = 8.2

type CharacterModelProps = {
  config: CharacterConfig
  attackSwingRef?: { current: number }
  showWeapon?: boolean
  preview?: boolean
}

export function CharacterModel({
  config,
  attackSwingRef,
  showWeapon = true,
  preview = false,
}: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const swordRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const hipsRef = useRef<THREE.Bone | null>(null)
  const headMeshesRef = useRef<THREE.Object3D[]>([])
  const currentAction = useRef<AnimationAction | null>(null)

  const { scene, animations } = useGLTF('/models/Soldier.glb')
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene])
  const { actions, mixer } = useAnimations(animations, groupRef)
  const { moveStateRef } = usePlayerStore()
  const { viewModeRef } = useCharacter()

  const broad = config.build === 'broad' ? 1.08 : 1

  useEffect(() => {
    tintHumanBase(clone, config)
    hipsRef.current = findBone(clone, 'Hips')
    headMeshesRef.current = []
    clone.traverse((o) => {
      if (o instanceof THREE.SkinnedMesh && o.name.toLowerCase().includes('head')) {
        headMeshesRef.current.push(o)
      }
    })
  }, [clone, config])

  useEffect(() => {
    if (preview) {
      const idle = actions.Idle ?? Object.values(actions)[0]
      if (idle) idle.reset().fadeIn(0.3).play()
      return
    }
    const idle = actions.Idle
    if (idle) {
      idle.reset().fadeIn(0.3).play()
      currentAction.current = idle
    }
  }, [actions, preview])

  useEffect(() => {
    const cleanups: Array<() => void> = []

    const hips = findBone(clone, 'Hips')
    const head = findBone(clone, 'Head')
    const spine = findBone(clone, 'Spine2') ?? findBone(clone, 'Spine1') ?? findBone(clone, 'Spine')
    const rightHand = findBone(clone, 'RightHand')
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
      const neck = buildSkinNeck(config)
      head.add(neck)
      cleanups.push(() => head.remove(neck))

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
      const sleeve = buildChainSleeve(config.trimColor)
      sleeve.position.y = -0.18
      rightArm.add(sleeve)
      cleanups.push(() => rightArm.remove(sleeve))
    }
    if (leftArm) {
      const sleeve = buildChainSleeve(config.trimColor)
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
      const sword = buildArcaneSword(config.gemColor, config.trimColor)
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

  const fadeTo = (action: AnimationAction | null, duration = 0.25) => {
    if (!action || currentAction.current === action) return
    action.reset()
    action.setEffectiveWeight(1)
    action.fadeIn(duration).play()
    if (currentAction.current) currentAction.current.fadeOut(duration)
    currentAction.current = action
  }

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta)

    if (!preview) {
      const { isMoving, isSprinting, speed } = moveStateRef.current
      const idle = actions.Idle
      const walk = actions.Walk
      const run = actions.Run

      if (isMoving && isSprinting && run) {
        fadeTo(run, 0.2)
        run.timeScale = THREE.MathUtils.clamp(speed / RUN_ANIM_SPEED, 0.85, 1.25)
      } else if (isMoving && walk) {
        fadeTo(walk, 0.2)
        walk.timeScale = THREE.MathUtils.clamp(speed / WALK_ANIM_SPEED, 0.75, 1.35)
      } else if (idle) {
        fadeTo(idle, 0.35)
        idle.timeScale = 1
      }

      const hips = hipsRef.current
      if (hips) {
        hips.position.x = 0
        hips.position.z = 0
      }
    }

    if (!preview && viewModeRef.current === 'first') {
      headMeshesRef.current.forEach((m) => { m.visible = false })
    } else if (!preview) {
      headMeshesRef.current.forEach((m) => { m.visible = true })
    }

    if (tailRef.current) {
      const spd = preview ? 0 : moveStateRef.current.speed
      tailRef.current.rotation.x =
        0.15 + Math.sin(state.clock.elapsedTime * (1.1 + spd * 0.08)) * 0.05
    }

    if (swordRef.current && attackSwingRef) {
      const swing = attackSwingRef.current
      swordRef.current.rotation.x = 0.2 - swing * 2.6
      swordRef.current.rotation.z = -0.2 - swing * 0.5
    }
  })

  return (
    <group ref={groupRef} scale={config.scale * broad * 0.95}>
      <primitive object={clone} />
    </group>
  )
}

export function CharacterPreviewRig({ config }: { config: CharacterConfig }) {
  return (
    <group position={[0, -0.95, 0]} rotation={[0, Math.PI, 0]}>
      <CharacterModel config={config} showWeapon preview />
    </group>
  )
}
