import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

export const DnaSvg: React.FC<{ width?: number; height?: number; color?: string; isActive?: boolean }> = ({ 
  width = 60, height = 100, color = '#18FFFF', isActive = false 
}) => {
  const activeColor = isActive ? '#00E676' : color;

  return (
    <Svg width={width} height={height} viewBox="0 0 100 140">
      <Defs>
        <LinearGradient id="dnaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={activeColor} stopOpacity="0.2" />
          <Stop offset="0.5" stopColor={activeColor} stopOpacity="1" />
          <Stop offset="1" stopColor={activeColor} stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      <G stroke="url(#dnaGrad)" strokeWidth="5" fill="none" strokeLinecap="round">
        {/* Ambient Glow (Drop Shadow) */}
        <G stroke={activeColor} strokeWidth="12" opacity="0.15" transform="translate(0, 2)">
          <Path d="M 30 10 Q 5 40 30 70 T 30 130" />
          <Path d="M 70 10 Q 95 40 70 70 T 70 130" />
        </G>

        {/* Left Strand */}
        <Path d="M 30 10 Q 5 40 30 70 T 30 130" />
        {/* Right Strand */}
        <Path d="M 70 10 Q 95 40 70 70 T 70 130" />
        
        {/* Base Pairs (Rungs) */}
        <Path d="M 35 25 L 65 25" strokeWidth="3" opacity="0.5" />
        <Path d="M 20 45 L 80 45" strokeWidth="3" opacity="0.8" />
        <Path d="M 35 65 L 65 65" strokeWidth="3" opacity="0.5" />
        <Path d="M 20 85 L 80 85" strokeWidth="3" opacity="0.8" />
        <Path d="M 35 105 L 65 105" strokeWidth="3" opacity="0.5" />
        
        {/* Glowing Nodes */}
        <Circle cx="35" cy="25" r="4" fill={activeColor} stroke="none" />
        <Circle cx="65" cy="25" r="4" fill={activeColor} stroke="none" />
        <Circle cx="20" cy="45" r="5" fill={activeColor} stroke="none" />
        <Circle cx="80" cy="45" r="5" fill={activeColor} stroke="none" />
        <Circle cx="35" cy="65" r="4" fill={activeColor} stroke="none" />
        <Circle cx="65" cy="65" r="4" fill={activeColor} stroke="none" />
        <Circle cx="20" cy="85" r="5" fill={activeColor} stroke="none" />
        <Circle cx="80" cy="85" r="5" fill={activeColor} stroke="none" />
      </G>
    </Svg>
  );
};
