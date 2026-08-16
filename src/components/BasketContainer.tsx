/**
 * BasketContainer Component
 * Renders baskets/tubes with capacity slots, fruit stacking, selection and target highlights.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';
import { Basket } from '../types';
import { FruitRenderer } from './FruitRenderer';
import { FRUITS } from '../lib/fruits';

interface BasketContainerProps {
  basket: Basket;
  basketIndex: number;
  isSelected: boolean;
  isValidDestination: boolean;
  isHintSource?: boolean;
  isHintTarget?: boolean;
  onSelect: (index: number) => void;
  basketBorderClass?: string;
  basketBgClass?: string;
  woodAccentClass?: string;
}

export const BasketContainer: React.FC<BasketContainerProps> = ({
  basket,
  basketIndex,
  isSelected,
  isValidDestination,
  isHintSource,
  isHintTarget,
  onSelect,
  basketBorderClass = 'border-amber-700/80',
  basketBgClass = 'bg-amber-950/40',
  woodAccentClass = 'bg-amber-800/90 text-amber-100',
}) => {
  const { capacity, items, isLocked, unlockKeyType } = basket;

  // Calculate container height dynamically based on capacity
  const isLargeCap = capacity >= 6;
  const slotHeightClass = isLargeCap ? 'h-10' : 'h-12';
  const containerHeightClass = isLargeCap ? 'min-h-[260px]' : 'min-h-[220px]';

  // Check if basket is pure completed (full of 1 matching fruit type)
  const isCompleted =
    items.length === capacity &&
    items.every((i) => i.type === items[0].type && !i.isFrozen);

  return (
    <div
      id={`basket-${basketIndex}`}
      onClick={() => onSelect(basketIndex)}
      className={`relative flex flex-col items-center cursor-pointer select-none transition-all duration-200 group ${
        isSelected ? 'scale-105' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Target/Source Hint Animated Indicator */}
      {(isHintSource || isHintTarget) && (
        <div className="absolute -top-7 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-lg animate-bounce z-30">
          {isHintSource ? 'FROM' : 'TO'}
        </div>
      )}

      {/* Basket Rim / Top Ring */}
      <div
        className={`w-16 sm:w-20 h-4 rounded-t-lg border-t-2 border-x-2 ${basketBorderClass} ${
          isSelected
            ? 'bg-amber-400 border-amber-300 ring-2 ring-amber-300/80'
            : isValidDestination
            ? 'bg-emerald-500 border-emerald-400 ring-2 ring-emerald-400/80 animate-pulse'
            : isCompleted
            ? 'bg-emerald-400 border-emerald-300'
            : 'bg-amber-800/60'
        } transition-all duration-200 z-10 shadow-sm`}
      />

      {/* Main Basket Body / Stack Tube */}
      <div
        className={`relative w-16 sm:w-20 ${containerHeightClass} rounded-b-xl border-b-2 border-x-2 ${basketBorderClass} ${basketBgClass} backdrop-blur-xs flex flex-col-reverse items-center justify-start p-1 gap-1.5 shadow-inner transition-all duration-200 overflow-hidden ${
          isSelected
            ? 'ring-4 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
            : isValidDestination
            ? 'ring-4 ring-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
            : isCompleted
            ? 'ring-2 ring-emerald-400/60 bg-emerald-950/20'
            : ''
        }`}
      >
        {/* Background Empty Slots */}
        <div className="absolute inset-0 flex flex-col-reverse justify-start p-1 gap-1.5 pointer-events-none opacity-20">
          {Array.from({ length: capacity }).map((_, idx) => (
            <div
              key={`slot_${idx}`}
              className={`w-full ${slotHeightClass} rounded-full border border-dashed border-white/40`}
            />
          ))}
        </div>

        {/* Stacked Fruits */}
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => {
            const isTop = idx === items.length - 1;
            const isTopAndSelected = isTop && isSelected;

            return (
              <motion.div
                key={item.id}
                layoutId={item.id}
                initial={{ scale: 0.8, y: -20, opacity: 0 }}
                animate={{
                  scale: 1,
                  y: isTopAndSelected ? -12 : 0,
                  opacity: 1,
                }}
                exit={{ scale: 0.8, y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="z-10"
              >
                <FruitRenderer
                  type={item.type}
                  size={isLargeCap ? 'sm' : 'md'}
                  isFrozen={item.isFrozen}
                  isWild={item.isWild}
                  isSelected={isTopAndSelected}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center z-20 rounded-b-xl border border-amber-500/40">
            <Lock className="w-6 h-6 text-amber-400 mb-1 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Locked
            </span>
            {unlockKeyType && FRUITS[unlockKeyType] && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-200 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-700/50">
                <span>{FRUITS[unlockKeyType].emoji}</span>
                <span>Key</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Basket Woven/Wood Label Foot */}
      <div
        className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider shadow-sm ${woodAccentClass} flex items-center gap-1`}
      >
        <span>Basket #{basketIndex + 1}</span>
        {isCompleted && <span className="text-emerald-300">✓</span>}
      </div>
    </div>
  );
};
