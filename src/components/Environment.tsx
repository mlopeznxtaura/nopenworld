import { Sky } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { StylizedSun } from './StylizedSun'
import { AtmosphereMist } from './AtmosphereMist'
import {
  DAY_CYCLE_SECONDS,
  DAYLIGHT_SECONDS,
  NIGHT_SECONDS,
  SUN_DISTANCE,
  orbitProgressFromElapsed,
} from '../game/timeState'
import { usePlayerStore } from '../game/playerState'
import { getSanctuaryDistance } from './HillCabinHub'
import { CAMPFIRE_RADIUS } from './Campfire'
import { BEACON_RADIUS } from './Beacon'

/** Sun orbits east → zenith → west; orbit p=0.25 sunrise, 0.5 noon, 0.75 sunset. */
function sunPositionFromProgress(p: number): THREE.Vector3 {
  const angle = p * Math.PI * 2 - Math.PI / 2
  const x = Math.cos(angle) * SUN_DISTANCE
  const y = Math.sin(angle) * SUN_DISTANCE
  const z = Math.sin(angle * 0.35) * 70 + 30
  return new THREE.Vector3(x, y, z)
}

function computeLighting(p: number, sunPos: THREE.Vector3) {
  const elevation = sunPos.y / SUN_DISTANCE

  const dayFactor = THREE.MathUtils.smoothstep(elevation, -0.1, 0.35)

  const dawnWindow = THREE.MathUtils.smoothstep(elevation, -0.02, 0.22) *
    (1 - THREE.MathUtils.smoothstep(elevation, 0.22, 0.55))
  const duskWindow = THREE.MathUtils.smoothstep(elevation, 0.55, 0.22) *
    (1 - THREE.MathUtils.smoothstep(elevation, 0.22, -0.02))

  const goldenHour = Math.max(dawnWindow, duskWindow)

  const NIGHT_AMBIENT = new THREE.Color('#1a2030')
  const DAY_AMBIENT = new THREE.Color('#c8d4e0')
  const DAWN_AMBIENT = new THREE.Color('#ffd700')

  const NIGHT_SUN = new THREE.Color('#8a7a60')
  const DAWN_SUN = new THREE.Color('#ffb830')
  const DAY_SUN = new THREE.Color('#fff0c8')
  const DUSK_SUN = new THREE.Color('#ff9020')

  const NIGHT_FOG = new THREE.Color('#1a2438')
  const DAY_FOG = new THREE.Color('#a8c8e8')
  const GOLDEN_FOG = new THREE.Color('#ffd700')
  const ORANGE_FOG = new THREE.Color('#ff8c00')

  const ambientColor = new THREE.Color()
  ambientColor.copy(NIGHT_AMBIENT).lerp(DAWN_AMBIENT, goldenHour * 0.85)
  ambientColor.lerp(DAY_AMBIENT, dayFactor * (1 - goldenHour * 0.4))

  const ambientIntensity = THREE.MathUtils.lerp(0.2, 0.45, dayFactor) +
    goldenHour * 0.25

  const sunColor = new THREE.Color()
  sunColor.copy(NIGHT_SUN).lerp(DAWN_SUN, goldenHour)
  sunColor.lerp(DAY_SUN, dayFactor * (1 - goldenHour * 0.3))
  if (duskWindow > dawnWindow) {
    sunColor.lerp(DUSK_SUN, duskWindow)
  }

  const sunIntensity = THREE.MathUtils.lerp(0.2, 1.15, dayFactor) +
    goldenHour * 0.45

  const fogColor = new THREE.Color()
  fogColor.copy(NIGHT_FOG).lerp(GOLDEN_FOG, goldenHour * 0.7)
  fogColor.lerp(ORANGE_FOG, goldenHour * 0.45)
  fogColor.lerp(DAY_FOG, dayFactor * (1 - goldenHour * 0.5))

  const turbidity = THREE.MathUtils.lerp(3.2, 6.5, goldenHour) +
    THREE.MathUtils.lerp(2.5, 4.0, dayFactor) * (1 - goldenHour)
  const rayleigh = THREE.MathUtils.lerp(0.15, 0.55, goldenHour) +
    THREE.MathUtils.lerp(0.2, 0.4, dayFactor) * (1 - goldenHour)

  return {
    ambientColor,
    ambientIntensity,
    sunColor,
    sunIntensity,
    fogColor,
    turbidity,
    rayleigh,
    goldenHour,
    dayFactor,
  }
}

