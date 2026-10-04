import { describe, expect, it } from 'vitest';
import {
  EulerSolver,
  Rk4Solver,
  Rk45Solver,
  Rkf78Solver,
  VerletSolver,
  Yoshida4Solver,
} from '../solvers';
import type { OdeSystem, Solver } from '../types';

describe('Solvers Convergence Order (Item 2)', () => {
  // Simple Harmonic Oscillator: x'' = -x, x(0) = 1, v(0) = 0 => x(t) = cos(t), v(t) = -sin(t)
  const createShoSystem = (): OdeSystem => ({
    dim: 2,
    pairs: [[0, 1]],
    free: [],
    f: (_t, y, out) => {
      out[0] = y[1];
      out[1] = -y[0];
    },
  });

  function integrateSho(
    solverFactory: (dim: number) => Solver,
    dt: number,
    tEnd: number
  ): number {
    const sys = createShoSystem();
    const solver = solverFactory(2);
    const y = new Float64Array([1, 0]);
    let t = 0;
    const steps = Math.round(tEnd / dt);
    const actualDt = tEnd / steps;

    for (let s = 0; s < steps; s++) {
      solver.step(sys, t, y, actualDt, 1e-12);
      t += actualDt;
    }

    const exactX = Math.cos(tEnd);
    return Math.abs(y[0] - exactX);
  }

  it('measures Euler convergence order ≈ 1 (±0.3)', () => {
    const err1 = integrateSho((d) => new EulerSolver(d), 0.05, 1.0);
    const err2 = integrateSho((d) => new EulerSolver(d), 0.025, 1.0);
    const order = Math.log2(err1 / err2);
    expect(order).toBeGreaterThanOrEqual(1 - 0.3);
    expect(order).toBeLessThanOrEqual(1 + 0.3);
  });

  it('measures Verlet convergence order ≈ 2 (±0.3)', () => {
    const err1 = integrateSho((d) => new VerletSolver(d), 0.05, 1.0);
    const err2 = integrateSho((d) => new VerletSolver(d), 0.025, 1.0);
    const order = Math.log2(err1 / err2);
    expect(order).toBeGreaterThanOrEqual(2 - 0.3);
    expect(order).toBeLessThanOrEqual(2 + 0.3);
  });

  it('measures RK4 convergence order ≈ 4 (±0.3)', () => {
    const err1 = integrateSho((d) => new Rk4Solver(d), 0.1, 1.0);
    const err2 = integrateSho((d) => new Rk4Solver(d), 0.05, 1.0);
    const order = Math.log2(err1 / err2);
    expect(order).toBeGreaterThanOrEqual(4 - 0.3);
    expect(order).toBeLessThanOrEqual(4 + 0.3);
  });

  it('measures Yoshida4 convergence order ≈ 4 (±0.3)', () => {
    const err1 = integrateSho((d) => new Yoshida4Solver(d), 0.1, 1.0);
    const err2 = integrateSho((d) => new Yoshida4Solver(d), 0.05, 1.0);
    const order = Math.log2(err1 / err2);
    expect(order).toBeGreaterThanOrEqual(4 - 0.3);
    expect(order).toBeLessThanOrEqual(4 + 0.3);
  });
});

describe('Adaptive Solvers Accuracy (Item 3)', () => {
  const createShoSystem = (): OdeSystem => ({
    dim: 2,
    pairs: [[0, 1]],
    free: [],
    f: (_t, y, out) => {
      out[0] = y[1];
      out[1] = -y[0];
    },
  });

  it('RK45 achieves error < 1e-8 for SHO at t=10 with tol=1e-10 and reasonable evaluations', () => {
    const sys = createShoSystem();
    const solver = new Rk45Solver(2);
    const y = new Float64Array([1, 0]);
    let t = 0;
    const dt = 0.5;
    let totalEvals = 0;

    while (t < 10 - 1e-12) {
      const step = Math.min(dt, 10 - t);
      const res = solver.step(sys, t, y, step, 1e-10);
      totalEvals += res.evals;
      t += step;
    }

    const err = Math.abs(y[0] - Math.cos(10));
    expect(err).toBeLessThan(1e-8);
    // Reasonable call count for interval [0, 10] with tol=1e-10
    expect(totalEvals).toBeGreaterThan(50);
    expect(totalEvals).toBeLessThan(10000);
  });

  it('Fehlberg78 achieves error < 1e-8 for SHO at t=10 with tol=1e-10 and reasonable evaluations', () => {
    const sys = createShoSystem();
    const solver = new Rkf78Solver(2);
    const y = new Float64Array([1, 0]);
    let t = 0;
    const dt = 0.5;
    let totalEvals = 0;

    while (t < 10 - 1e-12) {
      const step = Math.min(dt, 10 - t);
      const res = solver.step(sys, t, y, step, 1e-10);
      totalEvals += res.evals;
      t += step;
    }

    const err = Math.abs(y[0] - Math.cos(10));
    expect(err).toBeLessThan(1e-8);
    // 7(8) order method should use fewer steps than 5(4)
    expect(totalEvals).toBeGreaterThan(30);
    expect(totalEvals).toBeLessThan(5000);
  });
});

