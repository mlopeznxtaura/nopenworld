import { useEffect, useState } from 'react'
import { usePlayerStore } from '../game/playerState'
import { liveTimeSnapshot } from '../game/timeState'

export function SurvivalHUD() {
  const { snapRef } = usePlayerStore()
  const [ui, setUi] = useState({
    health: 5,
    stamina: 100,
    wood: 0,
    stone: 0,
    food: 0,
    hunger: 0,
    cold: 0,
    hitFlash: 0,
    isDaylight: true,
    nightFactor: 0,
  })

  useEffect(() => {
    const tick = () => {
      const s = snapRef.current
      const t = liveTimeSnapshot.current
      setUi({
        health: s.health,
        stamina: s.stamina,
        wood: s.wood,
        stone: s.stone,
        food: s.food,
        hunger: s.hunger,
        cold: s.cold,
        hitFlash: s.hitFlash,
        isDaylight: t.isDaylight,
        nightFactor: t.nightFactor,
      })
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [snapRef])

  const hpPct = (ui.health / 5) * 100
  const stPct = ui.stamina
  const hitOverlay = ui.hitFlash > 0.1

  return (
    <>
      {hitOverlay && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, transparent 40%, rgba(180,0,0,${ui.hitFlash * 0.5}) 100%)`,
          }}
        />
      )}

      <div className="absolute top-4 left-4 z-30 pointer-events-none space-y-2 text-white font-mono text-sm">
        {/* Health */}
        <div className="flex items-center gap-2">
          <span className="text-red-300 w-16">HEALTH</span>
          <div className="w-32 h-3 bg-black/50 rounded border border-white/20">
            <div
              className="h-full bg-red-500 rounded transition-all"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>
        {/* Stamina */}
        <div className="flex items-center gap-2">
          <span className="text-yellow-300 w-16">STAMINA</span>
          <div className="w-32 h-3 bg-black/50 rounded border border-white/20">
            <div
              className="h-full bg-yellow-400 rounded transition-all"
              style={{ width: `${stPct}%` }}
            />
          </div>
        </div>
        {/* Resources */}
        <div className="bg-black/40 px-3 py-2 rounded border border-white/15 space-y-1">
          <div>WOOD <span className="text-emerald-300">{ui.wood}</span></div>
          <div>STONE <span className="text-slate-300">{ui.stone}</span></div>
          <div>FOOD <span className="text-amber-300">{ui.food}</span></div>
        </div>
        {/* Survival pressure */}
        <div className="bg-black/40 px-3 py-1 rounded border border-white/10 text-xs text-white/70">
          <div>HUNGER {Math.round(ui.hunger)}%</div>
          <div>COLD {Math.round(ui.cold)}%</div>
        </div>
        {/* Day/night */}
        <div className="text-xs tracking-widest text-white/50">
          {ui.isDaylight ? '☀ DAY' : `☾ NIGHT ${Math.round(ui.nightFactor * 100)}%`}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-30 pointer-events-none text-white/40 text-xs font-mono">
        <div>F — chop / gather</div>
        <div>E — melee attack</div>
        <div>SHIFT — sprint</div>
      </div>
    </>
  )
}
