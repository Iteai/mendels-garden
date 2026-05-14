import { PlantGenetics, PhenotypeTraits, Species, Variety, GenePair, WeatherCondition } from '../types';

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

export const calculatePhenotype = (
  genetics: PlantGenetics,
  _species: Species
): PhenotypeTraits => {
  const colorScore = clampScore(scoreAlleles(genetics.color.allele1, genetics.color.allele2));
  const sizeScore = clampScore(scoreAlleles(genetics.size.allele1, genetics.size.allele2));
  const shapeScore = clampScore(scoreAlleles(genetics.shape.allele1, genetics.shape.allele2));
  const textureScore = clampScore(scoreAlleles(genetics.texture.allele1, genetics.texture.allele2));
  const growthSpeed = clampScore(
    scoreAlleles(genetics.growthRate.allele1, genetics.growthRate.allele2)
  );
  const yieldAmount = clampScore(scoreAlleles(genetics.yield.allele1, genetics.yield.allele2));
  const diseaseResistance = clampScore(
    scoreAlleles(genetics.diseaseResistance.allele1, genetics.diseaseResistance.allele2)
  );
  const droughtTolerance = clampScore(
    scoreAlleles(genetics.droughtTolerance.allele1, genetics.droughtTolerance.allele2)
  );
  const aromaScore = clampScore(scoreAlleles(genetics.aroma.allele1, genetics.aroma.allele2));

  return {
    colorScore,
    sizeScore,
    shapeScore,
    textureScore,
    growthSpeed,
    yieldAmount,
    diseaseResistance,
    droughtTolerance,
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

export const getPestResistance = (
  resistanceScore: number,
  pestType: string
): number => {
  // Returns 0-1 multiplier for pest resistance
  const base = [0.2, 0.4, 0.6, 0.8, 1.0];
  const idx = clampScore(resistanceScore) - 1;
  return base[idx];
};

export const getDroughtResistance = (
  droughtScore: number
): number => {
  // Returns water consumption multiplier (lower = more resistant)
  const multipliers = [2.0, 1.5, 1.0, 0.7, 0.4];
  return multipliers[clampScore(droughtScore) - 1];
};

export const getAromaDescription = (aromaScore: number): string => {
  const aromas = [
    'Odorless',
    'Mild',
    'Fragrant',
    'Strong Aromatic',
    'Intensely Pungent',
  ];
  return aromas[clampScore(aromaScore) - 1];
};

export const getWeatherGrowthMultiplier = (
  weather: WeatherCondition,
  species: Species
): number => {
  switch (weather) {
    case 'Sunny':
      return 1.3; // Good for everything
    case 'Cloudy':
      return 0.9;
    case 'Rainy':
      return species === 'Basil' ? 0.7 : 1.1; // Basil hates too much water
    case 'Hot':
      return species === 'Chili' ? 1.4 : species === 'Radish' ? 0.6 : 0.9;
    case 'Cold':
      return species === 'Radish' ? 1.2 : species === 'Chili' ? 0.5 : 0.8;
    default:
      return 1.0;
  }
};

/**
 * Generate a mutated visual description based on mutation count
 */
export const getMutationVisual = (genetics: PlantGenetics): string => {
  const count = genetics.mutationCount;
  if (count === 0) return 'normal';
  if (count === 1) return 'variegated';
  if (count === 2) return 'striped';
  if (count === 3) return 'iridescent';
  return 'mutant';
};

export const getHarvestsPerPlant = (species: Species): number => {
  switch (species) {
    case 'Basil': return 4;  // Cut-and-come-again
    case 'Chili': return 3;
    case 'Tomato': return 2;
    case 'Radish': return 1; // Root vegetable, single harvest
    default: return 1;
  }
};