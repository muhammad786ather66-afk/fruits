/**
 * GameView Component
 * Core gameplay board, fruit movement logic, win detection, UNDO, HINT, RESTART, and Win Modal.
 */

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Lightbulb,
  RefreshCw,
  Star,
  Play,
  Trophy,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { Basket, LevelConfig, MoveRecord, PlayerProfile } from '../types';
import { BasketContainer } from './BasketContainer';
import { audio } from '../lib/audio';
import { executeMove, isBoardSolved, isMoveLegal, solvePuzzle } from '../lib/solver';
import { FRUITS } from '../lib/fruits';
import { THEMES } from '../lib/themes';

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
  onOpenProfiles,
}) => {
  const theme = THEMES[player.currentTheme] || THEMES.classic;

  const [baskets, setBaskets] = useState<Basket[]>(levelConfig.initialBaskets);
  const [selectedBasketIdx, setSelectedBasketIdx] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintMove, setHintMove] = useState<{ from: number; to: number } | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [winStats, setWinStats] = useState<{ stars: number; earnedScore: number } | null>(null);

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
  }, [levelConfig]);

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

    // Fire Celebratory Confetti Burst
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: theme.particleColors,
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
    const moveScore = finalMoves * 5;
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
    } else {
      // If stuck, suggest restarting
      alert('No legal winning moves from this state! Try using Undo or Restarting the level.');
    }
  };

  return (
    <div className={`w-full flex-1 flex flex-col items-center justify-between p-3 bg-gradient-to-b ${theme.bgGradient} text-white min-h-[calc(100vh-56px)]`}>
      {/* Top Status Banner */}
      <div className={`w-full max-w-xl ${theme.cardBg} border rounded-2xl p-3 flex items-center justify-between shadow-xl mb-3`}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
            {levelConfig.levelNumber}
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>LEVEL {levelConfig.levelNumber}</span>
              {levelConfig.isChallenge && (
                <span className="text-[9px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded uppercase">
                  CHALLENGE
                </span>
              )}
            </h2>
            <span className="text-[11px] text-slate-400">
              Target Moves: {levelConfig.maxMovesTarget}
            </span>
          </div>
        </div>

        {/* Moves & Stars */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              MOVES
            </span>
            <span className="text-xl font-black text-amber-400">
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
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'text-slate-600'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Baskets Grid */}
      <div className="w-full max-w-2xl flex-1 flex items-center justify-center py-4">
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
                basketBorderClass={theme.basketBorder}
                basketBgClass={theme.basketBg}
                woodAccentClass={theme.woodAccent}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Control Toolbar */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-around shadow-2xl mt-2 z-20">
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || isWon}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-200 transition-all active:scale-95"
        >
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">UNDO</span>
        </button>

        <button
          onClick={handleHint}
          disabled={isWon}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 text-slate-200 transition-all active:scale-95 relative"
        >
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">HINT</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            onReplayLevel();
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-all active:scale-95"
        >
          <RefreshCw className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold">RESTART</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            onOpenLevelSelect();
          }}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-200 transition-all active:scale-95"
        >
          <Zap className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] font-bold">LEVELS</span>
        </button>
      </div>

      {/* Level Complete Win Modal */}
      {isWon && winStats && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header Fanfare Banner */}
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              PUZZLE SOLVED!
            </h2>
            <p className="text-xs text-amber-300 mt-0.5 font-medium">
              Level {levelConfig.levelNumber} Completed
            </p>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 my-4">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-9 h-9 ${
                    s <= winStats.stars
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110'
                      : 'text-slate-700'
                  } transition-all duration-300`}
                />
              ))}
            </div>

            {/* Stats Breakdown */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 my-4 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Moves Taken:</span>
                <span className="font-bold text-white">{movesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Score Earned:</span>
                <span className="font-bold text-amber-400">
                  +{winStats.earnedScore} pts
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-5">
              <button
                onClick={() => {
                  audio.playClick();
                  onNextLevel();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <span>NEXT LEVEL</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    audio.playClick();
                    onReplayLevel();
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 transition-colors"
                >
                  Replay
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    onOpenLevelSelect();
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 transition-colors"
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
