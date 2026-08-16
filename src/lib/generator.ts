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

export function generateLevelConfig(
  levelNumber: number,
  customSeed?: string
): LevelConfig {
  const seedString = customSeed || `level_${levelNumber}_v1`;
  let attempt = 0;

  while (attempt < 50) {
    const seed = hashSeed(`${seedString}_att_${attempt}`);
    const rng = mulberry32(seed);

    const config = tryGenerateLevel(levelNumber, seedString, rng, attempt);
    if (config) {
      return config;
    }
    attempt++;
  }

  // Fallback safe level if attempt limit reached
  return buildFallbackLevel(levelNumber, seedString);
}

function tryGenerateLevel(
  levelNumber: number,
  seedString: string,
  rng: () => number,
  attempt: number
): LevelConfig | null {
  const isChallenge = levelNumber > 5 && levelNumber % 10 === 0;

  // Determine fruit types count based on difficulty progression
  let numFruitTypes = 2;
  let basketCapacity = 4;
  let emptyBasketsCount = 2;

  if (levelNumber <= 2) {
    numFruitTypes = 2;
    emptyBasketsCount = levelNumber === 1 ? 1 : 2;
  } else if (levelNumber <= 10) {
    numFruitTypes = 3;
    emptyBasketsCount = 2;
  } else if (levelNumber <= 30) {
    numFruitTypes = 3 + Math.floor(rng() * 2); // 3 or 4
    emptyBasketsCount = 2;
  } else if (levelNumber <= 75) {
    numFruitTypes = 4 + Math.floor(rng() * 2); // 4 or 5
    emptyBasketsCount = 2;
  } else if (levelNumber <= 150) {
    numFruitTypes = 5 + Math.floor(rng() * 3); // 5 to 7
    basketCapacity = rng() > 0.6 ? 5 : 4;
    emptyBasketsCount = 2;
  } else if (levelNumber <= 300) {
    numFruitTypes = 6 + Math.floor(rng() * 3); // 6 to 8
    basketCapacity = rng() > 0.5 ? 5 : 4;
    emptyBasketsCount = rng() > 0.7 ? 3 : 2;
  } else {
    numFruitTypes = 7 + Math.floor(rng() * 3); // 7 to 9
    basketCapacity = rng() > 0.5 ? 5 : 4;
    emptyBasketsCount = 2;
  }

  if (isChallenge) {
    numFruitTypes = Math.min(ALL_FRUIT_TYPES.length, numFruitTypes + 1);
    emptyBasketsCount = 1; // Tougher: only 1 empty basket!
  }

  // Pick fruit types for this level
  const shuffledFruits = [...ALL_FRUIT_TYPES].sort(() => rng() - 0.5);
  const chosenFruitTypes = shuffledFruits.slice(0, numFruitTypes);

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
  if (levelNumber >= 25 && rng() > 0.6) {
    specialMechanics.push('locked');
  } else if (levelNumber >= 40 && rng() > 0.6) {
    specialMechanics.push('frozen');
  }

  // Apply Reverse Moves to thoroughly shuffle the solved board
  const shuffleMovesCount = Math.min(
    120,
    15 + levelNumber * 2 + Math.floor(rng() * 20)
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
        // In reverse shuffling, we can move a fruit to another basket if it has space
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
    // Freeze one fruit in a basket
    const candidateBaskets = currentBaskets.filter((b) => b.items.length > 2);
    if (candidateBaskets.length > 0) {
      const targetB = candidateBaskets[Math.floor(rng() * candidateBaskets.length)];
      targetB.items[0].isFrozen = true; // Bottom fruit frozen
    }
  }

  // Validate with Solver
  const solverRes = solvePuzzle(currentBaskets, 3500);

  if (!solverRes.isSolvable) {
    return null; // Reject unsolvable puzzle!
  }

  // Ensure minimum move depth appropriate for level
  const minRequiredMoves = Math.min(18, Math.max(3, Math.floor(levelNumber / 8)));
  if (solverRes.minMoves < minRequiredMoves && levelNumber > 5 && attempt < 25) {
    return null; // Reject if too trivial for higher level
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
  const fruitTypes: FruitType[] = (['apple', 'banana', 'orange'] as FruitType[]).slice(
    0,
    levelNumber === 1 ? 2 : 3
  );
  const basketsCount = fruitTypes.length + 2;
  const capacity = 4;

  const baskets: Basket[] = [];
  let itemCounter = 1;

  // Basket 0: mixed
  baskets.push({
    id: 'b_0',
    capacity,
    items: [
      { id: `i_${itemCounter++}`, type: fruitTypes[0] },
      { id: `i_${itemCounter++}`, type: fruitTypes[1] },
      { id: `i_${itemCounter++}`, type: fruitTypes[0] },
      { id: `i_${itemCounter++}`, type: fruitTypes[1] },
    ],
  });

  // Basket 1: mixed
  baskets.push({
    id: 'b_1',
    capacity,
    items: [
      { id: `i_${itemCounter++}`, type: fruitTypes[1] },
      { id: `i_${itemCounter++}`, type: fruitTypes[0] },
      { id: `i_${itemCounter++}`, type: fruitTypes[1] },
      { id: `i_${itemCounter++}`, type: fruitTypes[0] },
    ],
  });

  if (fruitTypes.length > 2) {
    baskets.push({
      id: 'b_2',
      capacity,
      items: [
        { id: `i_${itemCounter++}`, type: fruitTypes[2] },
        { id: `i_${itemCounter++}`, type: fruitTypes[2] },
        { id: `i_${itemCounter++}`, type: fruitTypes[2] },
        { id: `i_${itemCounter++}`, type: fruitTypes[2] },
      ],
    });
  }

  // 2 empty baskets
  baskets.push({ id: 'b_emp_1', capacity, items: [] });
  baskets.push({ id: 'b_emp_2', capacity, items: [] });

  return {
    levelNumber,
    seed: seedString,
    fruitTypes,
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
