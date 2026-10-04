import type { OdeSystem, Solver, StepResult } from '../types';

export class EulerSolver implements Solver {
  readonly name = 'Euler' as const;
  readonly order = 1;
  readonly adaptive = false;
  readonly needsPairs = false;

  private readonly dim: number;
  private readonly k1: Float64Array;

  constructor(dim: number) {
    this.dim = dim;
    this.k1 = new Float64Array(dim);
  }

  step(sys: OdeSystem, t: number, y: Float64Array, dt: number, tol = 0): StepResult {
    void tol;
    sys.f(t, y, this.k1);
    for (let i = 0; i < this.dim; i++) {
      y[i] += this.k1[i] * dt;
    }
    return { dtTaken: dt, dtNext: 0, evals: 1 };
  }
}
