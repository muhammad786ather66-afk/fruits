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
  rimBgClass?: string;
}

export const BasketContainer: React.FC<BasketContainerProps> = ({
  basket,
  basketIndex,
  isSelected,
  isValidDestination,
  isHintSource,
  isHintTarget,
  onSelect,
  basketBorderClass = 'border-[#86A789]',
  basketBgClass = 'bg-[#86A789]/15',
  woodAccentClass = 'bg-[#E9EDC9] text-[#5F6F52]',
  rimBgClass = 'bg-[#86A789]',
}) => {
  const {
    capacity,
    items,
    isLocked,
    unlockKeyType,
    isOneWay,
    labeledFruitType,
    exactOrder,
    isFrozenBasket,
  } = basket;

  // Calculate container height dynamically based on capacity
  const isLargeCap = capacity >= 6;
  const slotHeightClass = isLargeCap ? 'h-9 sm:h-10' : 'h-10 sm:h-12';
  const containerHeightClass = isLargeCap ? 'min-h-[220px] sm:min-h-[260px]' : 'min-h-[190px] sm:min-h-[220px]';

  // Check if basket is pure completed (full of matching fruit type or exact order)
  const isCompleted =
    items.length === capacity &&
    !items.some((i) => i.isFrozen || i.isHidden) &&
    (labeledFruitType
      ? items.every((i) => i.type === labeledFruitType)
      : exactOrder
      ? items.every((i, idx) => i.type === exactOrder[idx])
      : items.every((i) => i.type === items[0].type));

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
        <div className="absolute -top-7 text-xs font-bold px-2 py-0.5 rounded-full bg-[#5F6F52] text-white shadow-md animate-bounce z-30">
          {isHintSource ? 'FROM' : 'TO'}
        </div>
      )}

      {/* Labeled Fruit Badge Indicator */}
      {labeledFruitType && FRUITS[labeledFruitType] && (
        <div className="mb-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-400/80 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-md z-20">
          <span>{FRUITS[labeledFruitType].emoji}</span>
          <span className="uppercase tracking-wider">{FRUITS[labeledFruitType].name}</span>
        </div>
      )}

      {/* One-Way Entry Badge Indicator */}
      {isOneWay && (
        <div className="mb-1 px-2 py-0.5 rounded-full bg-rose-950/90 border border-rose-400 text-[9px] font-black text-rose-300 flex items-center gap-1 z-20 shadow-md">
          <span>⬇️</span>
          <span>ONE-WAY</span>
        </div>
      )}

      {/* Basket/Bottle Top Cork & Rim */}
      <div
        className={`w-14 sm:w-18 md:w-20 h-3.5 sm:h-4 rounded-t-lg border-t-2 border-x-2 transition-all duration-200 z-10 ${
          isSelected
            ? 'bg-amber-400 border-amber-200 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.9)]'
            : isValidDestination
            ? 'bg-cyan-400 border-cyan-200 ring-2 ring-cyan-300 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.9)]'
            : isCompleted
            ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
            : `${basketBorderClass} ${rimBgClass}`
        }`}
      />

      {/* Main Bottle Body / Stack Tube */}
      <div
        className={`relative w-14 sm:w-18 md:w-20 ${containerHeightClass} rounded-b-xl border-b-2 border-x-2 backdrop-blur-md flex flex-col-reverse items-center justify-start p-1 gap-1 sm:gap-1.5 shadow-inner transition-all duration-200 overflow-hidden ${
          isSelected
            ? 'bg-gradient-to-b from-amber-500/40 via-amber-400/25 to-yellow-500/40 border-amber-300 ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)]'
            : isValidDestination
            ? 'bg-gradient-to-b from-cyan-500/30 via-emerald-400/20 to-cyan-600/30 border-cyan-300 ring-4 ring-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.8)] animate-pulse'
            : isCompleted
            ? 'bg-gradient-to-b from-emerald-500/30 via-teal-400/20 to-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]'
            : `${basketBorderClass} ${basketBgClass}`
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
                  isHidden={item.isHidden}
                  isSelected={isTopAndSelected}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Exact Order Helper Sequence Display */}
        {exactOrder && exactOrder.length > 0 && (
          <div className="absolute left-0.5 top-1 flex flex-col gap-0.5 pointer-events-none opacity-80 z-20">
            {exactOrder.map((fType, idx) => (
              <span key={`ord_${idx}`} className="text-[9px] bg-slate-900/90 rounded px-1 text-amber-200 font-bold border border-amber-500/30">
                {FRUITS[fType]?.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Frozen Basket Overlay */}
        {isFrozenBasket && (
          <div className="absolute inset-0 bg-cyan-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center z-20 rounded-b-xl border border-cyan-400">
            <span className="text-xl">🧊</span>
            <span className="text-[9px] font-black text-cyan-200 uppercase tracking-widest mt-1">
              FROZEN
            </span>
          </div>
        )}

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

      {/* Bottle Base Stand Accent */}
      <div className="mt-1 h-1.5 w-12 rounded-full bg-[#E0E2D9] flex items-center justify-center">
        {isCompleted && (
          <span className="text-[10px] text-[#5F6F52] font-black leading-none">✓</span>
        )}
      </div>
    </div>
  );
};
