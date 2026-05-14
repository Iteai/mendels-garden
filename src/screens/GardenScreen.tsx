import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/useGameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { PotDisplay } from '../components/PotDisplay';
import { Seed, Consumable } from '../types';
import { Theme } from '../theme/colors';
import { SeedPacketSvg } from '../components/svg/SeedPacketSvg';
import { FlaskConical, X } from 'lucide-react-native';

export const GardenScreen: React.FC = () => {
  useGameLoop();

  const pots = useGameStore((state) => state.pots);
  const seeds = useGameStore((state) => state.seeds);
  const consumables = useGameStore((state) => state.consumables);
  
  const plantSeed = useGameStore((state) => state.plantSeed);
  const waterPlant = useGameStore((state) => state.waterPlant);
  const harvestPlant = useGameStore((state) => state.harvestPlant);
  const clearDeadPlant = useGameStore((state) => state.clearDeadPlant);
  const useFertilizer = useGameStore((state) => state.useFertilizer);

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
        <Text style={styles.title}>My Garden</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.background },
  header: { padding: 20, backgroundColor: Theme.surface, borderBottomWidth: 1, borderBottomColor: Theme.surfaceLight },
  title: { fontSize: 24, fontWeight: 'bold', color: Theme.text },
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
  emptyText: { color: Theme.textMuted, textAlign: 'center', marginVertical: 30, fontSize: 16 }
});
