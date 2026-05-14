import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameState,
  Seed,
  HarvestedItem,
  Plant,
  DiscoveredStrain,
  PlantGenetics,
  Species,
  Variety,
  MarketPrice,
  Mission,
  PestType,
  WeatherCondition,
} from '../types';
import { calculateOfflineProgress, getNextStage } from '../utils/timeUtils';
import { SHOP_ITEMS, LEVEL_THRESHOLDS, POT_UNLOCKS } from '../constants/plants';
import { SHOP_CONSUMABLES } from '../constants/items';
import { calculatePhenotype, getHarvestsPerPlant, getWeatherGrowthMultiplier, getPestResistance, getDroughtResistance } from '../genetics/phenotype';

interface GameActions {
  plantSeed: (potId: string, seedId: string) => void;
  waterPlant: (potId: string) => void;
  harvestPlant: (potId: string) => void;
  clearDeadPlant: (potId: string) => void;
  buySeed: (shopItemId: string) => void;
  buyConsumable: (consumableId: string) => void;
  useFertilizer: (potId: string, consumableId: string) => void;
  sellHarvest: (harvestId: string) => void;
  processOfflineTime: () => void;
  updateGameLoop: (deltaMs: number) => void;
  registerDiscovery: (seed: Seed) => void;
  addXp: (amount: number) => void;
  processWeather: () => void;
  tryInfectPests: () => void;
  claimMission: (missionId: string) => void;
  updateMissionProgress: () => void;
  addCrossbreed: () => void;
  addHarvest: () => void;
  addSeeds: (seeds: Seed[]) => void;
}

type GameStore = GameState & GameActions;

const WEATHER_CONDITIONS: WeatherCondition[] = ['Sunny', 'Cloudy', 'Rainy', 'Hot', 'Cold'];
const PEST_TYPES: PestType[] = ['Aphids', 'Fungus', 'RootRot', 'Whiteflies'];

const INITIAL_MISSIONS: Mission[] = [
  { id: 'mission_1', title: 'First Harvest', description: 'Harvest your first plant', type: 'harvest', target: 1, progress: 0, reward: { money: 50, xp: 30 }, completed: false, claimed: false },
  { id: 'mission_2', title: 'Green Thumb', description: 'Harvest 10 plants total', type: 'harvest', target: 10, progress: 0, reward: { money: 200, xp: 100 }, completed: false, claimed: false },
  { id: 'mission_3', title: 'Genetic Pioneer', description: 'Perform 3 crossbreeds', type: 'crossbreed', target: 3, progress: 0, reward: { money: 150, xp: 80 }, completed: false, claimed: false },
  { id: 'mission_4', title: 'Collector', description: 'Discover 5 unique strains', type: 'discover', target: 5, progress: 0, reward: { money: 300, xp: 150 }, completed: false, claimed: false },
  { id: 'mission_5', title: 'Wealthy Botanist', description: 'Earn 1000 coins total', type: 'money', target: 1000, progress: 0, reward: { money: 500, xp: 200 }, completed: false, claimed: false },
  { id: 'mission_6', title: 'Expert Grower', description: 'Harvest 50 plants', type: 'harvest', target: 50, progress: 0, reward: { money: 1000, xp: 500 }, completed: false, claimed: false },
  { id: 'mission_7', title: 'Master Breeder', description: 'Crossbreed 20 times', type: 'crossbreed', target: 20, progress: 0, reward: { money: 800, xp: 400 }, completed: false, claimed: false },
  { id: 'mission_8', title: 'Encyclopedia', description: 'Discover 20 unique strains', type: 'discover', target: 20, progress: 0, reward: { money: 2000, xp: 1000 }, completed: false, claimed: false },
];

const INITIAL_MARKET_PRICES: MarketPrice[] = [
  { species: 'Tomato', basePrice: 10, currentMultiplier: 1.0, lastFluctuated: Date.now() },
  { species: 'Chili', basePrice: 12, currentMultiplier: 1.0, lastFluctuated: Date.now() },
  { species: 'Basil', basePrice: 8, currentMultiplier: 1.0, lastFluctuated: Date.now() },
  { species: 'Radish', basePrice: 5, currentMultiplier: 1.0, lastFluctuated: Date.now() },
];

