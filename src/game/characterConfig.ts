export type CharacterBuild = 'slim' | 'broad'

export type CharacterConfig = {
  skinTone: string
  hairColor: string
  tunicColor: string
  trimColor: string
  gemColor: string
  scale: number
  build: CharacterBuild
}

export type ViewMode = 'first' | 'third'

export const DEFAULT_CHARACTER: CharacterConfig = {
  skinTone: '#6b4a32',
  hairColor: '#121010',
  tunicColor: '#4a7c45',
  trimColor: '#c87848',
  gemColor: '#9b7bff',
  scale: 1,
  build: 'broad',
}

export const CHARACTER_STORAGE_KEY = 'wild-breath-character-v2'

export function loadCharacterConfig(): CharacterConfig {
  try {
    const raw = sessionStorage.getItem(CHARACTER_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CHARACTER }
    const parsed = JSON.parse(raw) as Partial<CharacterConfig>
    return { ...DEFAULT_CHARACTER, ...parsed }
  } catch {
    return { ...DEFAULT_CHARACTER }
  }
}

export function saveCharacterConfig(config: CharacterConfig) {
  try {
    sessionStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* ignore quota / private mode */
  }
}

export const SKIN_PRESETS = [
  { id: 'fair', label: 'Fair', color: '#fce0d1' },
  { id: 'warm', label: 'Warm', color: '#e0ac69' },
  { id: 'tan', label: 'Tan', color: '#c68642' },
  { id: 'deep', label: 'Deep', color: '#6b4a32' },
]

export const HAIR_PRESETS = [
  { id: 'black', label: 'Black', color: '#121010' },
  { id: 'brown', label: 'Brown', color: '#4b2e1e' },
  { id: 'auburn', label: 'Auburn', color: '#8d3119' },
  { id: 'silver', label: 'Silver', color: '#c4c4c4' },
]

export const TUNIC_PRESETS = [
  { id: 'forest', label: 'Forest', color: '#4a7c45' },
  { id: 'pine', label: 'Pine', color: '#1c3b22' },
  { id: 'olive', label: 'Olive', color: '#556b2f' },
  { id: 'teal', label: 'Teal', color: '#1f7a7a' },
]

export const TRIM_PRESETS = [
  { id: 'gold', label: 'Gold', color: '#ffd700' },
  { id: 'bronze', label: 'Bronze', color: '#cd7f32' },
  { id: 'silver', label: 'Silver', color: '#c0c0c0' },
  { id: 'copper', label: 'Copper', color: '#c87848' },
]

export const GEM_PRESETS = [
  { id: 'arcane', label: 'Arcane', color: '#9b7bff' },
  { id: 'frost', label: 'Frost', color: '#70d6ff' },
  { id: 'ember', label: 'Ember', color: '#ff7043' },
  { id: 'void', label: 'Void', color: '#7a1fa2' },
]

/** Legacy field mapping for any stale references */
export type LegacyCharacterConfig = {
  bodyColor?: string
  hoodColor?: string
  lanternColor?: string
}
