import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'
import * as THREE from 'three'

export type ChopEvent = {
  position: THREE.Vector3
  loud: boolean
}

type WorldStore = {
  emitChop: (x: number, y: number, z: number, loud?: boolean) => void
  subscribeChop: (fn: (e: ChopEvent) => void) => () => void
  choppedTreeIds: Set<string>
  markTreeChopped: (id: string) => void
  isTreeChopped: (id: string) => boolean
}

const WorldContext = createContext<WorldStore | null>(null)

export function WorldProvider({ children }: { children: ReactNode }) {
  const chopListeners = useRef<((e: ChopEvent) => void)[]>([])
  const chopped = useRef(new Set<string>())

  const emitChop = useCallback((x: number, y: number, z: number, loud = false) => {
    const e: ChopEvent = {
      position: new THREE.Vector3(x, y, z),
      loud,
    }
    chopListeners.current.forEach((fn) => fn(e))
  }, [])

  const subscribeChop = useCallback((fn: (e: ChopEvent) => void) => {
    chopListeners.current.push(fn)
    return () => {
      chopListeners.current = chopListeners.current.filter((f) => f !== fn)
    }
  }, [])

  const markTreeChopped = useCallback((id: string) => {
    chopped.current.add(id)
  }, [])

  const isTreeChopped = useCallback((id: string) => {
    return chopped.current.has(id)
  }, [])

  const store: WorldStore = {
    emitChop,
    subscribeChop,
    choppedTreeIds: chopped.current,
    markTreeChopped,
    isTreeChopped,
  }

  return <WorldContext.Provider value={store}>{children}</WorldContext.Provider>
}

export function useWorldStore() {
  const ctx = useContext(WorldContext)
  if (!ctx) throw new Error('useWorldStore outside WorldProvider')
  return ctx
}
