import { Campfire } from './Campfire'
import { Beacon } from './Beacon'
import { HillCabinHub } from './HillCabinHub'
import { ChoppableTrees } from './ChoppableTree'
import { StalkerPack } from './StalkerWolf'
import { StoneNodes } from './StoneNode'
import { FoodNodes } from './FoodNode'
import { Fauna } from './Fauna'
import { HazardZone, BackgroundHills } from './HazardZone'
import { PlayerAvatar } from './PlayerAvatar'

export function WorldContent() {
  return (
    <>
      <BackgroundHills />
      <Campfire />
      <Beacon />
      <HillCabinHub />
      <ChoppableTrees />
      <StoneNodes />
      <FoodNodes />
      <StalkerPack />
      <Fauna />
      <HazardZone />
      <PlayerAvatar />
    </>
  )
}
