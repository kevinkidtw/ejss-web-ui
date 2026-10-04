import { describe, expect, it } from 'vitest';
import { EventRunner } from '../events';
import { Rk4Solver } from '../solvers';
import type { OdeSystem, VarBag } from '../types';

describe('ODE Events and Root Location (Item 5)', () => {
  it('locates ground impact time of free fall within < 1e-8 of sqrt(2*10/9.8)', () => {
    const g = 9.8;
    const sys: OdeSystem = {
      dim: 2,
      pairs: [[0, 1]],
      free: [],
      f: (_t, _y, out) => {
        out[0] = _y[1];
        out[1] = -g;
      },
    };

    const bag = { y: 10, vy: 0, g: 9.8, t: 0, dt: 0.05 } as VarBag;
    const y = new Float64Array([10, 0]);
    let recordedEventTime = -1;

    const event = {
      id: 'ground',
      name: 'Ground',
      kind: 'STATE' as const,
      evalG: (_v: VarBag, _t: number, state: Float64Array) => state[0],
      actionFn: (v: VarBag) => {
        if (recordedEventTime < 0) {
          recordedEventTime = v.t;
        }
        v.vy = -0.8 * Number(v.vy);
      },
      tolerance: 1e-9,
      endStep: false,
    };

    const runner = new EventRunner(2, ['y', 'vy'], [event], new Rk4Solver(2), 1e-9);

    // Step until ground impact
    for (let i = 0; i < 40; i++) {
      runner.step(sys, bag.t, y, 0.05, bag);
      bag.t += 0.05;
      if (recordedEventTime >= 0) break;
    }

    const exactTime = Math.sqrt((2 * 10) / 9.8);
    expect(recordedEventTime).toBeGreaterThan(0);
    expect(Math.abs(recordedEventTime - exactTime)).toBeLessThan(1e-8);
  });

  it('handles multiple bounces correctly with action vy = -0.8 * vy', () => {
    const g = 9.8;
    const sys: OdeSystem = {
      dim: 2,
      pairs: [[0, 1]],
      free: [],
      f: (_t, _y, out) => {
        out[0] = _y[1];
        out[1] = -g;
      },
    };

    const bag = { y: 10, vy: 0, g: 9.8, t: 0, dt: 0.05 } as VarBag;
    const y = new Float64Array([10, 0]);
    const bounceTimes: number[] = [];

    const event = {
      id: 'ground',
      name: 'Ground',
      kind: 'STATE' as const,
      evalG: (_v: VarBag, _t: number, state: Float64Array) => state[0],
      actionFn: (v: VarBag) => {
        bounceTimes.push(v.t);
        v.vy = -0.8 * Number(v.vy);
      },
      tolerance: 1e-9,
      endStep: false,
    };

    const runner = new EventRunner(2, ['y', 'vy'], [event], new Rk4Solver(2), 1e-9);

    // Run 150 steps (7.5 seconds)
    for (let i = 0; i < 150; i++) {
      runner.step(sys, bag.t, y, 0.05, bag);
      bag.t += 0.05;
    }

    // Should have bounced at least 3 times
    expect(bounceTimes.length).toBeGreaterThanOrEqual(3);

    // Bounces should occur in strictly increasing time order
    for (let i = 1; i < bounceTimes.length; i++) {
      expect(bounceTimes[i]).toBeGreaterThan(bounceTimes[i - 1]);
    }
  });
});
