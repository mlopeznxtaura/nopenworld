import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_CHARACTER,
  type CharacterConfig,
  type ViewMode,
} from './characterConfig'

type CharacterStore = {
  config: CharacterConfig
  setConfig: (patch: Partial<CharacterConfig>) => void
  viewModeRef: { current: ViewMode }
  viewMode: ViewMode
  toggleViewMode: () => void
}

const CharacterContext = createContext<CharacterStore | null>(null)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<CharacterConfig>(DEFAULT_CHARACTER)
  const viewModeRef = useRef<ViewMode>('first')
  const [viewMode, setViewMode] = useState<ViewMode>('first')

  const setConfig = useCallback((patch: Partial<CharacterConfig>) => {
    setConfigState((c) => ({ ...c, ...patch }))
  }, [])

  const toggleViewMode = useCallback(() => {
    const next: ViewMode = viewModeRef.current === 'first' ? 'third' : 'first'
    viewModeRef.current = next
    setViewMode(next)
  }, [])

  const store: CharacterStore = {
    config,
    setConfig,
    viewModeRef,
    viewMode,
    toggleViewMode,
  }

  return (
    <CharacterContext.Provider value={store}>{children}</CharacterContext.Provider>
  )
}

export function useCharacter() {
  const ctx = useContext(CharacterContext)
  if (!ctx) throw new Error('useCharacter outside CharacterProvider')
  return ctx
}
