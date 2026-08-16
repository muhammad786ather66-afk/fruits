/**
 * AchievementsModal Component
 * Visual achievements grid with progress bars and unlocked checkmarks.
 */

import React from 'react';
import { Award, Check, Lock, X } from 'lucide-react';
import { ACHIEVEMENTS } from '../lib/achievements';
import { PlayerProfile } from '../types';

interface AchievementsModalProps {
  player: PlayerProfile;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  player,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-2xl w-full max-w-md p-5 text-[#4A4941] shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2D9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9EDC9] text-[#5F6F52] rounded-xl border border-[#86A789]/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#4A4941] tracking-tight">
                ACHIEVEMENTS
              </h2>
              <p className="text-xs text-[#9A9B8F]">
                Unlock badges through gameplay milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FEFAE0] border border-[#E9EDC9] text-[#9A9B8F] hover:text-[#4A4941]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
          {ACHIEVEMENTS.map((ach) => {
            const currentVal = ach.getProgress(player);
            const isUnlocked = currentVal >= ach.goal;
            const pct = Math.min(100, Math.floor((currentVal / ach.goal) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-[#FEFAE0] border-[#86A789] ring-1 ring-[#86A789]/40'
                    : 'bg-white/80 border-[#E0E2D9] opacity-90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isUnlocked
                        ? 'bg-[#86A789] text-white shadow-xs'
                        : 'bg-[#E0E2D9] text-[#9A9B8F] border border-[#D2D2C6]'
                    }`}
                  >
                    {isUnlocked ? <Check className="w-6 h-6 stroke-[3]" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-[#4A4941]">
                        {ach.title}
                      </h3>
                      <span className="text-[10px] font-bold text-[#5F6F52]">
                        {currentVal} / {ach.goal}
                      </span>
                    </div>
                    <p className="text-xs text-[#9A9B8F] mt-0.5">
                      {ach.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#E0E2D9] rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className="bg-[#86A789] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
