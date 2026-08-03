import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../game/playerState'
import { useProgressStore } from '../game/progressState'
import { SHRINE_CATALOG } from '../game/shrineCatalog'

const LESSON_RADIUS = 16

export function ShrineLessonHUD() {
  const { positionRef } = usePlayerStore()
  const { isShrineComplete } = useProgressStore()
  const seenRef = useRef(new Set<string>())
  const [lesson, setLesson] = useState<{
    title: string
    body: string
    name: string
  } | null>(null)

  useEffect(() => {
    const tick = () => {
      const px = positionRef.current.x
      const pz = positionRef.current.z
      let best: typeof lesson = null
      let bestDist = LESSON_RADIUS

      for (const s of SHRINE_CATALOG) {
        if (isShrineComplete(s.id)) continue
        const dist = Math.hypot(px - s.x, pz - s.z)
        if (dist < bestDist) {
          bestDist = dist
          best = {
            title: s.lessonTitle,
            body: s.lessonBody,
            name: s.name,
          }
          if (!seenRef.current.has(s.id)) {
            seenRef.current.add(s.id)
          }
        }
      }
      setLesson(best)
    }
    const id = setInterval(tick, 150)
    return () => clearInterval(id)
  }, [isShrineComplete, positionRef])

  if (!lesson) return null

  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-40 pointer-events-none max-w-lg w-[90%]">
      <div className="bg-black/75 border border-cyan-500/40 rounded-xl px-5 py-4 backdrop-blur-md shadow-lg">
        <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 mb-1">
          Shrine · {lesson.name}
        </div>
        <div className="text-cyan-100 font-bold text-sm mb-2">{lesson.title}</div>
        <div className="text-white/75 text-sm leading-relaxed">{lesson.body}</div>
      </div>
    </div>
  )
}
