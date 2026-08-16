/**
 * StatsModal Component
 * Visual breakdown of player performance statistics.
 */

import React from 'react';
import {
  BarChart2,
  Trophy,
  Star,
  Zap,
  CheckCircle,
  HelpCircle,
  Flame,
  X,
  Apple,
} from 'lucide-react';
import { PlayerProfile } from '../types';

interface StatsModalProps {
  player: PlayerProfile;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ player, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-2xl w-full max-w-md p-5 text-[#4A4941] shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2D9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base text-white shadow-md bg-[#86A789]"
              style={{ backgroundColor: player.avatarColor || '#86A789' }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#4A4941] tracking-tight">
                {player.name}'s Stats
              </h2>
              <span className="text-xs text-[#9A9B8F]">
                Detailed local gameplay metrics
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FEFAE0] border border-[#E9EDC9] text-[#9A9B8F] hover:text-[#4A4941]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-1 flex-1">
          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 text-[#5F6F52] text-xs font-bold mb-1">
              <Trophy className="w-4 h-4" />
              <span>TOTAL SCORE</span>
            </div>
            <span className="text-2xl font-black text-[#86A789]">
              {player.totalScore.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 text-[#5F6F52] text-xs font-bold mb-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>TOTAL STARS</span>
            </div>
            <span className="text-2xl font-black text-[#4A4941]">
              {player.totalStars}
            </span>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 text-[#86A789] text-xs font-bold mb-1">
              <Apple className="w-4 h-4" />
              <span>FRUITS SORTED</span>
            </div>
            <span className="text-2xl font-black text-[#4A4941]">
              {player.totalFruitsSorted.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 text-[#5F6F52] text-xs font-bold mb-1">
              <Zap className="w-4 h-4" />
              <span>HIGHEST LEVEL</span>
            </div>
            <span className="text-2xl font-black text-[#4A4941]">
              {player.highestLevelReached}
            </span>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 text-[#86A789] text-xs font-bold mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>3-STAR LEVELS</span>
            </div>
            <span className="text-2xl font-black text-[#4A4941]">
              {player.perfectLevelsCount}
            </span>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold mb-1">
              <Flame className="w-4 h-4" />
              <span>BEST STREAK</span>
            </div>
            <span className="text-2xl font-black text-[#4A4941]">
              {player.bestStreak} days
            </span>
          </div>

          <div className="bg-white/80 border border-[#E0E2D9] rounded-xl p-3 flex flex-col col-span-2">
            <div className="flex items-center gap-2 text-[#9A9B8F] text-xs font-bold mb-1">
              <BarChart2 className="w-4 h-4" />
              <span>TOTAL MOVES EXECUTED</span>
            </div>
            <span className="text-xl font-black text-[#4A4941]">
              {player.totalMovesMade.toLocaleString()} moves
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
