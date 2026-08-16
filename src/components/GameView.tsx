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
  Plus,
  Palette,
  Settings,
  AlertTriangle,
  FlaskConical,
  ExternalLink,
} from 'lucide-react';
import { Basket, LevelConfig, MoveRecord, PlayerProfile } from '../types';
import { BasketContainer } from './BasketContainer';
import { audio } from '../lib/audio';
import { executeMove, isBoardSolved, isMoveLegal, solvePuzzle } from '../lib/solver';
import { THEMES } from '../lib/themes';
import { getBottleThemeForLevel } from '../lib/bottleThemes';
import { RewardedAdModal, AdRewardType } from './RewardedAdModal';

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
  const [extraBottlesAdded, setExtraBottlesAdded] = useState(0);

  // 3 Wrong Moves tracking
  const [wrongMovesCount, setWrongMovesCount] = useState<number>(0);
  const [showRestartToast, setShowRestartToast] = useState<boolean>(false);

  const [isWon, setIsWon] = useState(false);
  const [winStats, setWinStats] = useState<{ stars: number; earnedScore: number } | null>(null);

  // Auto-advance timer (seconds countdown)
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  // Hints & Rewarded Ads State
  const [freeHintsRemaining, setFreeHintsRemaining] = useState<number>(
    levelConfig.isChallenge ? 0 : 1
  );
  const [activeAd, setActiveAd] = useState<{
    rewardType: AdRewardType;
    rewardTitle: string;
    rewardDescription: string;
    requiredSeconds: number;
  } | null>(null);

  const AD_URL = "https://www.effectivecpmnetwork.com/injygstv?key=58b512b8278fdb4d1fb08d6d0bad6c5e";

  const isGrandLevel = levelConfig.levelNumber % 5 === 0 || levelConfig.isChallenge;

  // Re-initialize state when levelConfig changes
  useEffect(() => {
    setBaskets(levelConfig.initialBaskets);
    setSelectedBasketIdx(null);
    setMoveHistory([]);
    setMovesCount(0);
    setHintsUsed(0);
    setFreeHintsRemaining(levelConfig.isChallenge ? 0 : 1);
    setHintMove(null);
    setExtraBottlesAdded(0);
    setWrongMovesCount(0);
    setShowRestartToast(false);
    setIsWon(false);
    setWinStats(null);
    setAutoAdvanceTimer(null);
    setIsAutoPaused(false);
    setActiveAd(null);

    // Announce level start with Voice
    if (isGrandLevel) {
      audio.speakVoice(`Level ${levelConfig.levelNumber}. Super Hard Grand Level!`);
    } else {
      audio.speakVoice(`Level ${levelConfig.levelNumber}`);
    }
  }, [levelConfig]);

  // Handle automatic progression to next level on win -> shows Full Screen Rewarded Ad modal
  useEffect(() => {
    if (!isWon || isAutoPaused || activeAd !== null) {
      return;
    }

    setAutoAdvanceTimer(4);
    const interval = setInterval(() => {
      setAutoAdvanceTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleProceedToAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWon, isAutoPaused, activeAd]);

  // Trigger Full Screen Rewarded Ad before Next Level
  const handleProceedToAd = () => {
    setIsAutoPaused(true);
    setActiveAd({
      rewardType: 'next_level',
      rewardTitle: `LEVEL ${levelConfig.levelNumber + 1} UNLOCK`,
      rewardDescription: `Sponsored ad broadcast before advancing to Level ${levelConfig.levelNumber + 1}`,
      requiredSeconds: 12,
    });
  };

  // Claim handler when a full 10-15s ad completes watching
  const handleClaimAdReward = () => {
    if (!activeAd) return;
    const type = activeAd.rewardType;
    setActiveAd(null);

    if (type === 'hint') {
      audio.playHint();
      setHintsUsed((prev) => prev + 1);
      const solverResult = solvePuzzle(baskets, 3000);
      if (solverResult.nextBestMove) {
        setHintMove({
          from: solverResult.nextBestMove.fromIndex,
          to: solverResult.nextBestMove.toIndex,
        });
        audio.speakVoice("Ad completed! Optimal hint move revealed.");
      }
    } else if (type === 'bottle') {
      audio.playClick();
      setExtraBottlesAdded((prev) => prev + 1);
      setBaskets((prev) => [
        ...prev,
        {
          id: `basket_extra_${Date.now()}`,
          capacity: levelConfig.basketCapacity,
          items: [],
        },
      ]);
      audio.speakVoice("Ad completed! Extra tube added to puzzle.");
    } else if (type === 'next_level') {
      audio.playClick();
      onNextLevel();
    }
  };

  // Ensure full screen when playing
  const ensureFullscreenOnPlay = () => {
    if (typeof document !== 'undefined' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Exit/Toggle Fullscreen when clicked on empty free space
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (typeof document !== 'undefined') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }
    }
  };

  // Max extra bottles allowed dynamically scaled according to level complexity
  const getMaxExtraBottlesForLevel = (lvlNum: number, isChallenge?: boolean): number => {
    if (lvlNum <= 5) return 0; // Beginning levels (Level 1-5): NO extra bottles at start!
    if (isChallenge) return 0; // Grand Challenge levels: NO extra bottles allowed!
    if (lvlNum <= 15) return 2; // Mid levels: 2 extra bottles
    if (lvlNum <= 30) return 1; // Higher levels: reduced extra bottles (only 1)
    return 1; // High complexity levels: strictly max 1 extra bottle!
  };

  const maxAllowedExtra = getMaxExtraBottlesForLevel(levelConfig.levelNumber, levelConfig.isChallenge);

  // Handle basket selection and fruit movement
  const handleSelectBasket = (targetIdx: number) => {
    audio.ensureMusicPlaying();
    if (isWon || showRestartToast) return;
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

      const newMovesCount = movesCount + 1;
      setMoveHistory((prev) => [...prev, record]);
      setBaskets(nextBaskets);
      setSelectedBasketIdx(null);
      setMovesCount(newMovesCount);
      setWrongMovesCount(0); // reset error streak on valid move
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
        handleWin(newMovesCount, hintsUsed, nextBaskets);
      }
    } else {
      // INVALID MOVE ATTEMPT
      const newWrongCount = wrongMovesCount + 1;
      setWrongMovesCount(newWrongCount);
      audio.playInvalid();
      setSelectedBasketIdx(null);

      if (newWrongCount >= 3) {
        setShowRestartToast(true);
        audio.speakVoice("Three wrong moves! Level restarting...");
        setTimeout(() => {
          onReplayLevel();
          setWrongMovesCount(0);
          setShowRestartToast(false);
        }, 1600);
      } else {
        audio.speakVoice(`Wrong move! ${newWrongCount} of 3`);
      }
    }
  };

  // Handle Puzzle Solved Win - Directly Shows Interstitial Ad Modal
  const handleWin = (finalMoves: number, hints: number, finalBaskets: Basket[]) => {
    setIsWon(true);
    audio.playLevelWin();
    audio.speakVoice("Level Complete! Puzzle Solved!");

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

    // DIRECTLY open High-CPM Financial Interstitial Ad Modal upon completion!
    handleProceedToAd();
  };

  // Undo previous move
  const handleUndo = () => {
    audio.ensureMusicPlaying();
    if (moveHistory.length === 0 || isWon || showRestartToast) return;
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

  // Run Solver for Hint - Restricts hints to make game challenging & requires watching full-screen ad
  const handleHint = () => {
    audio.ensureMusicPlaying();
    if (isWon || showRestartToast) return;

    if (freeHintsRemaining > 0) {
      audio.playHint();
      setHintsUsed((prev) => prev + 1);
      setFreeHintsRemaining((prev) => prev - 1);

      const solverResult = solvePuzzle(baskets, 3000);
      if (solverResult.nextBestMove) {
        setHintMove({
          from: solverResult.nextBestMove.fromIndex,
          to: solverResult.nextBestMove.toIndex,
        });
        audio.speakVoice("Free hint used! 0 free hints remaining.");
      }
    } else {
      audio.playClick();
      setActiveAd({
        rewardType: 'hint',
        rewardTitle: '+1 EXTRA HINT',
        rewardDescription: 'Watch full 15s sponsored ad to reveal optimal move!',
        requiredSeconds: 15,
      });
    }
  };

  // Add Extra Bottle feature - requires watching full-screen ad
  const handleAddBottle = () => {
    audio.ensureMusicPlaying();
    if (isWon || showRestartToast) return;

    if (levelConfig.levelNumber <= 5) {
      audio.playInvalid();
      audio.speakVoice("No extra bottles in Level 1 to 5! Unlocks at Level 6.");
      return;
    }

    if (levelConfig.isChallenge) {
      audio.playInvalid();
      audio.speakVoice("No extra bottles on Grand Challenge levels!");
      return;
    }

    if (extraBottlesAdded >= maxAllowedExtra) {
      audio.playInvalid();
      audio.speakVoice(`Maximum ${maxAllowedExtra} extra bottle allowed for this level!`);
      return;
    }

    audio.playClick();
    setActiveAd({
      rewardType: 'bottle',
      rewardTitle: '+1 EXTRA TUBE',
      rewardDescription: 'Watch full 15s sponsored ad to add an extra empty tube!',
      requiredSeconds: 15,
    });
  };

  return (
    <div
      className="w-full flex-1 flex flex-col items-center justify-between p-2 sm:p-4 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white min-h-[calc(100vh-52px)] relative overflow-hidden select-none"
    >
      {/* Background Palm Trees / Tropical Sunset Backdrop matching user photo */}
      <div className="absolute inset-x-0 bottom-0 h-36 opacity-20 pointer-events-none flex items-end justify-between px-4">
        <div className="w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl" />
        <div className="w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="w-28 h-28 bg-pink-500/20 rounded-full blur-2xl" />
      </div>

      {/* 3 Wrong Moves Restarting Alert Toast */}
      {showRestartToast && (
        <div className="absolute top-16 z-50 bg-rose-600 text-white font-black px-5 py-3 rounded-2xl shadow-2xl border-2 border-rose-300 flex items-center gap-3 animate-bounce">
          <AlertTriangle className="w-6 h-6 text-yellow-300" />
          <div className="flex flex-col">
            <span className="text-sm tracking-wider uppercase">3 WRONG MOVES!</span>
            <span className="text-xs font-bold text-rose-100">Restarting Level...</span>
          </div>
        </div>
      )}

      {/* Top Banner Pill Badge (Exact screenshot styling) */}
      <div className="w-full max-w-xl flex items-center justify-between z-20 pt-1">
        {/* Left Level Select Button */}
        <button
          onClick={() => {
            audio.playClick();
            onOpenLevelSelect();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-400 border-2 border-amber-200 text-amber-950 flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Select Level"
        >
          <Zap className="w-5 h-5 fill-current" />
        </button>

        {/* Center Level Banner Pill Badge */}
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 border-2 border-rose-300 px-5 sm:px-6 py-1 sm:py-1.5 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.6)] flex items-center justify-center">
            <span className="text-sm sm:text-base font-black text-white tracking-wide uppercase drop-shadow-md">
              Level {levelConfig.levelNumber}
            </span>
          </div>
          {isGrandLevel && (
            <div className="mt-1 bg-red-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md border border-red-300 animate-pulse">
              🔥 SUPER HARD - GRAND PUZZLE 🔥
            </div>
          )}
        </div>

        {/* Right Restart Level Button */}
        <button
          onClick={() => {
            audio.playClick();
            onReplayLevel();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-500 border-2 border-purple-200 text-white flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Restart Level"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Middle Status Info: Target Moves & Wrong Moves Tracker */}
      <div className="w-full max-w-xl flex items-center justify-between text-xs font-bold text-slate-300 px-3 my-1.5 z-20">
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/80 px-3 py-1 rounded-full backdrop-blur-md">
          <span className="text-slate-400 uppercase text-[10px]">MOVES:</span>
          <span className="text-amber-400 font-black text-sm">{movesCount}</span>
          <span className="text-slate-500 text-[10px]">/ {levelConfig.maxMovesTarget}</span>
        </div>

        {/* Wrong Moves Warning Indicators */}
        <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-700/80 px-3 py-1 rounded-full backdrop-blur-md">
          <span className="text-slate-400 uppercase text-[10px]">ERRORS:</span>
          {[1, 2, 3].map((num) => (
            <span
              key={num}
              className={`w-2.5 h-2.5 rounded-full ${
                wrongMovesCount >= num ? 'bg-rose-500 ring-2 ring-rose-300' : 'bg-slate-700'
              } transition-all`}
            />
          ))}
        </div>
      </div>

      {/* Main Baskets / Bottles Grid */}
      <div className="w-full max-w-2xl flex-1 flex items-center justify-center py-2 z-20">
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

      {/* Bottom Control Toolbar - Vibrant 3D Circular Buttons matching user photo */}
      <div className="w-full max-w-md flex items-center justify-around py-2 z-30">
        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || isWon || showRestartToast}
          className="group relative flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90 disabled:opacity-40"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-purple-500 p-0.5 shadow-[0_0_15px_rgba(219,39,119,0.5)] group-hover:scale-105 transition-all">
            <div className="w-full h-full rounded-full bg-slate-900/90 flex items-center justify-center text-white border border-pink-400/30">
              <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 text-pink-300" />
            </div>
          </div>
          {/* Badge count at bottom right */}
          <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
            {moveHistory.length}
          </span>
          <span className="text-[10px] font-black text-pink-200 mt-1 uppercase tracking-wider">UNDO</span>
        </button>

        {/* Restart / Shuffle Button */}
        <button
          onClick={() => {
            audio.playClick();
            onReplayLevel();
          }}
          disabled={showRestartToast}
          className="group relative flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-indigo-700 via-purple-600 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(147,51,234,0.5)] group-hover:scale-105 transition-all">
            <div className="w-full h-full rounded-full bg-slate-900/90 flex items-center justify-center text-white border border-purple-400/30">
              <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-purple-300" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-xs font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </span>
          <span className="text-[10px] font-black text-purple-200 mt-1 uppercase tracking-wider">RESET</span>
        </button>

        {/* Add Extra Bottle Button - requires watching full-screen ad */}
        <button
          onClick={handleAddBottle}
          disabled={isWon || showRestartToast}
          className="group relative flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90"
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${
              maxAllowedExtra === 0 || extraBottlesAdded >= maxAllowedExtra
                ? 'bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-700'
                : 'bg-gradient-to-tr from-fuchsia-700 via-purple-600 to-indigo-500 shadow-[0_0_15px_rgba(192,38,211,0.5)]'
            } p-0.5 group-hover:scale-105 transition-all`}
          >
            <div className="w-full h-full rounded-full bg-slate-900/90 flex items-center justify-center text-white border border-fuchsia-400/30">
              <FlaskConical
                className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  maxAllowedExtra === 0 ? 'text-slate-500' : 'text-fuchsia-300'
                }`}
              />
            </div>
          </div>
          <span
            className={`absolute -bottom-1 -right-1 ${
              levelConfig.levelNumber <= 5 || extraBottlesAdded >= maxAllowedExtra
                ? 'bg-rose-600 text-white'
                : 'bg-amber-400 text-amber-950'
            } text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-900 shadow-md flex items-center gap-0.5`}
          >
            {levelConfig.levelNumber <= 5 ? (
              'Lvl 6+'
            ) : extraBottlesAdded >= maxAllowedExtra ? (
              'MAX'
            ) : (
              <>
                <Zap className="w-2.5 h-2.5 fill-current text-amber-950" />
                <span>AD +1</span>
              </>
            )}
          </span>
          <span className="text-[10px] font-black text-fuchsia-200 mt-1 uppercase tracking-wider">
            +TUBE
          </span>
        </button>

        {/* Hint Button - Restricted hints, watch ad for extra hints */}
        <button
          onClick={handleHint}
          disabled={isWon || showRestartToast}
          className="group relative flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-90 disabled:opacity-40"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-all">
            <div className="w-full h-full rounded-full bg-slate-900/90 flex items-center justify-center text-white border border-amber-400/30">
              <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>
          </div>
          <span
            className={`absolute -bottom-1 -right-1 ${
              freeHintsRemaining > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-amber-950'
            } text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-900 shadow-md flex items-center gap-0.5`}
          >
            {freeHintsRemaining > 0 ? (
              `FREE ${freeHintsRemaining}`
            ) : (
              <>
                <Zap className="w-2.5 h-2.5 fill-current text-amber-950" />
                <span>AD +1</span>
              </>
            )}
          </span>
          <span className="text-[10px] font-black text-amber-200 mt-1 uppercase tracking-wider">HINT</span>
        </button>
      </div>

      {/* Level Complete Win Modal */}
      {isWon && winStats && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-indigo-500/40 rounded-3xl w-full max-w-sm p-6 text-white shadow-2xl text-center relative overflow-hidden">
            {/* Header Fanfare Banner */}
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 mb-3">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              PUZZLE SOLVED!
            </h2>
            <p className="text-xs text-indigo-300 mt-0.5 font-bold">
              Level {levelConfig.levelNumber} Completed
            </p>

            {/* Stars Row */}
            <div className="flex items-center justify-center gap-2 my-4">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-9 h-9 ${
                    s <= winStats.stars
                      ? 'fill-amber-400 text-amber-400 scale-110'
                      : 'text-slate-700'
                  } transition-all duration-300`}
                />
              ))}
            </div>

            {/* Stats Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 my-4 space-y-1.5 text-xs text-white">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Moves Taken:</span>
                <span className="font-bold text-white">{movesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Score Earned:</span>
                <span className="font-bold text-emerald-400">
                  +{winStats.earnedScore} pts
                </span>
              </div>
            </div>

            {/* Auto-Advance Notification Banner */}
            {autoAdvanceTimer !== null && !isAutoPaused && (
              <div className="bg-indigo-900/60 border border-indigo-500/50 rounded-xl p-2.5 mb-4 text-xs font-bold text-indigo-200 flex items-center justify-between">
                <span>Next level in {autoAdvanceTimer}s...</span>
                <button
                  onClick={() => setIsAutoPaused(true)}
                  className="text-[10px] underline font-extrabold hover:text-white"
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
                  handleProceedToAd();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
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
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 transition-colors cursor-pointer border border-slate-700"
                >
                  Replay
                </button>

                <button
                  onClick={() => {
                    audio.playClick();
                    onOpenLevelSelect();
                  }}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-200 transition-colors cursor-pointer border border-slate-700"
                >
                  Level Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Rewarded Ad Modal */}
      {activeAd && (
        <RewardedAdModal
          rewardType={activeAd.rewardType}
          rewardTitle={activeAd.rewardTitle}
          rewardDescription={activeAd.rewardDescription}
          requiredSeconds={activeAd.requiredSeconds}
          adUrl={AD_URL}
          onClaimReward={handleClaimAdReward}
          onCancel={() => setActiveAd(null)}
        />
      )}
    </div>
  );
};

