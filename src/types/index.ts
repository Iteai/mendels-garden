export type Species = 'Tomato' | 'Chili' | 'Basil' | 'Radish';

export type Variety =
  | 'Cherry'
  | 'Roma'
  | 'Beefsteak'
  | 'Heirloom'
  | 'San Marzano'
  | 'Jalapeno'
  | 'Habanero'
  | 'Cayenne'
  | 'Poblano'
  | 'Ghost Pepper'
  | 'Sweet'
  | 'Thai'
  | 'Lemon'
  | 'Purple'
  | 'Holy'
  | 'Cherry Belle'
  | 'French Breakfast'
  | 'Daikon'
  | 'Black Spanish'
  | 'Watermelon';

export type GrowthStage =
  | 'Seed'
  | 'Germination'
  | 'Seedling'
  | 'Vegetative'
  | 'Flowering'
  | 'Pollination'
  | 'Fruiting'
  | 'Ripening'
  | 'HarvestReady';

export type Allele = 'A' | 'a' | 'B' | 'b' | 'C' | 'c' | 'D' | 'd' | 'E' | 'e' | 'F' | 'f' | 'G' | 'g';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type ConsumableType = 'GrowthBoost' | 'PollutionBoost';

export interface GenePair {
  allele1: Allele;
  allele2: Allele;
}

export interface PlantGenetics {
  color: GenePair;
  size: GenePair;
  growthRate: GenePair;
  yield: GenePair;
  shape: GenePair;
  texture: GenePair;
  flavor: GenePair;
  aromaIntensity: GenePair;
  generation: number;
  isHybrid: boolean;
  parentAId?: string;
  parentBId?: string;
}

export interface PhenotypeTraits {
  colorScore: number;
  sizeScore: number;
  shapeScore: number;
  textureScore: number;
  growthSpeed: number;
  yieldAmount: number;
  flavorScore: number;
  aromaScore: number;
}

export interface Plant {
  id: string;
  species: Species;
  variety: Variety;
  name: string;
  genetics: PlantGenetics;
  phenotype: PhenotypeTraits;
  stage: GrowthStage;
  plantedAt: number;
  lastWateredAt: number;
  waterLevel: number;
  health: number;
  growthProgress: number;
  yieldAmount: number;
  pollinated: boolean;
  harvestsRemaining: number;
  maxHarvests: number;
}

export interface Seed {
  id: string;
  species: Species;
  variety: Variety;
  genetics: PlantGenetics;
  phenotype: PhenotypeTraits;
  name: string;
  quantity: number;
  rarity: Rarity;
  description: string;
}

export interface HarvestedItem {
  id: string;
  species: Species;
  variety: Variety;
  quality: number;
  quantity: number;
  value: number;
  rarity: Rarity;
  growthQuality: number;
  geneticsInfo: {
    generation: number;
    isHybrid: boolean;
    colorScore: number;
    sizeScore: number;
    yieldAmount: number;
  };
  harvestTiming: number;
}

export interface Consumable {
  id: string;
  name: string;
  type: ConsumableType;
  description: string;
  price: number;
  quantity: number;
}

export interface Pot {
  id: string;
  plant: Plant | null;
  size: 'Small' | 'Medium' | 'Large';
  soilQuality: number;
  activeFertilizer?: ConsumableType;
  fertilizerExpiresAt?: number;
}

export interface DiscoveredStrain {
  id: string;
  species: Species;
  variety: Variety;
  name: string;
  discoveredAt: number;
  rarity: Rarity;
  generation: number;
  isHybrid: boolean;
  colorScore?: number;
  sizeScore?: number;
  yieldScore?: number;
  aromaScore?: number;
}

export interface ResearchRecord {
  id: string;
  title: string;
  description: string;
  type: 'f1_hybrid' | 'f2_segregation' | 'trait_fixation' | 'new_discovery';
  seedId: string;
  generation: number;
  completedAt: number;
  findings: {
    dominantTraits: string[];
    recessiveTraits: string[];
    segregationRatio?: string;
    variantCount?: number;
  };
}

export interface GameState {
  pots: Pot[];
  seeds: Seed[];
  inventory: HarvestedItem[];
  consumables: Consumable[];
  encyclopedia: Record<string, DiscoveredStrain>;
  researchLog: ResearchRecord[];
  money: number;
  xp: number;
  level: number;
  lastSavedAt: number;
  totalHarvests: number;
  totalCrossbreeds: number;
  unlockedPots: number;
  totalMoneyEarned: number;
}