const INITIAL_STATE: GameState = {
  pots: [
    { id: 'pot_1', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_2', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_3', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_4', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_5', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_6', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_7', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_8', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_9', plant: null, size: 'Small', soilQuality: 100 },
    { id: 'pot_10', plant: null, size: 'Small', soilQuality: 100 },
  ],
  seeds: [],
  inventory: [],
  consumables: [],
  encyclopedia: {},
  money: 200,
  xp: 0,
  level: 1,
  lastSavedAt: Date.now(),
  missions: INITIAL_MISSIONS,
  marketPrices: INITIAL_MARKET_PRICES,
  currentWeather: 'Sunny',
  weatherUntil: Date.now() + 1000 * 60 * 30,
  totalHarvests: 0,
  totalCrossbreeds: 0,
  unlockedPots: 4,
};

const getPhenotypeId = (
  species: Species,
  variety: Variety,
  genetics: PlantGenetics
): string => {
  const isColorDom = genetics.color.allele1 === 'A' || genetics.color.allele2 === 'A';
  const isSizeDom = genetics.size.allele1 === 'B' || genetics.size.allele2 === 'B';

  return `${species}-${variety}-C${isColorDom ? 'D' : 'R'}-S${isSizeDom ? 'D' : 'R'}-G${genetics.generation}`;
};

