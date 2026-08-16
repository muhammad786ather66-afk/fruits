import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Trophy, Flame } from 'lucide-react';
import { audio } from '../lib/audio';

// Import generated splash artwork asset
import splashArtImage from '../assets/images/fruit_sort_splash_art_1786862070840.jpg';

interface SplashScreenProps {
  onStartGame: () => void;
  playerName?: string;
  highestLevel?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStartGame,
  playerName = 'Player 1',
  highestLevel = 1,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Simulated smooth game loading bar sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsLoaded(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 10;
        return Math.min(100, prev + step);
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    audio.ensureMusicPlaying();
    audio.playClick();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0C1638] via-[#0B132E] to-[#060A17] text-white flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none animate-fadeIn">
      {/* Background Ambient Glows & Sparkles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-300/40 animate-ping"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header Player Profile Ribbon */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-cyan-400/30 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
            {playerName[0].toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-200">{playerName}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-amber-400/40 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg text-xs font-black text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>LVL {highestLevel}</span>
        </div>
      </div>

      {/* Center Content: Title Art & Bottle Graphic */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md my-auto relative z-10 text-center py-2">
        {/* 3D Glossy Game Title Artwork */}
        <div className="flex flex-col items-center justify-center mb-4 relative scale-95 sm:scale-105">
          {/* Top Line 3D Glossy "FRUIT" text */}
          <div className="relative">
            {/* 3D Extruded Deep Outline Layer */}
            <h1 className="text-5xl sm:text-6xl font-black tracking-wider uppercase text-[#221350] translate-y-1.5 translate-x-0.5 blur-[0.5px]">
              FRUIT
            </h1>
            {/* Vibrant Cyan-Blue Glossy Top Text */}
            <h1 className="absolute inset-0 text-5xl sm:text-6xl font-black tracking-wider uppercase bg-gradient-to-b from-emerald-200 via-teal-300 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(20,184,166,0.6)]">
              FRUIT
            </h1>
          </div>

          {/* Middle Line 3D Glossy "SORT" text */}
          <div className="relative -mt-2">
            {/* 3D Extruded Deep Outline Layer */}
            <h2 className="text-6xl sm:text-7xl font-black tracking-wider uppercase text-[#4C0519] translate-y-1.5 translate-x-0.5 blur-[0.5px]">
              SORT
            </h2>
            {/* Vibrant Yellow-Orange Glossy Top Text */}
            <h2 className="absolute inset-0 text-6xl sm:text-7xl font-black tracking-wider uppercase bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_4px_15px_rgba(245,158,11,0.8)]">
              SORT
            </h2>
          </div>

          {/* Subtitle Badge */}
          <div className="mt-2 bg-slate-900/90 border border-emerald-400/40 px-4 py-1 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.3)] backdrop-blur-md">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-emerald-200">
              Fruit Sort Game
            </span>
          </div>
        </div>

        {/* Glossy Glass Test Tube Fruit Graphic */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Glow backdrop ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 blur-2xl animate-pulse pointer-events-none" />

          {/* Generated or Fallback Image Frame */}
          <div className="relative w-full h-full rounded-3xl overflow-hidden border-2 border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.4)] bg-slate-950/80 backdrop-blur-md p-1 group">
            <img
              src={splashArtImage}
              alt="Fruit Sort Glass Bottles Graphic"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-2xl filter brightness-105 contrast-105 transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay sparkle highlight */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-cyan-500/10 pointer-events-none rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Footer Controls: Loading Progress Bar or Tap To Start */}
      <div className="w-full max-w-sm flex flex-col items-center z-10 pb-4">
        {!isLoaded ? (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full px-2 text-xs font-bold text-sky-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Loading Fruit Engine...</span>
              </span>
              <span>{progress}%</span>
            </div>

            {/* Glossy Progress Bar Track */}
            <div className="w-full h-4 rounded-full bg-slate-900 border border-slate-700 p-0.5 shadow-inner overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-500 transition-all duration-200 shadow-[0_0_12px_rgba(251,191,36,0.8)] relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(251,191,36,0.6)] border-2 border-amber-200 flex items-center justify-center gap-3 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-bounce"
          >
            <Play className="w-6 h-6 fill-slate-950 stroke-[3]" />
            <span>TAP TO PLAY</span>
          </button>
        )}
      </div>
    </div>
  );
};
