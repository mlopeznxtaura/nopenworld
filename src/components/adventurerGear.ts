import * as THREE from 'three'
import type { CharacterConfig } from '../game/characterConfig'

export function findBone(root: THREE.Object3D, part: string): THREE.Bone | null {
  let found: THREE.Bone | null = null
  root.traverse((o) => {
    if (
      o instanceof THREE.Bone &&
      (o.name.includes(part) || o.name.endsWith(`:${part}`))
    ) {
      found = o
    }
  })
  return found
}

function cloneMaterial(mesh: THREE.SkinnedMesh): THREE.MeshStandardMaterial[] {
  const src = mesh.material
  const list = Array.isArray(src) ? src : [src]
  return list.map((m) => {
    const cloned = (m as THREE.MeshStandardMaterial).clone()
    cloned.map = null
    cloned.normalMap = null
    cloned.roughnessMap = null
    cloned.metalnessMap = null
    return cloned
  })
}

function assignMaterials(mesh: THREE.SkinnedMesh, materials: THREE.MeshStandardMaterial[]) {
  mesh.material = materials.length === 1 ? materials[0] : materials
}

export function tintHumanBase(root: THREE.Object3D, config: CharacterConfig) {
  root.traverse((child) => {
    if (!(child instanceof THREE.SkinnedMesh)) return
    const mesh = child
    const name = mesh.name.toLowerCase()

    if (name.includes('gun') || name.includes('weapon') || name.includes('rifle')) {
      mesh.visible = false
      return
    }

    const materials = cloneMaterial(mesh)

    if (name.includes('visor')) {
      materials.forEach((m) => {
        m.color.set(config.skinTone)
        m.roughness = 0.42
        m.metalness = 0.04
      })
    } else if (
      name.includes('head') ||
      name.includes('face') ||
      name.includes('hand')
    ) {
      materials.forEach((m) => {
        m.color.set(config.skinTone)
        m.roughness = 0.48
        m.metalness = 0.02
      })
    } else if (
      name.includes('leg') ||
      name.includes('foot') ||
      name.includes('thigh')
    ) {
      // Dark trousers with trim edge feel
      materials.forEach((m) => {
        m.color.set('#2c2a32')
        m.roughness = 0.88
      })
    } else if (name.includes('mesh') || name.includes('body') || name.includes('vanguard')) {
      // Full body carries Tabard color so preset picks are unmistakable
      materials.forEach((m) => {
        m.color.set(config.tunicColor)
        m.roughness = 0.68
        m.metalness = 0.08
      })
    } else {
      materials.forEach((m) => {
        m.color.set(config.tunicColor)
        m.roughness = 0.72
      })
    }

    materials.forEach((m) => {
      m.needsUpdate = true
    })
    assignMaterials(mesh, materials)
    mesh.castShadow = true
    mesh.receiveShadow = true
  })
}

function mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.65,
    metalness: 0.05,
    ...opts,
  })
}

export function buildSkinNeck(config: CharacterConfig): THREE.Mesh {
  const neck = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.14, 0.2),
    mat(config.skinTone, { roughness: 0.45 }),
  )
  neck.position.set(0, -0.06, 0.02)
  neck.castShadow = true
  return neck
}

export function buildTail(config: CharacterConfig): THREE.Group {
  const tail = new THREE.Group()
  for (let i = 0; i < 14; i++) {
    const taper = 1 - i * 0.065
    const seg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11 * taper, 0.2, 6, 10),
      mat(i % 2 === 0 ? '#3a4848' : '#2a3838', { roughness: 0.82 }),
    )
    seg.position.set(0, -0.05 - i * 0.02, -0.22 - i * 0.19)
    seg.rotation.x = 0.55 + i * 0.07
    seg.castShadow = true
    tail.add(seg)
    if (i % 3 === 0) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.06 * taper, 0.14, 4),
        mat('#1a2028', { roughness: 0.9 }),
      )
      spike.position.set(0, 0.05, -0.08)
      spike.rotation.x = -0.8
      seg.add(spike)
    }
  }
  tail.position.set(0, 0.05, -0.12)
  tail.rotation.x = 0.15
  return tail
}

