import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { getTerrainHeight, noise2D } from '../utils/noise'

function terrainColor(y: number, x: number, z: number): THREE.Color {
  const c = new THREE.Color()
  const patch = noise2D(x * 0.08, z * 0.08) * 0.15
  if (y < -2) {
    c.setRGB(0.22 + patch, 0.28 + patch, 0.22)
  } else if (y < 4) {
    c.setRGB(0.28 + patch, 0.48 + patch * 0.5, 0.32 + patch * 0.3)
  } else if (y < 9) {
    c.setRGB(0.34 + patch, 0.55 + patch * 0.4, 0.38 + patch * 0.2)
  } else {
    c.setRGB(0.42 + patch, 0.46 + patch, 0.4 + patch)
  }
  return c
}

export const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(500, 500, 140, 140)
    geo.rotateX(-Math.PI / 2)

    const positions = geo.attributes.position.array as Float32Array
    const colors = new Float32Array(positions.length)

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      const y = getTerrainHeight(x, z)
      positions[i + 1] = y
      const col = terrainColor(y, x, z)
      colors[i] = col.r
      colors[i + 1] = col.g
      colors[i + 2] = col.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.78}
        metalness={0.03}
        envMapIntensity={0.35}
      />
    </mesh>
  )
}
