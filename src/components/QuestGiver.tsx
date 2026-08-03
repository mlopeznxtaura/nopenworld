import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { usePlayerStore } from '../game/playerState'
import { useProgressStore } from '../game/progressState'
import { getTerrainHeight } from '../utils/noise'
import { playScrapeSound } from '../audio/spatial'
import { useQuestList } from '../game/progressState'

const TALK_RADIUS = 5

export function QuestGiver() {
  const controls = usePlayerControls()
  const { positionRef } = usePlayerStore()
  const { startQuest, snapRef } = useProgressStore()
  const cooldown = useRef(0)
  const quests = useQuestList()
  const y = getTerrainHeight(-2, 3)

  useFrame((_, delta) => {
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x + 2, positionRef.current.z - 3)
    if (dist > TALK_RADIUS) return
    cooldown.current = 1.5

    const completed = snapRef.current.questCompleted
    const next = quests.find((q) => !completed.has(q.id))
    if (next) {
      startQuest(next.id)
      playScrapeSound()
    }
  })

  return (
    <group position={[-2, y, 3]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.75, 4, 8]} />
        <meshStandardMaterial color="#2a4a38" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.32, 8, 8]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, 0.25]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.35]} />
        <meshStandardMaterial color="#4a6a50" roughness={0.8} />
      </mesh>
      <pointLight position={[0, 2, 0]} color="#88ffaa" intensity={3} distance={5} decay={2} />
    </group>
  )
}

export function CabinQuestGiver() {
  const controls = usePlayerControls()
  const { positionRef } = usePlayerStore()
  const { startQuest, snapRef } = useProgressStore()
  const cooldown = useRef(0)
  const x = 78
  const z = -58
  const y = getTerrainHeight(x, z)

  useFrame((_, delta) => {
    if (cooldown.current > 0) cooldown.current -= delta
    if (!controls.interact || cooldown.current > 0) return
    const dist = Math.hypot(positionRef.current.x - x, positionRef.current.z - z)
    if (dist > TALK_RADIUS) return
    cooldown.current = 1.5
    if (!snapRef.current.questCompleted.has('korok-hunt')) {
      startQuest('korok-hunt')
      playScrapeSound()
    }
  })

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.7, 4, 8]} />
        <meshStandardMaterial color="#3a4a5a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#c8b8a0" roughness={0.8} />
      </mesh>
    </group>
  )
}
