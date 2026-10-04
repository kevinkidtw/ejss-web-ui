import { describe, expect, it } from 'vitest';
import { Physics } from '../physics';

describe('Physics Module Tests', () => {
  describe('Vector math', () => {
    it('performs basic vector operations', () => {
      const a = Physics.Vector.create(3, 4);
      const b = Physics.Vector.create(1, 2);

      expect(Physics.Vector.mag(a)).toBeCloseTo(5.0);
      expect(Physics.Vector.dot(a, b)).toBe(3 * 1 + 4 * 2);
      expect(Physics.Vector.dist(a, b)).toBeCloseTo(Math.hypot(2, 2));

      const sum = Physics.Vector.add(a, b);
      expect(sum).toEqual({ x: 4, y: 6 });

      const diff = Physics.Vector.sub(a, b);
      expect(diff).toEqual({ x: 2, y: 2 });

      const normA = Physics.Vector.norm(a);
      expect(Physics.Vector.mag(normA)).toBeCloseTo(1.0);
    });

    it('reflects vectors off normals correctly', () => {
      const v = Physics.Vector.create(1, -1);
      const normal = Physics.Vector.create(0, 1); // floor normal pointing up
      const reflected = Physics.Vector.reflect(v, normal);
      expect(reflected.x).toBeCloseTo(1);
      expect(reflected.y).toBeCloseTo(1);
    });
  });

  describe('Forces', () => {
    it('calculates Newtonian gravity with inverse square law', () => {
      const f1 = Physics.Forces.gravity(0, 0, 10, 2, 0, 5, 1.0, 0);
      expect(f1.fy).toBeCloseTo(0);
      // F = G * m1 * m2 / r^2 = 1.0 * 10 * 5 / 4 = 12.5 pointing in +x direction
      expect(f1.fx).toBeCloseTo(12.5);
    });

    it('calculates 2D Lorentz force q(E + v x B)', () => {
      // Particle moving in +x at speed 2 with B in +z direction (Bz = 3)
      // v x B in 2D gives F_y = -q * vx * Bz = -1 * 2 * 3 = -6
      const f = Physics.Forces.lorentz(2, 0, 1, 0, 0, 3);
      expect(f.fx).toBeCloseTo(0);
      expect(f.fy).toBeCloseTo(-6.0);
    });

    it('calculates damped Hooke spring force with Newton third law', () => {
      const s = Physics.Forces.spring(0, 0, 2, 0, 1, 10, 0);
      // dist = 2, restLength = 1 -> delta = 1, k = 10 -> force on 1 points towards 2 (+x) with magnitude 10
      expect(s.fx1).toBeCloseTo(10);
      expect(s.fx2).toBeCloseTo(-10);
    });
  });

  describe('Collision', () => {
    it('conserves momentum and kinetic energy in 2-circle elastic collision', () => {
      const p1 = { x: 0, y: 0 };
      const v1 = { x: 2, y: 0 };
      const m1 = 1.0;
      const r1 = 0.5;

      const p2 = { x: 0.8, y: 0 }; // overlapping along x-axis
      const v2 = { x: 0, y: 0 };
      const m2 = 2.0;
      const r2 = 0.5;

      const initialPx = m1 * v1.x + m2 * v2.x;
      const initialKE = 0.5 * m1 * v1.x * v1.x + 0.5 * m2 * v2.x * v2.x;

      const J = Physics.Collision.resolveCircles(p1, v1, m1, r1, p2, v2, m2, r2, 1.0);
      expect(J).toBeGreaterThan(0);

      const finalPx = m1 * v1.x + m2 * v2.x;
      const finalKE = 0.5 * m1 * v1.x * v1.x + 0.5 * m2 * v2.x * v2.x;

      expect(finalPx).toBeCloseTo(initialPx, 8);
      expect(finalKE).toBeCloseTo(initialKE, 8);
    });

    it('resolves box boundaries with restitution', () => {
      const pos = { x: 4.8, y: 0 };
      const vel = { x: 3.0, y: 1.0 };
      const bounds = { minX: -5, maxX: 5, minY: -5, maxY: 5 };
      const radius = 0.5;

      // pos.x + radius = 5.3 > 5.0 -> hits right wall
      const impulse = Physics.Collision.resolveBox(pos, vel, radius, bounds, 0.8);
      expect(impulse).toBeGreaterThan(0);
      expect(pos.x).toBeCloseTo(4.5);
      expect(vel.x).toBeCloseTo(-2.4); // -3.0 * 0.8
    });
  });

  describe('Thermodynamics & ParticleSystem', () => {
    it('samples Maxwell-Boltzmann distribution and computes accurate temperature', () => {
      const N = 500;
      const targetT = 2.5;
      const vx = new Float64Array(N);
      const vy = new Float64Array(N);

      for (let i = 0; i < N; i++) {
        const v = Physics.Thermo.sampleMaxwellBoltzmann2D(targetT, 1.0);
        vx[i] = v.vx;
        vy[i] = v.vy;
      }

      const measuredT = Physics.Thermo.temperature2D(vx, vy, N, 1.0);
      // Law of large numbers: measured temperature within 15% of target for N=500
      expect(Math.abs(measuredT - targetT) / targetT).toBeLessThan(0.15);
    });

    it('operates ParticleSystem over multiple steps without NaNs or crashes', () => {
      const ps = Physics.createParticleSystem({
        count: 50,
        bounds: { minX: -3, maxX: 3, minY: -3, maxY: 3 },
        radius: 0.1,
        temperature: 1.5,
        restitution: 1.0,
      });

      for (let step = 0; step < 100; step++) {
        ps.step(0.02, 1.5);
      }

      expect(Number.isFinite(ps.getTemperature())).toBe(true);
      expect(ps.getTemperature()).toBeGreaterThan(0.5);
      expect(Number.isFinite(ps.getKineticEnergy())).toBe(true);
    });
  });

  describe('Field Lines', () => {
    it('traces electric field line from positive charge', () => {
      const charges = [
        { x: -1, y: 0, q: 1.0 }, // positive charge
        { x: 1, y: 0, q: -1.0 }, // negative charge
      ];

      const line = Physics.Fields.traceFieldLine(
        -0.8,
        0,
        charges,
        0.05,
        200,
        { minX: -5, maxX: 5, minY: -5, maxY: 5 }
      );

      expect(line.length).toBeGreaterThan(5);
      // Line moves towards positive x (towards negative charge at x=1)
      expect(line[line.length - 1][0]).toBeGreaterThan(-0.8);
    });
  });
});