export function buildHair(config: CharacterConfig): THREE.Group {
  const hair = new THREE.Group()
  hair.name = 'adventurer-hair'

  // Large scalp cap — readable hair color even on helmeted Vanguard
  const scalp = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mat(config.hairColor, { roughness: 0.9 }),
  )
  scalp.position.set(0, 0.12, 0.02)
  scalp.castShadow = true
  hair.add(scalp)

  const spikes: Array<[number, number, number, number, number, number]> = [
    [0, 0.28, 0.08, 0.35, 0, 1.1],
    [0.1, 0.24, 0.05, 0.4, -0.5, 0.95],
    [-0.1, 0.24, 0.05, 0.4, 0.5, 0.95],
    [0.16, 0.18, -0.02, 0.5, -1.0, 0.85],
    [-0.16, 0.18, -0.02, 0.5, 1.0, 0.85],
    [0, 0.34, -0.04, 0.2, 0.3, 1.2],
    [0.08, 0.3, -0.08, 0.45, -0.7, 1.0],
    [-0.08, 0.3, -0.08, 0.45, 0.7, 1.0],
    [0.12, 0.2, 0.1, 0.55, -0.2, 0.8],
    [-0.12, 0.2, 0.1, 0.55, 0.2, 0.8],
    [0.05, 0.36, 0.02, 0.15, 0.4, 1.15],
    [-0.05, 0.35, 0.02, 0.15, -0.35, 1.1],
  ]
  spikes.forEach(([x, y, z, rz, ry, scale]) => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.07 * scale, 0.38 * scale, 5),
      mat(config.hairColor, { roughness: 0.88 }),
    )
    cone.position.set(x, y, z)
    cone.rotation.set(0, ry, rz)
    cone.castShadow = true
    hair.add(cone)
  })
  hair.position.set(0, 0.06, 0)
  return hair
}

export function buildTabard(config: CharacterConfig): THREE.Group {
  const tabard = new THREE.Group()
  tabard.name = 'adventurer-tabard'

  // Large outer panels — sit outside armor so Tabard color is obvious
  const front = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.95, 0.06),
    mat(config.tunicColor, { roughness: 0.7 }),
  )
  front.position.set(0, -0.08, 0.22)
  front.rotation.x = 0.06
  front.castShadow = true
  tabard.add(front)

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.9, 0.06),
    mat(config.tunicColor, { roughness: 0.7 }),
  )
  back.position.set(0, -0.08, -0.22)
  back.rotation.x = -0.05
  back.castShadow = true
  tabard.add(back)

  // Thick Trim bands — Gold/Copper/etc must read clearly
  const trimMat = mat(config.trimColor, { metalness: 0.75, roughness: 0.32 })
  const trimTop = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.1, 0.04), trimMat)
  trimTop.position.set(0, 0.36, 0.25)
  tabard.add(trimTop)

  const trimBottom = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.09, 0.04), trimMat.clone())
  trimBottom.position.set(0, -0.5, 0.24)
  tabard.add(trimBottom)

  const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.04), trimMat.clone())
  trimR.position.set(0.34, -0.05, 0.24)
  tabard.add(trimR)
  const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.04), trimMat.clone())
  trimL.position.set(-0.34, -0.05, 0.24)
  tabard.add(trimL)

  // Shoulder trim pauldrons
  ;[-1, 1].forEach((side) => {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.12, 0.32),
      mat(config.trimColor, { metalness: 0.7, roughness: 0.35 }),
    )
    pad.position.set(side * 0.38, 0.32, 0.05)
    pad.rotation.z = side * -0.25
    pad.castShadow = true
    tabard.add(pad)
  })

  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.1, 0),
    mat(config.gemColor, {
      emissive: config.gemColor,
      emissiveIntensity: 2.4,
      roughness: 0.2,
      metalness: 0.35,
    }),
  )
  gem.position.set(0, 0.12, 0.28)
  tabard.add(gem)

  tabard.position.set(0, 0.1, 0)
  return tabard
}

export function buildBelt(config: CharacterConfig): THREE.Group {
  const belt = new THREE.Group()
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.1, 0.28),
    mat('#3a2a1e', { roughness: 0.9 }),
  )
  belt.add(band)
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.05),
    mat(config.trimColor, { metalness: 0.75, roughness: 0.3 }),
  )
  buckle.position.set(0, 0, 0.16)
  belt.add(buckle)
  ;[-0.2, 0.15].forEach((x) => {
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.14, 0.1),
      mat('#4a3428', { roughness: 0.88 }),
    )
    pouch.position.set(x, -0.08, 0.1)
    belt.add(pouch)
  })
  belt.position.set(0, -0.02, 0.02)
  return belt
}

export function buildChainSleeve(trimColor: string): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.1, 0.38, 10),
    mat(trimColor, { metalness: 0.62, roughness: 0.42 }),
  )
}

export function buildGauntlet(gemColor: string): THREE.Group {
  const g = new THREE.Group()
  const leather = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.22, 0.13),
    mat('#4a3428', { roughness: 0.88 }),
  )
  g.add(leather)
  const gem = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.12, 0.03),
    mat(gemColor, {
      emissive: gemColor,
      emissiveIntensity: 2.5,
      roughness: 0.2,
      metalness: 0.3,
    }),
  )
  gem.position.set(0, 0, 0.08)
  g.add(gem)
  const light = new THREE.PointLight(gemColor, 6, 4, 2)
  light.position.set(0, 0, 0.1)
  g.add(light)
  return g
}

