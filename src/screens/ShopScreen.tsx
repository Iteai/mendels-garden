import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/useGameStore';
import { SHOP_ITEMS, ShopItem } from '../constants/plants';
import { SHOP_CONSUMABLES } from '../constants/items';
import { ShoppingCart, Coins, Beaker, FlaskConical } from 'lucide-react-native';
import { Theme } from '../theme/colors';
import { SeedPacketSvg } from '../components/svg/SeedPacketSvg';

export const ShopScreen: React.FC = () => {
  const [tab, setTab] = useState<'seeds' | 'supplies'>('seeds');
  const money = useGameStore((state) => state.money);
  const buySeed = useGameStore((state) => state.buySeed);
  const buyConsumable = useGameStore((state) => state.buyConsumable);

  const handleBuySeed = (item: ShopItem) => {
    if (money >= item.price) buySeed(item.id);
    else Alert.alert("Insufficient Funds", "Sell organic harvests to earn more coins.");
  };

  const handleBuyConsumable = (item: typeof SHOP_CONSUMABLES[0]) => {
    if (money >= item.price) buyConsumable(item.id);
    else Alert.alert("Insufficient Funds", "Sell organic harvests to earn more coins.");
  };

  const renderSeed = ({ item }: { item: ShopItem }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.packetContainer}>
        <SeedPacketSvg species={item.species} rarity={item.rarity} width={70} height={98} />
      </View>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={[styles.rarityBadge, { borderColor: Theme.rarity[item.rarity] }]}>
              <Text style={[styles.rarityText, { color: Theme.rarity[item.rarity] }]}>{item.rarity}</Text>
            </View>
          </View>
          <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardBottom}>
            <View style={styles.priceTag}>
              <Coins color={Theme.secondary} size={18} />
              <Text style={styles.priceText}>{item.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.buyButtonWrapper}
              onPress={() => handleBuySeed(item)}
              disabled={money < item.price}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={money >= item.price ? ['#2E7D32', '#1B5E20'] : ['#37474F', '#263238']}
                style={styles.buyButton}
              >
                <ShoppingCart color={money >= item.price ? "#FFF" : "#78909C"} size={16} />
                <Text style={[styles.buyButtonText, money < item.price && styles.buyButtonTextDisabled]}>
                  Acquire
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderConsumable = ({ item }: { item: typeof SHOP_CONSUMABLES[0] }) => (
    <View style={[styles.card, { marginLeft: 0, marginBottom: 16 }]}>
      <View style={[styles.cardContent, { paddingLeft: 16 }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <FlaskConical color={item.type === 'Mutation' ? '#AB47BC' : '#00E676'} size={24} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
        </View>
        <Text style={styles.descText}>{item.description}</Text>
        <View style={styles.cardBottom}>
          <View style={styles.priceTag}>
            <Coins color={Theme.secondary} size={18} />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
          <TouchableOpacity
            style={styles.buyButtonWrapper}
            onPress={() => handleBuyConsumable(item)}
            disabled={money < item.price}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={money >= item.price ? ['#0288D1', '#01579B'] : ['#37474F', '#263238']}
              style={styles.buyButton}
            >
              <ShoppingCart color={money >= item.price ? "#FFF" : "#78909C"} size={16} />
              <Text style={[styles.buyButtonText, money < item.price && styles.buyButtonTextDisabled]}>
                Acquire
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Botanical Market</Text>
          <Text style={styles.subtitle}>Acquire premium strains & supplies</Text>
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
          <Text style={[styles.tabText, tab === 'seeds' && styles.activeTabText]}>Genetics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'supplies' && styles.activeTab]}
          onPress={() => setTab('supplies')}
        >
          <FlaskConical color={tab === 'supplies' ? '#00E676' : 'rgba(255,255,255,0.4)'} size={20} />
          <Text style={[styles.tabText, tab === 'supplies' && styles.activeTabText]}>Supplies</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tab === 'seeds' ? SHOP_ITEMS : SHOP_CONSUMABLES}
        keyExtractor={(item) => item.id}
        renderItem={tab === 'seeds' ? renderSeed : renderConsumable}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B08' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A140F',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 10,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
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
  money: { fontSize: 18, fontWeight: 'bold', color: Theme.secondary },
  tabs: { flexDirection: 'row', padding: 16, gap: 12, paddingBottom: 0 },
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
  activeTab: { backgroundColor: 'rgba(24, 255, 255, 0.1)', borderColor: 'rgba(24, 255, 255, 0.3)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: 14 },
  activeTabText: { color: '#18FFFF' },
  listContent: { padding: 16, paddingTop: 24, paddingBottom: 40 },
  cardWrapper: { position: 'relative', marginBottom: 20, paddingLeft: 20 },
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
  cardContent: { padding: 16, paddingLeft: 50 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 },
  rarityBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  rarityText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  descText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 18, marginBottom: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceText: { color: Theme.secondary, fontWeight: '900', fontSize: 18 },
  buyButtonWrapper: { borderRadius: 12, overflow: 'hidden' },
  buyButton: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  buyButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase' },
  buyButtonTextDisabled: { color: '#78909C' },
});
