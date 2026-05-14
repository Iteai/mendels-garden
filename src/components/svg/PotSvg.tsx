import React from 'react';
import Svg, { Path, Defs, LinearGradient, RadialGradient, Stop, Ellipse, G } from 'react-native-svg';

interface PotSvgProps {
  width?: number;
  height?: number;
  waterLevel: number;
}

export const PotSvg: React.FC<PotSvgProps> = ({ width = 140, height = 140, waterLevel }) => {
  // Soil darkens significantly when wet, simulating real moisture
  const soilCenter = waterLevel > 50 ? '#110A07' : waterLevel > 20 ? '#24150E' : '#3A2318';
  const soilEdge = waterLevel > 50 ? '#000000' : waterLevel > 20 ? '#0D0705' : '#1A0F0A';

  return (
    <Svg width={width} height={height} viewBox="0 0 120 120">
      <Defs>
        {/* Premium Ceramic Glaze Gradient */}
        <LinearGradient id="potGlaze" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#5C1A0A" stopOpacity="1" />
          <Stop offset="0.1" stopColor="#8A2810" stopOpacity="1" />
          <Stop offset="0.3" stopColor="#D85A38" stopOpacity="1" />
          <Stop offset="0.7" stopColor="#B03A1E" stopOpacity="1" />
          <Stop offset="0.9" stopColor="#6B1D0A" stopOpacity="1" />
          <Stop offset="1" stopColor="#3A0F04" stopOpacity="1" />
        </LinearGradient>
        
        {/* Rim Highlight and Shadow */}
        <LinearGradient id="potRim" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#6B1D0A" stopOpacity="1" />
          <Stop offset="0.15" stopColor="#C94B2A" stopOpacity="1" />
          <Stop offset="0.4" stopColor="#FF7A55" stopOpacity="1" />
          <Stop offset="0.8" stopColor="#C94B2A" stopOpacity="1" />
          <Stop offset="1" stopColor="#4A1408" stopOpacity="1" />
        </LinearGradient>

        {/* Deep Soil Gradient */}
        <RadialGradient id="soilGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor={soilCenter} stopOpacity="1" />
          <Stop offset="80%" stopColor={soilEdge} stopOpacity="1" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
        </RadialGradient>

        {/* Ambient Occlusion (Drop Shadow under the rim) */}
        <LinearGradient id="rimShadow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#220802" stopOpacity="0.8" />
          <Stop offset="0.4" stopColor="#220802" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#220802" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      
      <G transform="translate(10, 15)">
        {/* Floor Drop Shadow */}
        <Ellipse cx="50" cy="92" rx="42" ry="12" fill="#000000" opacity="0.4" />

        {/* Saucer */}
        <Path d="M 12 85 C 12 95, 88 95, 88 85 Z" fill="url(#potGlaze)" />
        <Ellipse cx="50" cy="85" rx="38" ry="8" fill="#3A0F04" />

        {/* Back inner rim (Inside the pot) */}
        <Ellipse cx="50" cy="30" rx="44" ry="14" fill="#2A0B04" />
        
        {/* Soil Surface */}
        <Ellipse cx="50" cy="33" rx="40" ry="11" fill="url(#soilGrad)" />
        
        {/* Main Pot Body */}
        <Path d="M 10 30 C 10 30, 24 85, 30 85 L 70 85 C 76 85, 90 30, 90 30 Z" fill="url(#potGlaze)" />
        
        {/* Rim Shadow on Body */}
        <Path d="M 10 30 C 10 30, 24 48, 50 48 C 76 48, 90 30, 90 30 L 88 35 C 88 35, 74 52, 50 52 C 26 52, 12 35, 12 35 Z" fill="url(#rimShadow)" />

        {/* Front Rim (Thick 3D lip) */}
        <Path d="M 6 30 C 6 16, 94 16, 94 30 C 94 44, 6 44, 6 30 Z" fill="url(#potRim)" />
        
        {/* Inner Rim Shadow to give depth to the lip */}
        <Path d="M 10 30 C 10 20, 90 20, 90 30 C 90 33, 10 33, 10 30 Z" fill="#000000" opacity="0.25" />
      </G>
    </Svg>
  );
};
