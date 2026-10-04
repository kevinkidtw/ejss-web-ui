import type { OdeSystem, Solver, StepResult } from '../types';
import { Rk4Solver } from './rk4';

export class VerletSolver implements Solver {
  readonly name = 'Verlet' as const;
  readonly order = 2;
  readonly adaptive = false;
  readonly needsPairs = true;

  private readonly a0: Float64Array;
  private readonly a1: Float64Array;
  private readonly rk4: Rk4Solver;
  private readonly rk4Buf: Float64Array;

  constructor(dim: number) {
    this.a0 = new Float64Array(dim);
    this.a1 = new Float64Array(dim);
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

    // 1. Evaluate a0 = a(x, v)
    sys.f(t, y, this.a0);

    // 2. v½ = v + a0 * dt/2; x = x + v½ * dt
    const halfDt = 0.5 * dt;
    for (let k = 0; k < sys.pairs.length; k++) {
      const [pos, vel] = sys.pairs[k];
      const a = this.a0[vel];
      const vHalf = y[vel] + halfDt * a;
      y[pos] += vHalf * dt;
      y[vel] = vHalf;
    }

    // 3. Evaluate a1 = a(x_new, v½)
    sys.f(t + dt, y, this.a1);

    // 4. v = v½ + a1 * dt/2
    for (let k = 0; k < sys.pairs.length; k++) {
      const [, vel] = sys.pairs[k];
      const a = this.a1[vel];
      y[vel] += halfDt * a;
    }

    if (sys.free.length > 0) {
      for (let k = 0; k < sys.free.length; k++) {
        const idx = sys.free[k];
        y[idx] = this.rk4Buf[idx];
      }
    }

    return { dtTaken: dt, dtNext: 0, evals: 2 + extraEvals };
  }
}
