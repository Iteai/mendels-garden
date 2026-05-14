import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ListRenderItem, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/useGameStore';
import { Coins, Leaf, Beaker, Dna, X } from 'lucide-react-native';
import { Theme } from '../theme/colors';
import { SeedPacketSvg } from '../components/svg/SeedPacketSvg';
import { HarvestedItem, Seed, SeedParent } from '../types';

export const InventoryScreen: React.FC = () => {
  const [tab, setTab] = useState<'seeds' | 'harvests'>('seeds');
  const [showLegend, setShowLegend] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState<Seed | null>(null);
  const seeds = useGameStore((state) => state.seeds);
  const inventory = useGameStore((state) => state.inventory);
  const money = useGameStore((state) => state.money);
  const sellHarvest = useGameStore((state) => state.sellHarvest);

  const phenotypeLegend = [
    { abbr: 'CLR', full: 'Color', range: '1-5 (intensity)' },
    { abbr: 'SIZ', full: 'Size', range: '1-5 (scale)' },
    { abbr: 'SHP', full: 'Shape', range: '1-5 (elongation)' },
    { abbr: 'TXR', full: 'Texture', range: '1-5 (roughness)' },
    { abbr: 'GRO', full: 'Growth Speed', range: '1-5 (rate)' },
    { abbr: 'YLD', full: 'Yield Amount', range: '1-5 (quantity)' },
  ];

  const renderPedigree = (pedigree?: SeedParent[]) => {
    if (!pedigree || pedigree.length === 0) return null;

    // Show parents (first 2) and grandparents (next up to 4)
    const parents = pedigree.slice(0, 2);
    const grandparents = pedigree.slice(2);

    return (
      <View style={styles.pedigreeContainer}>
        <Text style={styles.pedigreeTitle}>Lineage</Text>
        <View style={styles.pedigreeTree}>
          {/* Parents */}
          <View style={styles.pedigreeGen}>
            <Text style={styles.pedigreeGenLabel}>P{parents[0]?.species === parents[1]?.species ? 'arents' : 'arent 1'}</Text>
            {parents.map((p, i) => (
              <View key={i} style={styles.pedigreeNode}>
                <View style={styles.pedigreeDot} />
                <Text style={styles.pedigreeNodeText} numberOfLines={1}>{p.name}</Text>
              </View>
            ))}
          </View>
          {/* Arrow */}
          <Text style={styles.pedigreeArrow}>↓</Text>
          {/* This seed */}
          <View style={styles.pedigreeGen}>
            <Text style={styles.pedigreeGenLabel}>Offspring</Text>
            <View style={[styles.pedigreeNode, styles.pedigreeNodeActive]}>
              <View style={[styles.pedigreeDot, { backgroundColor: '#18FFFF' }]} />
              <Text style={[styles.pedigreeNodeText, { color: '#18FFFF' }]}>This Seed</Text>
            </View>
          </View>
          {/* Grandparents if any */}
          {grandparents.length > 0 && (
            <>
              <Text style={styles.pedigreeArrow}>↑</Text>
              <View style={styles.pedigreeGen}>
                <Text style={styles.pedigreeGenLabel}>Grandparents</Text>
                {grandparents.map((gp, i) => (
                  <View key={i} style={styles.pedigreeNode}>
                    <View style={[styles.pedigreeDot, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
                    <Text style={styles.pedigreeNodeText} numberOfLines={1}>{gp.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderSeed: ListRenderItem<Seed> = ({ item }) => (
    <TouchableOpacity
      style={styles.cardWrapper}
      onPress={() => setSelectedSeed(item)}
      activeOpacity={0.8}
    >
      <View style={styles.packetContainer}>
        <SeedPacketSvg species={item.species} rarity={item.rarity} width={70} height={98} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>x{item.quantity}</Text>
            </View>
          </View>

          <Text style={[styles.rarityText, { color: Theme.rarity[item.rarity] }]}>
            {item.rarity} • Gen {item.genetics.generation}
          </Text>

          {item.pedigree && item.pedigree.length > 0 && (
            <View style={styles.pedigreeTag}>
              <Dna color="#18FFFF" size={12} />
              <Text style={styles.pedigreeTagText}>Has lineage</Text>
            </View>
          )}

          <View style={styles.genesGrid}>
            <View style={styles.geneBox}>
              <Text style={styles.geneLabel}>CLR</Text>
              <Text style={styles.geneValue}>{item.phenotype.colorScore}</Text>
            </View>
            <View style={styles.geneBox}>
              <Text style={styles.geneLabel}>SIZ</Text>
              <Text style={styles.geneValue}>{item.phenotype.sizeScore}</Text>
            </View>
            <View style={styles.geneBox}>
              <Text style={styles.geneLabel}>SHP</Text>
              <Text style={styles.geneValue}>{item.phenotype.shapeScore}</Text>
            </View>
            <View style={styles.geneBox}>
              <Text style={styles.geneLabel}>TXR</Text>
              <Text style={styles.geneValue}>{item.phenotype.textureScore}</Text>
            </View>
          </View>

          <View style={styles.traitsRow}>
            <View style={styles.smallTraitBox}>
              <Text style={styles.smallTraitLabel}>GRO</Text>
              <Text style={styles.smallTraitValue}>{item.phenotype.growthSpeed}</Text>
            </View>
            <View style={styles.smallTraitBox}>
              <Text style={styles.smallTraitLabel}>YLD</Text>
              <Text style={styles.smallTraitValue}>{item.phenotype.yieldAmount}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHarvest: ListRenderItem<HarvestedItem> = ({ item }) => (
    <View style={styles.harvestCard}>
      <View style={styles.harvestHeader}>
        <View style={styles.harvestTitleContainer}>
          <Text style={styles.cardTitle}>{item.variety} Harvest</Text>
          <Text style={[styles.rarityText, { color: Theme.rarity[item.rarity] }]}>
            {item.rarity} Quality • {Math.round(item.quality)}% Health
          </Text>
        </View>

        <View style={styles.qtyBadge}>
          <Text style={styles.qtyText}>x{item.quantity}</Text>
        </View>
      </View>

      <View style={styles.harvestBottom}>
        <View style={styles.priceTag}>
          <Coins color={Theme.secondary} size={18} />
          <Text style={styles.priceText}>+{item.value}</Text>
        </View>

        <TouchableOpacity
          style={styles.sellButtonWrapper}
          onPress={() => sellHarvest(item.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FFB300', '#FF8F00']}
            style={styles.sellButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Coins color="#FFF" size={16} />
            <Text style={styles.sellButtonText}>Sell</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Storage Archive</Text>
          <TouchableOpacity onPress={() => setShowLegend(true)} style={styles.legendButton}>
            <Text style={styles.legendButtonText}>?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.moneyContainer}>
          <Coins color={Theme.secondary} size={24} />
          <Text style={styles.money}>{money}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'seeds' && styles.activeTab]}
          onPress={() => setTab('seeds')}
        >
          <Beaker color={tab === 'seeds' ? '#18FFFF' : 'rgba(255,255,255,0.4)'} size={20} />
          <Text style={[styles.tabText, tab === 'seeds' && styles.activeTabText]}>
            Genetic Seeds
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'harvests' && styles.activeTab]}
          onPress={() => setTab('harvests')}
        >
          <Leaf color={tab === 'harvests' ? '#00E676' : 'rgba(255,255,255,0.4)'} size={20} />
          <Text style={[styles.tabText, tab === 'harvests' && styles.activeTabText]}>
            Organic Harvests
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'seeds' ? (
        <FlatList
          data={seeds}
          key="seeds"
          keyExtractor={(item) => item.id}
          renderItem={renderSeed}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No seeds yet. Visit the Shop!</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={inventory}
          key="harvests"
          keyExtractor={(item) => item.id}
          renderItem={renderHarvest}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No harvests yet. Plant and grow!</Text>
            </View>
          }
        />
      )}
      {/* Seed Detail / Pedigree Modal */}
      <Modal visible={selectedSeed !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seed Details</Text>
                <TouchableOpacity onPress={() => setSelectedSeed(null)}>
                  <X color="#18FFFF" size={28} />
                </TouchableOpacity>
              </View>

              {selectedSeed && (
                <>
                  <View style={styles.modalSeedHeader}>
                    <SeedPacketSvg species={selectedSeed.species} rarity={selectedSeed.rarity} width={60} height={84} />
                    <View style={styles.modalSeedInfo}>
                      <Text style={styles.modalSeedName}>{selectedSeed.name}</Text>
                      <Text style={[styles.modalRarity, { color: Theme.rarity[selectedSeed.rarity] }]}>
                        {selectedSeed.rarity} • Gen {selectedSeed.genetics.generation}
                      </Text>
                      {selectedSeed.pedigree && selectedSeed.pedigree.length > 0 && (
                        <View style={styles.modalLineageTag}>
                          <Dna color="#18FFFF" size={14} />
                          <Text style={styles.modalLineageText}>Has genealogy</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.modalGenesGrid}>
                    <View style={styles.modalGeneBox}><Text style={styles.modalGeneLabel}>CLR</Text><Text style={styles.modalGeneValue}>{selectedSeed.phenotype.colorScore}</Text></View>
                    <View style={styles.modalGeneBox}><Text style={styles.modalGeneLabel}>SIZ</Text><Text style={styles.modalGeneValue}>{selectedSeed.phenotype.sizeScore}</Text></View>
                    <View style={styles.modalGeneBox}><Text style={styles.modalGeneLabel}>SHP</Text><Text style={styles.modalGeneValue}>{selectedSeed.phenotype.shapeScore}</Text></View>
                    <View style={styles.modalGeneBox}><Text style={styles.modalGeneLabel}>TXR</Text><Text style={styles.modalGeneValue}>{selectedSeed.phenotype.textureScore}</Text></View>
                    <View style={styles.modalGeneBox}><Text style={styles.modalGeneLabel}>GRO</Text><Text style={styles.modalGeneValue}>{selectedSeed.phenotype.growthSpeed}</Text></View>
                    <View style={styles.modalGeneBox}><Text style={styles.modalGeneLabel}>YLD</Text><Text style={styles.modalGeneValue}>{selectedSeed.phenotype.yieldAmount}</Text></View>
                  </View>

                  {/* Pedigree Tree */}
                  {renderPedigree(selectedSeed.pedigree)}

                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedSeed(null)}
                  >
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B08',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A140F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  legendButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(24, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendButtonText: {
    color: '#18FFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  legendOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  legendBox: {
    backgroundColor: '#1A2A20',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
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
  legendAbbr: {
    color: '#18FFFF',
    fontSize: 16,
    fontWeight: '900',
    width: 50,
  },
  legendFull: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  legendRange: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'right',
  },
  legendCloseBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(24, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  legendCloseText: {
    color: '#18FFFF',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  moneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 213, 79, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 213, 79, 0.3)',
  },
  money: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.secondary,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111D16',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(24, 255, 255, 0.1)',
    borderColor: 'rgba(24, 255, 255, 0.3)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: '#18FFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 20,
    paddingLeft: 20,
  },
  packetContainer: {
    position: 'absolute',
    left: 0,
    top: -10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    backgroundColor: '#111D16',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginLeft: 30,
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 16,
    paddingLeft: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  qtyBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.4)',
  },
  qtyText: {
    color: '#00E676',
    fontWeight: '900',
    fontSize: 12,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  genesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  geneBox: {
    alignItems: 'center',
    flex: 1,
  },
  geneLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  geneValue: {
    color: '#18FFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  traitsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  smallTraitBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    alignItems: 'center',
  },
  smallTraitLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  smallTraitValue: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  harvestCard: {
    backgroundColor: '#111D16',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  harvestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  harvestTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  harvestBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    color: Theme.secondary,
    fontWeight: '900',
    fontSize: 18,
  },
  sellButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sellButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  sellButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Pedigree tag in card
  pedigreeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  pedigreeTagText: {
    color: '#18FFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Pedigree tree in modal
  pedigreeContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.15)',
  },
  pedigreeTitle: {
    color: '#18FFFF',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  pedigreeTree: {
    alignItems: 'center',
  },
  pedigreeGen: {
    alignItems: 'center',
    marginVertical: 4,
  },
  pedigreeGenLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  pedigreeNode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
    minWidth: 150,
  },
  pedigreeNodeActive: {
    backgroundColor: 'rgba(24, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.3)',
  },
  pedigreeNodeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  pedigreeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  pedigreeArrow: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 18,
    marginVertical: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 8, 0.95)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#111D16',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#18FFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  modalSeedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  modalSeedInfo: {
    flex: 1,
  },
  modalSeedName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalRarity: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalLineageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: 'rgba(24, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modalLineageText: {
    color: '#18FFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalGenesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    borderRadius: 12,
  },
  modalGeneBox: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalGeneLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalGeneValue: {
    color: '#18FFFF',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(24, 255, 255, 0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#18FFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});
