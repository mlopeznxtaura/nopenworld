import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from 'react'
import { getQuest, QUESTS } from './quests'
import { getShrineDef } from './shrineCatalog'

export type Notification = {
  id: number
  text: string
  kind: 'success' | 'quest' | 'item'
}

export type ProgressSnapshot = {
  spiritOrbs: number
  korokSeeds: number
  rupees: number
  shrinesCompleted: number
  mapRegionsUnlocked: number
  paragliderUnlocked: boolean
  activeQuestId: string | null
  questProgress: Record<string, number>
  questCompleted: Set<string>
  notifications: Notification[]
}

type ProgressStore = {
  snapRef: { current: ProgressSnapshot }
  isChestOpened: (id: string) => boolean
  isShrineComplete: (id: string) => boolean
  isKorokFound: (id: string) => boolean
  getShrinePuzzle: (id: string) => { torches?: boolean[]; targets?: boolean[]; plates?: boolean[] }
  openChest: (id: string) => boolean
  lightShrineTorch: (shrineId: string, index: number) => void
  hitShrineTarget: (shrineId: string, index: number) => void
  activateShrinePlate: (shrineId: string, index: number) => void
  completeShrine: (shrineId: string) => void
  findKorok: (id: string) => void
  activateBeacon: () => void
  advanceQuest: (questId: string, amount?: number) => void
  startQuest: (questId: string) => void
  pushNotification: (text: string, kind?: Notification['kind']) => void
  clearNotification: (id: number) => void
}

const ProgressContext = createContext<ProgressStore | null>(null)

let notifId = 0

