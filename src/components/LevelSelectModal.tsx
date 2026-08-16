/**
 * LevelSelectModal Component
 * Interactive grid for choosing level numbers, showing completed stars and high scores.
 */

import React, { useState } from 'react';
import { Star, Lock, X, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { LevelProgress } from '../types';

interface LevelSelectModalProps {
  currentLevel: number;
  highestLevelReached: number;
  levelProgress: Record<number, LevelProgress>;
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  highestLevelReached,
  levelProgress,
  onSelectLevel,
  onClose,
}) => {
  const [page, setPage] = useState(Math.floor((currentLevel - 1) / 30));
  const levelsPerPage = 30;

  const startLevel = page * levelsPerPage + 1;
  const endLevel = startLevel + levelsPerPage - 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 text-white shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>SELECT LEVEL</span>
            </h2>
            <p className="text-xs text-slate-400">
              Levels {startLevel} - {endLevel} (Highest Reached: {highestLevelReached})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 overflow-y-auto p-1 flex-1">
          {Array.from({ length: levelsPerPage }).map((_, idx) => {
            const levelNum = startLevel + idx;
            const isUnlocked = levelNum <= highestLevelReached + 1;
            const isCurrent = levelNum === currentLevel;
            const prog = levelProgress[levelNum];
            const stars = prog?.stars || 0;
            const isChallenge = levelNum > 5 && levelNum % 10 === 0;

            return (
              <button
                key={levelNum}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(levelNum);
                  onClose();
                }}
                className={`relative flex flex-col items-center justify-center h-16 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-300 font-black scale-105 shadow-lg'
                    : prog?.completed
                    ? 'bg-slate-800/90 border-emerald-500/60 text-white hover:bg-slate-800'
                    : isUnlocked
                    ? 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-800'
                    : 'bg-slate-950/60 border-slate-800/60 text-slate-600 cursor-not-allowed'
                }`}
              >
                {/* Challenge Badge */}
                {isChallenge && isUnlocked && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black px-1 rounded-full border border-rose-400">
                    C
                  </span>
                )}

                {!isUnlocked ? (
                  <Lock className="w-5 h-5 text-slate-600" />
                ) : (
                  <>
                    <span className="text-sm font-extrabold">{levelNum}</span>
                    {stars > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 ${
                              s <= stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold rounded-lg text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev 30</span>
          </button>

          <span className="text-xs font-semibold text-slate-400">
            Page {page + 1}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200"
          >
            <span>Next 30</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
