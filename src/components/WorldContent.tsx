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
import { Shrines } from './Shrine'
import { KorokSeeds } from './KorokSeed'
import { EnemyCamps } from './EnemyCamp'
import { CookingPot } from './CookingPot'
import { BeaconInteract } from './BeaconInteract'
import { QuestGiver, CabinQuestGiver } from './QuestGiver'
import { Chest } from './Chest'

export function WorldContent() {
  return (
    <>
      <BackgroundHills />
      <Campfire />
      <Beacon />
      <BeaconInteract />
      <HillCabinHub />
      <CookingPot />
      <QuestGiver />
      <CabinQuestGiver />
      <Shrines />
      <KorokSeeds />
      <EnemyCamps />
      <ChoppableTrees />
      <StoneNodes />
      <FoodNodes />
      <StalkerPack />
      <Fauna />
      <HazardZone />
      <Chest id="chest-hazard" x={-38} z={37} loot={{ rupees: 25, food: 2 }} />
      <Chest id="chest-shrine-reward" x={-22} z={-8} loot={{ rupees: 10 }} />
      <PlayerAvatar />
    </>
  )
}
