import type { OdeSystem, Solver, StepResult } from '../types';

// Runge–Kutta–Fehlberg 7(8) coefficients
const C = [
  0,
  2 / 27,
  1 / 9,
  1 / 6,
  5 / 12,
  1 / 2,
  5 / 6,
  1 / 6,
  2 / 3,
  1 / 3,
  1,
  0,
  1,
];

// a1..a12
const A1_0 = 2 / 27;

const A2_0 = 1 / 36;
const A2_1 = 1 / 12;

const A3_0 = 1 / 24;
const A3_2 = 1 / 8;

const A4_0 = 5 / 12;
const A4_2 = -25 / 16;
const A4_3 = 25 / 16;

const A5_0 = 1 / 20;
const A5_3 = 1 / 4;
const A5_4 = 1 / 5;

const A6_0 = -25 / 108;
const A6_3 = 125 / 108;
const A6_4 = -65 / 27;
const A6_5 = 125 / 54;

const A7_0 = 31 / 300;
const A7_4 = 61 / 225;
const A7_5 = -2 / 9;
const A7_6 = 13 / 900;

const A8_0 = 2;
const A8_3 = -53 / 6;
const A8_4 = 704 / 45;
const A8_5 = -107 / 9;
const A8_6 = 67 / 90;
const A8_7 = 3;

const A9_0 = -91 / 108;
const A9_3 = 23 / 108;
const A9_4 = -976 / 135;
const A9_5 = 311 / 54;
const A9_6 = -19 / 60;
const A9_7 = 17 / 6;
const A9_8 = -1 / 12;

const A10_0 = 2383 / 4100;
const A10_3 = -341 / 164;
const A10_4 = 4496 / 1025;
const A10_5 = -301 / 82;
const A10_6 = 2133 / 4100;
const A10_7 = 45 / 82;
const A10_8 = 45 / 164;
const A10_9 = 18 / 41;

const A11_0 = 3 / 205;
const A11_5 = -6 / 41;
const A11_6 = -3 / 205;
const A11_7 = -3 / 41;
const A11_8 = 3 / 41;
const A11_9 = 6 / 41;

const A12_0 = -1777 / 4100;
const A12_3 = -341 / 164;
const A12_4 = 4496 / 1025;
const A12_5 = -289 / 82;
const A12_6 = 2193 / 4100;
const A12_7 = 51 / 82;
const A12_8 = 33 / 164;
const A12_9 = 12 / 41;
const A12_11 = 1;

// b7 propagate
const B7_0 = 41 / 840;
const B7_5 = 34 / 105;
const B7_6 = 9 / 35;
const B7_7 = 9 / 35;
const B7_8 = 9 / 280;
const B7_9 = 9 / 280;
const B7_10 = 41 / 840;

const ERR_COEFF = 41 / 840;

export class Rkf78Solver implements Solver {
  readonly name = 'Fehlberg78' as const;
  readonly order = 7;
  readonly adaptive = true;
  readonly needsPairs = false;

  private readonly dim: number;
  private readonly k0: Float64Array;
  private readonly k1: Float64Array;
  private readonly k2: Float64Array;
  private readonly k3: Float64Array;
  private readonly k4: Float64Array;
  private readonly k5: Float64Array;
  private readonly k6: Float64Array;
  private readonly k7: Float64Array;
  private readonly k8: Float64Array;
  private readonly k9: Float64Array;
  private readonly k10: Float64Array;
  private readonly k11: Float64Array;
  private readonly k12: Float64Array;
  private readonly yTrial: Float64Array;

  private lastH = 0;

  constructor(dim: number) {
    this.dim = dim;
    this.k0 = new Float64Array(dim);
    this.k1 = new Float64Array(dim);
    this.k2 = new Float64Array(dim);
    this.k3 = new Float64Array(dim);
    this.k4 = new Float64Array(dim);
    this.k5 = new Float64Array(dim);
    this.k6 = new Float64Array(dim);
    this.k7 = new Float64Array(dim);
    this.k8 = new Float64Array(dim);
    this.k9 = new Float64Array(dim);
    this.k10 = new Float64Array(dim);
    this.k11 = new Float64Array(dim);
    this.k12 = new Float64Array(dim);
    this.yTrial = new Float64Array(dim);
  }

  step(sys: OdeSystem, t: number, y: Float64Array, dt: number, tol: number): StepResult {
    const dim = this.dim;
    const {
      k0,
      k1,
      k2,
      k3,
      k4,
      k5,
      k6,
      k7,
      k8,
      k9,
      k10,
      k11,
      k12,
      yTrial,
    } = this;

    const tEnd = t + dt;
    let tCur = t;
    let h = this.lastH > 0 ? Math.min(this.lastH, dt) : dt;
    if (h <= 0) h = dt;

    let totalEvals = 0;
    let iter = 0;
    const maxIter = 50000;
    const effectiveTol = tol > 0 ? tol : 1e-8;

    while (tCur < tEnd - 1e-14 && iter++ < maxIter) {
      if (tCur + h > tEnd) {
        h = tEnd - tCur;
      }

      // Stage 0
      sys.f(tCur, y, k0);
      totalEvals++;

      // Stage 1
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A1_0 * k0[i]);
      }
      sys.f(tCur + C[1] * h, yTrial, k1);
      totalEvals++;

