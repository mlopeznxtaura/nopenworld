import { useEffect, useState } from 'react'
import { usePlayerStore } from '../game/playerState'
import { useCharacter } from '../game/characterState'
import { useProgressStore, useQuestList } from '../game/progressState'
import { liveTimeSnapshot } from '../game/timeState'
import { SHRINE_TOTAL } from '../game/shrineCatalog'

export function SurvivalHUD() {
  const { snapRef } = usePlayerStore()
  const { snapRef: progressRef } = useProgressStore()
  const { viewMode } = useCharacter()
  const quests = useQuestList()
  const [ui, setUi] = useState({
    health: 5,
    maxHealth: 5,
    stamina: 100,
    wood: 0,
    stone: 0,
    food: 0,
    hunger: 0,
    cold: 0,
    hitFlash: 0,
    isDaylight: true,
    nightFactor: 0,
    weaponDurability: 100,
    isGliding: false,
    spiritOrbs: 0,
    korokSeeds: 0,
    rupees: 0,
    shrinesCompleted: 0,
    mapRegions: 1,
    paraglider: false,
    notifications: [] as { id: number; text: string; kind: string }[],
    activeQuestId: 'first-shrine' as string | null,
    questProgress: {} as Record<string, number>,
    questCompleted: new Set<string>(),
  })

  useEffect(() => {
    const tick = () => {
      const s = snapRef.current
      const p = progressRef.current
      const t = liveTimeSnapshot.current
      setUi({
        health: s.health,
        maxHealth: s.maxHealth,
        stamina: s.stamina,
        wood: s.wood,
        stone: s.stone,
        food: s.food,
        hunger: s.hunger,
        cold: s.cold,
        hitFlash: s.hitFlash,
        isDaylight: t.isDaylight,
        nightFactor: t.nightFactor,
        weaponDurability: s.weaponDurability,
        isGliding: s.isGliding,
        spiritOrbs: p.spiritOrbs,
        korokSeeds: p.korokSeeds,
        rupees: p.rupees,
        shrinesCompleted: p.shrinesCompleted,
        mapRegions: p.mapRegionsUnlocked,
        paraglider: p.paragliderUnlocked,
        notifications: [...p.notifications],
        activeQuestId: p.activeQuestId,
        questProgress: { ...p.questProgress },
        questCompleted: new Set(p.questCompleted),
      })
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [snapRef, progressRef])

  const hpPct = (ui.health / ui.maxHealth) * 100
  const stPct = ui.stamina
  const hitOverlay = ui.hitFlash > 0.1
  const activeQuest = quests.find((q) => q.id === ui.activeQuestId)
  const questProg = activeQuest ? (ui.questProgress[activeQuest.id] ?? 0) : 0

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

      {/* Notifications */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 space-y-2 pointer-events-none">
        {ui.notifications.map((n) => (
          <div
            key={n.id}
            className="bg-black/70 border border-white/20 px-4 py-2 rounded text-white text-sm font-mono animate-pulse"
          >
            {n.text}
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-4 z-30 pointer-events-none space-y-2 text-white font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="text-red-300 w-16">HEALTH</span>
          <div className="w-32 h-3 bg-black/50 rounded border border-white/20">
            <div
              className="h-full bg-red-500 rounded transition-all"
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-xs text-white/50">{ui.health}/{ui.maxHealth}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-300 w-16">STAMINA</span>
          <div className="w-32 h-3 bg-black/50 rounded border border-white/20">
            <div
              className="h-full bg-yellow-400 rounded transition-all"
              style={{ width: `${stPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-300 w-16">SWORD</span>
          <div className="w-32 h-2 bg-black/50 rounded border border-white/20">
            <div
              className="h-full bg-cyan-400 rounded transition-all"
              style={{ width: `${ui.weaponDurability}%` }}
            />
          </div>
        </div>
        <div className="bg-black/40 px-3 py-2 rounded border border-white/15 space-y-1">
          <div>WOOD <span className="text-emerald-300">{ui.wood}</span></div>
          <div>STONE <span className="text-slate-300">{ui.stone}</span></div>
          <div>FOOD <span className="text-amber-300">{ui.food}</span></div>
          <div>RUPEES <span className="text-green-300">{ui.rupees}</span></div>
        </div>
        <div className="bg-black/40 px-3 py-2 rounded border border-cyan-500/30 space-y-1 text-xs">
          <div>ORBS <span className="text-cyan-300">{ui.spiritOrbs}</span></div>
          <div>SEEDS <span className="text-lime-300">{ui.korokSeeds}</span></div>
          <div>SHRINES <span className="text-sky-300">{ui.shrinesCompleted}/{SHRINE_TOTAL}</span></div>
          <div>MAP <span className="text-blue-300">{ui.mapRegions}/3 regions</span></div>
          {ui.paraglider && <div className="text-cyan-200">PARAGLIDER READY</div>}
          {ui.isGliding && <div className="text-cyan-400 animate-pulse">GLIDING</div>}
        </div>
        <div className="bg-black/40 px-3 py-1 rounded border border-white/10 text-xs text-white/70">
          <div>HUNGER {Math.round(ui.hunger)}%</div>
          <div>COLD {Math.round(ui.cold)}%</div>
        </div>
        <div className="text-xs tracking-widest text-white/50">
          {ui.isDaylight ? '☀ DAY' : `☾ NIGHT ${Math.round(ui.nightFactor * 100)}%`}
        </div>
        <div className="text-xs text-white/40 mt-1">
          VIEW: {viewMode === 'first' ? '1ST PERSON' : '3RD PERSON'} · Tab to toggle
        </div>
      </div>

      {/* Quest log */}
      <div className="absolute top-4 right-4 z-30 pointer-events-none max-w-xs">
        <div className="bg-black/50 border border-amber-500/30 rounded px-3 py-2 text-white font-mono text-xs space-y-2">
          <div className="text-amber-300 tracking-widest text-[10px]">QUEST LOG</div>
          {activeQuest && !ui.questCompleted.has(activeQuest.id) ? (
            <div>
              <div className="text-amber-100 font-bold">{activeQuest.title}</div>
              <div className="text-white/60 mt-1">{activeQuest.description}</div>
              <div className="text-amber-400 mt-1">
                {questProg}/{activeQuest.goal} · {activeQuest.rewardText}
              </div>
            </div>
          ) : (
            <div className="text-white/40">Talk to NPCs (F) for new quests</div>
          )}
          <div className="text-white/30 text-[10px] border-t border-white/10 pt-2">
            Completed: {ui.questCompleted.size}/{quests.length}
          </div>
        </div>
      </div>

      {/* Mini map */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-none">
        <div className="w-28 h-28 bg-black/50 border border-white/20 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-slate-900/60" />
          {ui.mapRegions >= 2 && (
            <div className="absolute top-2 right-3 w-6 h-6 bg-cyan-500/30 rounded-full border border-cyan-400/50" />
          )}
          {ui.mapRegions >= 3 && (
            <div className="absolute bottom-3 left-2 w-8 h-8 bg-blue-500/30 rounded border border-blue-400/50" />
          )}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_white]" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-white/50">MAP</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-30 pointer-events-none text-white/40 text-xs font-mono space-y-0.5">
        <div>F — interact / gather / cook / talk</div>
        <div>E — melee attack</div>
        <div>SHIFT — sprint</div>
        <div>SPACE (falling) — glide with paraglider</div>
        <div>TAB — switch view (3rd person shows character)</div>
      </div>
    </>
  )
}
