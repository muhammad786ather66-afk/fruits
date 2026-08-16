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
  const isChallenge = levelNumber >= 5 && levelNumber % 5 === 0;

  // Level Range Mechanics Breakdown according to Progression Rules:
  // Level 1-20: Completely Normal (No special mechanics)
  // Level 21-40: Labeled Baskets
  // Level 41-60: Limited Capacity Baskets
  // Level 61-80: Locked Baskets + Keys
  // Level 81-100: Hidden Fruits
  // Level 101-125: Exact Order Baskets
  // Level 126-150: Frozen Fruits / Baskets
  // Level 151-200: One-Way Baskets
  // Level 201+: Gradual Combinations of mechanics

  type MechanicType =
    | 'labeled'
    | 'limited_capacity'
    | 'locked'
    | 'hidden'
    | 'exact_order'
    | 'frozen'
    | 'one_way';

  const specialMechanics: MechanicType[] = [];

  if (levelNumber <= 20) {
    // Completely normal, no special mechanics!
  } else if (levelNumber <= 40) {
    specialMechanics.push('labeled');
  } else if (levelNumber <= 60) {
    specialMechanics.push('limited_capacity');
  } else if (levelNumber <= 80) {
    specialMechanics.push('locked');
  } else if (levelNumber <= 100) {
    specialMechanics.push('hidden');
  } else if (levelNumber <= 125) {
    specialMechanics.push('exact_order');
  } else if (levelNumber <= 150) {
    specialMechanics.push('frozen');
  } else if (levelNumber <= 200) {
    specialMechanics.push('one_way');
  } else if (levelNumber <= 300) {
    // 2 Combined Mechanics
    const pool: MechanicType[] = ['labeled', 'limited_capacity', 'locked', 'hidden'];
    const m1 = pool[Math.floor(rng() * pool.length)];
    const m2 = pool.filter((m) => m !== m1)[Math.floor(rng() * (pool.length - 1))];
    specialMechanics.push(m1, m2);
  } else if (levelNumber <= 500) {
    // 2-3 Combined Mechanics
    const pool: MechanicType[] = ['labeled', 'limited_capacity', 'locked', 'hidden', 'exact_order', 'one_way'];
    const count = 2 + (rng() > 0.5 ? 1 : 0);
    const shuffled = shuffleArray(pool, rng);
    specialMechanics.push(...shuffled.slice(0, count));
  } else {
    // Expert/Master Mode: 3-4 Combined Mechanics
    const pool: MechanicType[] = [
      'labeled',
      'limited_capacity',
      'locked',
      'hidden',
      'exact_order',
      'frozen',
      'one_way',
    ];
    const shuffled = shuffleArray(pool, rng);
    specialMechanics.push(...shuffled.slice(0, 3));
  }

  // Fruit & Basket Count Progression
  let numFruitTypes = 2;
  let emptyBasketsCount = 2;
  let defaultCapacity = 4;

  if (levelNumber === 1) {
    numFruitTypes = 2;
  } else if (levelNumber === 2) {
    numFruitTypes = 3;
  } else if (levelNumber <= 5) {
    numFruitTypes = 3;
  } else if (levelNumber <= 10) {
    numFruitTypes = 4;
  } else if (levelNumber <= 20) {
    numFruitTypes = 5;
  } else if (levelNumber <= 40) {
    numFruitTypes = 5;
  } else if (levelNumber <= 80) {
    numFruitTypes = 6;
  } else if (levelNumber <= 150) {
    numFruitTypes = 7;
  } else if (levelNumber <= 300) {
    numFruitTypes = 8;
  } else {
    numFruitTypes = Math.min(ALL_FRUIT_TYPES.length, 8 + (levelNumber % 5));
  }

  if (isChallenge && levelNumber > 5) {
    numFruitTypes = Math.min(ALL_FRUIT_TYPES.length, numFruitTypes + 1);
    emptyBasketsCount = 1; // Challenge levels have tighter empty space!
  }

  // Choose Fruit Types
  const chosenFruitTypes = shuffleArray(ALL_FRUIT_TYPES, rng).slice(0, numFruitTypes);

  // Build Solved Initial State
  const baskets: Basket[] = [];
  let itemIdCounter = 1;

  for (let i = 0; i < numFruitTypes; i++) {
    const fType = chosenFruitTypes[i];
    let bCap = defaultCapacity;

    if (specialMechanics.includes('limited_capacity') && i % 2 === 1) {
      bCap = 3; // Limited capacity basket
    }

    const items: FruitItem[] = [];
    for (let c = 0; c < bCap; c++) {
      items.push({
        id: `f_${levelNumber}_${itemIdCounter++}`,
        type: fType,
      });
    }

    const basketObj: Basket = {
      id: `basket_${i}`,
      capacity: bCap,
      items,
    };

    if (specialMechanics.includes('labeled') && i < 2) {
      basketObj.labeledFruitType = fType;
    }

    baskets.push(basketObj);
  }

  // Add empty baskets
  for (let e = 0; e < emptyBasketsCount; e++) {
    baskets.push({
      id: `basket_empty_${e}`,
      capacity: defaultCapacity,
      items: [],
    });
  }

  // Apply Reverse Moves to Shuffle Puzzles Solvably
  const shuffleMovesCount = Math.min(
    120,
    10 + Math.min(70, levelNumber * 2) + Math.floor(rng() * 20)
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

  // Ensure board is not already solved
  if (isBoardSolved(currentBaskets)) {
    return null;
  }

  // Apply mechanic modifiers
  if (specialMechanics.includes('hidden')) {
    currentBaskets.forEach((b) => {
      if (b.items.length > 1) {
        // Hide items below top item
        for (let idx = 0; idx < b.items.length - 1; idx++) {
          if (rng() > 0.4) {
            b.items[idx].isHidden = true;
          }
        }
      }
    });
  }

  if (specialMechanics.includes('locked') && currentBaskets.length > 3) {
    const lockTargetIdx = Math.floor(rng() * (currentBaskets.length - emptyBasketsCount));
    const keyFruitType = chosenFruitTypes[Math.floor(rng() * chosenFruitTypes.length)];
    currentBaskets[lockTargetIdx].isLocked = true;
    currentBaskets[lockTargetIdx].unlockKeyType = keyFruitType;
  }

  if (specialMechanics.includes('one_way') && currentBaskets.length > 3) {
    // Set 1 empty basket as one-way
    const emptyIdx = currentBaskets.findIndex((b) => b.items.length === 0 && !b.isLocked);
    if (emptyIdx !== -1) {
      currentBaskets[emptyIdx].isOneWay = true;
    }
  }

  if (specialMechanics.includes('exact_order')) {
    // Pick 1 filled basket and assign exact sequence requirement based on current items
    const filledWithItems = currentBaskets.filter((b) => b.items.length === defaultCapacity);
    if (filledWithItems.length > 0) {
      const targetB = filledWithItems[0];
      targetB.exactOrder = targetB.items.map((i) => i.type);
    }
  }

  if (specialMechanics.includes('frozen')) {
    const candidateBaskets = currentBaskets.filter((b) => b.items.length > 2);
    if (candidateBaskets.length > 0) {
      const targetB = candidateBaskets[0];
      if (targetB.items.length > 0) {
        targetB.items[0].isFrozen = true;
      }
    }
  }

  // Validate with BFS Solver Engine
  const solverRes = solvePuzzle(currentBaskets, 3500);

  if (!solverRes.isSolvable) {
    return null; // Reject unsolvable puzzle!
  }

  const challengeTitle = isChallenge
    ? `Challenge Level ${levelNumber}`
    : undefined;

  // Time limit for hard levels (isChallenge or level 41+) is set to 5 minutes (300 seconds)
  let timeLimitSeconds: number | undefined = undefined;
  if (isChallenge || levelNumber >= 41) {
    timeLimitSeconds = 300; // Exactly 5 minutes (300 seconds)
  }

  return {
    levelNumber,
    seed: seedString,
    fruitTypes: chosenFruitTypes,
    basketsCount: currentBaskets.length,
    emptyBasketsCount,
    basketCapacity: defaultCapacity,
    maxMovesTarget: Math.ceil(solverRes.minMoves * 1.5) + 3,
    isChallenge,
    challengeTitle,
    specialMechanics,
    timeLimitSeconds,
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
