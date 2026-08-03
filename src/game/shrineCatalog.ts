export type ShrinePuzzleType =
  | 'torch'
  | 'target'
  | 'plates'
  | 'sprint-plates'
  | 'glide-zone'

export type ShrineDefinition = {
  id: string
  name: string
  x: number
  z: number
  puzzle: ShrinePuzzleType
  puzzleCount: number
  lessonTitle: string
  lessonBody: string
  stepHints?: string[]
  completeMessage: string
  difficulty: 'easy' | 'medium' | 'hard'
  offsets?: [number, number][]
}

const DEFAULT_TORCH: [number, number][] = [
  [-2.5, -2],
  [2.5, -2],
  [0, 2.5],
]
const DEFAULT_TARGET: [number, number][] = [
  [-3, 0],
  [3, 0],
  [0, -3],
]
const DEFAULT_PLATES: [number, number][] = [
  [-3, 2.5],
  [3, 2.5],
  [0, -3],
]

export const SHRINE_CATALOG: ShrineDefinition[] = [
  {
    id: 'shrine-forest',
    name: 'Forest Trial',
    x: -16,
    z: -8,
    puzzle: 'torch',
    puzzleCount: 3,
    lessonTitle: 'Shrine Trials',
    lessonBody:
      'Light each torch with F to earn a Spirit Orb. Shrines across the wild teach combat, survival, and exploration.',
    stepHints: ['Torch 1 lit.', 'Torch 2 — keep exploring shrines.', 'Final torch! Orbs power your journey.'],
    completeMessage: 'Forest Trial complete — Spirit Orb obtained!',
    difficulty: 'easy',
    offsets: DEFAULT_TORCH,
  },
  {
    id: 'shrine-melee',
    name: 'Blade Trial',
    x: 14,
    z: -6,
    puzzle: 'target',
    puzzleCount: 2,
    lessonTitle: 'Melee Combat',
    lessonBody:
      'Press E to swing your sword. Each strike costs stamina — watch the yellow bar. Aim with your crosshair.',
    stepHints: ['First strike! Face foes before attacking.', 'Blade ready — wolves fear a steady hand.'],
    completeMessage: 'Blade Trial complete — you mastered melee (E).',
    difficulty: 'easy',
    offsets: [[-2, 0], [2, 0]],
  },
  {
    id: 'shrine-stamina',
    name: 'Wind Trial',
    x: 10,
    z: 18,
    puzzle: 'sprint-plates',
    puzzleCount: 3,
    lessonTitle: 'Sprint & Stamina',
    lessonBody:
      'Hold SHIFT while moving to sprint. Sprint drains stamina fast — walk to recover before fighting.',
    stepHints: ['Sprint gate 1!', 'Gate 2 — hold SHIFT through the ring.', 'Final gate! Stamina wins chases.'],
    completeMessage: 'Wind Trial complete — sprint with SHIFT to escape danger.',
    difficulty: 'easy',
    offsets: [[-2.5, -1], [0, 2], [2.5, -1]],
  },
  {
    id: 'shrine-gather',
    name: 'Offering Trial',
    x: -12,
    z: 14,
    puzzle: 'torch',
    puzzleCount: 3,
    lessonTitle: 'Gathering',
    lessonBody:
      'Press F near trees, stones, and berries to gather. Wood fuels campfires; food and stone stock your pack.',
    stepHints: ['Offering 1 — F gathers in the world.', 'Offering 2.', 'The forest rewards those who prepare.'],
    completeMessage: 'Offering Trial complete — gather with F across the wild.',
    difficulty: 'easy',
    offsets: [[-2, -2], [2, -2], [0, 2.2]],
  },
  {
    id: 'shrine-cook',
    name: 'Hearth Trial',
    x: 6,
    z: 10,
    puzzle: 'torch',
    puzzleCount: 2,
    lessonTitle: 'Cooking',
    lessonBody:
      'At the campfire cooking pot, press F while you carry food. Meals slash hunger, restore health, and warm you.',
    stepHints: ['Hearth flame 1.', 'Cook at base camp anytime — survival starts at the fire.'],
    completeMessage: 'Hearth Trial complete — cook meals at the campfire pot (F).',
    difficulty: 'easy',
    offsets: [[-1.5, 0], [1.5, 0]],
  },
  {
    id: 'shrine-cold',
    name: 'Ember Refuge',
    x: -22,
    z: 6,
    puzzle: 'plates',
    puzzleCount: 2,
    lessonTitle: 'Cold & Sanctuary',
    lessonBody:
      'At night COLD rises and hurts at 100%. Campfires, the beacon, and hill cabin are sanctuaries — light slows the freeze.',
    stepHints: ['Warm plate 1.', 'Seek light when the moon is high.'],
    completeMessage: 'Ember Refuge complete — stay near fire and shelter at night.',
    difficulty: 'easy',
    offsets: [[-2, 0], [2, 0]],
  },
  {
    id: 'shrine-durability',
    name: 'Steel Lesson',
    x: 28,
    z: -14,
    puzzle: 'target',
    puzzleCount: 4,
    lessonTitle: 'Weapon Durability',
    lessonBody:
      'Every attack wears your blade. Watch the SWORD bar on your HUD. Monster camp chests repair your weapon.',
    stepHints: ['Strike 1.', 'Strike 2 — blade wears with each blow.', 'Strike 3!', 'Steel tempered — repair at camps.'],
    completeMessage: 'Steel Lesson complete — mind sword durability in long fights.',
    difficulty: 'medium',
    offsets: [[-2.5, -1], [2.5, -1], [-2.5, 1.5], [2.5, 1.5]],
  },
  {
    id: 'shrine-glide',
    name: 'Sky Trial',
    x: 48,
    z: -28,
    puzzle: 'glide-zone',
    puzzleCount: 2,
    lessonTitle: 'Paraglider',
    lessonBody:
      'Activate the hill beacon (F) to unlock the paraglider. Jump from height and hold SPACE while falling to glide.',
    stepHints: ['Sky ring 1 — glide or stand if you lack wings.', 'Sky ring 2 — glide drains stamina slowly.'],
    completeMessage: 'Sky Trial complete — glide with SPACE after unlocking at the beacon.',
    difficulty: 'hard',
    offsets: [[-3, 0], [3, 0]],
  },
]

export const SHRINE_TOTAL = SHRINE_CATALOG.length

export function getShrineDef(id: string): ShrineDefinition | undefined {
  return SHRINE_CATALOG.find((s) => s.id === id)
}

export function getShrineOffsets(def: ShrineDefinition): [number, number][] {
  if (def.offsets) return def.offsets.slice(0, def.puzzleCount)
  switch (def.puzzle) {
    case 'torch':
      return DEFAULT_TORCH.slice(0, def.puzzleCount)
    case 'target':
      return DEFAULT_TARGET.slice(0, def.puzzleCount)
    default:
      return DEFAULT_PLATES.slice(0, def.puzzleCount)
  }
}
