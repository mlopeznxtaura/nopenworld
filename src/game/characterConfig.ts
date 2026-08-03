export type CharacterBuild = 'slim' | 'broad'

export type CharacterConfig = {
  bodyColor: string
  hoodColor: string
  lanternColor: string
  scale: number
  build: CharacterBuild
}

export type ViewMode = 'first' | 'third'

export const DEFAULT_CHARACTER: CharacterConfig = {
  bodyColor: '#0a0a12',
  hoodColor: '#4cc9f0',
  lanternColor: '#ffcc66',
  scale: 1,
  build: 'slim',
}

export const HOOD_PRESETS = [
  { id: 'cyan', label: 'Frost', color: '#4cc9f0' },
  { id: 'emerald', label: 'Forest', color: '#34d399' },
  { id: 'amber', label: 'Ember', color: '#fbbf24' },
  { id: 'rose', label: 'Blood', color: '#f87171' },
  { id: 'violet', label: 'Void', color: '#a78bfa' },
]

export const BODY_PRESETS = [
  { id: 'shadow', label: 'Shadow', color: '#0a0a12' },
  { id: 'charcoal', label: 'Charcoal', color: '#1a1820' },
  { id: 'earth', label: 'Earth', color: '#2a2218' },
  { id: 'moss', label: 'Moss', color: '#1a2830' },
]

export const LANTERN_PRESETS = [
  { id: 'gold', label: 'Gold', color: '#ffcc66' },
  { id: 'warm', label: 'Warm', color: '#ff8844' },
  { id: 'pale', label: 'Pale', color: '#e8f4ff' },
  { id: 'green', label: 'Wisp', color: '#86efac' },
]
