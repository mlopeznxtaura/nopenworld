import { useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { SceneEnvironment } from './components/Environment'
import { Player } from './components/Player'
import { Terrain } from './components/Terrain'
import { Structures } from './components/Structures'
import { WorldContent } from './components/WorldContent'
import { TimeProvider } from './game/TimeProvider'
import { PlayerProvider, usePlayerStore } from './game/playerState'
import { WorldProvider } from './game/worldState'
import { CharacterProvider } from './game/characterState'
import { ProgressProvider } from './game/progressState'
import { SurvivalHUD } from './ui/SurvivalHUD'
import { ShrineLessonHUD } from './ui/ShrineLessonHUD'
import { CharacterCustomization } from './ui/CharacterCustomization'
import { useState } from 'react'

type AppPhase = 'customize' | 'playing'

function ProgressBridge({ children }: { children: React.ReactNode }) {
  const { addHeartContainer, repairWeapon } = usePlayerStore()

  const onHeartReward = useCallback(() => {
    addHeartContainer()
  }, [addHeartContainer])

  const onRepairWeapon = useCallback(() => {
    repairWeapon()
  }, [repairWeapon])

  return (
    <ProgressProvider
      onHeartReward={onHeartReward}
      onRepairWeapon={onRepairWeapon}
    >
      {children}
    </ProgressProvider>
  )
}

function GameScene({ phase }: { phase: AppPhase }) {
  const playing = phase === 'playing'

  return (
    <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
      <TimeProvider>
        {playing && <PointerLockControls />}
        <SceneEnvironment />
        <Terrain />
        <Structures />
        {playing && (
          <>
            <Player />
            <WorldContent />
          </>
        )}
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.85} mipmapBlur intensity={0.9} />
          <Vignette offset={0.12} darkness={0.85} />
        </EffectComposer>
      </TimeProvider>
    </Canvas>
  )
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('customize')

  return (
    <CharacterProvider>
      <PlayerProvider>
        <WorldProvider>
          <ProgressBridge>
            <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative font-sans">
              {phase === 'playing' && (
                <div className="absolute inset-0 z-0">
                  <GameScene phase={phase} />
                </div>
              )}

              {phase === 'customize' && (
                <CharacterCustomization onStart={() => setPhase('playing')} />
              )}

              {phase === 'playing' && (
                <>
                  <SurvivalHUD />
                  <ShrineLessonHUD />
                  <div className="absolute top-4 left-0 right-0 text-center z-30 pointer-events-none">
                    <h1 className="text-white/20 text-xl font-bold tracking-[0.5em]">WILD BREATH</h1>
                  </div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" />
                </>
              )}
            </div>
          </ProgressBridge>
        </WorldProvider>
      </PlayerProvider>
    </CharacterProvider>
  )
}
