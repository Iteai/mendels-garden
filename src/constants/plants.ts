import { Species, Variety, PlantGenetics, Rarity, Allele } from '../types';

export interface ShopItem {
  id: string;
  species: Species;
  variety: Variety;
  name: string;
  price: number;
  baseGenetics: PlantGenetics;
  description: string;
  rarity: Rarity;
}

const createGenePair = (allele1: Allele, allele2: Allele) => ({
  allele1,
  allele2,
});

const createBaseGenetics = (
  color: [Allele, Allele],
  size: [Allele, Allele],
  speed: [Allele, Allele],
  yieldGene: [Allele, Allele],
  shape: [Allele, Allele],
  texture: [Allele, Allele],
  diseaseRes: [Allele, Allele] = ['E', 'e'],
  droughtTol: [Allele, Allele] = ['F', 'f'],
  aroma: [Allele, Allele] = ['G', 'g']
): PlantGenetics => ({
  color: createGenePair(color[0], color[1]),
  size: createGenePair(size[0], size[1]),
  growthRate: createGenePair(speed[0], speed[1]),
  yield: createGenePair(yieldGene[0], yieldGene[1]),
  shape: createGenePair(shape[0], shape[1]),
  texture: createGenePair(texture[0], texture[1]),
  diseaseResistance: createGenePair(diseaseRes[0], diseaseRes[1]),
  droughtTolerance: createGenePair(droughtTol[0], droughtTol[1]),
  aroma: createGenePair(aroma[0], aroma[1]),
  generation: 1,
  mutationCount: 0,
});

export const LEVEL_THRESHOLDS = [0, 50, 150, 350, 700, 1200, 2000, 3500, 6000, 10000];

