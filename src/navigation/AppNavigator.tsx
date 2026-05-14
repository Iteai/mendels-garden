import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Sprout, Backpack, FlaskConical, Store } from 'lucide-react-native';

import { GardenScreen } from '../screens/GardenScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { LabScreen } from '../screens/LabScreen';
import { ShopScreen } from '../screens/ShopScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#112211', borderTopColor: '#2c3e2c', paddingBottom: 5, paddingTop: 5, height: 60 },
          tabBarActiveTintColor: '#81c784',
          tabBarInactiveTintColor: '#4a6b4a',
        }}
      >
        <Tab.Screen name="Garden" component={GardenScreen} options={{ tabBarIcon: ({ color, size }) => <Sprout color={color} size={size} /> }} />
        <Tab.Screen name="Shop" component={ShopScreen} options={{ tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }} />
        <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarIcon: ({ color, size }) => <Backpack color={color} size={size} /> }} />
        <Tab.Screen name="Lab" component={LabScreen} options={{ tabBarIcon: ({ color, size }) => <FlaskConical color={color} size={size} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
