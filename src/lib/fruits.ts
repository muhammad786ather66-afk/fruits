/**
 * Fruit Definitions with Visual Properties & Colors
 */

import { FruitType } from '../types';

export interface FruitData {
  type: FruitType;
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

export const FRUITS: Record<FruitType, FruitData> = {
  apple: {
    type: 'apple',
    name: 'Apple',
    emoji: '🍎',
    primaryColor: '#EF4444',
    secondaryColor: '#DC2626',
    borderColor: '#B91C1C',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    textColor: '#FFFFFF',
  },
  banana: {
    type: 'banana',
    name: 'Banana',
    emoji: '🍌',
    primaryColor: '#FACC15',
    secondaryColor: '#EAB308',
    borderColor: '#CA8A04',
    glowColor: 'rgba(250, 204, 21, 0.4)',
    textColor: '#854D0E',
  },
  orange: {
    type: 'orange',
    name: 'Orange',
    emoji: '🍊',
    primaryColor: '#FB923C',
    secondaryColor: '#F97316',
    borderColor: '#EA580C',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    textColor: '#FFFFFF',
  },
  strawberry: {
    type: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    primaryColor: '#F43F5E',
    secondaryColor: '#E11D48',
    borderColor: '#BE123C',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    textColor: '#FFFFFF',
  },
  watermelon: {
    type: 'watermelon',
    name: 'Watermelon',
    emoji: '🍉',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    borderColor: '#047857',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    textColor: '#FFFFFF',
  },
  grapes: {
    type: 'grapes',
    name: 'Grapes',
    emoji: '🍇',
    primaryColor: '#A855F7',
    secondaryColor: '#9333EA',
    borderColor: '#7E22CE',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    textColor: '#FFFFFF',
  },
  lemon: {
    type: 'lemon',
    name: 'Lemon',
    emoji: '🍋',
    primaryColor: '#FDE047',
    secondaryColor: '#FACC15',
    borderColor: '#EAB308',
    glowColor: 'rgba(253, 224, 71, 0.4)',
    textColor: '#713F12',
  },
  cherry: {
    type: 'cherry',
    name: 'Cherry',
    emoji: '🍒',
    primaryColor: '#E11D48',
    secondaryColor: '#9F1239',
    borderColor: '#881337',
    glowColor: 'rgba(225, 29, 72, 0.4)',
    textColor: '#FFFFFF',
  },
  peach: {
    type: 'peach',
    name: 'Peach',
    emoji: '🍑',
    primaryColor: '#FB923C',
    secondaryColor: '#F43F5E',
    borderColor: '#E11D48',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    textColor: '#FFFFFF',
  },
  pineapple: {
    type: 'pineapple',
    name: 'Pineapple',
    emoji: '🍍',
    primaryColor: '#EAB308',
    secondaryColor: '#CA8A04',
    borderColor: '#A16207',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    textColor: '#713F12',
  },
  kiwi: {
    type: 'kiwi',
    name: 'Kiwi',
    emoji: '🥝',
    primaryColor: '#84CC16',
    secondaryColor: '#65A30D',
    borderColor: '#4D7C0F',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    textColor: '#FFFFFF',
  },
  blueberry: {
    type: 'blueberry',
    name: 'Blueberry',
    emoji: '🫐',
    primaryColor: '#3B82F6',
    secondaryColor: '#2563EB',
    borderColor: '#1D4ED8',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    textColor: '#FFFFFF',
  },
  coconut: {
    type: 'coconut',
    name: 'Coconut',
    emoji: '🥥',
    primaryColor: '#78350F',
    secondaryColor: '#451A03',
    borderColor: '#290E02',
    glowColor: 'rgba(120, 53, 15, 0.4)',
    textColor: '#FFFFFF',
  },
  mango: {
    type: 'mango',
    name: 'Mango',
    emoji: '🥭',
    primaryColor: '#F97316',
    secondaryColor: '#EAB308',
    borderColor: '#C2410C',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    textColor: '#FFFFFF',
  },
};

export const ALL_FRUIT_TYPES: FruitType[] = Object.keys(FRUITS) as FruitType[];
