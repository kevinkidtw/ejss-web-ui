import type { OdeSystem, Solver, StepResult } from '../types';
import { Rk4Solver } from './rk4';

export class EulerCromerSolver implements Solver {
  readonly name = 'EulerCromer' as const;
  readonly order = 1;
  readonly adaptive = false;
  readonly needsPairs = true;

  private readonly k1: Float64Array;
  private readonly rk4: Rk4Solver;
  private readonly rk4Buf: Float64Array;

  constructor(dim: number) {
    this.k1 = new Float64Array(dim);
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

    sys.f(t, y, this.k1);

    for (let k = 0; k < sys.pairs.length; k++) {
      const [pos, vel] = sys.pairs[k];
      const a = this.k1[vel];
      y[vel] += a * dt;
      y[pos] += y[vel] * dt;
    }

    if (sys.free.length > 0) {
      for (let k = 0; k < sys.free.length; k++) {
        const idx = sys.free[k];
        y[idx] = this.rk4Buf[idx];
      }
    }

    return { dtTaken: dt, dtNext: 0, evals: 1 + extraEvals };
  }
}
