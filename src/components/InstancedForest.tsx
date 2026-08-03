import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'

/** Seeded RNG so forest layout is stable across remounts. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type TreeSpot = { x: number; z: number; y: number; scale: number; rot: number }
type BushSpot = { x: number; z: number; y: number; scale: number; rot: number; fern: boolean }

function buildLayout(seed = 42): { trees: TreeSpot[]; bushes: BushSpot[] } {
  const rnd = mulberry32(seed)
  const trees: TreeSpot[] = []
  const bushes: BushSpot[] = []

  for (let i = 0; i < 110; i++) {
    const x = (rnd() - 0.5) * 300
    const z = (rnd() - 0.5) * 300
    if (Math.abs(x) < 16 && Math.abs(z) < 16) continue
    const dist = Math.hypot(x, z)
    const scale = 0.7 + rnd() * 0.65 + (dist > 130 ? 0.2 : 0)
    trees.push({
      x,
      z,
      y: getTerrainHeight(x, z),
      scale,
      rot: rnd() * Math.PI * 2,
    })
  }

  for (let i = 0; i < 95; i++) {
    const x = (rnd() - 0.5) * 240
    const z = (rnd() - 0.5) * 240
    if (Math.abs(x) < 12 && Math.abs(z) < 12) continue
    bushes.push({
      x,
      z,
      y: getTerrainHeight(x, z),
      scale: 0.55 + rnd() * 0.95,
      rot: rnd() * Math.PI * 2,
      fern: rnd() > 0.5,
    })
  }

  return { trees, bushes }
}

function writeMatrix(
  mesh: THREE.InstancedMesh,
  i: number,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rotY: number,
  dummy: THREE.Object3D,
) {
  dummy.position.set(x, y, z)
  dummy.rotation.set(0, rotY, 0)
  dummy.scale.set(sx, sy, sz)
  dummy.updateMatrix()
  mesh.setMatrixAt(i, dummy.matrix)
}

/**
 * Dense PNW forest in ~7 draw calls (InstancedMesh) instead of hundreds of meshes.
 * Character path untouched — this only replaces static scenery.
 */
