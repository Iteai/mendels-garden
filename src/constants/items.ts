export const SHOP_CONSUMABLES = [
  {
    id: 'growth_boost',
    name: 'Growth Booster',
    type: 'Growth' as const,
    description: 'Advances plant growth by 4 hours instantly.',
    price: 30,
  },
  {
    id: 'mutation_solution',
    name: 'Mutation Solution',
    type: 'Mutation' as const,
    description: 'Triggers a genetic mutation on next harvest.',
    price: 60,
  },
  {
    id: 'fungicide',
    name: 'Organic Fungicide',
    type: 'Fungicide' as const,
    description: 'Cures fungal infections and prevents spread for 24h.',
    price: 25,
  },
  {
    id: 'root_booster',
    name: 'Root Activator',
    type: 'RootBooster' as const,
    description: 'Improves water absorption by 50% for 12 hours.',
    price: 20,
  },
  {
    id: 'yield_booster',
    name: 'Yield Enhancer',
    type: 'YieldBoost' as const,
    description: 'Doubles harvest quantity on next harvest.',
    price: 45,
  },
  {
    id: 'gene_stabilizer',
    name: 'Gene Stabilizer',
    type: 'GeneStabilizer' as const,
    description: 'Reduces mutation chance during crossbreeding by 50%.',
    price: 80,
  },
];