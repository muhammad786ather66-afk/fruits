/**
 * ThemesModal Component
 * Allows unlocking and selecting visual background and basket themes.
 */

import React from 'react';
import { Palette, Lock, Check, X } from 'lucide-react';
import { THEMES } from '../lib/themes';
import { PlayerProfile } from '../types';

interface ThemesModalProps {
  player: PlayerProfile;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({
  player,
  onSelectTheme,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-2xl w-full max-w-md p-5 text-[#4A4941] shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E0E2D9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E9EDC9] text-[#5F6F52] rounded-xl border border-[#86A789]/30">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#4A4941] tracking-tight">
                BOARD THEMES
              </h2>
              <p className="text-xs text-[#9A9B8F]">
                Unlock cosmetics by reaching higher levels
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

        {/* Theme List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {Object.values(THEMES).map((theme) => {
            const isUnlocked = player.highestLevelReached >= theme.unlockLevel;
            const isCurrent = player.currentTheme === theme.id;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectTheme(theme.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-[#FEFAE0] border-[#86A789] ring-2 ring-[#86A789]/50 shadow-xs'
                    : isUnlocked
                    ? 'bg-white/80 border-[#E0E2D9] hover:bg-white'
                    : 'bg-[#E0E2D9]/40 border-[#E0E2D9] opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme Gradient Preview Circle */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.bgGradient} border-2 border-[#D2D2C6] flex items-center justify-center shadow-xs`}
                  >
                    <div
                      className="w-5 h-5 rounded-md border-2 border-[#86A789]"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#4A4941] flex items-center gap-2">
                      <span>{theme.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold bg-[#86A789] text-white px-1.5 py-0.2 rounded">
                          ACTIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#9A9B8F] mt-0.5">
                      {isUnlocked
                        ? 'Unlocked'
                        : `Requires Level ${theme.unlockLevel}`}
                    </p>
                  </div>
                </div>

                <div>
                  {!isUnlocked ? (
                    <Lock className="w-5 h-5 text-[#9A9B8F]" />
                  ) : isCurrent ? (
                    <div className="w-7 h-7 rounded-full bg-[#86A789] text-white flex items-center justify-center font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <button className="px-3 py-1 bg-[#FEFAE0] border border-[#E9EDC9] hover:bg-[#F2EDD0] text-xs font-bold rounded-lg text-[#4A4941]">
                      Use
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
