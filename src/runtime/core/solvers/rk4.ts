import type { OdeSystem, Solver, StepResult } from '../types';

export class Rk4Solver implements Solver {
  readonly name = 'RungeKutta' as const;
  readonly order = 4;
  readonly adaptive = false;
  readonly needsPairs = false;

  private readonly dim: number;
  private readonly k1: Float64Array;
  private readonly k2: Float64Array;
  private readonly k3: Float64Array;
  private readonly k4: Float64Array;
  private readonly yTemp: Float64Array;

  constructor(dim: number) {
    this.dim = dim;
    this.k1 = new Float64Array(dim);
    this.k2 = new Float64Array(dim);
    this.k3 = new Float64Array(dim);
    this.k4 = new Float64Array(dim);
    this.yTemp = new Float64Array(dim);
  }

  step(sys: OdeSystem, t: number, y: Float64Array, dt: number, tol = 0): StepResult {
    void tol;
    const dim = this.dim;
    const { k1, k2, k3, k4, yTemp } = this;

    // k1 = f(t, y)
    sys.f(t, y, k1);

    // k2 = f(t + dt/2, y + dt/2 * k1)
    const dtHalf = 0.5 * dt;
    for (let i = 0; i < dim; i++) {
      yTemp[i] = y[i] + dtHalf * k1[i];
    }
    sys.f(t + dtHalf, yTemp, k2);

    // k3 = f(t + dt/2, y + dt/2 * k2)
    for (let i = 0; i < dim; i++) {
      yTemp[i] = y[i] + dtHalf * k2[i];
    }
    sys.f(t + dtHalf, yTemp, k3);

    // k4 = f(t + dt, y + dt * k3)
    for (let i = 0; i < dim; i++) {
      yTemp[i] = y[i] + dt * k3[i];
    }
    sys.f(t + dt, yTemp, k4);

    // y += (dt / 6) * (k1 + 2*k2 + 2*k3 + k4)
    const dtSixth = dt / 6;
    for (let i = 0; i < dim; i++) {
      y[i] += dtSixth * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    }

    return { dtTaken: dt, dtNext: 0, evals: 4 };
  }
}
