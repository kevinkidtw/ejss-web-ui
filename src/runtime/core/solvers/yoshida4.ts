import type { OdeSystem, Solver, StepResult } from '../types';
import { Rk4Solver } from './rk4';

const CBRT2 = Math.cbrt(2);
const W1 = 1 / (2 - CBRT2);
const W0 = -CBRT2 / (2 - CBRT2);
const C1 = W1 / 2;
const C4 = W1 / 2;
const C2 = (W0 + W1) / 2;
const C3 = (W0 + W1) / 2;
const D1 = W1;
const D3 = W1;
const D2 = W0;

export class Yoshida4Solver implements Solver {
  readonly name = 'Yoshida4' as const;
  readonly order = 4;
  readonly adaptive = false;
  readonly needsPairs = true;

  private readonly k: Float64Array;
  private readonly rk4: Rk4Solver;
  private readonly rk4Buf: Float64Array;

  constructor(dim: number) {
    this.k = new Float64Array(dim);
    this.rk4 = new Rk4Solver(dim);
    this.rk4Buf = new Float64Array(dim);
  }

  step(sys: OdeSystem, t: number, y: Float64Array, dt: number, tol: number): StepResult {
    if (sys.pairs.length === 0) {
      return this.rk4.step(sys, t, y, dt, tol);
    }

    let extraEvals = 0;
    if (sys.free.length > 0) {
      this.rk4Buf.set(y);
      const res = this.rk4.step(sys, t, this.rk4Buf, dt, tol);
      extraEvals = res.evals;
    }

    const pairs = sys.pairs;

    // Sub-step 1: x += c1 * v * dt
    for (let i = 0; i < pairs.length; i++) {
      const [pos, vel] = pairs[i];
      y[pos] += C1 * y[vel] * dt;
    }

    // Sub-step 2: v += d1 * a(x) * dt
    sys.f(t + C1 * dt, y, this.k);
    for (let i = 0; i < pairs.length; i++) {
      const [, vel] = pairs[i];
      y[vel] += D1 * this.k[vel] * dt;
    }

    // Sub-step 3: x += c2 * v * dt
    for (let i = 0; i < pairs.length; i++) {
      const [pos, vel] = pairs[i];
      y[pos] += C2 * y[vel] * dt;
    }

    // Sub-step 4: v += d2 * a(x) * dt
    sys.f(t + (C1 + C2) * dt, y, this.k);
    for (let i = 0; i < pairs.length; i++) {
      const [, vel] = pairs[i];
      y[vel] += D2 * this.k[vel] * dt;
    }

    // Sub-step 5: x += c3 * v * dt
    for (let i = 0; i < pairs.length; i++) {
      const [pos, vel] = pairs[i];
      y[pos] += C3 * y[vel] * dt;
    }

    // Sub-step 6: v += d3 * a(x) * dt
    sys.f(t + (C1 + C2 + C3) * dt, y, this.k);
    for (let i = 0; i < pairs.length; i++) {
      const [, vel] = pairs[i];
      y[vel] += D3 * this.k[vel] * dt;
    }

    // Sub-step 7: x += c4 * v * dt
    for (let i = 0; i < pairs.length; i++) {
      const [pos, vel] = pairs[i];
      y[pos] += C4 * y[vel] * dt;
    }

    if (sys.free.length > 0) {
      for (let i = 0; i < sys.free.length; i++) {
        const idx = sys.free[i];
        y[idx] = this.rk4Buf[idx];
      }
    }

    return { dtTaken: dt, dtNext: 0, evals: 3 + extraEvals };
  }
}
