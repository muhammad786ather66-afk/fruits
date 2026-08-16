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
} from 'lucide-react';
import { ActiveScreen, PlayerProfile } from '../types';

interface HeaderProps {
  player: PlayerProfile | null;
  activeScreen: ActiveScreen;
  musicOn?: boolean;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenProfiles: () => void;
  onToggleMusic?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  activeScreen,
  musicOn = true,
  onNavigate,
  onOpenProfiles,
  onToggleMusic,
}) => {
  return (
    <header className="w-full bg-[#F7F9F2] border-b border-[#E0E2D9] px-3 py-2 sticky top-0 z-40 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-[#4A4941] shadow-xs">
      {/* Brand Title */}
      <div
        onClick={() => onNavigate('game')}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-[#86A789] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
          🍓
        </div>
        <h1 className="text-base sm:text-lg font-black tracking-tight text-[#4A4941]">
          FRUIT SORT
        </h1>
      </div>

      {/* Active Player Profile & Clear Separated Stats */}
      {player ? (
        <div
          onClick={onOpenProfiles}
          className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-[#E0E2D9] cursor-pointer hover:border-[#86A789] transition-all shadow-xs group"
          title="Switch Player Profile"
        >
          {/* Player Avatar Icon */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xs group-hover:scale-105 transition-transform border border-white"
            style={{ backgroundColor: player.avatarColor || '#86A789' }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>

          {/* Separated Fields: Name, Level, Total Points */}
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#4A4941]">
            <span className="truncate max-w-[70px] sm:max-w-[100px] text-[#4A4941]">
              {player.name}
            </span>

            <span className="h-3 w-[1px] bg-[#E0E2D9]" />

            <span className="px-1.5 py-0.2 rounded bg-[#E9EDC9] text-[#5F6F52] text-[11px] font-black whitespace-nowrap">
              Lvl {player.currentLevel}
            </span>

            <span className="h-3 w-[1px] bg-[#E0E2D9]" />

            <span className="px-1.5 py-0.2 rounded bg-[#FEFAE0] text-[#5F6F52] text-[11px] font-black whitespace-nowrap border border-[#E9EDC9]">
              {player.totalScore.toLocaleString()} pts
            </span>
          </div>

          <Users className="w-3.5 h-3.5 text-[#9A9B8F] group-hover:text-[#5F6F52] transition-colors ml-0.5" />
        </div>
      ) : (
        <button
          onClick={onOpenProfiles}
          className="flex items-center gap-1.5 bg-[#86A789] hover:bg-[#5F6F52] text-white px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Select Profile</span>
        </button>
      )}

      {/* Quick Action Navigation Icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate('level_select')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeScreen === 'level_select'
              ? 'bg-[#86A789] text-white font-bold shadow-xs'
              : 'text-[#4A4941] hover:bg-[#E9EDC9]/50'
          }`}
          title="Level Select"
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('daily_puzzle')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeScreen === 'daily_puzzle'
              ? 'bg-[#86A789] text-white font-bold shadow-xs'
              : 'text-[#4A4941] hover:bg-[#E9EDC9]/50'
          }`}
          title="Daily Puzzle"
        >
          <Calendar className="w-4 h-4" />
        </button>

        <button
          onClick={() => onNavigate('scoreboard')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeScreen === 'scoreboard'
              ? 'bg-[#86A789] text-white font-bold shadow-xs'
              : 'text-[#4A4941] hover:bg-[#E9EDC9]/50'
          }`}
          title="Local Scoreboard"
        >
          <Trophy className="w-4 h-4" />
        </button>

        {onToggleMusic && (
          <button
            onClick={onToggleMusic}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              musicOn
                ? 'bg-amber-500 text-white font-bold shadow-xs animate-pulse'
                : 'text-[#4A4941] hover:bg-[#E9EDC9]/50 opacity-60'
            }`}
            title={musicOn ? 'Mute Background Music' : 'Play Background Music'}
          >
            {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={() => onNavigate('settings')}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            activeScreen === 'settings'
              ? 'bg-[#86A789] text-white font-bold shadow-xs'
              : 'text-[#4A4941] hover:bg-[#E9EDC9]/50'
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
