/**
 * GameView Component
 * Core gameplay board, fruit movement logic, win detection, UNDO, HINT, RESTART, and Win Modal.
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Lightbulb,
  RefreshCw,
  Star,
  Trophy,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Basket, LevelConfig, MoveRecord, PlayerProfile } from '../types';
import { BasketContainer } from './BasketContainer';
import { audio } from '../lib/audio';
import { executeMove, isBoardSolved, isMoveLegal, solvePuzzle } from '../lib/solver';
import { THEMES } from '../lib/themes';
import { getBottleThemeForLevel } from '../lib/bottleThemes';

interface GameViewProps {
  levelConfig: LevelConfig;
  player: PlayerProfile;
  onSaveProgress: (updatedPlayer: PlayerProfile) => void;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onOpenLevelSelect: () => void;
  onOpenProfiles: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  levelConfig,
  player,
  onSaveProgress,
  onNextLevel,
  onReplayLevel,
  onOpenLevelSelect,
}) => {
  const theme = THEMES[player.currentTheme] || THEMES.classic;
  const bottleTheme = getBottleThemeForLevel(levelConfig.levelNumber);

  const [baskets, setBaskets] = useState<Basket[]>(levelConfig.initialBaskets);
  const [selectedBasketIdx, setSelectedBasketIdx] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintMove, setHintMove] = useState<{ from: number; to: number } | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [winStats, setWinStats] = useState<{ stars: number; earnedScore: number } | null>(null);

  // Auto-advance timer (seconds countdown)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  // Re-initialize state when levelConfig changes
  useEffect(() => {
    setBaskets(levelConfig.initialBaskets);
    setSelectedBasketIdx(null);
    setMoveHistory([]);
    setMovesCount(0);
    setHintsUsed(0);
    setHintMove(null);
    setIsWon(false);
    setWinStats(null);
    setAutoAdvanceTimer(null);
    setIsAutoPaused(false);
  }, [levelConfig]);

  // Handle automatic progression to next level on win
  useEffect(() => {
    if (!isWon || isAutoPaused) {
      return;
    }

    setAutoAdvanceTimer(2);
    const interval = setInterval(() => {
      setAutoAdvanceTimer((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          onNextLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWon, isAutoPaused, onNextLevel]);

  // Handle basket selection and fruit movement
  const handleSelectBasket = (targetIdx: number) => {
    if (isWon) return;
    setHintMove(null);

    // Case 1: No basket currently selected
    if (selectedBasketIdx === null) {
      const b = baskets[targetIdx];
      if (!b || b.items.length === 0 || b.isLocked) {
        audio.playInvalid();
        return;
      }
      const topItem = b.items[b.items.length - 1];
      if (topItem.isFrozen) {
        audio.playInvalid();
        return;
      }
      setSelectedBasketIdx(targetIdx);
      audio.playPickUp();
      return;
    }

    // Case 2: Tapping the same basket unselects it
    if (selectedBasketIdx === targetIdx) {
      setSelectedBasketIdx(null);
      audio.playClick();
      return;
    }

    // Case 3: Destination basket selected -> Check if move is legal
    const sourceIdx = selectedBasketIdx;
    if (isMoveLegal(baskets, sourceIdx, targetIdx)) {
      const movedItem = baskets[sourceIdx].items[baskets[sourceIdx].items.length - 1];

      // Execute move
      const nextBaskets = executeMove(baskets, sourceIdx, targetIdx);
      const record: MoveRecord = {
        fromBasketId: baskets[sourceIdx].id,
        toBasketId: baskets[targetIdx].id,
        movedItem,
      };

      setMoveHistory((prev) => [...prev, record]);
      setBaskets(nextBaskets);
      setSelectedBasketIdx(null);
      setMovesCount((prev) => prev + 1);
      audio.playPlace();

      // Check if destination basket completed
      const destB = nextBaskets[targetIdx];
      if (
        destB.items.length === destB.capacity &&
        destB.items.every((i) => i.type === destB.items[0].type && !i.isFrozen)
      ) {
        audio.playBasketComplete();
      }

      // Check for Puzzle Solve Win
      if (isBoardSolved(nextBaskets)) {
        handleWin(movesCount + 1, hintsUsed, nextBaskets);
      }
    } else {
      audio.playInvalid();
      setSelectedBasketIdx(null);
    }
  };

  // Handle Puzzle Solved Win
  const handleWin = (finalMoves: number, hints: number, finalBaskets: Basket[]) => {
    setIsWon(true);
    audio.playLevelWin();

    // Fire Celebratory Confetti Burst using level-specific bottle theme colors
    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.55 },
        colors: bottleTheme.particleColors,
      });
    } catch {
      // ignore
    }

    // Calculate Stars
    let stars = 1;
    if (finalMoves <= levelConfig.maxMovesTarget) {
      stars = 3;
    } else if (finalMoves <= Math.ceil(levelConfig.maxMovesTarget * 1.4)) {
      stars = 2;
    }

    // Calculate Score Points
    const completionBonus = 50;
    const starBonus = stars * 25;
    const noHintBonus = hints === 0 ? 10 : 0;
    const totalEarned = completionBonus + starBonus + noHintBonus;

    setWinStats({ stars, earnedScore: totalEarned });

    // Count fruits sorted
    const fruitsSorted = finalBaskets.reduce((acc, b) => acc + b.items.length, 0);

    // Save Updated Player Profile Progress
    const existingProgress = player.levelProgress[levelConfig.levelNumber] || {
      completed: false,
      stars: 0,
      bestMoves: 999,
      highScore: 0,
    };

    const updatedStars = Math.max(existingProgress.stars, stars);
    const updatedMoves = Math.min(existingProgress.bestMoves, finalMoves);
    const updatedScore = Math.max(existingProgress.highScore, totalEarned);

    const isFirstTimeWin = !existingProgress.completed;
    const nextCurrentLevel = Math.max(player.currentLevel, levelConfig.levelNumber + 1);
    const nextHighestLevel = Math.max(player.highestLevelReached, levelConfig.levelNumber);

    const updatedProfile: PlayerProfile = {
      ...player,
      currentLevel: nextCurrentLevel,
      highestLevelReached: nextHighestLevel,
      totalScore: player.totalScore + (isFirstTimeWin ? totalEarned : Math.max(0, totalEarned - existingProgress.highScore)),
      totalStars: player.totalStars + (stars > existingProgress.stars ? stars - existingProgress.stars : 0),
      totalFruitsSorted: player.totalFruitsSorted + fruitsSorted,
      totalMovesMade: player.totalMovesMade + finalMoves,
      totalLevelsCompleted: player.totalLevelsCompleted + (isFirstTimeWin ? 1 : 0),
      perfectLevelsCount: player.perfectLevelsCount + (stars === 3 && existingProgress.stars < 3 ? 1 : 0),
      hintsUsedCount: player.hintsUsedCount + hints,
      levelProgress: {
        ...player.levelProgress,
        [levelConfig.levelNumber]: {
          completed: true,
          stars: updatedStars,
          bestMoves: updatedMoves,
          highScore: updatedScore,
        },
      },
    };

    onSaveProgress(updatedProfile);
  };

  // Undo previous move
  const handleUndo = () => {
    if (moveHistory.length === 0 || isWon) return;
    audio.playUndo();

    const lastMove = moveHistory[moveHistory.length - 1];
    setMoveHistory((prev) => prev.slice(0, prev.length - 1));

    // Revert move
    setBaskets((prev) => {
      const next = prev.map((b) => ({
        ...b,
        items: b.items.map((i) => ({ ...i })),
      }));

      const toBasket = next.find((b) => b.id === lastMove.toBasketId);
      const fromBasket = next.find((b) => b.id === lastMove.fromBasketId);

      if (toBasket && fromBasket) {
        const item = toBasket.items.pop();
        if (item) {
          fromBasket.items.push(item);
        }
      }
      return next;
    });

    setSelectedBasketIdx(null);
    setHintMove(null);
  };

  // Run Solver for Hint
  const handleHint = () => {
    if (isWon) return;
    audio.playHint();
    setHintsUsed((prev) => prev + 1);

    const solverResult = solvePuzzle(baskets, 3000);
    if (solverResult.nextBestMove) {
      setHintMove({
        from: solverResult.nextBestMove.fromIndex,
        to: solverResult.nextBestMove.toIndex,
      });
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-between p-3 bg-[#F7F9F2] text-[#4A4941] min-h-[calc(100vh-56px)]">
      {/* Top Level & Bottle Color Header */}
      <div className="w-full max-w-xl bg-white border border-[#E0E2D9] rounded-2xl p-3 flex items-center justify-between shadow-xs mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl ${bottleTheme.accentBadgeBg} ${bottleTheme.accentText} border border-[#86A789]/30 flex flex-col items-center justify-center font-black text-sm shadow-xs`}>
            <span>LVL</span>
            <span className="text-base leading-none">{levelConfig.levelNumber}</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-tight text-[#4A4941] flex items-center gap-2">
              <span>LEVEL {levelConfig.levelNumber}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bottleTheme.accentBadgeBg} ${bottleTheme.accentText}`}>
                Theme: {bottleTheme.name}
              </span>
            </h2>
            <span className="text-[11px] text-[#9A9B8F] font-medium">
              Target Moves: {levelConfig.maxMovesTarget}
            </span>
          </div>
        </div>

        {/* Moves & Stars */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#9A9B8F] font-bold uppercase tracking-wider">
              MOVES
            </span>
            <span className="text-xl font-black text-[#5F6F52]">
              {movesCount}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((s) => {
              const targetForStars =
                s === 3
                  ? levelConfig.maxMovesTarget
                  : s === 2
                  ? Math.ceil(levelConfig.maxMovesTarget * 1.4)
                  : 999;
              const hasStar = movesCount <= targetForStars;

              return (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    hasStar
                      ? 'fill-[#86A789] text-[#86A789]'
                      : 'text-[#E0E2D9]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Baskets / Bottles Grid */}
      <div className="w-full max-w-2xl flex-1 flex items-center justify-center py-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-5 place-items-center w-full">
          {baskets.map((b, idx) => {
            const isSelected = selectedBasketIdx === idx;
            const isValidDest =
              selectedBasketIdx !== null &&
              selectedBasketIdx !== idx &&
              isMoveLegal(baskets, selectedBasketIdx, idx);

            return (
              <BasketContainer
                key={b.id}
                basket={b}
                basketIndex={idx}
                isSelected={isSelected}
                isValidDestination={isValidDest}
                isHintSource={hintMove?.from === idx}
                isHintTarget={hintMove?.to === idx}
                onSelect={handleSelectBasket}
                basketBorderClass={bottleTheme.glassBorder}
                basketBgClass={bottleTheme.glassTintBg}
                woodAccentClass={`${bottleTheme.accentBadgeBg} ${bottleTheme.accentText}`}
                rimBgClass={bottleTheme.rimBg}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Control Toolbar */}
      <div className="w-full max-w-md bg-white border border-[#E0E2D9] rounded-2xl p-2.5 flex items-center justify-around shadow-sm mt-2 z-20">
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || isWon}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-[#FEFAE0] disabled:opacity-30 text-[#4A4941] transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-[#5F6F52]" />
          <span className="text-[10px] font-bold">UNDO</span>
        </button>

        <button
          onClick={handleHint}
          disabled={isWon}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-[#FEFAE0] disabled:opacity-30 text-[#4A4941] transition-all active:scale-95 cursor-pointer"
        >
          <Lightbulb className="w-5 h-5 text-[#86A789]" />
          <span className="text-[10px] font-bold">HINT</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            onReplayLevel();
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-[#FEFAE0] text-[#4A4941] transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-5 h-5 text-[#5F6F52]" />
          <span className="text-[10px] font-bold">RESTART</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            onOpenLevelSelect();
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-[#FEFAE0] text-[#4A4941] transition-all active:scale-95 cursor-pointer"
        >
          <Zap className="w-5 h-5 text-[#86A789]" />
          <span className="text-[10px] font-bold">LEVELS</span>
        </button>
      </div>

      {/* Level Complete Win Modal with Automatic Next Level */}
      {isWon && winStats && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F9F2] border border-[#E0E2D9] rounded-3xl w-full max-w-sm p-6 text-[#4A4941] shadow-2xl text-center relative overflow-hidden">
            {/* Header Fanfare Banner */}
            <div className="inline-flex p-3 rounded-2xl bg-[#E9EDC9] text-[#5F6F52] border border-[#86A789]/40 mb-3">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#4A4941] uppercase">
              PUZZLE SOLVED!
            </h2>
            <p className="text-xs text-[#5F6F52] mt-0.5 font-bold">
              Level {levelConfig.levelNumber} Completed
            </p>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 my-4">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-9 h-9 ${
                    s <= winStats.stars
                      ? 'fill-[#86A789] text-[#86A789] scale-110'
                      : 'text-[#E0E2D9]'
                  } transition-all duration-300`}
                />
              ))}
            </div>

            {/* Stats Breakdown */}
            <div className="bg-white border border-[#E0E2D9] rounded-2xl p-3 my-4 space-y-1.5 text-xs text-[#4A4941]">
              <div className="flex justify-between items-center">
                <span className="text-[#9A9B8F] font-medium">Moves Taken:</span>
                <span className="font-bold text-[#4A4941]">{movesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9A9B8F] font-medium">Score Earned:</span>
                <span className="font-bold text-[#5F6F52]">
                  +{winStats.earnedScore} pts
                </span>
              </div>
            </div>

            {/* Auto-Advance Notification Banner */}
            {autoAdvanceTimer !== null && !isAutoPaused && (
              <div className="bg-[#E9EDC9] border border-[#86A789]/50 rounded-xl p-2.5 mb-4 text-xs font-bold text-[#5F6F52] flex items-center justify-between">
                <span>Auto-advancing to Level {levelConfig.levelNumber + 1} in {autoAdvanceTimer}s...</span>
                <button
                  onClick={() => setIsAutoPaused(true)}
                  className="text-[10px] underline font-extrabold hover:text-[#4A4941]"
                >
                  PAUSE
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 mt-4">
              <button
                onClick={() => {
                  audio.playClick();
                  onNextLevel();
                }}
                className="w-full py-3.5 bg-[#5F6F52] hover:bg-[#4F5F42] text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
              >
                <span>NEXT LEVEL NOW</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    audio.playClick();
                    onReplayLevel();
                  }}
                  className="py-2.5 bg-[#FEFAE0] border border-[#E9EDC9] hover:bg-[#F2EDD0] text-xs font-bold rounded-xl text-[#4A4941] transition-colors cursor-pointer"
                >
                  Replay
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    onOpenLevelSelect();
                  }}
                  className="py-2.5 bg-[#FEFAE0] border border-[#E9EDC9] hover:bg-[#F2EDD0] text-xs font-bold rounded-xl text-[#4A4941] transition-colors cursor-pointer"
                >
                  Level Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

