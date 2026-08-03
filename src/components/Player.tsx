import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { getTerrainHeight } from '../utils/noise'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import { playClangSound } from '../audio/spatial'
import { attackSwingRef } from './PlayerAvatar'

const WALK_SPEED = 8
const SPRINT_SPEED = 13
const JUMP_FORCE = 8
const GRAVITY = 30
const PLAYER_HEIGHT = 2
const STAMINA_SPRINT_DRAIN = 18
const STAMINA_REGEN = 22
const SPAWN_X = 5
const SPAWN_Z = 4
const THIRD_PERSON_DIST = 4.8
const THIRD_PERSON_HEIGHT = 1.6

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
    setPosition,
    useStamina,
    regenStamina,
    setSprinting,
    triggerScreenShake,
    snapRef,
    tickSurvival,
  } = usePlayerStore()

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const attackCooldown = useRef(0)
  const spawned = useRef(false)

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

  useFrame((state, delta) => {
    if (!spawned.current) {
      const ground = getTerrainHeight(SPAWN_X, SPAWN_Z)
      positionRef.current.set(SPAWN_X, ground + PLAYER_HEIGHT, SPAWN_Z)
      spawned.current = true
    }

    const { forward, backward, left, right, jump, sprint, attack } = controls
    const moving = forward || backward || left || right

    let speed = WALK_SPEED
    const canSprint = sprint && moving && snapRef.current.stamina > 5
    if (canSprint) {
      speed = SPRINT_SPEED
      setSprinting(true)
      if (!useStamina(STAMINA_SPRINT_DRAIN * delta)) {
        speed = WALK_SPEED
        setSprinting(false)
      }
    } else {
      setSprinting(false)
      if (!moving && !attack) regenStamina(STAMINA_REGEN * delta)
    }

    tickSurvival(0.02 * delta, 0)

    velocity.current.y -= GRAVITY * delta

    direction.current
      .set((right ? 1 : 0) - (left ? 1 : 0), 0, (backward ? 1 : 0) - (forward ? 1 : 0))
      .normalize()
      .multiplyScalar(speed)

    direction.current.applyEuler(camera.rotation)
    direction.current.y = 0

    velocity.current.x = direction.current.x
    velocity.current.z = direction.current.z

    positionRef.current.x += velocity.current.x * delta
    positionRef.current.z += velocity.current.z * delta
    positionRef.current.y += velocity.current.y * delta

    const groundHeight = getTerrainHeight(positionRef.current.x, positionRef.current.z)

    if (positionRef.current.y < groundHeight + PLAYER_HEIGHT) {
      positionRef.current.y = groundHeight + PLAYER_HEIGHT
      velocity.current.y = 0
      if (jump) velocity.current.y = JUMP_FORCE
    }

    setPosition(
      positionRef.current.x,
      positionRef.current.y,
      positionRef.current.z,
    )

    if (attackCooldown.current > 0) attackCooldown.current -= delta

    if (attack && attackCooldown.current <= 0 && useStamina(18)) {
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

    if (snapRef.current.screenShake > 0) {
      camera.position.x += (Math.random() - 0.5) * snapRef.current.screenShake
      camera.position.y += (Math.random() - 0.5) * snapRef.current.screenShake
    }

    const yaw = camera.rotation.y
    if (viewModeRef.current === 'third') {
      camera.position.set(
        positionRef.current.x + Math.sin(yaw) * THIRD_PERSON_DIST,
        positionRef.current.y + THIRD_PERSON_HEIGHT,
        positionRef.current.z + Math.cos(yaw) * THIRD_PERSON_DIST,
      )
    } else {
      camera.position.copy(positionRef.current)
    }
  })

  return null
}
