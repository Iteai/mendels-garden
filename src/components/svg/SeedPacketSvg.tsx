import React from 'react';
import Svg, { Path, Rect, Defs, LinearGradient, RadialGradient, Stop, G, Ellipse, Polygon, Circle } from 'react-native-svg';
import { Species, Rarity } from '../../types';
import { Theme } from '../../theme/colors';

interface SeedPacketProps {
  species: Species;
  rarity: Rarity;
  width?: number;
  height?: number;
}

export const SeedPacketSvg: React.FC<SeedPacketProps> = ({ species, rarity, width = 80, height = 112 }) => {
  const getFoilGradient = () => {
    switch (rarity) {
      case 'Common':    return ['#B0BEC5', '#78909C', '#CFD8DC'];
      case 'Rare':      return ['#42A5F5', '#1565C0', '#90CAF9'];
      case 'Epic':      return ['#AB47BC', '#6A1B9A', '#E1BEE7'];
      case 'Legendary': return ['#FFCA28', '#FF8F00', '#FFECB3'];
      default:          return ['#B0BEC5', '#78909C', '#CFD8DC'];
    }
  };
  const foil = getFoilGradient();

  const getSpeciesColor = () => {
    switch (species) {
      case 'Tomato': return ['#E53935', '#B71C1C'];
      case 'Chili':  return ['#FB8C00', '#E65100'];
      case 'Basil':  return ['#43A047', '#1B5E20'];
      case 'Radish': return ['#D81B60', '#880E4F'];
      default:       return ['#757575', '#424242'];
    }
  };
  const speciesColors = getSpeciesColor();

  return (
    <Svg width={width} height={height} viewBox="0 0 100 140">
      <Defs>
        <LinearGradient id="paperBase" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <Stop offset="0.5" stopColor="#F5F5F0" stopOpacity="1" />
          <Stop offset="1" stopColor="#E0E0D8" stopOpacity="1" />
        </LinearGradient>

        <LinearGradient id="foldShadow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
          <Stop offset="0.8" stopColor="#D6D6D0" stopOpacity="1" />
          <Stop offset="1" stopColor="#BDBDB5" stopOpacity="1" />
        </LinearGradient>

        <LinearGradient id="speciesBanner" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={speciesColors[0]} stopOpacity="1" />
          <Stop offset="1" stopColor={speciesColors[1]} stopOpacity="1" />
        </LinearGradient>

        <LinearGradient id="rarityFoil" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={foil[2]} stopOpacity="1" />
          <Stop offset="0.4" stopColor={foil[0]} stopOpacity="1" />
          <Stop offset="0.6" stopColor={foil[1]} stopOpacity="1" />
          <Stop offset="1" stopColor={foil[0]} stopOpacity="1" />
        </LinearGradient>

        <RadialGradient id="packetShadow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Rect x="6" y="16" width="88" height="120" rx="6" fill="url(#packetShadow)" />
      <Rect x="10" y="15" width="80" height="115" rx="4" fill="url(#paperBase)" stroke="#C7C7C0" strokeWidth="1" />

      <Path d="M 10 25 L 10 12 C 10 9, 13 6, 16 6 L 84 6 C 87 6, 90 9, 90 12 L 90 25 Z" fill="url(#foldShadow)" stroke="#C7C7C0" strokeWidth="1" />
      <Path d="M 10 25 L 90 25" stroke="#A3A39C" strokeWidth="1.5" strokeDasharray="3,3" />

      <Path d="M 10 75 L 90 75 L 90 126 C 90 128.2 88.2 130 86 130 L 14 130 C 11.8 130 10 128.2 10 126 Z" fill="url(#speciesBanner)" />
      <Rect x="10" y="75" width="80" height="4" fill="#FFFFFF" opacity="0.3" />

      <Polygon points="50,110 65,120 50,130 35,120" fill="url(#rarityFoil)" stroke="#FFFFFF" strokeWidth="1.5" />
      <Polygon points="50,113 60,120 50,127 40,120" fill="#FFFFFF" opacity="0.3" />

      <G transform="translate(50, 55)">
        {species === 'Tomato' && (
          <G>
            <Circle cx="0" cy="0" r="14" fill="#D32F2F" />
            <Circle cx="-4" cy="-4" r="4" fill="#FFFFFF" opacity="0.4" />
            <Path d="M -6 -10 L 0 -14 L 6 -10 L 0 -2 Z" fill="#2E7D32" />
          </G>
        )}
        {species === 'Chili' && (
          <G>
            <Path d="M -8 -10 Q 15 10 -5 25 Q -12 10 -8 -10" fill="#E65100" />
            <Path d="M -4 -5 Q 5 10 -2 18" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
            <Path d="M -10 -12 L -4 -16 L 2 -12 L -4 -6 Z" fill="#2E7D32" />
          </G>
        )}
        {species === 'Basil' && (
          <G>
            <Path d="M 0 -15 C 15 -15, 20 5, 0 15 C -20 5, -15 -15, 0 -15" fill="#2E7D32" />
            <Path d="M 0 -15 C 10 -15, 15 5, 0 15" fill="#4CAF50" opacity="0.8" />
            <Path d="M 0 -12 L 0 12" stroke="#1B5E20" strokeWidth="1.5" opacity="0.6" />
          </G>
        )}
        {species === 'Radish' && (
          <G>
            <Circle cx="0" cy="5" r="12" fill="#C2185B" />
            <Circle cx="-3" cy="2" r="3" fill="#FFFFFF" opacity="0.4" />
            <Path d="M -8 -5 C -15 -15, -5 -20, 0 -10 C 5 -20, 15 -15, 8 -5 Z" fill="#2E7D32" />
          </G>
        )}
      </G>
    </Svg>
  );
};
