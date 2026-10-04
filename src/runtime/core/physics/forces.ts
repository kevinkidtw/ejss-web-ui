/**
 * Classical force calculation utilities.
 */

export const Forces = {
  /**
   * Gravitational force between two bodies: F = G * m1 * m2 / (r^2 + eps^2)
   * Returns force acting ON body 1 (pulling towards body 2).
   */
  gravity(
    x1: number,
    y1: number,
    m1: number,
    x2: number,
    y2: number,
    m2: number,
    G = 1.0,
    softening = 1e-4
  ): { fx: number; fy: number } {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const rSq = dx * dx + dy * dy + softening * softening;
    const r = Math.sqrt(rSq);
    const mag = (G * m1 * m2) / (rSq * r);
    return { fx: dx * mag, fy: dy * mag };
  },

  /**
   * Electrostatic Coulomb force between two charges.
   * Positive product (same sign) repels: force on charge 1 points AWAY from charge 2.
   */
  coulomb(
    x1: number,
    y1: number,
    q1: number,
    x2: number,
    y2: number,
    q2: number,
    k = 8.98755e9,
    softening = 1e-4
  ): { fx: number; fy: number } {
    const dx = x1 - x2; // away from charge 2
    const dy = y1 - y2;
    const rSq = dx * dx + dy * dy + softening * softening;
    const r = Math.sqrt(rSq);
    const mag = (k * q1 * q2) / (rSq * r);
    return { fx: dx * mag, fy: dy * mag };
  },

  /**
   * 2D Lorentz force: F = q * (E + v x B)
   * With magnetic field perpendicular to plane: B = (0, 0, Bz)
   * v x B = (vy * Bz, -vx * Bz, 0)
   */
  lorentz(
    vx: number,
    vy: number,
    q: number,
    ex = 0,
    ey = 0,
    bz = 0
  ): { fx: number; fy: number } {
    const fx = q * (ex + vy * bz);
    const fy = q * (ey - vx * bz);
    return { fx, fy };
  },

  /**
   * Damped Hooke's law spring force between two points.
   * Returns force acting on particle 1. (Force on particle 2 is equal and opposite).
   */
  spring(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    restLength = 0,
    k = 10,
    damping = 0,
    vx1 = 0,
    vy1 = 0,
    vx2 = 0,
    vy2 = 0
  ): { fx1: number; fy1: number; fx2: number; fy2: number } {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    const nx = dx / dist;
    const ny = dy / dist;

    // Elastic force: pull towards x2 if dist > restLength
    const delta = dist - restLength;
    let fMag = k * delta;

    // Damping: relative velocity along spring axis
    if (damping > 0) {
      const relVx = vx2 - vx1;
      const relVy = vy2 - vy1;
      const relVproj = relVx * nx + relVy * ny;
      fMag += damping * relVproj;
    }

    const fx1 = fMag * nx;
    const fy1 = fMag * ny;
    return { fx1, fy1, fx2: -fx1, fy2: -fy1 };
  },

  /**
   * Fluid / air drag force.
   * quadratic = false: linear Stokes drag F = -k * v
   * quadratic = true: quadratic drag F = -k * |v| * v
   */
  drag(vx: number, vy: number, k: number, quadratic = false): { fx: number; fy: number } {
    if (!quadratic) {
      return { fx: -k * vx, fy: -k * vy };
    }
    const speed = Math.sqrt(vx * vx + vy * vy);
    return { fx: -k * speed * vx, fy: -k * speed * vy };
  },
};
