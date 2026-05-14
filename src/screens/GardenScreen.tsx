import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/useGameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { PotDisplay } from '../components/PotDisplay';
import { Seed, Consumable } from '../types';
import { Theme } from '../theme/colors';
import { SeedPacketSvg } from '../components/svg/SeedPacketSvg';
import { FlaskConical, X, Sun, Cloud, CloudRain, Thermometer, Snowflake, Target } from 'lucide-react-native';

export const GardenScreen: React.FC = () => {
  useGameLoop();

  const pots = useGameStore((state) => state.pots);
  const seeds = useGameStore((state) => state.seeds);
  const consumables = useGameStore((state) => state.consumables);
  const currentWeather = useGameStore((state) => state.currentWeather);
  const unlockedPots = useGameStore((state) => state.unlockedPots);
  const missions = useGameStore((state) => state.missions);
  const claimMission = useGameStore((state) => state.claimMission);
  
  const plantSeed = useGameStore((state) => state.plantSeed);
  const waterPlant = useGameStore((state) => state.waterPlant);
  const harvestPlant = useGameStore((state) => state.harvestPlant);
  const clearDeadPlant = useGameStore((state) => state.clearDeadPlant);
  const useFertilizer = useGameStore((state) => state.useFertilizer);

  const [showMissions, setShowMissions] = useState(false);

  const WeatherIcon = () => {
    switch (currentWeather) {
      case 'Sunny': return <Sun color="#FFD700" size={16} />;
      case 'Cloudy': return <Cloud color="rgba(255,255,255,0.6)" size={16} />;
      case 'Rainy': return <CloudRain color="#42A5F5" size={16} />;
      case 'Hot': return <Thermometer color="#FF7043" size={16} />;
      case 'Cold': return <Snowflake color="#81D4FA" size={16} />;
      default: return <Sun color="#FFD700" size={16} />;
    }
  };

  const unclaimedCount = missions.filter(m => m.completed && !m.claimed).length;

  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'seed' | 'fertilizer' | null>(null);

  const handleOpenModal = (potId: string, type: 'seed' | 'fertilizer') => {
    setSelectedPotId(potId);
    setModalType(type);
  };

  const handleAction = (itemId: string) => {
    if (selectedPotId) {
      if (modalType === 'seed') plantSeed(selectedPotId, itemId);
      if (modalType === 'fertilizer') useFertilizer(selectedPotId, itemId);
    }
    setModalType(null);
    setSelectedPotId(null);
  };

  const renderSeedItem = ({ item }: { item: Seed }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleAction(item.id)}>
      <SeedPacketSvg species={item.species} rarity={item.rarity} width={40} height={55} />
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listDetails}>Gen: {item.genetics.generation} | Qty: {item.quantity}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderConsumableItem = ({ item }: { item: Consumable }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleAction(item.id)}>
      <View style={styles.consumableIcon}>
        <FlaskConical color={item.type === 'Mutation' ? '#AB47BC' : '#00E676'} size={24} />
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listDetails}>Qty: {item.quantity} | {item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>My Garden</Text>
          <WeatherIcon />
          <Text style={styles.weatherLabel}>{currentWeather}</Text>
        </View>
        <TouchableOpacity style={styles.missionsButton} onPress={() => setShowMissions(true)}>
          <Target color="#18FFFF" size={20} />
          {unclaimedCount > 0 && (
            <View style={styles.missionBadge}>
              <Text style={styles.missionBadgeText}>{unclaimedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {pots.map((pot) => (
            <PotDisplay
              key={pot.id}
              pot={pot}
              onWater={() => waterPlant(pot.id)}
              onHarvest={() => harvestPlant(pot.id)}
              onClear={() => clearDeadPlant(pot.id)}
              onPlant={() => handleOpenModal(pot.id, 'seed')}
              onFertilize={() => handleOpenModal(pot.id, 'fertilizer')}
              weather={currentWeather}
              isLocked={parseInt(pot.id.split('_')[1]) > unlockedPots}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'seed' ? 'Select a Seed' : 'Select Fertilizer'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>

            {modalType === 'seed' && seeds.length === 0 && (
              <Text style={styles.emptyText}>No seeds in inventory. Visit the Shop!</Text>
            )}
            {modalType === 'fertilizer' && consumables.length === 0 && (
              <Text style={styles.emptyText}>No supplies in inventory. Visit the Shop!</Text>
            )}

            <FlatList
              data={modalType === 'seed' ? seeds : consumables}
              keyExtractor={(item) => item.id}
              renderItem={modalType === 'seed' ? renderSeedItem : renderConsumableItem as any}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showMissions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Missions</Text>
              <TouchableOpacity onPress={() => setShowMissions(false)}>
                <X color="#FFF" size={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={missions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.listItem, item.completed && item.claimed && { opacity: 0.5 }]}>
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{item.title}</Text>
                    <Text style={styles.listDetails}>{item.description}</Text>
                    <View style={styles.missionProgressBar}>
                      <View style={[styles.missionProgressFill, { width: `${Math.min(100, (item.progress / item.target) * 100)}%` }]} />
                    </View>
                    <Text style={styles.missionProgressText}>{item.progress}/{item.target}</Text>
                  </View>
                  {item.completed && !item.claimed && (
                    <TouchableOpacity
                      style={styles.claimBtn}
                      onPress={() => claimMission(item.id)}
                    >
                      <Text style={styles.claimBtnText}>Claim</Text>
                    </TouchableOpacity>
                  )}
                  {item.claimed && (
                    <Text style={styles.claimedText}>✓</Text>
                  )}
                </View>
              )}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.text },
  weatherLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  missionsButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(24, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.3)',
  },
  missionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00E676',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionBadgeText: {
    color: '#050B08',
    fontSize: 11,
    fontWeight: '900',
  },
  scrollContent: { padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111D16', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Theme.text },
  list: { marginBottom: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 12, marginBottom: 10, gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  consumableIcon: { width: 40, height: 55, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8 },
  listInfo: { flex: 1 },
  listName: { color: Theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  listDetails: { color: Theme.textMuted, fontSize: 14 },
  emptyText: { color: Theme.textMuted, textAlign: 'center', marginVertical: 30, fontSize: 16 },
  missionProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    backgroundColor: '#18FFFF',
    borderRadius: 2,
  },
  missionProgressText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  claimBtn: {
    backgroundColor: '#00E676',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  claimBtnText: {
    color: '#050B08',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  claimedText: {
    color: '#00E676',
    fontSize: 20,
    fontWeight: '900',
  },
});