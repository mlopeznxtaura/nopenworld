import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { useProgressStore } from '../game/progressState'
import { getTerrainHeight } from '../utils/noise'
import { playScrapeSound } from '../audio/spatial'

const INTERACT_RADIUS = 6

export function BeaconInteract() {
  const controls = usePlayerControls()
  const { positionRef } = usePlayerStore()
  const { activateBeacon, snapRef } = useProgressStore()
  const cooldown = useRef(0)
  const x = 80
  const z = -60
  const y = getTerrainHeight(x, z)

  useFrame((_, delta) => {
    if (snapRef.current.mapRegionsUnlocked >= 3) return
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - x, positionRef.current.z - z)
    if (dist > INTERACT_RADIUS) return
    cooldown.current = 2
    activateBeacon()
    playScrapeSound()
  })

  return null
}
