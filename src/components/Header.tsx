/**
 * Header Component
 * Top bar displaying player status, score, quick action icons and profile switcher.
 */

import React from 'react';
import {
  Users,
  Trophy,
  Calendar,
  Grid,
  Settings,
  HelpCircle,
  Palette,
  Award,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ActiveScreen, PlayerProfile } from '../types';

interface HeaderProps {
  player: PlayerProfile | null;
  activeScreen: ActiveScreen;
  musicOn?: boolean;
  isFullscreen?: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenProfiles: () => void;
  onToggleMusic?: () => void;
  onToggleFullscreen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  activeScreen,
  musicOn = true,
  isFullscreen = false,
  onNavigate,
  onOpenProfiles,
  onToggleMusic,
  onToggleFullscreen,
}) => {
  return (
    <header className="w-full bg-[#0B132B]/95 border-b border-indigo-900/80 px-2 sm:px-4 py-1.5 sm:py-2 sticky top-0 z-40 flex items-center justify-between gap-1 sm:gap-3 text-white shadow-xl backdrop-blur-md overflow-x-auto no-scrollbar">
      {/* Brand Title */}
      <div
        onClick={() => onNavigate('splash')}
        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
        title="View Game Splash Screen"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-400 to-purple-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-[0_0_12px_rgba(244,63,94,0.6)] group-hover:scale-105 transition-transform border border-rose-300/40">
          🍓
        </div>
        <h1 className="text-xs sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 uppercase drop-shadow whitespace-nowrap">
          FRUIT SORT
        </h1>
      </div>

      {/* Active Player Profile & Clear Separated Stats */}
      {player ? (
        <div
          onClick={onOpenProfiles}
          className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-500/50 cursor-pointer hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(30,27,75,0.8)] group shrink-0 hover:scale-102"
          title="Switch Player Profile"
        >
          {/* Player Avatar Icon */}
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs text-white shadow-md group-hover:scale-105 transition-transform border border-white/80 shrink-0"
            style={{ backgroundColor: player.avatarColor || '#ec4899' }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>

          {/* Separated Fields: Name, Level, Total Points */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-extrabold text-white">
            <span className="truncate max-w-[50px] sm:max-w-[90px] text-amber-200">
              {player.name}
            </span>

            <span className="h-3 w-[1px] bg-slate-700" />

            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[9px] sm:text-[11px] font-black whitespace-nowrap border border-emerald-300/30">
              Lvl {player.currentLevel}
            </span>

            <span className="h-3 w-[1px] bg-slate-700 hidden xs:block" />

            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] sm:text-[11px] font-black whitespace-nowrap border border-amber-200 hidden xs:block">
              {player.totalScore.toLocaleString()} pts
            </span>
          </div>

          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-300 group-hover:text-amber-400 transition-colors ml-0.5 shrink-0" />
        </div>
      ) : (
        <button
          onClick={onOpenProfiles}
          className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-md cursor-pointer border border-rose-300/30 shrink-0"
        >
          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="whitespace-nowrap">Profile</span>
        </button>
      )}

      {/* Quick Action Navigation Icons - Professional 3D Styled Vibrant Circular/Pill Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          onClick={() => onNavigate('level_select')}
          className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'level_select'
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-200 scale-105'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 shadow-sm'
          }`}
          title="Level Select"
        >
          <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={() => onNavigate('daily_puzzle')}
          className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'daily_puzzle'
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-200 scale-105'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 shadow-sm'
          }`}
          title="Daily Puzzle"
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={() => onNavigate('scoreboard')}
          className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'scoreboard'
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-200 scale-105'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 shadow-sm'
          }`}
          title="Local Scoreboard"
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {onToggleMusic && (
          <button
            onClick={onToggleMusic}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              musicOn
                ? 'bg-gradient-to-b from-purple-500 to-fuchsia-600 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.8)] border border-purple-200 animate-pulse'
                : 'bg-slate-900/90 text-slate-500 hover:text-slate-300 border border-slate-700/60 shadow-sm'
            }`}
            title={musicOn ? 'Mute Background Music' : 'Play Background Music'}
          >
            {musicOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        )}

        {/* Attractive Fullscreen Exit/Toggle Button with Glowing Arrows */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black shadow-[0_0_16px_rgba(34,211,238,0.9)] border-2 border-cyan-200 scale-105 animate-pulse'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] border border-cyan-300/40 hover:scale-105 active:scale-95'
            }`}
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 stroke-[3]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
            )}
          </button>
        )}

        <button
          onClick={() => onNavigate('settings')}
          className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'settings'
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-200 scale-105'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 shadow-sm'
          }`}
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
