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
    id: 'shrine-combo',
    name: 'Strike Sequence',
    x: -32,
    z: -18,
    puzzle: 'target',
    puzzleCount: 3,
    lessonTitle: 'Combat Flow',
    lessonBody:
      'Stalker wolves take multiple hits. Clear targets one by one — don’t let enemies surround you at night.',
    stepHints: ['Target down!', 'Second foe — keep spacing.', 'Sequence complete — chain your strikes.'],
    completeMessage: 'Strike Sequence complete — wolves need 3 hits; plan your swings.',
    difficulty: 'medium',
    offsets: [[-2.5, 0], [0, -2.5], [2.5, 0]],
  },
  {
    id: 'shrine-night',
    name: 'Moon Watch',
    x: -18,
    z: 28,
    puzzle: 'torch',
    puzzleCount: 3,
    lessonTitle: 'Night Danger',
    lessonBody:
      'Nights spawn extra wolves and raise COLD. Hunger also kills at 100%. Gather food and light before sunset.',
    stepHints: ['Moon flame 1.', 'Moon flame 2.', 'The wild sleeps uneasy — be ready.'],
    completeMessage: 'Moon Watch complete — nights are lethal; prepare or hide in sanctuary.',
    difficulty: 'medium',
    offsets: DEFAULT_TORCH,
  },
  {
    id: 'shrine-stealth',
    name: 'Quiet Steps',
    x: -24,
    z: -24,
    puzzle: 'torch',
    puzzleCount: 2,
    lessonTitle: 'Noise & Wolves',
    lessonBody:
      'Loud tree chops alert wolves from far away. Chop trees carefully — or fight what your noise summons.',
    stepHints: ['Quiet flame 1.', 'Silence is armor — loud chops draw stalkers.'],
    completeMessage: 'Quiet Steps complete — chopping alerts predators across the forest.',
    difficulty: 'medium',
    offsets: [[-2, 0], [2, 0]],
  },
  {
    id: 'shrine-explore',
    name: 'Path Trial',
    x: 38,
    z: 22,
    puzzle: 'plates',
    puzzleCount: 3,
    lessonTitle: 'Exploration',
    lessonBody:
      'Korok seeds hide in odd places. Chests glow in camps and ruins. Tab toggles third person for navigation.',
    stepHints: ['Path stone 1.', 'Path stone 2.', 'Walk the wild — secrets reward the curious.'],
    completeMessage: 'Path Trial complete — hunt seeds, chests, and shrines for orbs.',
    difficulty: 'medium',
    offsets: DEFAULT_PLATES,
  },
  {
    id: 'shrine-ruins',
    name: 'Ruins Trial',
    x: -42,
    z: 22,
    puzzle: 'target',
    puzzleCount: 3,
    lessonTitle: 'Target Practice',
    lessonBody:
      'Walk within melee range of red targets, face them, and press E. Position and aim matter in real combat.',
    stepHints: ['Ruins target 1!', 'Target 2 — strafe and strike.', 'Ruins cleared — aim before you swing.'],
    completeMessage: 'Ruins Trial complete — close distance before attacking.',
    difficulty: 'medium',
    offsets: DEFAULT_TARGET,
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
  {
    id: 'shrine-beacon',
    name: 'Tower Lore',
    x: 65,
    z: -48,
    puzzle: 'plates',
    puzzleCount: 3,
    lessonTitle: 'Beacon Tower',
    lessonBody:
      'The ancient beacon on the hill reveals map regions and grants the paraglider. Follow the worn path from camp.',
    stepHints: ['Tower step 1.', 'Tower step 2.', 'Climb high — the beacon guides wanderers.'],
    completeMessage: 'Tower Lore complete — activate the beacon with F on the hill.',
    difficulty: 'hard',
    offsets: [[0, -2.5], [-2, 1], [2, 1]],
  },
  {
    id: 'shrine-hill',
    name: 'Hill Trial',
    x: 50,
    z: -32,
    puzzle: 'plates',
    puzzleCount: 3,
    lessonTitle: 'Patience Trial',
    lessonBody:
      'Stand on each stone plate until it glows green. Some trials reward patience over raw speed.',
    stepHints: ['Plate 1 holding.', 'Plate 2 — stand firm.', 'Hill conquered — patience is a weapon.'],
    completeMessage: 'Hill Trial complete — hold on plates to solve stone puzzles.',
    difficulty: 'hard',
    offsets: DEFAULT_PLATES,
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
