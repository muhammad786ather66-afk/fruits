/**
 * Visual Theme Configurations & Styling Data
 */

import { ThemeConfig } from '../types';

export const THEMES: Record<string, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Orchard',
    bgGradient: 'from-emerald-900 via-teal-900 to-slate-900',
    cardBg: 'bg-slate-800/80 border-emerald-700/50',
    basketBorder: 'border-amber-700/80',
    basketBg: 'bg-amber-950/40',
    woodAccent: 'bg-amber-800/90 text-amber-100',
    accentColor: '#10B981',
    particleColors: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'],
    unlockLevel: 1,
  },
  tropical: {
    id: 'tropical',
    name: 'Tropical Beach',
    bgGradient: 'from-cyan-900 via-sky-900 to-blue-950',
    cardBg: 'bg-sky-900/80 border-cyan-500/50',
    basketBorder: 'border-amber-500/80',
    basketBg: 'bg-amber-900/30',
    woodAccent: 'bg-amber-600/90 text-amber-100',
    accentColor: '#06B6D4',
    particleColors: ['#06B6D4', '#38BDF8', '#FACC15', '#FB923C'],
    unlockLevel: 5,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Farm',
    bgGradient: 'from-rose-950 via-orange-950 to-amber-950',
    cardBg: 'bg-orange-950/80 border-rose-700/50',
    basketBorder: 'border-rose-700/80',
    basketBg: 'bg-rose-950/40',
    woodAccent: 'bg-rose-900/90 text-rose-100',
    accentColor: '#F97316',
    particleColors: ['#F97316', '#F43F5E', '#FACC15', '#A855F7'],
    unlockLevel: 15,
  },
  neon: {
    id: 'neon',
    name: 'Cyber Neon',
    bgGradient: 'from-purple-950 via-slate-950 to-indigo-950',
    cardBg: 'bg-purple-950/80 border-fuchsia-500/50',
    basketBorder: 'border-fuchsia-500/80',
    basketBg: 'bg-fuchsia-950/40',
    woodAccent: 'bg-fuchsia-800/90 text-fuchsia-100',
    accentColor: '#D946EF',
    particleColors: ['#D946EF', '#A855F7', '#3B82F6', '#06B6D4'],
    unlockLevel: 30,
  },
  zen: {
    id: 'zen',
    name: 'Zen Garden',
    bgGradient: 'from-stone-900 via-zinc-900 to-neutral-950',
    cardBg: 'bg-zinc-800/80 border-stone-600/50',
    basketBorder: 'border-stone-500/80',
    basketBg: 'bg-stone-900/40',
    woodAccent: 'bg-stone-700/90 text-stone-200',
    accentColor: '#84CC16',
    particleColors: ['#84CC16', '#22C55E', '#A8A29E', '#F59E0B'],
    unlockLevel: 50,
  },
};
