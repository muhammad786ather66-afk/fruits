/**
 * Fruit Sort - Type Definitions
 */

export type FruitType =
  | 'apple'
  | 'banana'
  | 'orange'
  | 'strawberry'
  | 'watermelon'
  | 'grapes'
  | 'lemon'
  | 'cherry'
  | 'peach'
  | 'pineapple'
  | 'kiwi'
  | 'blueberry'
  | 'coconut'
  | 'mango';

export interface FruitItem {
  id: string;
  type: FruitType;
  isFrozen?: boolean;
  isWild?: boolean;
  isKey?: boolean;
  isHidden?: boolean;
}

export interface Basket {
  id: string;
  capacity: number;
  items: FruitItem[];
  isLocked?: boolean;
  unlockKeyType?: FruitType;
  isOneWay?: boolean;
  isIce?: boolean;
  labeledFruitType?: FruitType;
  exactOrder?: FruitType[];
  isFrozenBasket?: boolean;
}

export interface MoveRecord {
  fromBasketId: string;
  toBasketId: string;
  movedItem: FruitItem;
  unlockedBasketId?: string;
  unfrozenFruitId?: string;
  unhiddenFruitId?: string;
}

export interface LevelConfig {
  levelNumber: number;
  seed: string;
  fruitTypes: FruitType[];
  basketsCount: number;
  emptyBasketsCount: number;
  basketCapacity: number;
  maxMovesTarget: number;
  isChallenge?: boolean;
  challengeTitle?: string;
  specialMechanics?: (
    | 'labeled'
    | 'limited_capacity'
    | 'locked'
    | 'hidden'
    | 'exact_order'
    | 'frozen'
    | 'one_way'
    | 'wild'
  )[];
  timeLimitSeconds?: number;
  initialBaskets: Basket[];
}

export interface LevelProgress {
  completed: boolean;
  stars: number; // 1, 2, or 3
  bestMoves: number;
  highScore: number;
}

export interface DailyPuzzleResult {
  completed: boolean;
  score: number;
  moves: number;
  stars: number;
  date: string; // YYYY-MM-DD
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
  currentLevel: number;
  highestLevelReached: number;
  totalScore: number;
  totalStars: number;
  totalFruitsSorted: number;
  totalMovesMade: number;
  totalLevelsCompleted: number;
  perfectLevelsCount: number; // 3-star levels
  hintsUsedCount: number;
  bestStreak: number;
  currentStreak: number;
  lastPlayedDate: string;
  levelProgress: Record<number, LevelProgress>;
  dailyPuzzleHistory: Record<string, DailyPuzzleResult>;
  unlockedThemes: string[];
  currentTheme: string;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  goal: number;
  getProgress: (profile: PlayerProfile) => number;
}

export interface ThemeConfig {
  id: string;
  name: string;
  bgGradient: string;
  cardBg: string;
  basketBorder: string;
  basketBg: string;
  woodAccent: string;
  accentColor: string;
  particleColors: string[];
  unlockLevel: number;
}

export type ActiveScreen =
  | 'splash'
  | 'game'
  | 'level_select'
  | 'daily_puzzle'
  | 'scoreboard'
  | 'stats'
  | 'achievements'
  | 'themes'
  | 'how_to_play'
  | 'settings'
  | 'profiles';
