import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pot, WeatherCondition, PestType } from '../types';
import { PotSvg } from './svg/PotSvg';
import { PlantSprite } from './svg/PlantSprite';
import { Droplets, Scissors, Trash2, Plus, FlaskConical, AlertTriangle, Bug, Sun, Cloud, CloudRain, Thermometer, Snowflake } from 'lucide-react-native';
import { Theme } from '../theme/colors';
import { getMutationVisual, getAromaDescription } from '../genetics/phenotype';

interface PotDisplayProps {
  pot: Pot;
  onWater: () => void;
  onHarvest: () => void;
  onClear: () => void;
  onPlant: () => void;
  onFertilize: () => void;
  weather?: WeatherCondition;
  isLocked?: boolean;
}

const WeatherIcon: React.FC<{ weather: WeatherCondition; size?: number }> = ({ weather, size = 16 }) => {
  const color = 'rgba(255,255,255,0.6)';
  switch (weather) {
    case 'Sunny': return <Sun color="#FFD700" size={size} />;
    case 'Cloudy': return <Cloud color={color} size={size} />;
    case 'Rainy': return <CloudRain color="#42A5F5" size={size} />;
    case 'Hot': return <Thermometer color="#FF7043" size={size} />;
    case 'Cold': return <Snowflake color="#81D4FA" size={size} />;
    default: return <Sun color="#FFD700" size={size} />;
  }
};

const PestIcon: React.FC<{ pest: PestType }> = ({ pest }) => {
  const colors: Record<string, string> = {
    Aphids: '#81C784',
    Fungus: '#8D6E63',
    RootRot: '#6D4C41',
    Whiteflies: '#B0BEC5',
  };
  if (pest === 'None') return null;
  return <Bug color={colors[pest] || '#EF5350'} size={14} />;
};

