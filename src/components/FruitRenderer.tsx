/**
 * FruitRenderer Component
 * Renders high quality fruit graphics with detailed SVG, glossy highlights, and visual depth.
 */

import React from 'react';
import { FRUITS } from '../lib/fruits';
import { FruitType } from '../types';

interface FruitRendererProps {
  type: FruitType;
  size?: 'sm' | 'md' | 'lg';
  isFrozen?: boolean;
  isWild?: boolean;
  isSelected?: boolean;
  showName?: boolean;
}

export const FruitRenderer: React.FC<FruitRendererProps> = ({
  type,
  size = 'md',
  isFrozen = false,
  isWild = false,
  isSelected = false,
  showName = false,
}) => {
  const fruit = FRUITS[type] || FRUITS.apple;

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-11 h-11 text-2xl',
    lg: 'w-14 h-14 text-3xl',
  }[size];

  return (
    <div
      className={`relative flex flex-col items-center justify-center transition-all duration-200 ${
        isSelected ? '-translate-y-3 scale-125 z-30' : ''
      }`}
    >
      <div
        className={`relative rounded-full flex items-center justify-center select-none ${sizeClasses} transition-all duration-200`}
        style={{
          background: isSelected
            ? `radial-gradient(circle at 35% 35%, #FEF08A, ${fruit.primaryColor})`
            : `radial-gradient(circle at 35% 35%, ${fruit.primaryColor}, ${fruit.secondaryColor})`,
          border: isSelected ? `3px solid #FACC15` : `2px solid ${fruit.borderColor}`,
          boxShadow: isSelected
            ? `0 0 25px #FACC15, 0 0 15px ${fruit.glowColor}, 0 6px 16px rgba(0,0,0,0.5)`
            : `0 3px 6px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Selected Active Glow Halo Ring */}
        {isSelected && (
          <div className="absolute -inset-1 rounded-full border-2 border-yellow-300 animate-ping opacity-75 pointer-events-none" />
        )}

        {/* Glossy Top Highlight */}
        <div className="absolute top-1 left-2 w-1/3 h-1/3 rounded-full bg-white/40 blur-[1px] pointer-events-none" />

        {/* Fruit Emoji or Special Icon */}
        <span className="drop-shadow-sm filter z-10 pointer-events-none">
          {isWild ? '🌟' : fruit.emoji}
        </span>

        {/* Frozen Overlay */}
        {isFrozen && (
          <div className="absolute inset-0 rounded-full bg-cyan-200/50 backdrop-blur-[1px] border-2 border-cyan-300 flex items-center justify-center z-20">
            <span className="text-xs">❄️</span>
          </div>
        )}
      </div>

      {showName && (
        <span className="text-[10px] font-medium text-slate-300 mt-0.5 truncate max-w-[50px]">
          {fruit.name}
        </span>
      )}
    </div>
  );
};
