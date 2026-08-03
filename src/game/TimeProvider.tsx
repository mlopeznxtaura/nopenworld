import { useFrame } from '@react-three/fiber'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { computeTimeSnapshot, type TimeSnapshot, liveTimeSnapshot } from './timeState'

const defaultSnap: TimeSnapshot = computeTimeSnapshot(0)

type TimeCtx = {
  snapshotRef: { current: TimeSnapshot }
}

const TimeContext = createContext<TimeCtx>({ snapshotRef: { current: defaultSnap } })

export function useTimeSnapshot() {
  return useContext(TimeContext).snapshotRef.current
}

export function useTimeRef() {
  return useContext(TimeContext).snapshotRef
}

export function TimeProvider({ children }: { children: ReactNode }) {
  const snapshotRef = useRef<TimeSnapshot>(defaultSnap)

  useFrame(({ clock }) => {
    snapshotRef.current = computeTimeSnapshot(clock.elapsedTime)
    liveTimeSnapshot.current = snapshotRef.current
  })

  return (
    <TimeContext.Provider value={{ snapshotRef }}>
      {children}
    </TimeContext.Provider>
  )
}
