import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { SceneEnvironment } from './components/Environment'
import { Player } from './components/Player'
import { Terrain } from './components/Terrain'
import { Structures } from './components/Structures'
import { WorldContent } from './components/WorldContent'
import { TimeProvider } from './game/TimeProvider'
import { PlayerProvider } from './game/playerState'
import { WorldProvider } from './game/worldState'
import { SurvivalHUD } from './ui/SurvivalHUD'
import { useState } from 'react'

function GameScene({ started }: { started: boolean }) {
  return (
    <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
      <TimeProvider>
        {started && <PointerLockControls />}
        <SceneEnvironment />
        <Terrain />
        <Structures />
        {started && (
          <>
            <Player />
            <WorldContent />
          </>
        )}
        <EffectComposer>
          <Bloom luminanceThreshold={0.78} mipmapBlur intensity={1.55} />
          <Vignette offset={0.12} darkness={1.15} />
        </EffectComposer>
      </TimeProvider>
    </Canvas>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)

  return (
    <PlayerProvider>
      <WorldProvider>
        <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative font-sans">
          <div className="absolute inset-0 z-0">
            <GameScene started={started} />
          </div>

          {!started && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white pointer-events-auto">
              <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-widest text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,113,0.8)]">
                WILD BREATH
              </h1>
              <p className="text-xl mb-12 text-emerald-100/80">Survival Action — gather, fight, survive the night</p>

              <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md mb-12 border border-white/20 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6 border-b border-white/20 pb-3 text-emerald-200">Controls</h2>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-center gap-4">
                    <span className="font-mono bg-white/20 px-3 py-1.5 rounded-lg text-emerald-50">W A S D</span>
                    <span>Move</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="font-mono bg-white/20 px-3 py-1.5 rounded-lg text-emerald-50">Mouse</span>
                    <span>Look & aim</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="font-mono bg-white/20 px-3 py-1.5 rounded-lg text-emerald-50">Space</span>
                    <span>Jump</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="font-mono bg-white/20 px-3 py-1.5 rounded-lg text-emerald-50">Shift</span>
                    <span>Sprint (stamina)</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="font-mono bg-white/20 px-3 py-1.5 rounded-lg text-emerald-50">F</span>
                    <span>Chop / gather</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="font-mono bg-white/20 px-3 py-1.5 rounded-lg text-emerald-50">E</span>
                    <span>Melee attack</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setStarted(true)}
                className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-2xl transition-all shadow-[0_0_30px_rgba(5,150,105,0.6)] hover:scale-105 hover:shadow-[0_0_40px_rgba(5,150,105,0.8)] cursor-pointer"
              >
                Enter the Forest
              </button>
            </div>
          )}

          {started && (
            <>
              <SurvivalHUD />
              <div className="absolute top-4 left-0 right-0 text-center z-30 pointer-events-none">
                <h1 className="text-white/20 text-xl font-bold tracking-[0.5em]">WILD BREATH</h1>
              </div>
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/50 rounded-full -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none" />
            </>
          )}
        </div>
      </WorldProvider>
    </PlayerProvider>
  )
}
