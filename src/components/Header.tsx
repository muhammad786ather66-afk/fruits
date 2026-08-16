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
} from 'lucide-react';
import { ActiveScreen, PlayerProfile } from '../types';

interface HeaderProps {
  player: PlayerProfile | null;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenProfiles: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  activeScreen,
  onNavigate,
  onOpenProfiles,
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-3 py-2 sticky top-0 z-40 flex items-center justify-between text-white shadow-md">
      {/* Brand Title */}
      <div
        onClick={() => onNavigate('game')}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-lg">
            🍎
          </div>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent leading-none">
            FRUIT SORT
          </h1>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Fill the baskets
          </span>
        </div>
      </div>

      {/* Active Player Profile Badge */}
      {player ? (
        <div
          onClick={onOpenProfiles}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 cursor-pointer transition-all shadow-inner group"
          title="Switch Player Profile"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs group-hover:scale-110 transition-transform"
            style={{ backgroundColor: player.avatarColor }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 leading-none truncate max-w-[80px] sm:max-w-[110px]">
              {player.name}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold leading-none mt-0.5">
              Lvl {player.currentLevel} • {player.totalScore.toLocaleString()} pts
            </span>
          </div>
          <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
        </div>
      ) : (
        <button
          onClick={onOpenProfiles}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md"
        >
          <Users className="w-4 h-4" />
          <span>Choose Player</span>
        </button>
      )}

      {/* Quick Action Navigation Icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onNavigate('level_select')}
          className={`p-2 rounded-lg transition-all ${
            activeScreen === 'level_select'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Level Select"
        >
          <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => onNavigate('daily_puzzle')}
          className={`p-2 rounded-lg transition-all ${
            activeScreen === 'daily_puzzle'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Daily Puzzle"
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => onNavigate('scoreboard')}
          className={`p-2 rounded-lg transition-all ${
            activeScreen === 'scoreboard'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Local Scoreboard"
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`p-2 rounded-lg transition-all ${
            activeScreen === 'settings'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </header>
  );
};
