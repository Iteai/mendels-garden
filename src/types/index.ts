export type Species = 'Chili' | 'Tomato' | 'Basil' | 'Radish';

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
  | 'HarvestReady'
  | 'Dead';

export type Allele = 'A' | 'a' | 'B' | 'b' | 'C' | 'c' | 'D' | 'd' | 'E' | 'e' | 'F' | 'f' | 'G' | 'g';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type ConsumableType = 'Growth' | 'Mutation' | 'Fungicide' | 'RootBooster' | 'YieldBoost' | 'GeneStabilizer';
export type PestType = 'Aphids' | 'Fungus' | 'RootRot' | 'Whiteflies' | 'None';
export type WeatherCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Hot' | 'Cold';

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
  diseaseResistance: GenePair;
  droughtTolerance: GenePair;
  aroma: GenePair;
  generation: number;
  mutationCount: number;
}

export interface PhenotypeTraits {
  colorScore: number;
  sizeScore: number;
  shapeScore: number;
  textureScore: number;
  growthSpeed: number;
  yieldAmount: number;
  diseaseResistance: number;
  droughtTolerance: number;
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
  isHybrid: boolean;
  pest: PestType;
  pestSeverity: number;
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
  pedigree?: SeedParent[];
}

export interface SeedParent {
  id: string;
  name: string;
  species: Species;
  variety: Variety;
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
  soilQuality: number;
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
}

export interface DiscoveredStrain {
  id: string;
  species: Species;
  variety: Variety;
  name: string;
  discoveredAt: number;
  rarity: Rarity;
  generation: number;
  colorScore?: number;
  sizeScore?: number;
  aromaScore?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'crossbreed' | 'harvest' | 'discover' | 'money' | 'level';
  target: number;
  progress: number;
  reward: { money?: number; xp?: number; seedId?: string };
  completed: boolean;
  claimed: boolean;
}

export interface MarketPrice {
  species: Species;
  basePrice: number;
  currentMultiplier: number;
  lastFluctuated: number;
}

export interface GameState {
  pots: Pot[];
  seeds: Seed[];
  inventory: HarvestedItem[];
  consumables: Consumable[];
  encyclopedia: Record<string, DiscoveredStrain>;
  money: number;
  xp: number;
  level: number;
  lastSavedAt: number;
  missions: Mission[];
  marketPrices: MarketPrice[];
  currentWeather: WeatherCondition;
  weatherUntil: number;
  totalHarvests: number;
  totalCrossbreeds: number;
  unlockedPots: number;
}