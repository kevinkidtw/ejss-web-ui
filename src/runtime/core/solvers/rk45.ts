import type { OdeSystem, Solver, StepResult } from '../types';

// Coefficients for Dormand–Prince 5(4)
const C2 = 1 / 5;
const C3 = 3 / 10;
const C4 = 4 / 5;
const C5 = 8 / 9;

const A21 = 1 / 5;

const A31 = 3 / 40;
const A32 = 9 / 40;

const A41 = 44 / 45;
const A42 = -56 / 15;
const A43 = 32 / 9;

const A51 = 19372 / 6561;
const A52 = -25360 / 2187;
const A53 = 64448 / 6561;
const A54 = -212 / 729;

const A61 = 9017 / 3168;
const A62 = -355 / 33;
const A63 = 46732 / 5247;
const A64 = 49 / 176;
const A65 = -5103 / 18656;

const A71 = 35 / 384;
const A73 = 500 / 1113;
const A74 = 125 / 192;
const A75 = -2187 / 6784;
const A76 = 11 / 84;

// Error difference e = b5 - b4
const E1 = 71 / 57600;
const E3 = -71 / 16695;
const E4 = 71 / 1920;
const E5 = -17253 / 339200;
const E6 = 22 / 525;
const E7 = -1 / 40;

export class Rk45Solver implements Solver {
  readonly name = 'RK45' as const;
  readonly order = 5;
  readonly adaptive = true;
  readonly needsPairs = false;

  private readonly dim: number;
  private readonly k1: Float64Array;
  private readonly k2: Float64Array;
  private readonly k3: Float64Array;
  private readonly k4: Float64Array;
  private readonly k5: Float64Array;
  private readonly k6: Float64Array;
  private readonly k7: Float64Array;
  private readonly yTrial: Float64Array;

  private lastH = 0;

  constructor(dim: number) {
    this.dim = dim;
    this.k1 = new Float64Array(dim);
    this.k2 = new Float64Array(dim);
    this.k3 = new Float64Array(dim);
    this.k4 = new Float64Array(dim);
    this.k5 = new Float64Array(dim);
    this.k6 = new Float64Array(dim);
    this.k7 = new Float64Array(dim);
    this.yTrial = new Float64Array(dim);
  }

  step(sys: OdeSystem, t: number, y: Float64Array, dt: number, tol: number): StepResult {
    const dim = this.dim;
    const { k1, k2, k3, k4, k5, k6, k7, yTrial } = this;

    const tEnd = t + dt;
    let tCur = t;
    let h = this.lastH > 0 ? Math.min(this.lastH, dt) : dt;
    if (h <= 0) h = dt;

    let totalEvals = 0;
    let hasK1 = false;
    let iter = 0;
    const maxIter = 50000;

    const effectiveTol = tol > 0 ? tol : 1e-8;

    while (tCur < tEnd - 1e-14 && iter++ < maxIter) {
      if (tCur + h > tEnd) {
        h = tEnd - tCur;
      }

      // 1. Stage 1 (FSAL)
      if (!hasK1) {
        sys.f(tCur, y, k1);
        totalEvals++;
        hasK1 = true;
      }

      // 2. Stage 2
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A21 * k1[i]);
      }
      sys.f(tCur + C2 * h, yTrial, k2);
      totalEvals++;

      // 3. Stage 3
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A31 * k1[i] + A32 * k2[i]);
      }
      sys.f(tCur + C3 * h, yTrial, k3);
      totalEvals++;

      // 4. Stage 4
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A41 * k1[i] + A42 * k2[i] + A43 * k3[i]);
      }
      sys.f(tCur + C4 * h, yTrial, k4);
      totalEvals++;

      // 5. Stage 5
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A51 * k1[i] + A52 * k2[i] + A53 * k3[i] + A54 * k4[i]);
      }
      sys.f(tCur + C5 * h, yTrial, k5);
      totalEvals++;

      // 6. Stage 6
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h * (A61 * k1[i] + A62 * k2[i] + A63 * k3[i] + A64 * k4[i] + A65 * k5[i]);
      }
      sys.f(tCur + h, yTrial, k6);
      totalEvals++;

      // 7. Stage 7 (yTrial is the 5th order propagated solution)
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h * (A71 * k1[i] + A73 * k3[i] + A74 * k4[i] + A75 * k5[i] + A76 * k6[i]);
      }
      sys.f(tCur + h, yTrial, k7);
      totalEvals++;

      // Error estimate: error = (b5 - b4) * k * h
      let errNorm = 0;
      for (let i = 0; i < dim; i++) {
        const err_i =
          h *
          (E1 * k1[i] +
            E3 * k3[i] +
            E4 * k4[i] +
            E5 * k5[i] +
            E6 * k6[i] +
            E7 * k7[i]);
        const scale = effectiveTol + effectiveTol * Math.abs(y[i]);
        const ratio = Math.abs(err_i) / scale;
        if (ratio > errNorm) {
          errNorm = ratio;
        }
      }

      if (errNorm <= 1.0) {
        // Step accepted
        y.set(yTrial);
        tCur += h;

        // FSAL: k1 of next step is k7
        k1.set(k7);
        hasK1 = true;

        // Step-size adaptation: safety 0.9, exponent 1/5
        const factor =
          errNorm === 0 ? 5.0 : Math.max(0.2, Math.min(5.0, 0.9 * Math.pow(1 / errNorm, 0.2)));
        const hNext = h * factor;
        this.lastH = hNext;
        h = Math.min(hNext, tEnd - tCur);
      } else {
        // Step rejected
        const factor = Math.max(0.2, Math.min(1.0, 0.9 * Math.pow(1 / errNorm, 0.2)));
        h *= factor;
        if (h < 1e-15) {
          break;
        }
      }
    }

    return { dtTaken: dt, dtNext: this.lastH, evals: totalEvals };
  }
}
