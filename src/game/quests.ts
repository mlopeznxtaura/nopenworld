export type QuestDef = {
  id: string
  title: string
  description: string
  goal: number
  rewardText: string
}

export const QUESTS: QuestDef[] = [
  {
    id: 'first-shrine',
    title: 'Trial of the Forest',
    description: 'Complete any shrine trial to earn a Spirit Orb.',
    goal: 1,
    rewardText: '+50 rupees',
  },
  {
    id: 'korok-hunt',
    title: 'Hidden Sprouts',
    description: 'Find forest spirits hiding in odd places.',
    goal: 3,
    rewardText: '+1 heart container',
  },
  {
    id: 'activate-beacon',
    title: 'Light the Beacon',
    description: 'Climb the hill and activate the ancient beacon tower.',
    goal: 1,
    rewardText: 'Paraglider + map region',
  },
  {
    id: 'clear-camp',
    title: 'Camp Raider',
    description: 'Defeat enemies at a monster camp and loot the chest.',
    goal: 1,
    rewardText: '+30 rupees + weapon repair',
  },
]

export function getQuest(id: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === id)
}
