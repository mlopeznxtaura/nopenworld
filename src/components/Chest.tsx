import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { useProgressStore } from '../game/progressState'
import { usePlayerStore } from '../game/playerState'
import { getTerrainHeight } from '../utils/noise'
import { playScrapeSound } from '../audio/spatial'

const INTERACT_RADIUS = 2.8

export type ChestLoot = {
  rupees?: number
  wood?: number
  stone?: number
  food?: number
  repair?: boolean
}

type ChestProps = {
  id: string
  x: number
  z: number
  loot: ChestLoot
  yOffset?: number
}

export function Chest({ id, x, z, loot, yOffset = 0 }: ChestProps) {
  const controls = usePlayerControls()
  const { positionRef, addWood, addStone, addFood, repairWeapon } = usePlayerStore()
  const { isChestOpened, openChest, pushNotification, advanceQuest, snapRef } = useProgressStore()
  const [opened, setOpened] = useState(isChestOpened(id))
  const cooldown = useRef(0)
  const glow = useRef(0)
  const y = getTerrainHeight(x, z) + yOffset

  useFrame((_, delta) => {
    glow.current += delta * 3
    if (opened) return
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - x, positionRef.current.z - z)
    if (dist > INTERACT_RADIUS) return
    cooldown.current = 0.6
    if (!openChest(id)) return
    setOpened(true)
    playScrapeSound()
    if (loot.rupees) {
      snapRef.current.rupees += loot.rupees
      pushNotification(`+${loot.rupees} rupees`, 'item')
    }
    if (loot.wood) addWood(loot.wood)
    if (loot.stone) addStone(loot.stone)
    if (loot.food) addFood(loot.food)
    if (loot.repair) {
      repairWeapon()
      pushNotification('Weapon repaired', 'item')
    }
    if (id.includes('camp')) advanceQuest('clear-camp', 1)
  })

  if (opened) {
    return (
      <group position={[x, y, z]}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.9, 0.15, 0.7]} />
          <meshStandardMaterial color="#4a4035" roughness={0.9} />
        </mesh>
      </group>
    )
  }

  const pulse = 0.6 + Math.sin(glow.current) * 0.4

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.9, 0.7, 0.7]} />
        <meshStandardMaterial
          color="#6a5840"
          emissive="#c8a050"
          emissiveIntensity={pulse * 0.8}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.95, 0.2, 0.75]} />
        <meshStandardMaterial color="#5a4838" roughness={0.8} />
      </mesh>
      <pointLight position={[0, 1, 0]} color="#ffd080" intensity={3 + pulse * 2} distance={6} decay={2} />
    </group>
  )
}
