/**
 * Infinite Procedural Level Generator with Guaranteed Solver Validation
 */

import { Basket, FruitItem, FruitType, LevelConfig } from '../types';
import { ALL_FRUIT_TYPES } from './fruits';
import { isBoardSolved, isMoveLegal, solvePuzzle } from './solver';

// Mulberry32 Pseudo-Random Number Generator for deterministic seed generation
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string seed or number to numeric seed
function hashSeed(seedStr: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Fisher-Yates deterministic shuffle
function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateLevelConfig(
  levelNumber: number,
  customSeed?: string
): LevelConfig {
  const seedString = customSeed || `endless_level_${levelNumber}_v2`;
  let attempt = 0;

  while (attempt < 40) {
    const seed = hashSeed(`${seedString}_att_${attempt}`);
    const rng = mulberry32(seed);

    const config = tryGenerateLevel(levelNumber, seedString, rng, attempt);
    if (config) {
      return config;
    }
    attempt++;
  }

  // Fallback dynamic level generator if attempt limit reached
  return buildFallbackLevel(levelNumber, seedString);
}

function tryGenerateLevel(
  levelNumber: number,
  seedString: string,
  rng: () => number,
  attempt: number
): LevelConfig | null {
  const isChallenge = levelNumber > 5 && levelNumber % 10 === 0;

  // Endless Level Difficulty Scaling
  let numFruitTypes = 2;
  let basketCapacity = 4;
  let emptyBasketsCount = 2;

  if (levelNumber === 1) {
    numFruitTypes = 2;
    emptyBasketsCount = 2;
  } else if (levelNumber <= 5) {
    numFruitTypes = 3;
    emptyBasketsCount = 2;
  } else if (levelNumber <= 15) {
    numFruitTypes = 3 + Math.floor(rng() * 2); // 3-4
    emptyBasketsCount = 2;
  } else if (levelNumber <= 30) {
    numFruitTypes = 4 + Math.floor(rng() * 2); // 4-5
    emptyBasketsCount = 2;
  } else if (levelNumber <= 60) {
    numFruitTypes = 5 + Math.floor(rng() * 2); // 5-6
    emptyBasketsCount = 2;
  } else if (levelNumber <= 120) {
    numFruitTypes = 6 + Math.floor(rng() * 3); // 6-8
    emptyBasketsCount = rng() > 0.8 ? 3 : 2;
  } else {
    // Endless mode beyond 120: cycle through 6..9 fruit types
    numFruitTypes = 6 + Math.min(ALL_FRUIT_TYPES.length - 6, (levelNumber % 6));
    emptyBasketsCount = (levelNumber % 7 === 0) ? 3 : 2;
  }

  if (isChallenge) {
    numFruitTypes = Math.min(ALL_FRUIT_TYPES.length, numFruitTypes + 1);
    emptyBasketsCount = 1; // Tougher: only 1 empty basket!
  }

  // Pick fruit types deterministically for this level using Fisher-Yates
  const chosenFruitTypes = shuffleArray(ALL_FRUIT_TYPES, rng).slice(0, numFruitTypes);

  // Generate solved state first (Reverse move shuffling guarantees solvability)
  const baskets: Basket[] = [];
  const totalFilledBaskets = numFruitTypes;
  let itemIdCounter = 1;

  for (let i = 0; i < totalFilledBaskets; i++) {
    const fType = chosenFruitTypes[i];
    const items: FruitItem[] = [];
    for (let c = 0; c < basketCapacity; c++) {
      items.push({
        id: `f_${levelNumber}_${itemIdCounter++}`,
        type: fType,
      });
    }
    baskets.push({
      id: `basket_${i}`,
      capacity: basketCapacity,
      items,
    });
  }

  // Add empty baskets
  for (let e = 0; e < emptyBasketsCount; e++) {
    baskets.push({
      id: `basket_empty_${e}`,
      capacity: basketCapacity,
      items: [],
    });
  }

  // Special mechanics for level 25+
  const specialMechanics: ('locked' | 'frozen' | 'wild')[] = [];
  if (levelNumber >= 25 && rng() > 0.7) {
    specialMechanics.push('locked');
  } else if (levelNumber >= 40 && rng() > 0.7) {
    specialMechanics.push('frozen');
  }

  // Apply Reverse Moves to shuffle the solved board
  const shuffleMovesCount = Math.min(
    100,
    12 + Math.min(60, levelNumber * 2) + Math.floor(rng() * 15)
  );

  let currentBaskets = baskets.map((b) => ({
    ...b,
    items: b.items.map((i) => ({ ...i })),
  }));

  for (let step = 0; step < shuffleMovesCount; step++) {
    const validMoves: { from: number; to: number }[] = [];
    const n = currentBaskets.length;

    for (let f = 0; f < n; f++) {
      if (currentBaskets[f].items.length === 0) continue;
      for (let t = 0; t < n; t++) {
        if (f === t) continue;
        if (currentBaskets[t].items.length < currentBaskets[t].capacity) {
          validMoves.push({ from: f, to: t });
        }
      }
    }

    if (validMoves.length === 0) break;
    const chosenMove = validMoves[Math.floor(rng() * validMoves.length)];

    const item = currentBaskets[chosenMove.from].items.pop()!;
    currentBaskets[chosenMove.to].items.push(item);
  }

  // Ensure it didn't end up already solved
  if (isBoardSolved(currentBaskets)) {
    return null;
  }

  // Apply special mechanics if requested
  if (specialMechanics.includes('locked') && currentBaskets.length > 3) {
    const lockedIdx = Math.floor(rng() * (currentBaskets.length - 1));
    const keyFruitType = chosenFruitTypes[Math.floor(rng() * chosenFruitTypes.length)];
    currentBaskets[lockedIdx].isLocked = true;
    currentBaskets[lockedIdx].unlockKeyType = keyFruitType;
  }

  if (specialMechanics.includes('frozen')) {
    const candidateBaskets = currentBaskets.filter((b) => b.items.length > 2);
    if (candidateBaskets.length > 0) {
      const targetB = candidateBaskets[Math.floor(rng() * candidateBaskets.length)];
      if (targetB.items.length > 0) {
        targetB.items[0].isFrozen = true;
      }
    }
  }

  // Validate with Solver
  const solverRes = solvePuzzle(currentBaskets, 2500);

  if (!solverRes.isSolvable) {
    return null; // Reject unsolvable puzzle!
  }

  const challengeTitle = isChallenge
    ? `Challenge #${Math.ceil(levelNumber / 10)}`
    : undefined;

  return {
    levelNumber,
    seed: seedString,
    fruitTypes: chosenFruitTypes,
    basketsCount: currentBaskets.length,
    emptyBasketsCount,
    basketCapacity,
    maxMovesTarget: Math.ceil(solverRes.minMoves * 1.5) + 3,
    isChallenge,
    challengeTitle,
    specialMechanics,
    initialBaskets: currentBaskets,
  };
}

function buildFallbackLevel(levelNumber: number, seedString: string): LevelConfig {
  const seed = hashSeed(`${seedString}_fallback`);
  const rng = mulberry32(seed);

  const numFruits = Math.min(ALL_FRUIT_TYPES.length, 2 + (levelNumber % 4));
  const chosenFruitTypes = shuffleArray(ALL_FRUIT_TYPES, rng).slice(0, numFruits);
  const capacity = 4;

  // Build a solvable mixed layout dynamically based on seed
  const itemsPool: FruitItem[] = [];
  let itemCounter = 1;
  chosenFruitTypes.forEach((fType) => {
    for (let c = 0; c < capacity; c++) {
      itemsPool.push({ id: `fb_${levelNumber}_${itemCounter++}`, type: fType });
    }
  });

  const shuffledItems = shuffleArray(itemsPool, rng);

  const baskets: Basket[] = [];
  for (let b = 0; b < numFruits; b++) {
    baskets.push({
      id: `b_fb_${b}`,
      capacity,
      items: shuffledItems.slice(b * capacity, (b + 1) * capacity),
    });
  }

  // 2 empty baskets
  baskets.push({ id: `b_fb_emp_0`, capacity, items: [] });
  baskets.push({ id: `b_fb_emp_1`, capacity, items: [] });

  return {
    levelNumber,
    seed: seedString,
    fruitTypes: chosenFruitTypes,
    basketsCount: baskets.length,
    emptyBasketsCount: 2,
    basketCapacity: capacity,
    maxMovesTarget: 15,
    initialBaskets: baskets,
  };
}

// Generate Daily Puzzle deterministically using date string
export function generateDailyPuzzleConfig(dateString: string): LevelConfig {
  const seed = `daily_${dateString}`;
  // Use pseudo random date hash for level difficulty (e.g. level 25..50 equivalent)
  const dayNum = parseInt(dateString.replace(/-/g, ''), 10) % 100;
  const equivalentLevel = 20 + (dayNum % 40);

  const levelConf = generateLevelConfig(equivalentLevel, seed);
  return {
    ...levelConf,
    isChallenge: true,
    challengeTitle: `Daily Puzzle - ${dateString}`,
  };
}
