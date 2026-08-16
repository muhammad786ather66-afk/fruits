/**
 * Level Bottle Color Themes
 * Dynamic per-level bottle rim, glass tint, accent, and particle colors
 */

export interface LevelBottleTheme {
  name: string;
  rimBg: string;
  rimBorder: string;
  glassBorder: string;
  glassTintBg: string;
  accentBadgeBg: string;
  accentText: string;
  particleColors: string[];
}

export const LEVEL_BOTTLE_THEMES: LevelBottleTheme[] = [
  // 1: Sage Emerald
  {
    name: 'Sage Emerald',
    rimBg: 'bg-[#86A789]',
    rimBorder: 'border-[#5F6F52]',
    glassBorder: 'border-[#86A789]',
    glassTintBg: 'bg-[#86A789]/15',
    accentBadgeBg: 'bg-[#E9EDC9]',
    accentText: 'text-[#5F6F52]',
    particleColors: ['#86A789', '#5F6F52', '#E9EDC9'],
  },
  // 2: Warm Honey Amber
  {
    name: 'Honey Amber',
    rimBg: 'bg-[#D4A373]',
    rimBorder: 'border-[#A9714B]',
    glassBorder: 'border-[#D4A373]',
    glassTintBg: 'bg-[#D4A373]/15',
    accentBadgeBg: 'bg-[#FAEDCD]',
    accentText: 'text-[#8C5E38]',
    particleColors: ['#D4A373', '#FAEDCD', '#A9714B'],
  },
  // 3: Ocean Slate Teal
  {
    name: 'Ocean Teal',
    rimBg: 'bg-[#709775]',
    rimBorder: 'border-[#415D43]',
    glassBorder: 'border-[#709775]',
    glassTintBg: 'bg-[#709775]/15',
    accentBadgeBg: 'bg-[#A1CCA5]/30',
    accentText: 'text-[#2D4030]',
    particleColors: ['#709775', '#A1CCA5', '#415D43'],
  },
  // 4: Terracotta Rose
  {
    name: 'Terracotta Rose',
    rimBg: 'bg-[#C87D55]',
    rimBorder: 'border-[#96522E]',
    glassBorder: 'border-[#C87D55]',
    glassTintBg: 'bg-[#C87D55]/15',
    accentBadgeBg: 'bg-[#F4D9C7]',
    accentText: 'text-[#7A3F20]',
    particleColors: ['#C87D55', '#F4D9C7', '#96522E'],
  },
  // 5: Olive Herb
  {
    name: 'Olive Herb',
    rimBg: 'bg-[#5F6F52]',
    rimBorder: 'border-[#3A4730]',
    glassBorder: 'border-[#5F6F52]',
    glassTintBg: 'bg-[#5F6F52]/15',
    accentBadgeBg: 'bg-[#A9B388]/40',
    accentText: 'text-[#3A4730]',
    particleColors: ['#5F6F52', '#A9B388', '#3A4730'],
  },
  // 6: Lavender Dusk
  {
    name: 'Lavender Dusk',
    rimBg: 'bg-[#8A7B9B]',
    rimBorder: 'border-[#5C4F6E]',
    glassBorder: 'border-[#8A7B9B]',
    glassTintBg: 'bg-[#8A7B9B]/15',
    accentBadgeBg: 'bg-[#E3DCED]',
    accentText: 'text-[#4A3D5C]',
    particleColors: ['#8A7B9B', '#E3DCED', '#5C4F6E'],
  },
  // 7: Forest Pine
  {
    name: 'Forest Pine',
    rimBg: 'bg-[#4F772D]',
    rimBorder: 'border-[#31511E]',
    glassBorder: 'border-[#4F772D]',
    glassTintBg: 'bg-[#4F772D]/15',
    accentBadgeBg: 'bg-[#ECF39E]/50',
    accentText: 'text-[#31511E]',
    particleColors: ['#4F772D', '#ECF39E', '#31511E'],
  },
  // 8: Golden Sand
  {
    name: 'Golden Sand',
    rimBg: 'bg-[#C69C6D]',
    rimBorder: 'border-[#8C6239]',
    glassBorder: 'border-[#C69C6D]',
    glassTintBg: 'bg-[#C69C6D]/15',
    accentBadgeBg: 'bg-[#F5EBE0]',
    accentText: 'text-[#634221]',
    particleColors: ['#C69C6D', '#F5EBE0', '#8C6239'],
  },
  // 9: Mint Breeze
  {
    name: 'Mint Breeze',
    rimBg: 'bg-[#6B9080]',
    rimBorder: 'border-[#3B5B4C]',
    glassBorder: 'border-[#6B9080]',
    glassTintBg: 'bg-[#6B9080]/15',
    accentBadgeBg: 'bg-[#E8F1EE]',
    accentText: 'text-[#2C483B]',
    particleColors: ['#6B9080', '#E8F1EE', '#3B5B4C'],
  },
  // 10: Plum Earth
  {
    name: 'Plum Earth',
    rimBg: 'bg-[#9E6B7B]',
    rimBorder: 'border-[#6E3C4C]',
    glassBorder: 'border-[#9E6B7B]',
    glassTintBg: 'bg-[#9E6B7B]/15',
    accentBadgeBg: 'bg-[#F4E6EB]',
    accentText: 'text-[#592837]',
    particleColors: ['#9E6B7B', '#F4E6EB', '#6E3C4C'],
  },
  // 11: Earthy Bronze
  {
    name: 'Earthy Bronze',
    rimBg: 'bg-[#A67C52]',
    rimBorder: 'border-[#735234]',
    glassBorder: 'border-[#A67C52]',
    glassTintBg: 'bg-[#A67C52]/15',
    accentBadgeBg: 'bg-[#F3E8DC]',
    accentText: 'text-[#543A21]',
    particleColors: ['#A67C52', '#F3E8DC', '#735234'],
  },
  // 12: Sky Slate
  {
    name: 'Sky Slate',
    rimBg: 'bg-[#6C8EAD]',
    rimBorder: 'border-[#43627D]',
    glassBorder: 'border-[#6C8EAD]',
    glassTintBg: 'bg-[#6C8EAD]/15',
    accentBadgeBg: 'bg-[#E6EEF5]',
    accentText: 'text-[#2E4A63]',
    particleColors: ['#6C8EAD', '#E6EEF5', '#43627D'],
  },
];

export function getBottleThemeForLevel(levelNumber: number): LevelBottleTheme {
  const index = Math.max(0, levelNumber - 1) % LEVEL_BOTTLE_THEMES.length;
  return LEVEL_BOTTLE_THEMES[index];
}
