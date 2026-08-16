/**
 * Achievement System Definitions
 */

import { Achievement, PlayerProfile } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_sort',
    title: 'First Sort',
    description: 'Complete your first fruit basket puzzle.',
    iconName: 'Sparkles',
    goal: 1,
    getProgress: (p: PlayerProfile) => p.totalLevelsCompleted,
  },
  {
    id: 'fruit_master_100',
    title: 'Fruit Collector',
    description: 'Sort 100 total fruits into matching baskets.',
    iconName: 'Apple',
    goal: 100,
    getProgress: (p: PlayerProfile) => p.totalFruitsSorted,
  },
  {
    id: 'fruit_master_500',
    title: 'Fruit Master',
    description: 'Sort 500 total fruits.',
    iconName: 'Trophy',
    goal: 500,
    getProgress: (p: PlayerProfile) => p.totalFruitsSorted,
  },
  {
    id: 'basket_master_25',
    title: 'Basket Master',
    description: 'Complete 25 puzzle levels.',
    iconName: 'ShoppingBag',
    goal: 25,
    getProgress: (p: PlayerProfile) => p.totalLevelsCompleted,
  },
  {
    id: 'perfect_sorter_10',
    title: 'Perfect Sorter',
    description: 'Earn 3 stars on 10 different levels.',
    iconName: 'Star',
    goal: 10,
    getProgress: (p: PlayerProfile) => p.perfectLevelsCount,
  },
  {
    id: 'no_hints_20',
    title: 'Self-Reliant',
    description: 'Complete 20 levels without using any hints.',
    iconName: 'Zap',
    goal: 20,
    getProgress: (p: PlayerProfile) =>
      Math.max(0, p.totalLevelsCompleted - p.hintsUsedCount),
  },
  {
    id: 'level_50',
    title: 'Fruit Expert',
    description: 'Reach Level 50 in Classic Mode.',
    iconName: 'Award',
    goal: 50,
    getProgress: (p: PlayerProfile) => p.highestLevelReached,
  },
  {
    id: 'level_100',
    title: 'Master Sorter',
    description: 'Reach Level 100 in Classic Mode.',
    iconName: 'Crown',
    goal: 100,
    getProgress: (p: PlayerProfile) => p.highestLevelReached,
  },
  {
    id: 'daily_sorter_7',
    title: 'Daily Sorter',
    description: 'Complete 7 Daily Fruit Puzzles.',
    iconName: 'Calendar',
    goal: 7,
    getProgress: (p: PlayerProfile) =>
      Object.keys(p.dailyPuzzleHistory || {}).length,
  },
  {
    id: 'score_10k',
    title: 'High Scorer',
    description: 'Accumulate 10,000 total score points.',
    iconName: 'Flame',
    goal: 10000,
    getProgress: (p: PlayerProfile) => p.totalScore,
  },
];