describe('Energy Conservation / Drift in Kepler Orbit (Item 4)', () => {
  // Kepler circular orbit: GM=1, r=1, v=1, Period T = 2*pi
  // State: [x, y, vx, vy], pairs: [0, 2], [1, 3]
  // Energy E = 0.5 * (vx^2 + vy^2) - 1 / sqrt(x^2 + y^2) = 0.5 - 1 = -0.5
  const createKeplerSystem = (): OdeSystem => ({
    dim: 4,
    pairs: [
      [0, 2],
      [1, 3],
    ],
    free: [],
    f: (_t, y, out) => {
      const r = Math.sqrt(y[0] * y[0] + y[1] * y[1]);
      const r3 = r * r * r;
      out[0] = y[2];
      out[1] = y[3];
      out[2] = -y[0] / r3;
      out[3] = -y[1] / r3;
    },
  });

  function calcKeplerEnergy(y: Float64Array): number {
    const r = Math.sqrt(y[0] * y[0] + y[1] * y[1]);
    const vSq = y[2] * y[2] + y[3] * y[3];
    return 0.5 * vSq - 1.0 / r;
  }

  const initialE = -0.5;
  const dt = 0.01;
  const numPeriods = 1000;
  const tEnd = numPeriods * 2 * Math.PI;
  const totalSteps = Math.round(tEnd / dt);

  it('Verlet relative energy drift < 1e-4 over 1000 periods', () => {
    const sys = createKeplerSystem();
    const solver = new VerletSolver(4);
    const y = new Float64Array([1, 0, 0, 1]);
    let t = 0;

    for (let s = 0; s < totalSteps; s++) {
      solver.step(sys, t, y, dt, 1e-8);
      t += dt;
    }

    const finalE = calcKeplerEnergy(y);
    const relDrift = Math.abs(finalE - initialE) / Math.abs(initialE);
    expect(relDrift).toBeLessThan(1e-4);
  });

  it('Yoshida4 relative energy drift < 1e-4 over 1000 periods', () => {
    const sys = createKeplerSystem();
    const solver = new Yoshida4Solver(4);
    const y = new Float64Array([1, 0, 0, 1]);
    let t = 0;

    for (let s = 0; s < totalSteps; s++) {
      solver.step(sys, t, y, dt, 1e-8);
      t += dt;
    }

    const finalE = calcKeplerEnergy(y);
    const relDrift = Math.abs(finalE - initialE) / Math.abs(initialE);
    expect(relDrift).toBeLessThan(1e-4);
  });

  it('Euler significantly diverges as contrast', () => {
    const sys = createKeplerSystem();
    const solver = new EulerSolver(4);
    const y = new Float64Array([1, 0, 0, 1]);
    let t = 0;

    // Run only 5 periods because Euler quickly spirals out
    const eulerSteps = Math.round((5 * 2 * Math.PI) / dt);
    for (let s = 0; s < eulerSteps; s++) {
      solver.step(sys, t, y, dt, 1e-8);
      t += dt;
    }

    const finalE = calcKeplerEnergy(y);
    const relDrift = Math.abs(finalE - initialE) / Math.abs(initialE);
    // Euler will have huge drift (> 0.1 even after 5 periods)
    expect(relDrift).toBeGreaterThan(0.1);
  });
});
