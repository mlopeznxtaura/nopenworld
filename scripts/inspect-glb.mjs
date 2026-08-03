import { readFileSync } from 'fs'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'

const data = readFileSync('public/models/Soldier.glb')
const loader = new GLTFLoader()
loader.parse(data.buffer, '', (gltf) => {
  const meshes = []
  const bones = []
  gltf.scene.traverse((o) => {
    if (o.isMesh) meshes.push(o.name)
    if (o.isBone) bones.push(o.name)
  })
  console.log('meshes:', meshes)
  console.log('bones sample:', bones.filter((b) => /Hand|Hips|Head|Spine/.test(b)))
  const box = new THREE.Box3().setFromObject(gltf.scene)
  const s = new THREE.Vector3()
  box.getSize(s)
  console.log('size', s)
  console.log('anims', gltf.animations.map((a) => a.name))
})
