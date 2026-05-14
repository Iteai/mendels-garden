import { PlantGenetics, GenePair, Allele, Species, SeedParent } from '../types';

const MUTATION_CHANCE = 0.05;

const getInheritedAllele = (pair: GenePair): Allele => {
  return Math.random() > 0.5 ? pair.allele1 : pair.allele2;
};

const mutateAllele = (allele: Allele): Allele => {
  if (Math.random() > MUTATION_CHANCE) {
    return allele;
  }

  const isUpperCase = allele === allele.toUpperCase();
  return (isUpperCase ? allele.toLowerCase() : allele.toUpperCase()) as Allele;
};

/**
 * Crossing over: with 30% chance, alleles within a gene pair swap
 * to simulate recombination (more realistic inheritance)
 */
const applyCrossingOver = (pair: GenePair, _isParentA: boolean): GenePair => {
  if (Math.random() > 0.3) {
    return pair; // no crossing over
  }
  // Swap alleles within the pair
  return { allele1: pair.allele2, allele2: pair.allele1 };
};

const combineGenes = (parentA: GenePair, parentB: GenePair): GenePair => {
  // Apply crossing over before inheritance
  const recombinedA = applyCrossingOver(parentA, true);
  const recombinedB = applyCrossingOver(parentB, false);

  let a1 = mutateAllele(getInheritedAllele(recombinedA));
  let a2 = mutateAllele(getInheritedAllele(recombinedB));

  // Sort: dominant allele first (uppercase)
  if (a1 === a1.toLowerCase() && a2 === a2.toUpperCase()) {
    const temp = a1;
    a1 = a2;
    a2 = temp;
  }

  return {
    allele1: a1,
    allele2: a2,
  };
};

export const crossbreed = (
  parentA: PlantGenetics,
  parentB: PlantGenetics
): PlantGenetics => {
  const newGenetics: PlantGenetics = {
    color: combineGenes(parentA.color, parentB.color),
    size: combineGenes(parentA.size, parentB.size),
    growthRate: combineGenes(parentA.growthRate, parentB.growthRate),
    yield: combineGenes(parentA.yield, parentB.yield),
    shape: combineGenes(parentA.shape, parentB.shape),
    texture: combineGenes(parentA.texture, parentB.texture),
    diseaseResistance: combineGenes(parentA.diseaseResistance, parentB.diseaseResistance),
    droughtTolerance: combineGenes(parentA.droughtTolerance, parentB.droughtTolerance),
    aroma: combineGenes(parentA.aroma, parentB.aroma),
    generation: Math.max(parentA.generation, parentB.generation) + 1,
    mutationCount: Math.max(parentA.mutationCount, parentB.mutationCount),
  };

  const inheritedPairs: Array<keyof Omit<PlantGenetics, 'generation' | 'mutationCount'>> = [
    'color',
    'size',
    'growthRate',
    'yield',
    'shape',
    'texture',
    'diseaseResistance',
    'droughtTolerance',
    'aroma',
  ];

  const hasMutation = inheritedPairs.some((key) => {
    const value = newGenetics[key];
    const sameAsParentA =
      value.allele1 === parentA[key].allele1 && value.allele2 === parentA[key].allele2;
    const sameAsParentB =
      value.allele1 === parentB[key].allele1 && value.allele2 === parentB[key].allele2;

    return !sameAsParentA && !sameAsParentB;
  });

  if (hasMutation) {
    newGenetics.mutationCount += 1;
  }

  return newGenetics;
};

export const createPedigree = (
  parentA: { id: string; name: string; species: Species; variety: string },
  parentB: { id: string; name: string; species: Species; variety: string },
  existingPedigreeA?: SeedParent[],
  existingPedigreeB?: SeedParent[]
): SeedParent[] => {
  const newPedigree: SeedParent[] = [
    { id: parentA.id, name: parentA.name, species: parentA.species, variety: parentA.variety as any },
    { id: parentB.id, name: parentB.name, species: parentB.species, variety: parentB.variety as any },
  ];

  // Include up to 2 grandparents from each side to limit pedigree size
  if (existingPedigreeA) {
    newPedigree.push(...existingPedigreeA.slice(0, 2));
  }
  if (existingPedigreeB) {
    newPedigree.push(...existingPedigreeB.slice(0, 2));
  }

  return newPedigree;
};

export const getPhenotypeColor = (species: Species, colorGene: GenePair): string => {
  const isDominant = colorGene.allele1 === 'A' || colorGene.allele2 === 'A';

  switch (species) {
    case 'Chili':
      return isDominant ? '#e63946' : '#ffb703';
    case 'Tomato':
      return isDominant ? '#d62828' : '#8338ec';
    case 'Basil':
      return isDominant ? '#2a9d8f' : '#52b788';
    case 'Radish':
      return isDominant ? '#e01e37' : '#ffffff';
    default:
      return '#4caf50';
  }
};

/**
 * Determine if there's co-dominance (both alleles different case but neither fully dominant).
 * Returns:
 * - 'dominant' if uppercase present → normal dominant expression
 * - 'recessive' if both lowercase → recessive 
 * - 'codominant' if one is uppercase and one lowercase of a different trait → blended
 */
export const getExpressionType = (pair: GenePair): 'dominant' | 'recessive' | 'codominant' => {
  const hasDominant = pair.allele1 === pair.allele1.toUpperCase() || pair.allele2 === pair.allele2.toUpperCase();
  if (hasDominant) {
    // If one uppercase and one lowercase but different letters → co-dominant blend
    if (pair.allele1.toUpperCase() !== pair.allele2.toUpperCase() && 
        pair.allele1 !== pair.allele2) {
      return 'codominant';
    }
    return 'dominant';
  }
  return 'recessive';
};