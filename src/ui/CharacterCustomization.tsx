import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { CharacterPreviewScene } from '../components/CharacterPreviewScene'
import {
  SKIN_PRESETS,
  HAIR_PRESETS,
  TUNIC_PRESETS,
  TRIM_PRESETS,
  GEM_PRESETS,
  type CharacterBuild,
  type CharacterConfig,
} from '../game/characterConfig'
import { useCharacter } from '../game/characterState'

type CharacterCustomizationProps = {
  onStart: () => void
}

function PreviewLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#8ab4d0] z-10">
      <div className="text-center text-white/80 font-mono text-sm">
        <div className="w-10 h-10 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
        Loading adventurer model…
      </div>
    </div>
  )
}

function PresetRow({
  label,
  presets,
  value,
  onPick,
  glow,
}: {
  label: string
  presets: Array<{ id: string; label: string; color: string }>
  value: string
  onPick: (color: string) => void
  glow?: boolean
}) {
  return (
    <section className="mb-6">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">{label}</h2>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const selected = value.toLowerCase() === p.color.toLowerCase()
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.color)}
              className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                selected
                  ? 'border-emerald-400 bg-white/10 ring-1 ring-emerald-400/50'
                  : 'border-white/15 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2 align-middle border border-white/15"
                style={{
                  background: p.color,
                  boxShadow: glow ? `0 0 8px ${p.color}` : undefined,
                }}
              />
              {p.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ConfigSummary({ config }: { config: CharacterConfig }) {
  return (
    <div className="mb-6 p-3 rounded-lg border border-white/10 bg-white/5 text-xs font-mono text-white/50 space-y-1">
      <div className="text-white/30 uppercase tracking-wider text-[10px] mb-2">Live preview</div>
      <div>Skin <span className="text-white/70">{config.skinTone}</span></div>
      <div>Hair <span className="text-white/70">{config.hairColor}</span></div>
      <div>Tabard <span className="text-emerald-300/80">{config.tunicColor}</span></div>
      <div>Trim <span className="text-amber-300/80">{config.trimColor}</span></div>
      <div>Glow <span className="text-cyan-300/80">{config.gemColor}</span></div>
      <div>Build <span className="text-white/70">{config.build}</span> · Scale {config.scale.toFixed(2)}×</div>
    </div>
  )
}

export function CharacterCustomization({ onStart }: CharacterCustomizationProps) {
  const { config, setConfig } = useCharacter()
  const [previewReady, setPreviewReady] = useState(false)

  return (
    <div className="absolute inset-0 z-50 flex bg-[#0a0a0a] text-white">
      <div className="flex-1 relative min-w-0">
        <Canvas shadows camera={{ position: [0, 1.1, 3.6], fov: 40 }}>
          <Suspense fallback={null}>
            <CharacterPreviewScene onReady={() => setPreviewReady(true)} />
          </Suspense>
        </Canvas>
        {!previewReady && <PreviewLoader />}
        <div className="absolute bottom-6 left-6 text-white/40 text-sm font-mono pointer-events-none">
          Drag to inspect · changes update live
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col border-l border-white/10 bg-black/70 backdrop-blur-md p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold tracking-widest text-emerald-400 mb-1">WILD BREATH</h1>
        <p className="text-emerald-100/60 text-sm mb-4">Forge your adventurer</p>

        <ConfigSummary config={config} />

        <PresetRow
          label="Skin tone"
          presets={SKIN_PRESETS}
          value={config.skinTone}
          onPick={(c) => setConfig({ skinTone: c })}
        />
        <PresetRow
          label="Hair"
          presets={HAIR_PRESETS}
          value={config.hairColor}
          onPick={(c) => setConfig({ hairColor: c })}
        />
        <PresetRow
          label="Tabard"
          presets={TUNIC_PRESETS}
          value={config.tunicColor}
          onPick={(c) => setConfig({ tunicColor: c })}
        />
        <PresetRow
          label="Trim"
          presets={TRIM_PRESETS}
          value={config.trimColor}
          onPick={(c) => setConfig({ trimColor: c })}
        />
        <PresetRow
          label="Arcane glow"
          presets={GEM_PRESETS}
          value={config.gemColor}
          onPick={(c) => setConfig({ gemColor: c })}
          glow
        />

        <section className="mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Height — {config.scale.toFixed(2)}×
          </h2>
          <input
            type="range"
            min={0.9}
            max={1.1}
            step={0.05}
            value={config.scale}
            onChange={(e) => setConfig({ scale: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Build</h2>
          <div className="flex gap-2">
            {(['slim', 'broad'] as CharacterBuild[]).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setConfig({ build: b })}
                className={`flex-1 py-2 rounded-lg text-sm border capitalize transition-all ${
                  config.build === b
                    ? 'border-emerald-400 bg-white/10 ring-1 ring-emerald-400/50'
                    : 'border-white/15 bg-white/5 hover:bg-white/10'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={onStart}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-lg transition-all shadow-[0_0_24px_rgba(5,150,105,0.5)] cursor-pointer"
        >
          Enter the Forest
        </button>

        <p className="mt-4 text-xs text-white/35 text-center">
          Your look carries into the open world · Tab toggles 1st / 3rd person
        </p>
      </div>
    </div>
  )
}
