import { createNoise2D } from 'simplex-noise'

export const noise2D = createNoise2D()

export const getTerrainHeight = (x: number, z: number) => {
  let y = noise2D(x * 0.01, z * 0.01) * 10
  y += noise2D(x * 0.05, z * 0.05) * 2
  return y
}
