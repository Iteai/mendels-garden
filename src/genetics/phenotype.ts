import { PlantGenetics, PhenotypeTraits, Species, Variety, GenePair } from '../types';
import { calculateHybridVigor, calculateSegregationVariance } from './engine';

const clampScore = (value: number): number => {
  return Math.max(1, Math.min(5, value));
};

const scoreAlleles = (allele1: string, allele2: string): number => {
  const isDom1 = allele1 === allele1.toUpperCase();
  const isDom2 = allele2 === allele2.toUpperCase();

  if (isDom1 && isDom2) return 5;
  if (isDom1 || isDom2) return 3;
  return 1;
};

/**
 * REALISTIC PHENOTYPE CALCULATION
 * Accounting for:
 * - F1 vigor (heterosis)
 * - F2 segregation variability
 * - Trait dominance/recessiveness
 */
export const calculatePhenotype = (
  genetics: PlantGenetics,
  _species: Species
): PhenotypeTraits => {
  // Base score from alleles
  let colorScore = clampScore(scoreAlleles(genetics.color.allele1, genetics.color.allele2));
  let sizeScore = clampScore(scoreAlleles(genetics.size.allele1, genetics.size.allele2));
  let shapeScore = clampScore(scoreAlleles(genetics.shape.allele1, genetics.shape.allele2));
  let textureScore = clampScore(scoreAlleles(genetics.texture.allele1, genetics.texture.allele2));
  let growthSpeed = clampScore(scoreAlleles(genetics.growthRate.allele1, genetics.growthRate.allele2));
  let yieldAmount = clampScore(scoreAlleles(genetics.yield.allele1, genetics.yield.allele2));
  let flavorScore = clampScore(scoreAlleles(genetics.flavor.allele1, genetics.flavor.allele2));
  let aromaScore = clampScore(scoreAlleles(genetics.aromaIntensity.allele1, genetics.aromaIntensity.allele2));

  // APPLY F1 HYBRID VIGOR BOOST
  if (genetics.isHybrid && genetics.generation === 1) {
    const vigorBoost = calculateHybridVigor(genetics);
    // F1 vigore aumenta crescita e resa
    growthSpeed = clampScore(growthSpeed + vigorBoost * 2);
    yieldAmount = clampScore(yieldAmount + vigorBoost * 1.5);
  }

  // APPLY F2 SEGREGATION VARIABILITY (reduced from maximum)
  if (genetics.isHybrid && genetics.generation === 2) {
    // In F2, la variabilità genetica causa fenotipo più "instabile"
    // Alcuni tratti possono essere più estremi per segregazione
    const variance = calculateSegregationVariance(genetics);
    
    // Aggiusta casualmente alcuni tratti (segregazione mendeliana)
    if (Math.random() < 0.3) colorScore = clampScore(colorScore + (Math.random() - 0.5) * 2 * variance);
    if (Math.random() < 0.3) sizeScore = clampScore(sizeScore + (Math.random() - 0.5) * 2 * variance);
    if (Math.random() < 0.3) growthSpeed = clampScore(growthSpeed - variance); // Alcuni F2 sono più lenti
  }

  return {
    colorScore,
    sizeScore,
    shapeScore,
    textureScore,
    growthSpeed,
    yieldAmount,
    flavorScore,
    aromaScore,
  };
};

export const getColorFromScore = (
  species: Species,
  variety: Variety,
  colorScore: number
): string => {
  const score = clampScore(colorScore);

  switch (species) {
    case 'Chili': {
      const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF6347', '#8B0000'];
      return colors[score - 1];
    }

    case 'Tomato': {
      const colors = ['#FFD700', '#FFB347', '#FF8C69', '#DC143C', '#8B0000'];
      return colors[score - 1];
    }

    case 'Basil': {
      if (variety === 'Purple' || variety === 'Thai' || variety === 'Holy') {
        const colors = ['#7CB342', '#558B2F', '#33691E', '#6A1B9A', '#311B92'];
        return colors[score - 1];
      }

      const colors = ['#C8E6C9', '#81C784', '#4CAF50', '#2E7D32', '#1B5E20'];
      return colors[score - 1];
    }

    case 'Radish': {
      const colors = ['#FFCDD2', '#F48FB1', '#EC407A', '#C2185B', '#880E4F'];
      return colors[score - 1];
    }

    default:
      return '#4CAF50';
  }
};

export const getSizeMultiplier = (sizeScore: number): number => {
  const multipliers = [0.7, 0.85, 1.0, 1.2, 1.5];
  return multipliers[clampScore(sizeScore) - 1];
};

export const getShapeRatio = (
  shapeScore: number
): { widthRatio: number; heightRatio: number } => {
  const ratios = [
    { widthRatio: 1.0, heightRatio: 1.0 },
    { widthRatio: 0.9, heightRatio: 1.1 },
    { widthRatio: 0.8, heightRatio: 1.3 },
    { widthRatio: 0.7, heightRatio: 1.6 },
    { widthRatio: 0.6, heightRatio: 2.0 },
  ];

  return ratios[clampScore(shapeScore) - 1];
};

export const getTextureDetails = (
  textureScore: number
): { roughness: number; wrinkles: boolean; ribs: boolean } => {
  const textures = [
    { roughness: 0, wrinkles: false, ribs: false },
    { roughness: 1, wrinkles: false, ribs: false },
    { roughness: 2, wrinkles: true, ribs: false },
    { roughness: 3, wrinkles: true, ribs: true },
    { roughness: 4, wrinkles: true, ribs: true },
  ];

  return textures[clampScore(textureScore) - 1];
};

export const getFlavorDescription = (flavorScore: number): string => {
  const flavors = [
    'Bland',
    'Mild',
    'Balanced',
    'Rich',
    'Intense',
  ];
  return flavors[clampScore(flavorScore) - 1];
};

export const getAromaDescription = (aromaScore: number): string => {
  const aromas = [
    'Odorless',
    'Mild',
    'Fragrant',
    'Strong',
    'Intensely Aromatic',
  ];
  return aromas[clampScore(aromaScore) - 1];
};

export const getHarvestsPerPlant = (species: Species): number => {
  switch (species) {
    case 'Basil': return 4;  // Cut-and-come-again
    case 'Chili': return 3;
    case 'Tomato': return 2;
    case 'Radish': return 1; // Root vegetable
    default: return 1;
  }
};

/**
 * Calculates actual time for growth stage based on phenotype
 */
export const getGrowthSpeedMultiplier = (growthSpeed: number): number => {
  const multipliers = [2.0, 1.5, 1.0, 0.7, 0.4];
  return multipliers[clampScore(growthSpeed) - 1];
};

/**
 * Gets mutation visual based on rare variants
 * (placeholder for visual differentiation)
 */
export const getMutationVisual = (genetics: PlantGenetics): string => {
  const mutationChance = genetics.generation > 2 ? 0.1 : 0.02;
  if (Math.random() < mutationChance) {
    return 'variegated';
  }
  return 'normal';
};

/**
 * Generates description of generation stability
 */
export const getGenerationStabilityDescription = (generation: number, isHybrid: boolean): string => {
  if (!isHybrid) return 'Pure line - traits stable';
  if (generation === 1) return 'F1 Hybrid - uniform vigor';
  if (generation === 2) return 'F2 Segregation - high variability';
  if (generation === 3) return 'F3 - stabilizing traits';
  return `F${generation} - establishing homozygous lines`;
};