export const PotDisplay: React.FC<PotDisplayProps> = ({
  pot,
  onWater,
  onHarvest,
  onClear,
  onPlant,
  onFertilize,
  weather = 'Sunny',
  isLocked = false,
}) => {
  const { plant, activeFertilizer } = pot;
  const [showLegend, setShowLegend] = useState(false);

  const phenotypeLegend = [
    { abbr: 'CLR', full: 'Color', range: '1-5 (intensity)' },
    { abbr: 'SIZ', full: 'Size', range: '1-5 (scale)' },
    { abbr: 'SHP', full: 'Shape', range: '1-5 (elongation)' },
    { abbr: 'TXR', full: 'Texture', range: '1-5 (roughness)' },
    { abbr: 'DIS', full: 'Disease Resist.', range: '1-5 (resistance)' },
    { abbr: 'DRT', full: 'Drought Tol.', range: '1-5 (tolerance)' },
    { abbr: 'ARO', full: 'Aroma', range: '1-5 (intensity)' },
  ];

  if (isLocked) {
    return (
      <View style={[styles.container, styles.lockedContainer]}>
        <View style={styles.lockedIcon}>
          <Text style={styles.lockedText}>🔒</Text>
        </View>
        <Text style={styles.lockedLabel}>Locked</Text>
        <Text style={styles.lockedHint}>Level up to unlock</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, activeFertilizer === 'Mutation' && styles.mutatedContainer]}>
      {showLegend && (
        <TouchableOpacity 
          style={styles.legendOverlay}
          activeOpacity={1}
          onPress={() => setShowLegend(false)}
        >
          <View style={styles.legendBox}>
            <Text style={styles.legendTitle}>Phenotype Legend</Text>
            {phenotypeLegend.map((item) => (
              <View key={item.abbr} style={styles.legendRow}>
                <Text style={styles.legendAbbr}>{item.abbr}</Text>
                <Text style={styles.legendFull}>{item.full}</Text>
                <Text style={styles.legendRange}>{item.range}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.legendCloseBtn}
              onPress={() => setShowLegend(false)}
            >
              <Text style={styles.legendCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.graphicsContainer}>
        {plant && (
          <View style={styles.plantWrapper}>
            <PlantSprite
              stage={plant.stage}
              species={plant.species}
              variety={plant.variety}
              genetics={plant.genetics}
              health={plant.health}
              width={160}
              height={160}
              pest={plant.pest}
              mutationVisual={getMutationVisual(plant.genetics)}
            />
          </View>
        )}

        <View style={styles.potWrapper}>
          <PotSvg width={130} height={130} waterLevel={plant ? plant.waterLevel : 0} />
          {plant && plant.pest !== 'None' && (
            <View style={styles.pestBadge}>
              <PestIcon pest={plant.pest} />
              <Text style={styles.pestText}>{plant.pest}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.infoContainer}>
        {plant ? (
          <>
            <View style={styles.nameRow}>
              <Text style={styles.plantName} numberOfLines={1}>
                {plant.name}
              </Text>
              <WeatherIcon weather={weather} />
            </View>

            <Text
              style={[
                styles.stageText,
                activeFertilizer === 'Mutation' && { color: '#AB47BC' },
                plant.health < 30 && { color: '#EF5350' },
                plant.pest !== 'None' && { color: '#FFA726' },
              ]}
            >
              {plant.health <= 0 ? 'DEAD' :
               plant.pest !== 'None' ? `INFECTED: ${plant.pest}` :
               activeFertilizer === 'Mutation' ? 'MUTATING...' :
               activeFertilizer === 'Fungicide' ? 'TREATED' :
               activeFertilizer === 'RootBooster' ? 'ROOT BOOSTED' :
               activeFertilizer === 'YieldBoost' ? 'YIELD BOOSTED' :
               activeFertilizer === 'GeneStabilizer' ? 'STABILIZED' :
               plant.stage}
            </Text>

            {/* Multi-harvest indicator */}
            {plant.maxHarvests > 1 && plant.stage !== 'Dead' && (
              <Text style={styles.harvestCycleText}>
                Harvest {plant.maxHarvests - plant.harvestsRemaining + 1}/{plant.maxHarvests}
              </Text>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statColumn}>
                <Text style={styles.statLabel}>GROWTH</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.growthFill,
                      { width: `${Math.max(0, Math.min(100, plant.growthProgress))}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statColumn}>
                <Text style={styles.statLabel}>WATER</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.waterFill,
                      { width: `${Math.max(0, Math.min(100, plant.waterLevel))}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Soil quality bar */}
            <View style={styles.soilRow}>
              <Text style={styles.soilLabel}>SOIL</Text>
              <View style={styles.soilBarTrack}>
                <View
                  style={[
                    styles.soilFill,
                    { width: `${pot.soilQuality}%` },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowLegend(true)}
            >
              <View style={styles.phenotypeGrid}>
                <View style={styles.traitBox}>
                  <Text style={styles.traitLabel}>CLR</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.colorScore}</Text>
                </View>
                <View style={styles.traitBox}>
                  <Text style={styles.traitLabel}>SIZ</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.sizeScore}</Text>
                </View>
                <View style={styles.traitBox}>
                  <Text style={styles.traitLabel}>SHP</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.shapeScore}</Text>
                </View>
                <View style={styles.traitBox}>
                  <Text style={styles.traitLabel}>TXR</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.textureScore}</Text>
                </View>
                <View style={styles.traitBox}>
                  <Text style={styles.traitLabel}>DIS</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.diseaseResistance}</Text>
                </View>
                <View style={styles.traitBox}>
                  <Text style={styles.traitLabel}>DRT</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.droughtTolerance}</Text>
                </View>
                <View style={[styles.traitBox, styles.traitBoxFull]}>
                  <Text style={styles.traitLabel}>ARO</Text>
                  <Text style={styles.traitValue}>{plant.phenotype.aromaScore}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionButton, styles.waterBtn]} onPress={onWater}>
                <Droplets color="#FFF" size={18} />
              </TouchableOpacity>

              {(plant.stage === 'HarvestReady' || plant.stage === 'Fruiting') && plant.health > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.harvestBtn]}
                  onPress={onHarvest}
                >
                  <Scissors color="#FFF" size={18} />
                </TouchableOpacity>
              )}

              {plant.stage !== 'HarvestReady' && plant.stage !== 'Dead' && plant.stage !== 'Fruiting' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.fertilizeBtn]}
                  onPress={onFertilize}
                >
                  <FlaskConical color="#FFF" size={18} />
                </TouchableOpacity>
              )}

              {plant.stage === 'Dead' && (
                <TouchableOpacity style={[styles.actionButton, styles.clearBtn]} onPress={onClear}>
                  <Trash2 color="#FFF" size={18} />
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.emptyPotButton} onPress={onPlant}>
            <View style={styles.emptyIconWrapper}>
              <Plus color={Theme.primary} size={28} />
            </View>
            <Text style={styles.emptyPotText}>Plant Seed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: '#111D16',
    borderRadius: 24,
    padding: 16,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  lockedContainer: {
    opacity: 0.4,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  lockedIcon: { marginBottom: 8 },
  lockedText: { fontSize: 32, textAlign: 'center' },
  lockedLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' },
  lockedHint: { color: 'rgba(255,255,255,0.2)', fontSize: 10, textAlign: 'center', marginTop: 4 },
  mutatedContainer: {
    borderColor: 'rgba(171, 71, 188, 0.5)',
    shadowColor: '#AB47BC',
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  graphicsContainer: {
    width: 160,
    height: 200,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plantWrapper: {
    position: 'absolute',
    bottom: 55,
    zIndex: 2,
  },
  potWrapper: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  pestBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255, 167, 38, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 167, 38, 0.4)',
  },
  pestText: { color: '#FFA726', fontSize: 8, fontWeight: 'bold' },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  plantName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  stageText: {
    color: Theme.primary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  harvestCycleText: {
    color: '#FFD54F',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    marginBottom: 6,
  },
  statColumn: { flex: 1 },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    letterSpacing: 1,
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  growthFill: { height: '100%', backgroundColor: Theme.primary, borderRadius: 3 },
  waterFill: { height: '100%', backgroundColor: '#00B0FF', borderRadius: 3 },
  soilRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 6,
    marginBottom: 6,
  },
  soilLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold', letterSpacing: 1, width: 30 },
  soilBarTrack: { flex: 1, height: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden' },
  soilFill: { height: '100%', backgroundColor: '#8D6E63', borderRadius: 2 },
  phenotypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 6,
    borderRadius: 10,
    marginBottom: 12,
    gap: 3,
  },
  traitBox: {
    width: '18%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  traitBoxFull: { width: '100%', marginTop: 3, flexDirection: 'row', gap: 4, justifyContent: 'center' },
  traitLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 7,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  traitValue: {
    color: '#18FFFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  actionButton: { padding: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  waterBtn: { backgroundColor: '#0288D1' },
  fertilizeBtn: { backgroundColor: '#8E24AA' },
  harvestBtn: { backgroundColor: Theme.secondary },
  clearBtn: { backgroundColor: Theme.danger },
  emptyPotButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  emptyPotText: {
    color: Theme.primary,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  // Legend styles
  legendOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendBox: {
    backgroundColor: '#1A2A20',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.3)',
  },
  legendTitle: {
    color: '#18FFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  legendAbbr: { color: '#18FFFF', fontSize: 16, fontWeight: '900', width: 50 },
  legendFull: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
  legendRange: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'right' },
  legendCloseBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(24, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  legendCloseText: { color: '#18FFFF', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
});