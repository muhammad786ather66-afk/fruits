/**
 * ScoreboardModal Component
 * Displays an attractive local leaderboard with category sorting, podium showcase, and detailed stats.
 */

import React, { useState } from 'react';
import { Trophy, Star, Medal, X, Crown, Flame, Target, Award } from 'lucide-react';
import { PlayerProfile } from '../types';

interface ScoreboardModalProps {
  profiles: PlayerProfile[];
  activeProfileId: string;
  onClose: () => void;
}

type SortCategory = 'score' | 'stars' | 'level' | 'fruits';

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  profiles,
  activeProfileId,
  onClose,
}) => {
  const [category, setCategory] = useState<SortCategory>('score');

  // Sort profiles based on selected category
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (category === 'score') return b.totalScore - a.totalScore;
    if (category === 'stars') return b.totalStars - a.totalStars;
    if (category === 'level') return b.highestLevelReached - a.highestLevelReached;
    if (category === 'fruits') return b.totalFruitsSorted - a.totalFruitsSorted;
    return 0;
  });

  const topThree = sortedProfiles.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-3xl w-full max-w-lg p-4 sm:p-6 text-[#4A4941] shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E2D9]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#86A789] text-white rounded-2xl shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#4A4941] tracking-tight leading-tight">
                HALL OF FAME
              </h2>
              <p className="text-xs text-[#9A9B8F] font-bold">
                Local Leaderboard • {profiles.length} Players
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white border border-[#E0E2D9] text-[#9A9B8F] hover:text-[#4A4941] hover:border-[#86A789] transition-all cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 my-3 p-1 bg-white border border-[#E0E2D9] rounded-2xl">
          <button
            onClick={() => setCategory('score')}
            className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
              category === 'score'
                ? 'bg-[#5F6F52] text-white shadow-xs'
                : 'text-[#9A9B8F] hover:text-[#4A4941]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Score</span>
          </button>

          <button
            onClick={() => setCategory('stars')}
            className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
              category === 'stars'
                ? 'bg-[#5F6F52] text-white shadow-xs'
                : 'text-[#9A9B8F] hover:text-[#4A4941]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Stars</span>
          </button>

          <button
            onClick={() => setCategory('level')}
            className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
              category === 'level'
                ? 'bg-[#5F6F52] text-white shadow-xs'
                : 'text-[#9A9B8F] hover:text-[#4A4941]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Level</span>
          </button>

          <button
            onClick={() => setCategory('fruits')}
            className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
              category === 'fruits'
                ? 'bg-[#5F6F52] text-white shadow-xs'
                : 'text-[#9A9B8F] hover:text-[#4A4941]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Fruits</span>
          </button>
        </div>

        {/* Top 3 Podium Showcase (if at least 1 profile exists) */}
        {topThree.length > 0 && (
          <div className="bg-white border border-[#E0E2D9] rounded-2xl p-3 mb-3 flex items-end justify-center gap-2 sm:gap-4 shadow-xs">
            {/* 2nd Place (Silver) */}
            {topThree[1] ? (
              <div className="flex flex-col items-center flex-1 order-1">
                <div className="relative mb-1">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs border-2 border-slate-300"
                    style={{ backgroundColor: topThree[1].avatarColor || '#94a3b8' }}
                  >
                    {topThree[1].name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-800 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    2
                  </span>
                </div>
                <span className="text-xs font-black text-[#4A4941] truncate max-w-[70px] sm:max-w-[90px] text-center">
                  {topThree[1].name}
                </span>
                <span className="text-[10px] font-bold text-[#5F6F52]">
                  {category === 'score' && `${topThree[1].totalScore.toLocaleString()} pts`}
                  {category === 'stars' && `${topThree[1].totalStars} ⭐`}
                  {category === 'level' && `Lvl ${topThree[1].highestLevelReached}`}
                  {category === 'fruits' && `${topThree[1].totalFruitsSorted} 🍎`}
                </span>
              </div>
            ) : (
              <div className="flex-1 order-1" />
            )}

            {/* 1st Place (Gold Champion) */}
            {topThree[0] && (
              <div className="flex flex-col items-center flex-1 order-2 -mt-2">
                <Crown className="w-5 h-5 text-amber-500 animate-bounce mb-0.5" />
                <div className="relative mb-1">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-base text-white shadow-md border-2 border-amber-400 ring-2 ring-amber-300/50"
                    style={{ backgroundColor: topThree[0].avatarColor || '#86A789' }}
                  >
                    {topThree[0].name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    1
                  </span>
                </div>
                <span className="text-xs font-black text-[#4A4941] truncate max-w-[80px] sm:max-w-[100px] text-center">
                  {topThree[0].name}
                </span>
                <span className="text-[11px] font-black text-[#5F6F52]">
                  {category === 'score' && `${topThree[0].totalScore.toLocaleString()} pts`}
                  {category === 'stars' && `${topThree[0].totalStars} ⭐`}
                  {category === 'level' && `Lvl ${topThree[0].highestLevelReached}`}
                  {category === 'fruits' && `${topThree[0].totalFruitsSorted} 🍎`}
                </span>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {topThree[2] ? (
              <div className="flex flex-col items-center flex-1 order-3">
                <div className="relative mb-1">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs border-2 border-amber-700"
                    style={{ backgroundColor: topThree[2].avatarColor || '#b45309' }}
                  >
                    {topThree[2].name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    3
                  </span>
                </div>
                <span className="text-xs font-black text-[#4A4941] truncate max-w-[70px] sm:max-w-[90px] text-center">
                  {topThree[2].name}
                </span>
                <span className="text-[10px] font-bold text-[#5F6F52]">
                  {category === 'score' && `${topThree[2].totalScore.toLocaleString()} pts`}
                  {category === 'stars' && `${topThree[2].totalStars} ⭐`}
                  {category === 'level' && `Lvl ${topThree[2].highestLevelReached}`}
                  {category === 'fruits' && `${topThree[2].totalFruitsSorted} 🍎`}
                </span>
              </div>
            ) : (
              <div className="flex-1 order-3" />
            )}
          </div>
        )}

        {/* Complete Leaderboard List */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {sortedProfiles.length === 0 ? (
            <div className="text-center py-8 text-[#9A9B8F] italic text-sm">
              No player profiles found yet.
            </div>
          ) : (
            sortedProfiles.map((p, idx) => {
              const rank = idx + 1;
              const isActive = p.id === activeProfileId;

              const rankBadgeClasses = {
                1: 'bg-amber-400 text-amber-950 font-black ring-2 ring-amber-300',
                2: 'bg-slate-300 text-slate-900 font-black',
                3: 'bg-amber-700 text-white font-black',
              }[rank] || 'bg-[#E0E2D9] text-[#4A4941] font-bold';

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-[#E9EDC9]/60 border-[#86A789] ring-2 ring-[#86A789]/40'
                      : 'bg-white border-[#E0E2D9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shadow-xs ${rankBadgeClasses}`}
                    >
                      {rank <= 3 ? <Medal className="w-4 h-4" /> : `#${rank}`}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-xs border border-white"
                      style={{ backgroundColor: p.avatarColor || '#86A789' }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Player Details */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-[#4A4941] truncate max-w-[90px] sm:max-w-[130px]">
                          {p.name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-black bg-[#86A789] text-white px-1.5 py-0.2 rounded-full uppercase">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#9A9B8F] font-semibold">
                        <span>Lvl {p.highestLevelReached}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-[#5F6F52] font-bold">
                          <Star className="w-3 h-3 fill-current text-[#86A789]" />
                          {p.totalStars}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category Target Value */}
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-black text-[#5F6F52]">
                      {category === 'score' && `${p.totalScore.toLocaleString()} pts`}
                      {category === 'stars' && `${p.totalStars} Stars`}
                      {category === 'level' && `Level ${p.highestLevelReached}`}
                      {category === 'fruits' && `${p.totalFruitsSorted} Fruits`}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#9A9B8F] font-bold uppercase">
                      {category === 'score' && 'Total Points'}
                      {category === 'stars' && 'Earned Stars'}
                      {category === 'level' && 'Highest Level'}
                      {category === 'fruits' && 'Fruits Sorted'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-3 pt-2 border-t border-[#E0E2D9] text-center text-[10px] text-[#9A9B8F] font-semibold">
          Leaderboard records local device scores across all player profiles.
        </div>
      </div>
    </div>
  );
};