export function buildSheathedBlades(): THREE.Group {
  const g = new THREE.Group()
  const blade1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.48, 0.07),
    mat('#8a9098', { metalness: 0.75, roughness: 0.3 }),
  )
  blade1.position.set(0, 0.05, 0)
  blade1.rotation.z = 0.15
  g.add(blade1)
  const blade2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.44, 0.07),
    mat('#7a8088', { metalness: 0.75, roughness: 0.3 }),
  )
  blade2.position.set(0.07, 0.03, 0.02)
  blade2.rotation.z = 0.1
  g.add(blade2)
  const hilt1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.1, 0.06),
    mat('#4a3428', { roughness: 0.9 }),
  )
  hilt1.position.set(0, -0.2, 0)
  g.add(hilt1)
  g.rotation.set(0.25, 0.45, 0.3)
  g.position.set(-0.14, 0, 0.08)
  return g
}

/** Forest loadout: woodcutter axe held in hand. Trim colors the axe head rim. */
export function buildForestAxe(trimColor: string): THREE.Group {
  const axe = new THREE.Group()
  axe.name = 'forest-axe'

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.95, 8),
    mat('#5a3a22', { roughness: 0.92 }),
  )
  handle.position.y = 0.35
  handle.castShadow = true
  axe.add(handle)

  const wrap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.042, 0.14, 8),
    mat('#3a2a1e', { roughness: 0.95 }),
  )
  wrap.position.y = 0.02
  axe.add(wrap)

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.16, 0.08),
    mat('#6a7078', { metalness: 0.7, roughness: 0.35 }),
  )
  head.position.set(0.12, 0.78, 0)
  head.castShadow = true
  axe.add(head)

  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.22, 0.03),
    mat(trimColor, { metalness: 0.8, roughness: 0.28 }),
  )
  blade.position.set(0.28, 0.78, 0)
  axe.add(blade)

  const poll = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.12, 0.08),
    mat('#4a5058', { metalness: 0.65, roughness: 0.4 }),
  )
  poll.position.set(-0.02, 0.78, 0)
  axe.add(poll)

  axe.rotation.set(0.15, 0, -0.35)
  return axe
}

/** Hunting knife sheathed at hip. */
export function buildHuntingKnife(trimColor: string): THREE.Group {
  const g = new THREE.Group()
  g.name = 'hunting-knife'
  const sheath = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.28, 0.08),
    mat('#3a2a1e', { roughness: 0.9 }),
  )
  g.add(sheath)
  const hilt = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.1, 0.05),
    mat(trimColor, { metalness: 0.6, roughness: 0.4 }),
  )
  hilt.position.y = 0.16
  g.add(hilt)
  g.rotation.set(0.4, 0.2, 0.5)
  g.position.set(0.18, -0.05, 0.1)
  return g
}

/** Simple shortbow on the back. */
export function buildForestBow(trimColor: string): THREE.Group {
  const g = new THREE.Group()
  g.name = 'forest-bow'
  const limb = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.025, 6, 16, Math.PI * 1.15),
    mat('#4a3428', { roughness: 0.88 }),
  )
  limb.rotation.z = Math.PI / 2
  limb.rotation.y = 0.2
  g.add(limb)
  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6),
    mat(trimColor, { metalness: 0.4, roughness: 0.5 }),
  )
  g.add(grip)
  g.position.set(-0.22, 0.15, -0.12)
  g.rotation.set(0.1, 0.6, 0.15)
  return g
}

export function buildArcaneSword(gemColor: string, trimColor = '#d4af37'): THREE.Group {
  const sword = new THREE.Group()
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.92, 0.05),
    mat(gemColor, {
      emissive: gemColor,
      emissiveIntensity: 2.2,
      metalness: 0.7,
      roughness: 0.18,
    }),
  )
  blade.position.y = 0.46
  sword.add(blade)

  const glow = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.98, 0.08),
    mat(gemColor, {
      emissive: gemColor,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.35,
    }),
  )
  glow.position.y = 0.46
  sword.add(glow)

  const guard = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.05, 0.1),
    mat(trimColor, { metalness: 0.75, roughness: 0.3 }),
  )
  sword.add(guard)

  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.16, 0.06),
    mat('#3a2a1e', { roughness: 0.9 }),
  )
  handle.position.y = -0.12
  sword.add(handle)

  const light = new THREE.PointLight(gemColor, 10, 6, 2)
  light.position.y = 0.5
  sword.add(light)

  sword.rotation.set(0.2, 0, -0.2)
  return sword
}
