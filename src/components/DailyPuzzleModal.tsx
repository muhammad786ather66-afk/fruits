/**
 * DailyPuzzleModal Component
 * Daily Fruit Puzzle challenge with streak tracker.
 */

import React from 'react';
import { Calendar, Flame, Star, Trophy, ArrowRight, X } from 'lucide-react';
import { PlayerProfile } from '../types';

interface DailyPuzzleModalProps {
  player: PlayerProfile;
  onStartDaily: () => void;
  onClose: () => void;
}

export const DailyPuzzleModal: React.FC<DailyPuzzleModalProps> = ({
  player,
  onStartDaily,
  onClose,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyHistory = player.dailyPuzzleHistory || {};
  const todayResult = dailyHistory[todayStr];
  const isCompletedToday = todayResult?.completed;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-2xl w-full max-w-md p-5 text-[#4A4941] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2D9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9EDC9] text-[#5F6F52] rounded-xl border border-[#86A789]/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#4A4941] tracking-tight">
                DAILY FRUIT PUZZLE
              </h2>
              <p className="text-xs text-[#9A9B8F]">{todayStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FEFAE0] border border-[#E9EDC9] text-[#9A9B8F] hover:text-[#4A4941]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="bg-[#FEFAE0] border border-[#E9EDC9] rounded-2xl p-4 text-center mb-4 relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-[#5F6F52] animate-bounce" />
            <span className="text-2xl font-black text-[#4A4941]">
              {player.currentStreak || 0} Day Streak
            </span>
          </div>
          <p className="text-xs text-[#5F6F52] font-semibold">
            Complete today's unique seed puzzle to maintain your streak!
          </p>
        </div>

        {/* Status */}
        {isCompletedToday ? (
          <div className="bg-[#EBEFE4] border border-[#86A789] rounded-xl p-4 text-center mb-5">
            <div className="w-10 h-10 rounded-full bg-[#86A789] text-white font-black mx-auto flex items-center justify-center mb-2">
              ✓
            </div>
            <h3 className="font-extrabold text-base text-[#5F6F52]">
              TODAY'S PUZZLE SOLVED!
            </h3>
            <p className="text-xs text-[#4A4941] mt-1 font-medium">
              Score: {todayResult.score} • Stars: {todayResult.stars} ★ • Moves:{' '}
              {todayResult.moves}
            </p>
            <p className="text-[11px] text-[#9A9B8F] mt-2">
              Come back tomorrow for a brand new daily puzzle!
            </p>
          </div>
        ) : (
          <div className="text-center py-3 mb-4 space-y-2">
            <p className="text-sm text-[#4A4941]">
              Every day generates a special seed puzzle. Can you solve today's challenge in minimum moves?
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            onStartDaily();
            onClose();
          }}
          className="w-full py-3.5 bg-[#5F6F52] hover:bg-[#4F5F42] text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          <span>{isCompletedToday ? 'REPLAY TODAY\'S PUZZLE' : 'START DAILY PUZZLE'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
