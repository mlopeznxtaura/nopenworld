import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { registerMeleeTarget } from './Player'
import { usePlayerStore } from '../game/playerState'
import { useWorldStore } from '../game/worldState'
import { useTimeRef } from '../game/TimeProvider'
import { getTerrainHeight } from '../utils/noise'
import {
  playGrowlSound,
  playHitSound,
  startSprintLoop,
  stopSprintLoop,
} from '../audio/spatial'

type StalkerState = 'IdleWatch' | 'Alert' | 'Sprint' | 'Dead'

type StalkerWolfProps = {
  spawnX: number
  spawnZ: number
  id?: string
}

const ALERT_RADIUS = 45
const LOUD_ALERT_RADIUS = 70
const SPRINT_SPEED = 9
const NIGHT_SPEED_BONUS = 3

export function StalkerWolf({ spawnX, spawnZ, id = 'stalker-0' }: StalkerWolfProps) {
  const { positionRef, damage } = usePlayerStore()
  const { subscribeChop } = useWorldStore()
  const timeRef = useTimeRef()
  const groupRef = useRef<THREE.Group>(null)
  const posRef = useRef(new THREE.Vector3(spawnX, 0, spawnZ))
  const [state, setState] = useState<StalkerState>('IdleWatch')
  const stateRef = useRef<StalkerState>('IdleWatch')
  const [hits, setHits] = useState(0)
  const hitsRef = useRef(0)
  const [hitFlash, setHitFlash] = useState(0)
  const eyePulse = useRef(0)
  const lightRef = useRef<THREE.PointLight>(null)
  const damageCooldown = useRef(0)

  const y = getTerrainHeight(spawnX, spawnZ)
  posRef.current.y = y

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    hitsRef.current = hits
  }, [hits])

  useEffect(() => {
    return subscribeChop((e) => {
      if (stateRef.current === 'Dead') return
      const dist = posRef.current.distanceTo(e.position)
      const radius = e.loud ? LOUD_ALERT_RADIUS : ALERT_RADIUS
      if (dist < radius) {
        setState('Alert')
        playGrowlSound()
        setTimeout(() => setState('Sprint'), 600)
      }
    })
  }, [subscribeChop])

  useEffect(() => {
    if (state === 'Dead') {
      stopSprintLoop()
      return
    }
    if (state === 'Sprint') {
      startSprintLoop()
      return () => stopSprintLoop()
    }
    stopSprintLoop()
  }, [state])

  useEffect(() => {
    const pos = posRef.current
    return registerMeleeTarget({
      position: pos,
      radius: 1.8,
      onHit: () => {
        if (stateRef.current === 'Dead') return
        playHitSound()
        setHitFlash(1)
        const next = hitsRef.current + 1
        hitsRef.current = next
        setHits(next)
        if (next >= 3) {
          setState('Dead')
          stopSprintLoop()
        } else {
          setState('Alert')
        }
      },
    })
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current || state === 'Dead') return

    eyePulse.current += delta * 4
    const pulse = 0.5 + Math.sin(eyePulse.current) * 0.5
    if (lightRef.current) {
      lightRef.current.intensity = 3 + pulse * 4
    }

    const time = timeRef.current
    const nightBoost = time.nightFactor * NIGHT_SPEED_BONUS
    const playerPos = positionRef.current

  // Sanctuary: lose interest near campfire (0,0) or beacon (80,-60)
    const fireDist = Math.hypot(playerPos.x, playerPos.z)
    const beaconDist = Math.hypot(playerPos.x - 80, playerPos.z + 60)
    if (fireDist < 14 || beaconDist < 18) {
      if (state === 'Sprint') setState('IdleWatch')
      return
    }

    if (damageCooldown.current > 0) damageCooldown.current -= delta

    if (state === 'Sprint') {
      const dir = new THREE.Vector3()
        .subVectors(playerPos, posRef.current)
      dir.y = 0
      const dist = dir.length()
      dir.normalize()
      const speed = (SPRINT_SPEED + nightBoost) * delta
      posRef.current.x += dir.x * speed
      posRef.current.z += dir.z * speed
      posRef.current.y = getTerrainHeight(posRef.current.x, posRef.current.z)

      if (dist < 1.8 && damageCooldown.current <= 0) {
        damage(1)
        damageCooldown.current = 1.1
        setState('Alert')
      }

      groupRef.current.rotation.y = Math.atan2(dir.x, dir.z)
    }

    if (hitFlash > 0) setHitFlash((f) => Math.max(0, f - delta * 3))

    groupRef.current.position.copy(posRef.current)
  })

  if (state === 'Dead') return null

  const emissive = hitFlash > 0 ? '#ff4444' : '#cc0000'

  return (
    <group ref={groupRef} position={[spawnX, y, spawnZ]}>
      {/* Jagged wolf silhouette */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 1.2]} />
        <meshStandardMaterial
          color={hitFlash > 0 ? '#ffaaaa' : '#0a0a10'}
          emissive={emissive}
          emissiveIntensity={hitFlash > 0 ? 2 : 0}
          roughness={0.9}
        />
      </mesh>
      {/* Sharp ears */}
      <mesh position={[0.2, 1.5, 0.3]} rotation={[0, 0, 0.4]} castShadow>
        <coneGeometry args={[0.12, 0.5, 4]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.95} />
      </mesh>
      <mesh position={[-0.2, 1.5, 0.3]} rotation={[0, 0, -0.4]} castShadow>
        <coneGeometry args={[0.12, 0.5, 4]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.95} />
      </mesh>
      {/* Back spike */}
      <mesh position={[0, 1.2, -0.5]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.6, 4]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.95} />
      </mesh>
      {/* Pulsing red eyes */}
      {['IdleWatch', 'Alert', 'Sprint'].includes(state) && (
        <>
          <mesh position={[0.18, 1.15, 0.55]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff2200"
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh position={[-0.18, 1.15, 0.55]}>
            <sphereGeometry args={[0.08, 6, 6]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff2200"
              emissiveIntensity={2.5}
            />
          </mesh>
          <pointLight
            ref={lightRef}
            position={[0, 1.15, 0.6]}
            color="#ff2200"
            intensity={5}
            distance={6}
            decay={2}
          />
        </>
      )}
    </group>
  )
}

export function StalkerPack() {
  const timeRef = useTimeRef()
  const [extraCount, setExtraCount] = useState(0)

  useFrame(() => {
    const nf = timeRef.current.nightFactor
    let e = 0
    if (nf > 0.3) e = 1
    if (nf > 0.6) e = 3
    if (e !== extraCount) setExtraCount(e)
  })

  const extras = [
    { x: -32, z: 28, id: 'stalker-1' },
    { x: 28, z: 35, id: 'stalker-2' },
    { x: -40, z: -20, id: 'stalker-3' },
  ]

  return (
    <>
      <StalkerWolf spawnX={35} spawnZ={-25} id="stalker-0" />
      {extras.slice(0, extraCount).map((s) => (
        <StalkerWolf key={s.id} id={s.id} spawnX={s.x} spawnZ={s.z} />
      ))}
    </>
  )
}