export function ProgressProvider({
  children,
  onHeartReward,
  onRupeesReward,
  onRepairWeapon,
}: {
  children: ReactNode
  onHeartReward?: () => void
  onRupeesReward?: (n: number) => void
  onRepairWeapon?: () => void
}) {
  const openedChests = useRef(new Set<string>())
  const completedShrines = useRef(new Set<string>())
  const foundKoroks = useRef(new Set<string>())
  const shrinePuzzles = useRef<
    Record<string, { torches?: boolean[]; targets?: boolean[]; plates?: boolean[] }>
  >({})
  const questProgress = useRef<Record<string, number>>({})
  const questCompleted = useRef(new Set<string>())

  const snapRef = useRef<ProgressSnapshot>({
    spiritOrbs: 0,
    korokSeeds: 0,
    rupees: 0,
    shrinesCompleted: 0,
    mapRegionsUnlocked: 1,
    paragliderUnlocked: false,
    activeQuestId: 'first-shrine',
    questProgress: {},
    questCompleted: new Set(),
    notifications: [],
  })

  const pushNotification = useCallback((text: string, kind: Notification['kind'] = 'success') => {
    const n: Notification = { id: ++notifId, text, kind }
    snapRef.current.notifications = [...snapRef.current.notifications.slice(-4), n]
    setTimeout(() => {
      snapRef.current.notifications = snapRef.current.notifications.filter((x) => x.id !== n.id)
    }, 4500)
  }, [])

  const clearNotification = useCallback((id: number) => {
    snapRef.current.notifications = snapRef.current.notifications.filter((x) => x.id !== id)
  }, [])

  const completeQuestIfReady = useCallback(
    (questId: string) => {
      if (questCompleted.current.has(questId)) return
      const def = getQuest(questId)
      if (!def) return
      const prog = questProgress.current[questId] ?? 0
      if (prog < def.goal) return
      questCompleted.current.add(questId)
      snapRef.current.questCompleted = new Set(questCompleted.current)
      pushNotification(`Quest complete: ${def.title}`, 'quest')

      if (questId === 'first-shrine') {
        snapRef.current.rupees += 50
        onRupeesReward?.(50)
      }
      if (questId === 'korok-hunt') onHeartReward?.()
      if (questId === 'clear-camp') {
        snapRef.current.rupees += 30
        onRupeesReward?.(30)
        onRepairWeapon?.()
      }
    },
    [onHeartReward, onRupeesReward, onRepairWeapon, pushNotification],
  )

  const advanceQuest = useCallback(
    (questId: string, amount = 1) => {
      if (questCompleted.current.has(questId)) return
      questProgress.current[questId] = (questProgress.current[questId] ?? 0) + amount
      snapRef.current.questProgress = { ...questProgress.current }
      completeQuestIfReady(questId)
    },
    [completeQuestIfReady],
  )

  const startQuest = useCallback((questId: string) => {
    if (questCompleted.current.has(questId)) return
    snapRef.current.activeQuestId = questId
    pushNotification(`Quest started: ${getQuest(questId)?.title ?? questId}`, 'quest')
  }, [pushNotification])

  const completeShrine = useCallback(
    (shrineId: string) => {
      if (completedShrines.current.has(shrineId)) return
      completedShrines.current.add(shrineId)
      snapRef.current.spiritOrbs += 1
      snapRef.current.shrinesCompleted = completedShrines.current.size
      const def = getShrineDef(shrineId)
      pushNotification(def?.completeMessage ?? 'Spirit Orb obtained!', 'item')
      advanceQuest('first-shrine', 1)
    },
    [advanceQuest, pushNotification],
  )

  const puzzleComplete = useCallback(
    (shrineId: string, kind: 'torches' | 'targets' | 'plates', count: number) => {
      const p = shrinePuzzles.current[shrineId] ?? {}
      const arr =
        kind === 'torches' ? p.torches : kind === 'targets' ? p.targets : p.plates
      if (!arr || arr.length < count) return false
      return arr.slice(0, count).every(Boolean)
    },
    [],
  )

  const lightShrineTorch = useCallback(
    (shrineId: string, index: number) => {
      const def = getShrineDef(shrineId)
      const count = def?.puzzleCount ?? 3
      const p = shrinePuzzles.current[shrineId] ?? {}
      if (!p.torches) p.torches = Array(count).fill(false)
      if (p.torches[index]) return
      p.torches[index] = true
      shrinePuzzles.current[shrineId] = p
      const hint = def?.stepHints?.[index]
      pushNotification(hint ?? 'Torch lit', 'success')
      if (puzzleComplete(shrineId, 'torches', count)) completeShrine(shrineId)
    },
    [completeShrine, pushNotification, puzzleComplete],
  )

  const hitShrineTarget = useCallback(
    (shrineId: string, index: number) => {
      const def = getShrineDef(shrineId)
      const count = def?.puzzleCount ?? 3
      const p = shrinePuzzles.current[shrineId] ?? {}
      if (!p.targets) p.targets = Array(count).fill(false)
      if (p.targets[index]) return
      p.targets[index] = true
      shrinePuzzles.current[shrineId] = p
      const hint = def?.stepHints?.[index]
      pushNotification(hint ?? 'Target hit!', 'success')
      if (puzzleComplete(shrineId, 'targets', count)) completeShrine(shrineId)
    },
    [completeShrine, pushNotification, puzzleComplete],
  )

  const activateShrinePlate = useCallback(
    (shrineId: string, index: number) => {
      const def = getShrineDef(shrineId)
      const count = def?.puzzleCount ?? 3
      const p = shrinePuzzles.current[shrineId] ?? {}
      if (!p.plates) p.plates = Array(count).fill(false)
      if (p.plates[index]) return
      p.plates[index] = true
      shrinePuzzles.current[shrineId] = p
      const hint = def?.stepHints?.[index]
      pushNotification(hint ?? 'Stone plate activated', 'success')
      if (puzzleComplete(shrineId, 'plates', count)) completeShrine(shrineId)
    },
    [completeShrine, pushNotification, puzzleComplete],
  )

  const findKorok = useCallback(
    (id: string) => {
      if (foundKoroks.current.has(id)) return
      foundKoroks.current.add(id)
      snapRef.current.korokSeeds += 1
      pushNotification('Korok seed found!', 'item')
      advanceQuest('korok-hunt', 1)
    },
    [advanceQuest, pushNotification],
  )

  const openChest = useCallback(
    (id: string) => {
      if (openedChests.current.has(id)) return false
      openedChests.current.add(id)
      return true
    },
    [],
  )

  const activateBeacon = useCallback(() => {
    if (snapRef.current.mapRegionsUnlocked < 3) {
      snapRef.current.mapRegionsUnlocked = 3
      pushNotification('Map region revealed!', 'success')
    }
    if (!snapRef.current.paragliderUnlocked) {
      snapRef.current.paragliderUnlocked = true
      pushNotification('Paraglider acquired — glide while falling!', 'item')
    }
    advanceQuest('activate-beacon', 1)
  }, [advanceQuest, pushNotification])

  const store: ProgressStore = {
    snapRef,
    isChestOpened: (id) => openedChests.current.has(id),
    isShrineComplete: (id) => completedShrines.current.has(id),
    isKorokFound: (id) => foundKoroks.current.has(id),
    getShrinePuzzle: (id) => shrinePuzzles.current[id] ?? {},
    openChest,
    lightShrineTorch,
    hitShrineTarget,
    activateShrinePlate,
    completeShrine,
    findKorok,
    activateBeacon,
    advanceQuest,
    startQuest,
    pushNotification,
    clearNotification,
  }

  // Seed initial quest list for HUD
  snapRef.current.questProgress = { ...questProgress.current }
  snapRef.current.questCompleted = new Set(questCompleted.current)

  return <ProgressContext.Provider value={store}>{children}</ProgressContext.Provider>
}

export function useProgressStore() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgressStore outside ProgressProvider')
  return ctx
}

export function useQuestList() {
  return QUESTS
}