export function InstancedForest() {
  const { trees, bushes } = useMemo(() => buildLayout(42), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const canopyDarkRef = useRef<THREE.InstancedMesh>(null)
  const canopyMidRef = useRef<THREE.InstancedMesh>(null)
  const canopyLiteRef = useRef<THREE.InstancedMesh>(null)
  const fernRef = useRef<THREE.InstancedMesh>(null)
  const bushRef = useRef<THREE.InstancedMesh>(null)

  const fernCount = useMemo(
    () => bushes.filter((b) => b.fern).length * 3,
    [bushes],
  )
  const bushCount = useMemo(
    () => bushes.filter((b) => !b.fern).length * 3,
    [bushes],
  )

  useLayoutEffect(() => {
    const trunk = trunkRef.current
    const dark = canopyDarkRef.current
    const mid = canopyMidRef.current
    const lite = canopyLiteRef.current
    if (!trunk || !dark || !mid || !lite) return

    trees.forEach((t, i) => {
      const s = t.scale
      const trunkH = 18 * s
      // Unit cylinder (r=1,h=1) → radius 0.42*s, height trunkH
      writeMatrix(trunk, i, t.x, t.y + trunkH * 0.5, t.z, 0.42 * s, trunkH, 0.42 * s, t.rot, dummy)

      // Two dark lower cones
      for (let L = 0; L < 2; L++) {
        const baseY = trunkH - 5.5 * s + L * 2.6 * s
        const radius = (3.4 - L * 0.48) * s
        const height = 3.1 * s
        writeMatrix(
          dark,
          i * 2 + L,
          t.x,
          t.y + baseY,
          t.z,
          radius,
          height,
          radius,
          t.rot + L * 0.2,
          dummy,
        )
      }
      // Two mid cones
      for (let L = 0; L < 2; L++) {
        const li = L + 2
        const baseY = trunkH - 5.5 * s + li * 2.6 * s
        const radius = (3.4 - li * 0.48) * s
        const height = 3.1 * s
        writeMatrix(
          mid,
          i * 2 + L,
          t.x,
          t.y + baseY,
          t.z,
          radius,
          height,
          radius,
          t.rot + L * 0.15,
          dummy,
        )
      }
      // Two light top cones
      for (let L = 0; L < 2; L++) {
        const li = L + 4
        const baseY = trunkH - 5.5 * s + li * 2.6 * s
        const radius = (3.4 - li * 0.48) * s
        const height = 3.1 * s
        writeMatrix(
          lite,
          i * 2 + L,
          t.x,
          t.y + baseY,
          t.z,
          radius,
          height,
          radius,
          t.rot + L * 0.1,
          dummy,
        )
      }
    })

    trunk.count = trees.length
    dark.count = trees.length * 2
    mid.count = trees.length * 2
    lite.count = trees.length * 2
    trunk.instanceMatrix.needsUpdate = true
    dark.instanceMatrix.needsUpdate = true
    mid.instanceMatrix.needsUpdate = true
    lite.instanceMatrix.needsUpdate = true
    trunk.computeBoundingSphere()
    dark.computeBoundingSphere()
    mid.computeBoundingSphere()
    lite.computeBoundingSphere()
  }, [trees, dummy])

  useLayoutEffect(() => {
    const fern = fernRef.current
    const bush = bushRef.current
    if (!fern || !bush) return

    let fi = 0
    let bi = 0
    bushes.forEach((b) => {
      if (b.fern) {
        ;[-0.35, 0, 0.35].forEach((ox, k) => {
          const s = b.scale
          writeMatrix(
            fern,
            fi++,
            b.x + ox * s,
            b.y + 0.55 * s,
            b.z + k * 0.15 * s,
            0.55 * s,
            1.4 * s,
            0.55 * s,
            b.rot + k * 0.9,
            dummy,
          )
        })
      } else {
        const offsets: [number, number, number, number][] = [
          [0, 1.1, 0, 1.1],
          [0.7, 1.4, 0.3, 0.75],
          [-0.6, 1.2, -0.2, 0.8],
        ]
        offsets.forEach(([ox, oy, oz, r]) => {
          const s = b.scale
          writeMatrix(
            bush,
            bi++,
            b.x + ox * s,
            b.y + oy * s,
            b.z + oz * s,
            r * s,
            r * s,
            r * s,
            b.rot,
            dummy,
          )
        })
      }
    })

    fern.count = fi
    bush.count = bi
    fern.instanceMatrix.needsUpdate = true
    bush.instanceMatrix.needsUpdate = true
    fern.computeBoundingSphere()
    bush.computeBoundingSphere()
  }, [bushes, dummy])

  const n = trees.length

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, n]}
        castShadow
        receiveShadow
        frustumCulled
      >
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial color="#3e342c" roughness={0.95} metalness={0.02} />
      </instancedMesh>

      <instancedMesh
        ref={canopyDarkRef}
        args={[undefined, undefined, n * 2]}
        castShadow
        frustumCulled
      >
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#163d2a" roughness={0.78} metalness={0.03} />
      </instancedMesh>

      <instancedMesh
        ref={canopyMidRef}
        args={[undefined, undefined, n * 2]}
        castShadow
        frustumCulled
      >
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial color="#245a3c" roughness={0.74} metalness={0.03} />
      </instancedMesh>

      <instancedMesh
        ref={canopyLiteRef}
        args={[undefined, undefined, n * 2]}
        castShadow
        frustumCulled
      >
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial
          color="#2f6b4a"
          emissive="#1a5a38"
          emissiveIntensity={0.1}
          roughness={0.7}
          metalness={0.04}
        />
      </instancedMesh>

      <instancedMesh
        ref={fernRef}
        args={[undefined, undefined, Math.max(fernCount, 1)]}
        frustumCulled
      >
        <coneGeometry args={[1, 1, 5]} />
        <meshStandardMaterial color="#5cb85c" roughness={0.8} />
      </instancedMesh>

      <instancedMesh
        ref={bushRef}
        args={[undefined, undefined, Math.max(bushCount, 1)]}
        frustumCulled
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#6ecf6a" roughness={0.72} />
      </instancedMesh>
    </group>
  )
}
