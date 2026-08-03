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
  skinTone: '#c4a882',
  hairColor: '#121010',
  tunicColor: '#4a7c45',
  trimColor: '#d4af37',
  gemColor: '#5eb8ff',
  scale: 1,
  build: 'slim',
}

export const CHARACTER_STORAGE_KEY = 'wild-breath-character-v1'

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
  { id: 'fair', label: 'Fair', color: '#e8c9a8' },
  { id: 'warm', label: 'Warm', color: '#c4a882' },
  { id: 'tan', label: 'Tan', color: '#a07850' },
  { id: 'deep', label: 'Deep', color: '#6b4a32' },
]

export const HAIR_PRESETS = [
  { id: 'black', label: 'Black', color: '#121010' },
  { id: 'brown', label: 'Brown', color: '#2a1e14' },
  { id: 'auburn', label: 'Auburn', color: '#4a2818' },
  { id: 'silver', label: 'Silver', color: '#8a9098' },
]

export const TUNIC_PRESETS = [
  { id: 'forest', label: 'Forest', color: '#4a7c45' },
  { id: 'pine', label: 'Pine', color: '#2d5a3a' },
  { id: 'olive', label: 'Olive', color: '#5a6b40' },
  { id: 'teal', label: 'Teal', color: '#3a6a5a' },
]

export const TRIM_PRESETS = [
  { id: 'gold', label: 'Gold', color: '#d4af37' },
  { id: 'bronze', label: 'Bronze', color: '#b8860b' },
  { id: 'silver', label: 'Silver', color: '#c0c8d0' },
  { id: 'copper', label: 'Copper', color: '#c87848' },
]

export const GEM_PRESETS = [
  { id: 'arcane', label: 'Arcane', color: '#5eb8ff' },
  { id: 'frost', label: 'Frost', color: '#a8e8ff' },
  { id: 'ember', label: 'Ember', color: '#ff8844' },
  { id: 'void', label: 'Void', color: '#9b7bff' },
]

/** Legacy field mapping for any stale references */
export type LegacyCharacterConfig = {
  bodyColor?: string
  hoodColor?: string
  lanternColor?: string
}
