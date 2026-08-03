import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { getTerrainHeight } from '../utils/noise'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import { playClangSound } from '../audio/spatial'
import { useProgressStore } from '../game/progressState'
import { attackSwingRef } from './PlayerAvatar'

const GLIDE_FALL_SPEED = 3.5
const GLIDE_STAMINA_DRAIN = 8

/** Tuned to match Soldier.glb walk cycle foot speed */
const WALK_SPEED = 4.6
const SPRINT_SPEED = 8.2
const JUMP_FORCE = 8
const GRAVITY = 28
const PLAYER_HEIGHT = 1.75
const STAMINA_SPRINT_DRAIN = 18
const STAMINA_REGEN = 22
const SPAWN_X = 5
const SPAWN_Z = 4
const THIRD_PERSON_DIST = 4.8
const THIRD_PERSON_HEIGHT = 1.35
const ACCEL = 22
const DECEL = 28

export type MeleeTarget = {
  position: THREE.Vector3
  radius: number
  onHit: () => void
}

const meleeTargets: MeleeTarget[] = []

export function registerMeleeTarget(t: MeleeTarget) {
  meleeTargets.push(t)
  return () => {
    const i = meleeTargets.indexOf(t)
    if (i >= 0) meleeTargets.splice(i, 1)
  }
}

export function Player() {
  const { camera } = useThree()
  const controls = usePlayerControls()
  const { viewModeRef, toggleViewMode } = useCharacter()
  const {
    positionRef,
    moveStateRef,
    setPosition,
    useStamina,
    regenStamina,
    setSprinting,
    setMoving,
    setGliding,
    triggerScreenShake,
    snapRef,
    tickSurvival,
    useWeaponDurability,
  } = usePlayerStore()
  const { snapRef: progressRef } = useProgressStore()

  const velocityY = useRef(0)
  const horizontalVel = useRef(new THREE.Vector3())
  const inputDir = useRef(new THREE.Vector3())
  const attackCooldown = useRef(0)
  const spawned = useRef(false)
  const cameraGoal = useRef(new THREE.Vector3())
  const shakeOffset = useRef(new THREE.Vector3())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault()
        toggleViewMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleViewMode])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    if (!spawned.current) {
      const ground = getTerrainHeight(SPAWN_X, SPAWN_Z)
      positionRef.current.set(SPAWN_X, ground + PLAYER_HEIGHT, SPAWN_Z)
      cameraGoal.current.copy(positionRef.current)
      spawned.current = true
    }

    const { forward, backward, left, right, jump, sprint, attack } = controls
    const moving = forward || backward || left || right

    let targetSpeed = WALK_SPEED
    const canSprint = sprint && moving && snapRef.current.stamina > 5
    if (canSprint) {
      targetSpeed = SPRINT_SPEED
      setSprinting(true)
      if (!useStamina(STAMINA_SPRINT_DRAIN * dt)) {
        targetSpeed = WALK_SPEED
        setSprinting(false)
      }
    } else {
      setSprinting(false)
      if (!moving && !attack) regenStamina(STAMINA_REGEN * dt)
    }

    setMoving(moving)
    tickSurvival(0.02 * dt, 0)

    inputDir.current
      .set((right ? 1 : 0) - (left ? 1 : 0), 0, (backward ? 1 : 0) - (forward ? 1 : 0))

    if (inputDir.current.lengthSq() > 0) {
      inputDir.current.normalize()
      inputDir.current.applyEuler(camera.rotation)
      inputDir.current.y = 0
      inputDir.current.normalize()
    }

    const targetVel = inputDir.current.clone().multiplyScalar(moving ? targetSpeed : 0)
    const blend = moving ? 1 - Math.exp(-ACCEL * dt) : 1 - Math.exp(-DECEL * dt)
    horizontalVel.current.lerp(targetVel, blend)

    const speed = horizontalVel.current.length()
    moveStateRef.current.isMoving = speed > 0.15
    moveStateRef.current.isSprinting = canSprint && speed > WALK_SPEED * 0.85
    moveStateRef.current.speed = speed
    if (speed > 0.15) {
      moveStateRef.current.moveYaw = Math.atan2(horizontalVel.current.x, horizontalVel.current.z)
    }

    velocityY.current -= GRAVITY * dt

    const groundHeight = getTerrainHeight(positionRef.current.x, positionRef.current.z)
    const targetY = groundHeight + PLAYER_HEIGHT
    const airborne = positionRef.current.y > targetY + 0.15
    const canGlide =
      progressRef.current.paragliderUnlocked &&
      airborne &&
      velocityY.current < -1 &&
      jump

    if (canGlide) {
      setGliding(true)
      velocityY.current = Math.max(velocityY.current, -GLIDE_FALL_SPEED)
      if (!useStamina(GLIDE_STAMINA_DRAIN * dt)) {
        setGliding(false)
      }
    } else {
      setGliding(false)
    }

    positionRef.current.x += horizontalVel.current.x * dt
    positionRef.current.z += horizontalVel.current.z * dt
    positionRef.current.y += velocityY.current * dt

    if (positionRef.current.y < targetY) {
      positionRef.current.y = targetY
      velocityY.current = 0
      if (jump) velocityY.current = JUMP_FORCE
    } else {
      positionRef.current.y += (targetY - positionRef.current.y) * Math.min(1, 14 * dt)
    }

    setPosition(
      positionRef.current.x,
      positionRef.current.y,
      positionRef.current.z,
    )

    if (attackCooldown.current > 0) attackCooldown.current -= dt

    if (attack && attackCooldown.current <= 0 && useStamina(18)) {
      if (snapRef.current.weaponDurability <= 0) {
        attackCooldown.current = 0.3
      } else {
        useWeaponDurability(8)
        attackCooldown.current = 0.45
        attackSwingRef.current = 0.25
        triggerScreenShake(0.06)

        const forwardVec = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation)
        forwardVec.y = 0
        forwardVec.normalize()
        const hitPoint = positionRef.current.clone().add(forwardVec.multiplyScalar(2.2))

        for (const t of meleeTargets) {
          if (hitPoint.distanceTo(t.position) < t.radius + 2) {
            t.onHit()
            playClangSound()
            triggerScreenShake(0.12)
            break
          }
        }
      }
    }

    const yaw = camera.rotation.y
    const desiredCam = new THREE.Vector3()
    if (viewModeRef.current === 'third') {
      desiredCam.set(
        positionRef.current.x + Math.sin(yaw) * THIRD_PERSON_DIST,
        positionRef.current.y + THIRD_PERSON_HEIGHT,
        positionRef.current.z + Math.cos(yaw) * THIRD_PERSON_DIST,
      )
    } else {
      desiredCam.copy(positionRef.current)
    }

    cameraGoal.current.lerp(desiredCam, 1 - Math.exp(-10 * dt))

    if (snapRef.current.screenShake > 0) {
      shakeOffset.current.set(
        (Math.random() - 0.5) * snapRef.current.screenShake,
        (Math.random() - 0.5) * snapRef.current.screenShake,
        0,
      )
    } else {
      shakeOffset.current.set(0, 0, 0)
    }

    camera.position.copy(cameraGoal.current).add(shakeOffset.current)
  })

  return null
}
