/**
 * Statistical thermodynamics and kinetic theory calculations.
 */

export const Thermo = {
  /**
   * Generates a 2D velocity vector sampled from a Maxwell-Boltzmann distribution
   * at temperature T (in units where kB = 1).
   * v_x, v_y ~ Normal(0, sigma^2) with sigma = sqrt(T / m).
   */
  sampleMaxwellBoltzmann2D(
    temperature: number,
    mass = 1.0
  ): { vx: number; vy: number; speed: number } {
    const sigma = Math.sqrt(Math.max(1e-6, temperature) / Math.max(1e-6, mass));
    // Box-Muller transform
    const u1 = Math.max(1e-10, Math.random());
    const u2 = Math.random();
    const r = sigma * Math.sqrt(-2 * Math.log(u1));
    const theta = 2 * Math.PI * u2;
    const vx = r * Math.cos(theta);
    const vy = r * Math.sin(theta);
    return { vx, vy, speed: r };
  },

  /**
   * Calculates temperature of a 2D gas from velocities (kB = 1):
   * T = <1/2 * m * v^2> = sum(1/2 * m * (vx^2 + vy^2)) / N
   */
  temperature2D(
    vx: Float64Array | number[],
    vy: Float64Array | number[],
    count: number,
    mass = 1.0
  ): number {
    if (count <= 0) return 0;
    let sumKE = 0;
    for (let i = 0; i < count; i++) {
      sumKE += 0.5 * mass * (vx[i] * vx[i] + vy[i] * vy[i]);
    }
    return sumKE / count;
  },

  /**
   * Calculates pressure from accumulated wall impulse:
   * P = totalImpulse / (timeElapsed * wallPerimeter)
   */
  pressure(totalImpulse: number, timeElapsed: number, wallPerimeter: number): number {
    if (timeElapsed <= 0 || wallPerimeter <= 0) return 0;
    return totalImpulse / (timeElapsed * wallPerimeter);
  },

  /**
   * Berendsen thermostat: smooth, physical temperature coupling.
   * Scales velocities by factor lambda:
   * lambda = sqrt(1 + (dt / tau) * (T_target / T_current - 1))
   */
  applyBerendsenThermostat(
    vx: Float64Array | number[],
    vy: Float64Array | number[],
    count: number,
    targetT: number,
    currentT: number,
    dt: number,
    tau = 0.5
  ): number {
    if (count <= 0 || currentT <= 1e-6 || targetT <= 0) return 1.0;
    const ratio = targetT / currentT;
    const lambdaSq = 1 + (dt / Math.max(dt, tau)) * (ratio - 1);
    const lambda = Math.min(1.2, Math.max(0.8, Math.sqrt(Math.max(0.01, lambdaSq))));

    for (let i = 0; i < count; i++) {
      vx[i] *= lambda;
      vy[i] *= lambda;
    }
    return lambda;
  },
};