      // Stage 2
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A2_0 * k0[i] + A2_1 * k1[i]);
      }
      sys.f(tCur + C[2] * h, yTrial, k2);
      totalEvals++;

      // Stage 3
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A3_0 * k0[i] + A3_2 * k2[i]);
      }
      sys.f(tCur + C[3] * h, yTrial, k3);
      totalEvals++;

      // Stage 4
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A4_0 * k0[i] + A4_2 * k2[i] + A4_3 * k3[i]);
      }
      sys.f(tCur + C[4] * h, yTrial, k4);
      totalEvals++;

      // Stage 5
      for (let i = 0; i < dim; i++) {
        yTrial[i] = y[i] + h * (A5_0 * k0[i] + A5_3 * k3[i] + A5_4 * k4[i]);
      }
      sys.f(tCur + C[5] * h, yTrial, k5);
      totalEvals++;

      // Stage 6
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] + h * (A6_0 * k0[i] + A6_3 * k3[i] + A6_4 * k4[i] + A6_5 * k5[i]);
      }
      sys.f(tCur + C[6] * h, yTrial, k6);
      totalEvals++;

      // Stage 7
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h * (A7_0 * k0[i] + A7_4 * k4[i] + A7_5 * k5[i] + A7_6 * k6[i]);
      }
      sys.f(tCur + C[7] * h, yTrial, k7);
      totalEvals++;

      // Stage 8
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h *
            (A8_0 * k0[i] +
              A8_3 * k3[i] +
              A8_4 * k4[i] +
              A8_5 * k5[i] +
              A8_6 * k6[i] +
              A8_7 * k7[i]);
      }
      sys.f(tCur + C[8] * h, yTrial, k8);
      totalEvals++;

      // Stage 9
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h *
            (A9_0 * k0[i] +
              A9_3 * k3[i] +
              A9_4 * k4[i] +
              A9_5 * k5[i] +
              A9_6 * k6[i] +
              A9_7 * k7[i] +
              A9_8 * k8[i]);
      }
      sys.f(tCur + C[9] * h, yTrial, k9);
      totalEvals++;

      // Stage 10
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h *
            (A10_0 * k0[i] +
              A10_3 * k3[i] +
              A10_4 * k4[i] +
              A10_5 * k5[i] +
              A10_6 * k6[i] +
              A10_7 * k7[i] +
              A10_8 * k8[i] +
              A10_9 * k9[i]);
      }
      sys.f(tCur + C[10] * h, yTrial, k10);
      totalEvals++;

      // Stage 11
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h *
            (A11_0 * k0[i] +
              A11_5 * k5[i] +
              A11_6 * k6[i] +
              A11_7 * k7[i] +
              A11_8 * k8[i] +
              A11_9 * k9[i]);
      }
      sys.f(tCur + C[11] * h, yTrial, k11);
      totalEvals++;

      // Stage 12
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h *
            (A12_0 * k0[i] +
              A12_3 * k3[i] +
              A12_4 * k4[i] +
              A12_5 * k5[i] +
              A12_6 * k6[i] +
              A12_7 * k7[i] +
              A12_8 * k8[i] +
              A12_9 * k9[i] +
              A12_11 * k11[i]);
      }
      sys.f(tCur + C[12] * h, yTrial, k12);
      totalEvals++;

      // Propagate with 7th order b7
      for (let i = 0; i < dim; i++) {
        yTrial[i] =
          y[i] +
          h *
            (B7_0 * k0[i] +
              B7_5 * k5[i] +
              B7_6 * k6[i] +
              B7_7 * k7[i] +
              B7_8 * k8[i] +
              B7_9 * k9[i] +
              B7_10 * k10[i]);
      }

      // Error estimate: error = (41/840) * (k0 + k10 - k11 - k12) * h
      let errNorm = 0;
      for (let i = 0; i < dim; i++) {
        const err_i = ERR_COEFF * (k0[i] + k10[i] - k11[i] - k12[i]) * h;
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

        // Step-size exponent 1/8, safety factor 0.9
        const factor =
          errNorm === 0 ? 5.0 : Math.max(0.2, Math.min(5.0, 0.9 * Math.pow(1 / errNorm, 0.125)));
        const hNext = h * factor;
        this.lastH = hNext;
        h = Math.min(hNext, tEnd - tCur);
      } else {
        // Step rejected
        const factor = Math.max(0.2, Math.min(1.0, 0.9 * Math.pow(1 / errNorm, 0.125)));
        h *= factor;
        if (h < 1e-15) {
          break;
        }
      }
    }

    return { dtTaken: dt, dtNext: this.lastH, evals: totalEvals };
  }
}
