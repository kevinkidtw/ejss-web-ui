import type { DerivFn, OdeSystem, VarBag } from './types';

export function detectPairs(rates: { state: string; expression: string }[]): {
  pairs: [number, number][];
  free: number[];
} {
  const pairs: [number, number][] = [];
  const used = new Set<number>();

  for (let i = 0; i < rates.length; i++) {
    if (used.has(i)) continue;
    const expr = rates[i].expression.trim();
    // Look for j such that rates[j].state === expr
    for (let j = 0; j < rates.length; j++) {
      if (i !== j && !used.has(j) && rates[j].state === expr) {
        pairs.push([i, j]);
        used.add(i);
        used.add(j);
        break;
      }
    }
  }

  const free: number[] = [];
  for (let i = 0; i < rates.length; i++) {
    if (!used.has(i)) {
      free.push(i);
    }
  }

  return { pairs, free };
}

export function createOdeSystem(
  dim: number,
  derivFn: DerivFn,
  getBag: () => VarBag,
  pairs: [number, number][],
  free: number[]
): OdeSystem {
  return {
    dim,
    pairs,
    free,
    f: (t: number, y: Float64Array, out: Float64Array) => {
      derivFn(getBag(), t, y, out);
    },
  };
}