const getLevelFromXp = (xp: number): number => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      addSeeds: (newSeeds) =>
        set((state) => {
          const updatedSeeds = [...state.seeds];
          for (const ns of newSeeds) {
            const existingIdx = updatedSeeds.findIndex(
              (s) => s.id === ns.id
            );
            if (existingIdx >= 0) {
              updatedSeeds[existingIdx] = {
                ...updatedSeeds[existingIdx],
                quantity: updatedSeeds[existingIdx].quantity + ns.quantity,
              };
            } else {
              updatedSeeds.push(ns);
            }
          }
          return { seeds: updatedSeeds, lastSavedAt: Date.now() };
        }),

      registerDiscovery: (seed) =>
        set((state) => {
          const phenotypeId = getPhenotypeId(seed.species, seed.variety, seed.genetics);

          if (!state.encyclopedia[phenotypeId]) {
            const newDiscovery: DiscoveredStrain = {
              id: phenotypeId,
              species: seed.species,
              variety: seed.variety,
              name: seed.name,
              discoveredAt: Date.now(),
              rarity: seed.rarity,
              generation: seed.genetics.generation,
              colorScore: seed.phenotype.colorScore,
              sizeScore: seed.phenotype.sizeScore,
              aromaScore: seed.phenotype.aromaScore,
            };

            return {
              encyclopedia: {
                ...state.encyclopedia,
                [phenotypeId]: newDiscovery,
              },
            };
          }

          return state;
        }),

      addXp: (amount) =>
        set((state) => {
          const newXp = state.xp + amount;
          const newLevel = getLevelFromXp(newXp);
          const newUnlockedPots = POT_UNLOCKS[newLevel] || state.unlockedPots;
          return {
            xp: newXp,
            level: newLevel,
            unlockedPots: Math.max(state.unlockedPots, newUnlockedPots),
            lastSavedAt: Date.now(),
          };
        }),

      processWeather: () =>
        set((state) => {
          const now = Date.now();
          if (now < state.weatherUntil) return state;

          const newWeather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
          const duration = 1000 * 60 * (15 + Math.floor(Math.random() * 30)); // 15-45 min
          return {
            currentWeather: newWeather,
            weatherUntil: now + duration,
            lastSavedAt: Date.now(),
          };
        }),

      tryInfectPests: () =>
        set((state) => {
          const updatedPots = state.pots.map((pot) => {
            if (!pot.plant || pot.plant.stage === 'Dead' || pot.plant.stage === 'HarvestReady') return pot;
            if (pot.plant.pest !== 'None') return pot; // already infected

            // 5% chance per tick to get pests, modified by resistance
            const resistance = pot.plant.phenotype.diseaseResistance;
            const infectionChance = 0.05 * (1 - getPestResistance(resistance, ''));
            if (Math.random() > infectionChance) return pot;

            const pest = PEST_TYPES[Math.floor(Math.random() * PEST_TYPES.length)];
            const severity = 10 + Math.floor(Math.random() * 30);

            return {
              ...pot,
              plant: {
                ...pot.plant,
                pest,
                pestSeverity: severity,
              },
            };
          });

          return { pots: updatedPots, lastSavedAt: Date.now() };
        }),

      addCrossbreed: () =>
        set((state) => {
          const newTotal = state.totalCrossbreeds + 1;
          return { totalCrossbreeds: newTotal, lastSavedAt: Date.now() };
        }),

      addHarvest: () =>
        set((state) => {
          const newTotal = state.totalHarvests + 1;
          return { totalHarvests: newTotal, lastSavedAt: Date.now() };
        }),

      updateMissionProgress: () =>
        set((state) => {
          const updatedMissions = state.missions.map((m) => {
            if (m.completed) return m;
            let progress = 0;
            switch (m.type) {
              case 'harvest': progress = state.totalHarvests; break;
              case 'crossbreed': progress = state.totalCrossbreeds; break;
              case 'discover': progress = Object.keys(state.encyclopedia).length; break;
              case 'money': progress = 2000 - state.money; break; // sum of all money earned (approximate)
              case 'level': progress = state.level; break;
            }
            return {
              ...m,
              progress: Math.min(m.target, progress),
              completed: progress >= m.target,
            };
          });
          return { missions: updatedMissions, lastSavedAt: Date.now() };
        }),

      claimMission: (missionId) =>
        set((state) => {
          const mission = state.missions.find((m) => m.id === missionId);
          if (!mission || !mission.completed || mission.claimed) return state;

          const moneyGain = mission.reward.money || 0;
          const xpGain = mission.reward.xp || 0;

          const newXp = state.xp + xpGain;
          const newLevel = getLevelFromXp(newXp);
          const newUnlockedPots = POT_UNLOCKS[newLevel] || state.unlockedPots;

          const newSeeds = [...state.seeds];
          if (mission.reward.seedId) {
            const rewardSeed = SHOP_ITEMS.find((s) => s.id === mission.reward.seedId);
            if (rewardSeed) {
              const phenotype = calculatePhenotype(rewardSeed.baseGenetics, rewardSeed.species);
              newSeeds.push({
                id: `mission_seed_${Date.now()}`,
                species: rewardSeed.species,
                variety: rewardSeed.variety,
                name: `${rewardSeed.name} Seed`,
                genetics: rewardSeed.baseGenetics,
                phenotype,
                quantity: 1,
                rarity: rewardSeed.rarity,
              });
            }
          }

          return {
            missions: state.missions.map((m) =>
              m.id === missionId ? { ...m, claimed: true } : m
            ),
            money: state.money + moneyGain,
            xp: newXp,
            level: newLevel,
            unlockedPots: Math.max(state.unlockedPots, newUnlockedPots),
            seeds: newSeeds,
            lastSavedAt: Date.now(),
          };
        }),

      buySeed: (shopItemId) =>
        set((state) => {
          const item = SHOP_ITEMS.find((i) => i.id === shopItemId);
          if (!item || state.money < item.price) {
            return state;
          }

          const phenotype = calculatePhenotype(item.baseGenetics, item.species);

          const newSeed: Seed = {
            id: `seed_${Date.now()}_${Math.random()}`,
            species: item.species,
            variety: item.variety,
            name: `${item.name} Seed`,
            genetics: item.baseGenetics,
            phenotype,
            quantity: 1,
            rarity: item.rarity,
          };

          const existingSeedIndex = state.seeds.findIndex(
            (s) =>
              s.species === item.species &&
              s.variety === item.variety &&
              s.genetics.generation === item.baseGenetics.generation
          );

          const newSeeds = [...state.seeds];

          if (existingSeedIndex >= 0) {
            newSeeds[existingSeedIndex] = {
              ...newSeeds[existingSeedIndex],
              quantity: newSeeds[existingSeedIndex].quantity + 1,
            };
          } else {
            newSeeds.push(newSeed);
          }

          return {
            money: state.money - item.price,
            seeds: newSeeds,
            lastSavedAt: Date.now(),
          };
        }),

      buyConsumable: (consumableId) =>
        set((state) => {
          const item = SHOP_CONSUMABLES.find((i) => i.id === consumableId);
          if (!item || state.money < item.price) {
            return state;
          }

          const existingIndex = state.consumables.findIndex((c) => c.id === consumableId);
          const newConsumables = [...state.consumables];

          if (existingIndex >= 0) {
            newConsumables[existingIndex] = {
              ...newConsumables[existingIndex],
              quantity: newConsumables[existingIndex].quantity + 1,
            };
          } else {
            newConsumables.push({ ...item, quantity: 1 });
          }

          return {
            money: state.money - item.price,
            consumables: newConsumables,
            lastSavedAt: Date.now(),
          };
        }),

      useFertilizer: (potId, consumableId) =>
        set((state) => {
          const consumableIndex = state.consumables.findIndex((c) => c.id === consumableId);
          if (consumableIndex === -1 || state.consumables[consumableIndex].quantity <= 0) {
            return state;
          }

          const consumable = state.consumables[consumableIndex];
          const newConsumables = [...state.consumables];
          newConsumables[consumableIndex] = {
            ...newConsumables[consumableIndex],
            quantity: newConsumables[consumableIndex].quantity - 1,
          };

          if (newConsumables[consumableIndex].quantity <= 0) {
            newConsumables.splice(consumableIndex, 1);
          }

          const newPots = state.pots.map((pot) => {
            if (pot.id !== potId || !pot.plant) return pot;

            switch (consumable.type) {
              case 'Growth': {
                const updatedPlant = calculateOfflineProgress(pot.plant, 4 * 60 * 60 * 1000, state.currentWeather);
                return { ...pot, plant: updatedPlant };
              }
              case 'Mutation':
                return { ...pot, activeFertilizer: 'Mutation' };
              case 'Fungicide':
                return {
                  ...pot,
                  plant: {
                    ...pot.plant,
                    pest: 'None' as PestType,
                    pestSeverity: 0,
                  },
                  activeFertilizer: 'Fungicide',
                };
              case 'RootBooster':
                return { ...pot, activeFertilizer: 'RootBooster' };
              case 'YieldBoost':
                return { ...pot, activeFertilizer: 'YieldBoost' };
              case 'GeneStabilizer':
                return { ...pot, activeFertilizer: 'GeneStabilizer' };
              default:
                return pot;
            }
          });

          return {
            consumables: newConsumables,
            pots: newPots,
            lastSavedAt: Date.now(),
          };
        }),

      sellHarvest: (harvestId) =>
        set((state) => {
          const itemIndex = state.inventory.findIndex((i) => i.id === harvestId);
          if (itemIndex === -1) {
            return state;
          }

          const item = state.inventory[itemIndex];

          // Apply market price multiplier
          const marketPrice = state.marketPrices.find((mp) => mp.species === item.species);
          const multiplier = marketPrice?.currentMultiplier ?? 1.0;
          const adjustedValue = Math.floor(item.value * multiplier);

          const newInventory = [...state.inventory];
          newInventory.splice(itemIndex, 1);

          return {
            inventory: newInventory,
            money: state.money + adjustedValue,
            lastSavedAt: Date.now(),
          };
        }),

      plantSeed: (potId, seedId) =>
        set((state) => {
          const seedIndex = state.seeds.findIndex((s) => s.id === seedId);
          if (seedIndex === -1) {
            return state;
          }

          const targetPot = state.pots.find((pot) => pot.id === potId);
          if (!targetPot || targetPot.plant) {
            return state;
          }

          // Check if pot is unlocked
          const potNumber = parseInt(potId.split('_')[1]);
          if (potNumber > state.unlockedPots) return state;

          const seed = state.seeds[seedIndex];
          const newSeeds = [...state.seeds];

          if (seed.quantity > 1) {
            newSeeds[seedIndex] = {
              ...seed,
              quantity: seed.quantity - 1,
            };
          } else {
            newSeeds.splice(seedIndex, 1);
          }

          const maxHarvests = getHarvestsPerPlant(seed.species);

          const newPlant: Plant = {
            id: `plant_${Date.now()}`,
            species: seed.species,
            variety: seed.variety,
            name: seed.name.replace(/ Seed$/, ''),
            genetics: seed.genetics,
            phenotype: seed.phenotype,
            stage: 'Seed',
            plantedAt: Date.now(),
            lastWateredAt: Date.now(),
            waterLevel: 100,
            health: 100,
            growthProgress: 0,
            yieldAmount: 0,
            isHybrid: seed.genetics.generation > 1,
            pest: 'None',
            pestSeverity: 0,
            harvestsRemaining: maxHarvests,
            maxHarvests,
          };

          const newPots = state.pots.map((pot) =>
            pot.id === potId
              ? { ...pot, plant: newPlant, activeFertilizer: undefined }
              : pot
          );

          return {
            pots: newPots,
            seeds: newSeeds,
            lastSavedAt: Date.now(),
          };
        }),

      waterPlant: (potId) =>
        set((state) => {
          const newPots = state.pots.map((pot) =>
            pot.id === potId && pot.plant
              ? {
                  ...pot,
                  plant: {
                    ...pot.plant,
                    waterLevel: 100,
                    lastWateredAt: Date.now(),
                  },
                }
              : pot
          );

          return {
            pots: newPots,
            lastSavedAt: Date.now(),
          };
        }),

      harvestPlant: (potId) =>
        set((state) => {
          const pot = state.pots.find((p) => p.id === potId);
          if (!pot || !pot.plant || (pot.plant.stage !== 'HarvestReady' && pot.plant.stage !== 'Fruiting')) {
            return state;
          }

          const plant = pot.plant;

          // Check if it's time for multi-harvest
          const canMultiHarvest = plant.harvestsRemaining > 1 && (plant.stage === 'HarvestReady' || plant.stage === 'Fruiting');

          const shopRef = SHOP_ITEMS.find((i) => i.variety === plant.variety);
          const baseValue = shopRef ? Math.floor(shopRef.price * 1.5) : 15;

          // Quality calculation based on multiple factors
          const growthQuality = Math.min(100, plant.growthProgress);
          const soilQuality = pot.soilQuality;
          const healthQuality = plant.health;
          const avgQuality = Math.floor((growthQuality + soilQuality + healthQuality) / 3);

          const quantity = plant.yieldAmount > 0 ? plant.yieldAmount : 1;

          // Apply yield boost if active
          const isYieldBoosted = pot.activeFertilizer === 'YieldBoost';
          const finalQuantity = isYieldBoosted ? quantity * 2 : quantity;

          const harvestedItem: HarvestedItem = {
            id: `harvest_${Date.now()}`,
            species: plant.species,
            variety: plant.variety,
            quality: Math.round(avgQuality),
            quantity: finalQuantity,
            value: Math.floor(
              (avgQuality / 100) * baseValue * Math.max(1, finalQuantity)
            ),
            rarity: shopRef?.rarity ?? 'Common',
            growthQuality,
            soilQuality,
            harvestTiming: Date.now(),
          };

          const newSeeds = [...state.seeds];

          // Handle mutation fertilizer
          if (pot.activeFertilizer === 'Mutation') {
            const mutatedGenetics: PlantGenetics = {
              ...plant.genetics,
              mutationCount: plant.genetics.mutationCount + 1,
            };

            const bonusSeed: Seed = {
              id: `seed_mut_${Date.now()}`,
              species: plant.species,
              variety: plant.variety,
              name: `Mutated ${plant.name} Seed`,
              genetics: mutatedGenetics,
              phenotype: calculatePhenotype(mutatedGenetics, plant.species),
              quantity: 1,
              rarity: 'Epic',
            };

            newSeeds.push(bonusSeed);
          }

          // Handle multi-harvest vs single harvest
          let newPlant: Plant | null;
          if (canMultiHarvest) {
            newPlant = {
              ...plant,
              harvestsRemaining: plant.harvestsRemaining - 1,
              stage: 'Flowering', // Go back to flowering for next cycle
              growthProgress: 0,
              yieldAmount: 0,
              pest: 'None',
              pestSeverity: 0,
            };
          } else {
            newPlant = null; // Plant is done
          }

          const newPots = state.pots.map((p) =>
            p.id === potId
              ? {
                  ...p,
                  plant: newPlant,
                  activeFertilizer: undefined,
                  soilQuality: Math.max(20, p.soilQuality - 5), // Soil degrades
                }
              : p
          );

          // XP for harvesting
          const harvestXp = 50;
          const newXp = state.xp + harvestXp;
          const newLevel = getLevelFromXp(newXp);
          const newUnlockedPots = POT_UNLOCKS[newLevel] || state.unlockedPots;

          return {
            pots: newPots,
            inventory: [...state.inventory, harvestedItem],
            seeds: newSeeds,
            xp: newXp,
            level: newLevel,
            unlockedPots: Math.max(state.unlockedPots, newUnlockedPots),
            totalHarvests: state.totalHarvests + 1,
            lastSavedAt: Date.now(),
          };
        }),

      clearDeadPlant: (potId) =>
        set((state) => {
          const newPots = state.pots.map((p) =>
            p.id === potId
              ? {
                  ...p,
                  plant: null,
                  activeFertilizer: undefined,
                  soilQuality: Math.max(20, p.soilQuality - 10), // Dead plant degrades soil more
                }
              : p
          );

          return {
            pots: newPots,
            lastSavedAt: Date.now(),
          };
        }),

      processOfflineTime: () =>
        set((state) => {
          const now = Date.now();
          const timeDeltaMs = now - state.lastSavedAt;

          if (timeDeltaMs < 1000) {
            return state;
          }

          const updatedPots = state.pots.map((pot) =>
            pot.plant
              ? { ...pot, plant: calculateOfflineProgress(pot.plant, timeDeltaMs, state.currentWeather) }
              : pot
          );

          // Fluctuate market prices while offline
          const updatedPrices = state.marketPrices.map((mp) => ({
            ...mp,
            currentMultiplier: 0.7 + Math.random() * 0.6, // Random between 0.7 and 1.3
            lastFluctuated: now,
          }));

          // Cycle weather
          const newWeather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];

          return {
            pots: updatedPots,
            marketPrices: updatedPrices,
            currentWeather: newWeather,
            weatherUntil: now + 1000 * 60 * 30,
            lastSavedAt: now,
          };
        }),

      updateGameLoop: (deltaMs) =>
        set((state) => {
          const now = Date.now();

          // Weather cycling
          let weather = state.currentWeather;
          let weatherUntil = state.weatherUntil;
          if (now >= weatherUntil) {
            weather = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
            weatherUntil = now + 1000 * 60 * (15 + Math.floor(Math.random() * 30));
          }

          // Fluctuate market prices occasionally (every ~10 ticks)
          let updatedPrices = state.marketPrices;
          if (Math.random() < 0.1) {
            updatedPrices = state.marketPrices.map((mp) => ({
              ...mp,
              currentMultiplier: Math.max(0.5, Math.min(2.0, mp.currentMultiplier + (Math.random() - 0.5) * 0.2)),
              lastFluctuated: now,
            }));
          }

          const updatedPots = state.pots.map((pot) => {
            if (!pot.plant) return pot;

            let plant = calculateOfflineProgress(pot.plant, deltaMs, weather);

            // Handle root booster
            if (pot.activeFertilizer === 'RootBooster') {
              const droughtResist = getDroughtResistance(plant.phenotype.droughtTolerance);
              const waterConservation = 1 - (1 - droughtResist) * 0.5;
              // Water depletes slower - handled inside timeUtils already
            }

            // Handle pest damage
            if (plant.pest !== 'None' && plant.stage !== 'HarvestReady' && plant.stage !== 'Dead') {
              const resistance = plant.phenotype.diseaseResistance;
              const damageReduction = getPestResistance(resistance, plant.pest);
              const damage = (plant.pestSeverity / 100) * deltaMs * 0.01 * (1 - damageReduction);

              plant = {
                ...plant,
                health: Math.max(0, plant.health - damage),
              };

              if (plant.health <= 0) {
                plant.stage = 'Dead';
              }
            }

            // Soil degradation
            const newSoilQuality = Math.max(20, pot.soilQuality - (deltaMs * 0.0001));

            return { ...pot, plant, soilQuality: newSoilQuality };
          });

          return {
            pots: updatedPots,
            currentWeather: weather,
            weatherUntil,
            marketPrices: updatedPrices,
            lastSavedAt: now,
          };
        }),
    }),
    {
      name: 'mendels-garden-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            state.processOfflineTime();
          } catch (e) {
            console.error('Failed to process offline time:', e);
          }
        }
      },
      // Skip validation errors for old schema versions
      partialize: (state) => {
        // Only persist the fields we need
        const { pots, seeds, inventory, consumables, encyclopedia, money, xp, level, lastSavedAt,
                missions, marketPrices, currentWeather, weatherUntil, totalHarvests, totalCrossbreeds, unlockedPots } = state;
        return { pots, seeds, inventory, consumables, encyclopedia, money, xp, level, lastSavedAt,
                missions, marketPrices, currentWeather, weatherUntil, totalHarvests, totalCrossbreeds, unlockedPots };
      },
    }
  )
);