export const POT_UNLOCKS: Record<number, number> = {
  1: 4,  // Level 1: 4 pots
  3: 6,  // Level 3: 6 pots
  5: 8,  // Level 5: 8 pots
  8: 10, // Level 8: 10 pots
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop_tom_cherry',
    species: 'Tomato',
    variety: 'Cherry',
    name: 'Cherry Tomato',
    price: 10,
    rarity: 'Common',
    description: 'Fast growing, small clusters of sweet fruits.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['b', 'b'], ['C', 'C'], ['d', 'd'], ['E', 'E'], ['F', 'F']),
  },
  {
    id: 'shop_tom_roma',
    species: 'Tomato',
    variety: 'Roma',
    name: 'Roma Tomato',
    price: 15,
    rarity: 'Common',
    description: 'Classic oval paste tomato. Great yield.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['B', 'b'], ['C', 'C'], ['D', 'D'], ['e', 'e'], ['F', 'f']),
  },
  {
    id: 'shop_tom_sanmarzano',
    species: 'Tomato',
    variety: 'San Marzano',
    name: 'San Marzano',
    price: 30,
    rarity: 'Rare',
    description: 'Elongated, highly prized for sauces.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['B', 'b'], ['c', 'c'], ['D', 'D'], ['e', 'e'], ['f', 'f']),
  },
  {
    id: 'shop_tom_beef',
    species: 'Tomato',
    variety: 'Beefsteak',
    name: 'Beefsteak Tomato',
    price: 45,
    rarity: 'Epic',
    description: 'Huge, ribbed fruits. Slow but valuable.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['B', 'B'], ['c', 'c'], ['d', 'd'], ['E', 'E'], ['f', 'f']),
  },
  {
    id: 'shop_tom_heirloom',
    species: 'Tomato',
    variety: 'Heirloom',
    name: 'Heirloom Tomato',
    price: 80,
    rarity: 'Legendary',
    description: 'Rare, high value, unique dark colors.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'b'], ['c', 'c'], ['D', 'D'], ['E', 'E'], ['f', 'f']),
  },

  {
    id: 'shop_chi_jalapeno',
    species: 'Chili',
    variety: 'Jalapeno',
    name: 'Jalapeno',
    price: 12,
    rarity: 'Common',
    description: 'Standard spicy green pepper. Reliable.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'b'], ['C', 'C'], ['D', 'd'], ['E', 'e'], ['F', 'F']),
  },
  {
    id: 'shop_chi_cayenne',
    species: 'Chili',
    variety: 'Cayenne',
    name: 'Cayenne',
    price: 18,
    rarity: 'Common',
    description: 'Long, thin, and fiery red.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['b', 'b'], ['C', 'C'], ['D', 'D'], ['e', 'e'], ['F', 'F']),
  },
  {
    id: 'shop_chi_poblano',
    species: 'Chili',
    variety: 'Poblano',
    name: 'Poblano',
    price: 25,
    rarity: 'Rare',
    description: 'Large, dark green, mild heat.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'B'], ['c', 'c'], ['D', 'd'], ['E', 'E'], ['F', 'f']),
  },
  {
    id: 'shop_chi_habanero',
    species: 'Chili',
    variety: 'Habanero',
    name: 'Habanero',
    price: 40,
    rarity: 'Epic',
    description: 'Very hot, orange lantern shape.',
    baseGenetics: createBaseGenetics(['A', 'a'], ['B', 'b'], ['C', 'C'], ['D', 'D'], ['E', 'E'], ['f', 'f']),
  },
  {
    id: 'shop_chi_ghost',
    species: 'Chili',
    variety: 'Ghost Pepper',
    name: 'Ghost Pepper',
    price: 100,
    rarity: 'Legendary',
    description: 'Extremely hot, wrinkled, high value.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['B', 'b'], ['c', 'c'], ['d', 'd'], ['E', 'E'], ['f', 'f']),
  },

  {
    id: 'shop_bas_sweet',
    species: 'Basil',
    variety: 'Sweet',
    name: 'Sweet Basil',
    price: 8,
    rarity: 'Common',
    description: 'Classic culinary basil with cupped leaves.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['B', 'b'], ['C', 'C'], ['D', 'd'], ['E', 'E'], ['F', 'F']),
  },
  {
    id: 'shop_bas_lemon',
    species: 'Basil',
    variety: 'Lemon',
    name: 'Lemon Basil',
    price: 14,
    rarity: 'Common',
    description: 'Light green, citrus scent.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'b'], ['C', 'C'], ['D', 'd'], ['E', 'E'], ['F', 'F']),
  },
  {
    id: 'shop_bas_thai',
    species: 'Basil',
    variety: 'Thai',
    name: 'Thai Basil',
    price: 22,
    rarity: 'Rare',
    description: 'Purple stems, narrow leaves, licorice flavor.',
    baseGenetics: createBaseGenetics(['A', 'a'], ['b', 'b'], ['C', 'C'], ['D', 'D'], ['E', 'e'], ['F', 'F']),
  },
  {
    id: 'shop_bas_purple',
    species: 'Basil',
    variety: 'Purple',
    name: 'Purple Basil',
    price: 35,
    rarity: 'Epic',
    description: 'Striking dark purple leaves.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'b'], ['c', 'c'], ['D', 'D'], ['E', 'E'], ['F', 'f']),
  },
  {
    id: 'shop_bas_holy',
    species: 'Basil',
    variety: 'Holy',
    name: 'Holy Basil',
    price: 60,
    rarity: 'Legendary',
    description: 'Sacred herb with jagged leaves.',
    baseGenetics: createBaseGenetics(['A', 'a'], ['B', 'b'], ['c', 'c'], ['D', 'D'], ['e', 'e'], ['f', 'f']),
  },

  {
    id: 'shop_rad_cherry',
    species: 'Radish',
    variety: 'Cherry Belle',
    name: 'Cherry Belle',
    price: 5,
    rarity: 'Common',
    description: 'Fastest growing, round red root.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['b', 'b'], ['C', 'C'], ['D', 'D'], ['E', 'E'], ['F', 'F']),
  },
  {
    id: 'shop_rad_french',
    species: 'Radish',
    variety: 'French Breakfast',
    name: 'French Breakfast',
    price: 12,
    rarity: 'Common',
    description: 'Oblong, red with white tip.',
    baseGenetics: createBaseGenetics(['A', 'A'], ['b', 'b'], ['C', 'c'], ['D', 'D'], ['E', 'e'], ['F', 'F']),
  },
  {
    id: 'shop_rad_daikon',
    species: 'Radish',
    variety: 'Daikon',
    name: 'Daikon',
    price: 20,
    rarity: 'Rare',
    description: 'Massive long white root.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'B'], ['c', 'c'], ['D', 'D'], ['e', 'e'], ['F', 'F']),
  },
  {
    id: 'shop_rad_black',
    species: 'Radish',
    variety: 'Black Spanish',
    name: 'Black Spanish',
    price: 35,
    rarity: 'Epic',
    description: 'Round with rough black skin.',
    baseGenetics: createBaseGenetics(['a', 'a'], ['B', 'b'], ['c', 'c'], ['D', 'd'], ['E', 'E'], ['f', 'f']),
  },
  {
    id: 'shop_rad_watermelon',
    species: 'Radish',
    variety: 'Watermelon',
    name: 'Watermelon Radish',
    price: 75,
    rarity: 'Legendary',
    description: 'Green outside, bright pink inside.',
    baseGenetics: createBaseGenetics(['A', 'a'], ['B', 'b'], ['c', 'c'], ['D', 'D'], ['E', 'E'], ['F', 'f']),
  },
];