function ManagedSky({
  sunPosRef,
  turbidityRef,
  rayleighRef,
}: {
  sunPosRef: { current: THREE.Vector3 }
  turbidityRef: { current: number }
  rayleighRef: { current: number }
}) {
  const skyRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const sky = skyRef.current
    if (!sky?.material) return
    const mat = sky.material as THREE.ShaderMaterial
    const u = mat.uniforms
    if (u.sunPosition) u.sunPosition.value.copy(sunPosRef.current)
    if (u.turbidity) u.turbidity.value = turbidityRef.current
    if (u.rayleigh) u.rayleigh.value = rayleighRef.current
  })

  return (
    <Sky
      ref={skyRef}
      sunPosition={[100, 20, 100]}
      turbidity={3}
      rayleigh={0.35}
      mieCoefficient={0.006}
      mieDirectionalG={0.7}
      distance={450000}
    />
  )
}

export const SceneEnvironment = () => {
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const sunPosRef = useRef(new THREE.Vector3(100, 20, 100))
  const goldenHourRef = useRef(0)
  const turbidityRef = useRef(3)
  const rayleighRef = useRef(0.35)
  const shadowFrame = useRef(0)
  const { scene } = useThree()
  const { positionRef, snapRef } = usePlayerStore()

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime
    const cycleElapsed = elapsed % DAY_CYCLE_SECONDS
    const isDaylight = cycleElapsed < DAYLIGHT_SECONDS
    const nightFactor = isDaylight
      ? 0
      : (cycleElapsed - DAYLIGHT_SECONDS) / NIGHT_SECONDS

    const orbitP = orbitProgressFromElapsed(elapsed)
    const sunPos = sunPositionFromProgress(orbitP)
    sunPosRef.current.copy(sunPos)
    const lighting = computeLighting(orbitP, sunPos)
    goldenHourRef.current = lighting.goldenHour
    turbidityRef.current = lighting.turbidity
    rayleighRef.current = lighting.rayleigh

    const px = positionRef.current.x
    const pz = positionRef.current.z
    const sanctuaryDist = getSanctuaryDistance(px, pz)
    const maxSanctuary = Math.max(CAMPFIRE_RADIUS, BEACON_RADIUS, 12)
    const inSanctuary = sanctuaryDist < maxSanctuary
    const exposureCrush = nightFactor > 0 && !inSanctuary
      ? THREE.MathUtils.clamp(nightFactor * 1.2, 0, 1)
      : 0

    if (exposureCrush > 0) {
      snapRef.current.cold = Math.min(100, snapRef.current.cold + 0.03)
    }

    const ambientMult = 1 - exposureCrush * 0.55
    const fogNear = 32 - exposureCrush * 10
    const fogFar = 200 - exposureCrush * 70

    if (sunRef.current) {
      sunRef.current.position.copy(sunPos)
      sunRef.current.intensity = lighting.sunIntensity * ambientMult * 1.05
      sunRef.current.color.copy(lighting.sunColor)

      // Follow player less often — shadows stay sharp near you without every-frame matrix thrash
      shadowFrame.current += 1
      if (shadowFrame.current % 4 === 0) {
        const cam = sunRef.current.shadow.camera as THREE.OrthographicCamera
        cam.position.set(px + sunPos.x * 0.02, Math.max(35, sunPos.y * 0.45), pz + sunPos.z * 0.02)
        cam.lookAt(px, 0, pz)
        cam.updateProjectionMatrix()
        sunRef.current.target.position.set(px, 0, pz)
        sunRef.current.target.updateMatrixWorld()
      }
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = lighting.ambientIntensity * ambientMult * 0.6
      ambientRef.current.color.copy(lighting.ambientColor)
    }

    if (hemiRef.current) {
      hemiRef.current.intensity = 0.4 * ambientMult + lighting.goldenHour * 0.22
    }

    if (scene.fog) {
      const fog = scene.fog as THREE.Fog
      fog.color.copy(lighting.fogColor)
      fog.near = fogNear
      fog.far = fogFar
    }
  })

  return (
    <>
      <color attach="background" args={['#a8c8e8']} />
      <ambientLight ref={ambientRef} intensity={0.32} color="#c8d4e0" />
      <hemisphereLight
        ref={hemiRef}
        intensity={0.5}
        color="#9ec8e8"
        groundColor="#3d5c40"
      />
      <directionalLight
        ref={sunRef}
        castShadow
        position={[100, 200, 50]}
        intensity={1.3}
        color="#fff4d0"
        shadow-mapSize-width={1280}
        shadow-mapSize-height={1280}
        shadow-camera-near={1}
        shadow-camera-far={220}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
      />
      <StylizedSun positionRef={sunPosRef} goldenHourRef={goldenHourRef} />
      <ManagedSky
        sunPosRef={sunPosRef}
        turbidityRef={turbidityRef}
        rayleighRef={rayleighRef}
      />
      <AtmosphereMist />
      <fog attach="fog" args={['#a8c8e8', 32, 200]} />
    </>
  )
}
