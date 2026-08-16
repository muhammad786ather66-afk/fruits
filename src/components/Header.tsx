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
    <header className="w-full bg-[#0B132B] border-b border-indigo-900/60 px-3 py-2 sticky top-0 z-40 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-white shadow-lg backdrop-blur-md">
      {/* Brand Title */}
      <div
        onClick={() => onNavigate('game')}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 text-white flex items-center justify-center font-bold text-base shadow-[0_0_12px_rgba(244,63,94,0.6)] group-hover:scale-105 transition-transform border border-rose-300/40">
          🍓
        </div>
        <h1 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 uppercase drop-shadow">
          FRUIT SORT
        </h1>
      </div>

      {/* Active Player Profile & Clear Separated Stats matching dark game background */}
      {player ? (
        <div
          onClick={onOpenProfiles}
          className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-full border border-indigo-500/40 cursor-pointer hover:border-amber-400 transition-all shadow-[0_0_12px_rgba(30,27,75,0.8)] group hover:scale-102"
          title="Switch Player Profile"
        >
          {/* Player Avatar Icon */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md group-hover:scale-105 transition-transform border-2 border-white/80"
            style={{ backgroundColor: player.avatarColor || '#ec4899' }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>

          {/* Separated Fields: Name, Level, Total Points */}
          <div className="flex items-center gap-2 text-xs font-extrabold text-white">
            <span className="truncate max-w-[70px] sm:max-w-[100px] text-amber-200">
              {player.name}
            </span>

            <span className="h-3 w-[1px] bg-slate-700" />

            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-black whitespace-nowrap shadow-xs border border-emerald-300/30">
              Lvl {player.currentLevel}
            </span>

            <span className="h-3 w-[1px] bg-slate-700" />

            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[11px] font-black whitespace-nowrap shadow-xs border border-amber-200">
              {player.totalScore.toLocaleString()} pts
            </span>
          </div>

          <Users className="w-3.5 h-3.5 text-indigo-300 group-hover:text-amber-400 transition-colors ml-0.5" />
        </div>
      ) : (
        <button
          onClick={onOpenProfiles}
          className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer border border-rose-300/30"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Select Profile</span>
        </button>
      )}

      {/* Quick Action Navigation Icons - 3D Styled Vibrant Circular/Pill Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate('level_select')}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'level_select'
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-300 scale-105'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
          title="Level Select"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('daily_puzzle')}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'daily_puzzle'
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-300 scale-105'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
          title="Daily Puzzle"
        >
          <Calendar className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('scoreboard')}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'scoreboard'
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-300 scale-105'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
          title="Local Scoreboard"
        >
          <Trophy className="w-4 h-4" />
        </button>

        {onToggleMusic && (
          <button
            onClick={onToggleMusic}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              musicOn
                ? 'bg-purple-600 text-white font-bold shadow-[0_0_12px_rgba(147,51,234,0.8)] border border-purple-300 animate-pulse'
                : 'bg-slate-900/80 text-slate-500 hover:text-slate-300 border border-slate-800'
            }`}
            title={musicOn ? 'Mute Background Music' : 'Play Background Music'}
          >
            {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-xl bg-slate-900/80 text-cyan-300 hover:bg-slate-800 hover:text-cyan-200 border border-cyan-500/30 transition-all cursor-pointer shadow-xs"
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={() => onNavigate('settings')}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            activeScreen === 'settings'
              ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)] border border-amber-300 scale-105'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
