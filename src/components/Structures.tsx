import { getTerrainHeight } from '../utils/noise'
import { ConiferTree, Undergrowth, useForestLayout } from './ForestTrees'

export const Structures = () => {
  const { conifers, undergrowth } = useForestLayout()

  return (
    <group>
      {conifers.map((tree, i) => (
        <group
          key={`c-${i}`}
          position={[
            tree.position[0],
            getTerrainHeight(tree.position[0], tree.position[2]),
            tree.position[2],
          ]}
          rotation={[0, tree.rotation, 0]}
          scale={tree.scale}
        >
          <ConiferTree variant={tree.variant} />
        </group>
      ))}

      {undergrowth.map((plant, i) => (
        <group
          key={`u-${i}`}
          position={[
            plant.position[0],
            getTerrainHeight(plant.position[0], plant.position[2]),
            plant.position[2],
          ]}
          rotation={[0, plant.rotation, 0]}
          scale={plant.scale}
        >
          <Undergrowth type={plant.type} />
        </group>
      ))}
    </group>
  )
}
