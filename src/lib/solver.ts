/**
 * Puzzle Solver & State Validator Engine (BFS Search)
 */

import { Basket, FruitItem, FruitType } from '../types';

export interface Move {
  fromIndex: number;
  toIndex: number;
}

export interface SolverResult {
  isSolvable: boolean;
  minMoves: number;
  solutionPath: Move[];
  nextBestMove: Move | null;
}

// Convert baskets to a string key for state memoization
function serializeBaskets(baskets: Basket[]): string {
  return baskets
    .map((b) => {
      const lockStr = b.isLocked ? '[L]' : '';
      const itemsStr = b.items
        .map((i) => i.type + (i.isFrozen ? '*f' : '') + (i.isWild ? '*w' : ''))
        .join(',');
      return `${lockStr}${b.capacity}:${itemsStr}`;
    })
    .join('|');
}

// Check if current board configuration is completely solved
export function isBoardSolved(baskets: Basket[]): boolean {
  for (const b of baskets) {
    if (b.items.length === 0) continue;
    if (b.isLocked) return false;

    // Must be completely pure (only 1 fruit type)
    const firstType = b.items[0].type;
    const isPure = b.items.every(
      (item) => (item.type === firstType || item.isWild) && !item.isFrozen
    );
    if (!isPure) return false;

    // Ideally full or all remaining fruits of this type exist in this basket
    if (b.items.length < b.capacity) {
      // Check if any other basket contains this fruit type
      const otherHasType = baskets.some(
        (other, idx) =>
          other !== b &&
          other.items.some((item) => item.type === firstType && !item.isWild)
      );
      if (otherHasType) return false;
    }
  }
  return true;
}

// Check if a move from fromIdx to toIdx is legal
export function isMoveLegal(
  baskets: Basket[],
  fromIdx: number,
  toIdx: number
): boolean {
  if (fromIdx === toIdx) return false;
  const fromBasket = baskets[fromIdx];
  const toBasket = baskets[toIdx];

  if (!fromBasket || !toBasket) return false;
  if (fromBasket.isLocked || toBasket.isLocked) return false;
  if (fromBasket.items.length === 0) return false;
  if (toBasket.items.length >= toBasket.capacity) return false;

  const topItem = fromBasket.items[fromBasket.items.length - 1];
  if (topItem.isFrozen) return false;

  if (toBasket.items.length === 0) return true;

  const destTopItem = toBasket.items[toBasket.items.length - 1];
  if (topItem.isWild || destTopItem.isWild) return true;

  return topItem.type === destTopItem.type;
}

// Clone baskets array deeply for state evaluation
export function cloneBaskets(baskets: Basket[]): Basket[] {
  return baskets.map((b) => ({
    ...b,
    items: b.items.map((item) => ({ ...item })),
  }));
}

// Perform move on cloned baskets
export function executeMove(
  baskets: Basket[],
  fromIdx: number,
  toIdx: number
): Basket[] {
  const nextBaskets = cloneBaskets(baskets);
  const from = nextBaskets[fromIdx];
  const to = nextBaskets[toIdx];

  const item = from.items.pop();
  if (!item) return nextBaskets;

  to.items.push(item);

  // Auto unlock mechanic if key fruit is placed into destination or moved
  nextBaskets.forEach((b) => {
    if (b.isLocked && b.unlockKeyType === item.type) {
      b.isLocked = false;
    }
  });

  // Unfreeze top item if unblock conditions met
  if (from.items.length > 0) {
    const newTop = from.items[from.items.length - 1];
    if (newTop.isFrozen) {
      newTop.isFrozen = false;
    }
  }

  return nextBaskets;
}

// BFS Solver algorithm with max node limit to guarantee fast response (< 50ms)
export function solvePuzzle(
  initialBaskets: Basket[],
  maxVisitedNodes = 4000
): SolverResult {
  if (isBoardSolved(initialBaskets)) {
    return {
      isSolvable: true,
      minMoves: 0,
      solutionPath: [],
      nextBestMove: null,
    };
  }

  const queue: { state: Basket[]; path: Move[] }[] = [
    { state: initialBaskets, path: [] },
  ];
  const visited = new Set<string>();
  visited.add(serializeBaskets(initialBaskets));

  let visitedCount = 0;

  while (queue.length > 0 && visitedCount < maxVisitedNodes) {
    visitedCount++;
    const current = queue.shift()!;

    const n = current.state.length;
    for (let f = 0; f < n; f++) {
      if (current.state[f].items.length === 0) continue;
      if (current.state[f].isLocked) continue;

      // Skip moving a uniform stack from a basket to an empty basket (redundant move)
      const fromItems = current.state[f].items;
      const isUniform =
        fromItems.length > 0 &&
        fromItems.every((i) => i.type === fromItems[0].type && !i.isFrozen);

      for (let t = 0; t < n; t++) {
        if (f === t) continue;
        if (!isMoveLegal(current.state, f, t)) continue;

        // Redundancy pruning: Don't move uniform stack to empty basket if it's already alone
        if (
          current.state[t].items.length === 0 &&
          isUniform &&
          fromItems.length === current.state[f].capacity
        ) {
          continue;
        }

        const nextState = executeMove(current.state, f, t);
        const nextKey = serializeBaskets(nextState);

        if (visited.has(nextKey)) continue;
        visited.add(nextKey);

        const newPath = [...current.path, { fromIndex: f, toIndex: t }];

        if (isBoardSolved(nextState)) {
          return {
            isSolvable: true,
            minMoves: newPath.length,
            solutionPath: newPath,
            nextBestMove: newPath[0],
          };
        }

        queue.push({ state: nextState, path: newPath });
      }
    }
  }

  return {
    isSolvable: false,
    minMoves: 0,
    solutionPath: [],
    nextBestMove: null,
  };
}
