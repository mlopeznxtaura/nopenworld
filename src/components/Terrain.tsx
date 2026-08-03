import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { getTerrainHeight } from '../utils/noise'

export const Terrain = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(500, 500, 120, 120)
    geo.rotateX(-Math.PI / 2)
    
    const positions = geo.attributes.position.array as Float32Array
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]
      positions[i + 1] = getTerrainHeight(x, z)
    }
    
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial 
        color="#4a7c59" 
        roughness={0.92}
        metalness={0.04}
        flatShading={false}
      />
    </mesh>
  )
}
