import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, style, intensity = 'medium' }) => {
  const opacities = {
    low: ['rgba(24, 255, 255, 0.05)', 'rgba(0, 230, 118, 0.02)'],
    medium: ['rgba(24, 255, 255, 0.1)', 'rgba(0, 230, 118, 0.05)'],
    high: ['rgba(24, 255, 255, 0.2)', 'rgba(0, 230, 118, 0.1)'],
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={opacities[intensity]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 255, 255, 0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
    zIndex: 1,
  }
});
