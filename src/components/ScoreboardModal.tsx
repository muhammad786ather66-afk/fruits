/**
 * ScoreboardModal Component
 * Displays local leaderboard comparing player profiles saved on this browser/device.
 */

import React from 'react';
import { Trophy, Star, Medal, X, Shield } from 'lucide-react';
import { PlayerProfile } from '../types';

interface ScoreboardModalProps {
  profiles: PlayerProfile[];
  activeProfileId: string;
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  profiles,
  activeProfileId,
  onClose,
}) => {
  // Sort profiles by Total Score descending
  const sortedProfiles = [...profiles].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 text-white shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                LOCAL SCOREBOARD
              </h2>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60">
                THIS DEVICE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scoreboard List */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {sortedProfiles.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic text-sm">
              No profiles found on this device yet.
            </div>
          ) : (
            sortedProfiles.map((p, idx) => {
              const rank = idx + 1;
              const isActive = p.id === activeProfileId;

              const medalColors = {
                1: 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300',
                2: 'bg-slate-300 text-slate-950 font-black',
                3: 'bg-amber-700 text-white font-black',
              }[rank];

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40'
                      : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                        medalColors || 'bg-slate-700 text-slate-300 font-bold'
                      }`}
                    >
                      {rank <= 3 ? <Medal className="w-4 h-4" /> : rank}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100">
                          {p.name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-2">
                        <span>Level {p.currentLevel}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-300">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {p.totalStars}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-base font-black text-amber-400">
                      {p.totalScore.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      points
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-500">
          Rankings are calculated locally from profiles saved in browser memory.
        </div>
      </div>
    </div>
  );
};
