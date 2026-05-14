import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useGameStore } from '../store/useGameStore';
import { crossbreed, createPedigree } from '../genetics/engine';
import { calculatePhenotype, getMutationVisual } from '../genetics/phenotype';
import { Seed } from '../types';
import { DnaSvg } from '../components/svg/DnaSvg';
import { SeedPacketSvg } from '../components/svg/SeedPacketSvg';
import { FlaskConical, Fingerprint, Zap, X, Dna } from 'lucide-react-native';
import { Theme } from '../theme/colors';

export const LabScreen: React.FC = () => {
  const seeds = useGameStore((state) => state.seeds);
  const [parentAId, setParentAId] = useState<string | null>(null);
  const [parentBId, setParentBId] = useState<string | null>(null);
  
  const [isSelectingFor, setIsSelectingFor] = useState<'A' | 'B' | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [resultSeed, setResultSeed] = useState<Seed | null>(null);

  // Holographic Animations
  const scanLineY = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(160, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const parentA = seeds.find(s => s.id === parentAId);
  const parentB = seeds.find(s => s.id === parentBId);

  const handleCrossbreed = () => {
    if (!parentA || !parentB) return;
    setIsBreeding(true);

    setTimeout(() => {
      const newGenetics = crossbreed(parentA.genetics, parentB.genetics);
      const newSpecies = Math.random() > 0.5 ? parentA.species : parentB.species;
      const newVariety = Math.random() > 0.5 ? parentA.variety : parentB.variety;
      
      // Create pedigree
      const pedigree = createPedigree(
        { id: parentA.id, name: parentA.name, species: parentA.species, variety: parentA.variety },
        { id: parentB.id, name: parentB.name, species: parentB.species, variety: parentB.variety },
        parentA.pedigree,
        parentB.pedigree
      );

      const rarity = newGenetics.mutationCount > 2 ? 'Legendary' : newGenetics.mutationCount > 0 ? 'Epic' : 'Rare';

      const newSeed: Seed = {
        id: `hybrid_${Date.now()}`,
        species: newSpecies,
        variety: newVariety,
        name: `Hybrid ${newSpecies}`,
        genetics: newGenetics,
        phenotype: calculatePhenotype(newGenetics, newSpecies),
        quantity: 1,
        rarity,
        pedigree,
      };

      // Collect indices before modifying array
      const idxA = seeds.findIndex(s => s.id === parentAId);
      const idxB = seeds.findIndex(s => s.id === parentBId);

      useGameStore.setState((state) => {
        const newSeeds = [...state.seeds];
        
        if (idxA !== -1) {
          if (newSeeds[idxA].quantity > 1) newSeeds[idxA].quantity -= 1;
          else newSeeds.splice(idxA, 1);
        }

        let adjustedIdxB = idxB;
        if (idxA !== -1 && idxB > idxA) {
          adjustedIdxB = idxB - 1;
        }

        if (adjustedIdxB !== -1 && newSeeds[adjustedIdxB]) {
          if (newSeeds[adjustedIdxB].quantity > 1) newSeeds[adjustedIdxB].quantity -= 1;
          else newSeeds.splice(adjustedIdxB, 1);
        }

        newSeeds.push(newSeed);

        // Also check if this is the first of this strain for encyclopedia
        const phenoId = `${newSeed.species}-${newSeed.variety}-C${newGenetics.color.allele1 === 'A' || newGenetics.color.allele2 === 'A' ? 'D' : 'R'}-S${newGenetics.size.allele1 === 'B' || newGenetics.size.allele2 === 'B' ? 'D' : 'R'}-G${newGenetics.generation}`;

        return { 
          seeds: newSeeds, 
          lastSavedAt: Date.now(),
          totalCrossbreeds: state.totalCrossbreeds + 1,
        };
      });

      setResultSeed(newSeed);
      setIsBreeding(false);
      setParentAId(null);
      setParentBId(null);
    }, 2500);
  };

  const renderParentSlot = (parent: Seed | undefined, slot: 'A' | 'B') => (
    <TouchableOpacity style={styles.parentSlot} onPress={() => setIsSelectingFor(slot)} activeOpacity={0.8}>
      <LinearGradient
        colors={parent ? ['rgba(24, 255, 255, 0.15)', 'rgba(0, 230, 118, 0.05)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        style={styles.slotPanel}
      >
        {parent ? (
          <View style={styles.slotContent}>
            <SeedPacketSvg species={parent.species} rarity={parent.rarity} width={55} height={77} />
            <Text style={styles.slotName} numberOfLines={1}>{parent.name}</Text>
            <View style={styles.geneMiniGrid}>
              <Text style={styles.geneMiniText}>{parent.genetics.color.allele1}{parent.genetics.color.allele2} • {parent.genetics.size.allele1}{parent.genetics.size.allele2}</Text>
              <Text style={styles.geneMiniText}>{parent.genetics.growthRate.allele1}{parent.genetics.growthRate.allele2} • {parent.genetics.yield.allele1}{parent.genetics.yield.allele2}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <Fingerprint color="rgba(24, 255, 255, 0.3)" size={40} />
            <Text style={styles.emptySlotText}>Insert Sample {slot}</Text>
          </View>
        )}
        {/* Holographic Scan Line */}
        {parent && <Animated.View style={[styles.scanLine, scanLineStyle]} />}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <FlaskConical color="#18FFFF" size={28} />
        <Text style={styles.title}>Synthesis Lab</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instructions}>
          Insert two genetic samples into the synthesis chambers to sequence a new hybrid strain.
        </Text>

        <View style={styles.chambersContainer}>
          {renderParentSlot(parentA, 'A')}
          
          <View style={styles.dnaCenter}>
            <Animated.View style={isBreeding ? pulseStyle : {}}>
              <DnaSvg color="#18FFFF" isActive={isBreeding} />
            </Animated.View>
          </View>

          {renderParentSlot(parentB, 'B')}
        </View>

        <LinearGradient colors={['rgba(24, 255, 255, 0.1)', 'rgba(0, 0, 0, 0)']} style={styles.analysisPanel}>
          <Text style={styles.analysisTitle}>Synthesis Probability</Text>
          <View style={styles.probRow}>
            <Text style={styles.probLabel}>Mutation Chance:</Text>
            <Text style={styles.probValue}>High</Text>
          </View>
          <View style={styles.probRow}>
            <Text style={styles.probLabel}>Compatibility:</Text>
            <Text style={styles.probValue}>{parentA && parentB ? (parentA.species === parentB.species ? 'Optimal (98%)' : 'Experimental (45%)') : '---'}</Text>
          </View>
        </LinearGradient>

        <TouchableOpacity 
          style={styles.breedButtonWrapper}
          disabled={!parentA || !parentB || isBreeding}
          onPress={handleCrossbreed}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(!parentA || !parentB || isBreeding) ? ['#263238', '#101416'] : ['#00E676', '#00B0FF']}
            style={styles.breedButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Zap color={(!parentA || !parentB || isBreeding) ? '#546E7A' : '#050B08'} size={24} />
            <Text style={[styles.breedButtonText, (!parentA || !parentB || isBreeding) && { color: '#546E7A' }]}>
              {isBreeding ? 'Sequencing DNA...' : 'Initiate Synthesis'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Seed Selection Modal */}
      <Modal visible={isSelectingFor !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sample {isSelectingFor}</Text>
              <TouchableOpacity onPress={() => setIsSelectingFor(null)}>
                <X color="#18FFFF" size={28} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={seeds}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.seedSelectItem}
                  onPress={() => {
                    if (isSelectingFor === 'A') setParentAId(item.id);
                    else setParentBId(item.id);
                    setIsSelectingFor(null);
                  }}
                >
                  <SeedPacketSvg species={item.species} rarity={item.rarity} width={40} height={56} />
                  <View style={styles.seedSelectInfo}>
                    <Text style={styles.seedSelectName}>{item.name}</Text>
                    <Text style={styles.seedSelectGen}>Gen {item.genetics.generation} • Qty: {item.quantity}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={resultSeed !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <LinearGradient colors={['#0A140F', '#111D16']} style={styles.resultContent}>
            <Text style={styles.resultHeader}>Synthesis Complete</Text>
            {resultSeed && (
              <View style={styles.resultBody}>
                <Animated.View style={pulseStyle}>
                  <SeedPacketSvg species={resultSeed.species} rarity={resultSeed.rarity} width={100} height={140} />
                </Animated.View>
                <Text style={styles.resultName}>{resultSeed.name}</Text>
                <Text style={[styles.resultRarity, { color: Theme.rarity[resultSeed.rarity] }]}>
                  {resultSeed.rarity} Strain
                </Text>
                
                <View style={styles.resultStats}>
                  <Text style={styles.resultStatText}>Generation: <Text style={{color: '#18FFFF', fontWeight: 'bold'}}>{resultSeed.genetics.generation}</Text></Text>
                  <Text style={styles.resultStatText}>Mutations: <Text style={{color: '#00E676', fontWeight: 'bold'}}>{resultSeed.genetics.mutationCount}</Text></Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.collectButtonWrapper} onPress={() => setResultSeed(null)}>
              <LinearGradient colors={['#18FFFF', '#00B0FF']} style={styles.collectButton}>
                <Text style={styles.collectButtonText}>Extract to Archive</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B08' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, backgroundColor: '#0A140F', borderBottomWidth: 1, borderBottomColor: 'rgba(24, 255, 255, 0.15)' },
  title: { fontSize: 24, fontWeight: '900', color: '#E0F7FA', letterSpacing: 1 },
  content: { padding: 16 },
  instructions: { color: 'rgba(24, 255, 255, 0.6)', marginBottom: 24, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  chambersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  parentSlot: { width: '40%', height: 220 },
  slotPanel: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(24, 255, 255, 0.3)', padding: 12, overflow: 'hidden' },
  slotContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  slotName: { color: '#E0F7FA', fontSize: 14, fontWeight: 'bold', marginVertical: 12, textAlign: 'center' },
  geneMiniGrid: { width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8, alignItems: 'center' },
  geneMiniText: { color: '#18FFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 2 },
  emptySlot: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptySlotText: { color: 'rgba(24, 255, 255, 0.4)', fontSize: 12, textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' },
  scanLine: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: '#18FFFF', shadowColor: '#18FFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  dnaCenter: { width: '20%', alignItems: 'center' },
  analysisPanel: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(24, 255, 255, 0.2)', marginBottom: 30 },
  analysisTitle: { color: '#18FFFF', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  probRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  probLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  probValue: { color: '#E0F7FA', fontSize: 14, fontWeight: 'bold' },
  breedButtonWrapper: { borderRadius: 16, overflow: 'hidden', shadowColor: '#00E676', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  breedButton: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'center', gap: 12 },
  breedButtonText: { color: '#050B08', fontWeight: '900', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(5, 11, 8, 0.95)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#111D16', borderRadius: 24, padding: 20, maxHeight: '80%', borderWidth: 1, borderColor: 'rgba(24, 255, 255, 0.2)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#18FFFF', fontSize: 20, fontWeight: '900' },
  seedSelectItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  seedSelectInfo: { flex: 1, marginLeft: 16 },
  seedSelectName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  seedSelectGen: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  resultContent: { alignItems: 'center', padding: 30, borderRadius: 24, borderWidth: 1, borderColor: '#18FFFF', shadowColor: '#18FFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10, margin: 20 },
  resultHeader: { color: '#00E676', fontSize: 22, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 30 },
  resultBody: { alignItems: 'center', marginBottom: 40 },
  resultName: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 24 },
  resultRarity: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 8, letterSpacing: 1 },
  resultStats: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resultStatText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  collectButtonWrapper: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  collectButton: { paddingVertical: 16, alignItems: 'center' },
  collectButtonText: { color: '#050B08', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }
});
