/**
 * Collision detection and resolution algorithms.
 */

export interface BoxBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const Collision = {
  /**
   * Resolves elastic/inelastic collision between two circles.
   * Modifies velocities in place and separates overlapping circles.
   * Returns impulse magnitude (0 if no collision).
   */
  resolveCircles(
    p1: { x: number; y: number },
    v1: { x: number; y: number },
    m1: number,
    r1: number,
    p2: { x: number; y: number },
    v2: { x: number; y: number },
    m2: number,
    r2: number,
    restitution = 1.0
  ): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distSq = dx * dx + dy * dy;
    const minDist = r1 + r2;

    if (distSq >= minDist * minDist || distSq === 0) {
      return 0;
    }

    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const ny = dy / dist;

    // Separate overlapping circles proportional to inverse mass
    const overlap = minDist - dist;
    const invM1 = m1 > 0 ? 1 / m1 : 0;
    const invM2 = m2 > 0 ? 1 / m2 : 0;
    const totalInvM = invM1 + invM2;
    if (totalInvM > 0) {
      const sep = overlap / totalInvM;
      p1.x -= nx * sep * invM1;
      p1.y -= ny * sep * invM1;
      p2.x += nx * sep * invM2;
      p2.y += ny * sep * invM2;
    }

    // Relative velocity along collision normal
    const relVx = v1.x - v2.x;
    const relVy = v1.y - v2.y;
    const vn = relVx * nx + relVy * ny;

    // Moving apart already
    if (vn <= 0) {
      return 0;
    }

    // Impulse scalar: J = -(1 + e) * vn / (1/m1 + 1/m2)
    const J = ((1 + restitution) * vn) / (totalInvM || 1);

    v1.x -= J * invM1 * nx;
    v1.y -= J * invM1 * ny;
    v2.x += J * invM2 * nx;
    v2.y += J * invM2 * ny;

    return J;
  },

  /**
   * Resolves collision of a circle with rectangular box bounds.
   * Returns total normal impulse delivered to the walls.
   */
  resolveBox(
    pos: { x: number; y: number },
    vel: { x: number; y: number },
    radius: number,
    bounds: BoxBounds,
    restitution = 1.0,
    friction = 0.0
  ): number {
    let impulse = 0;

    // Left wall
    if (pos.x - radius < bounds.minX) {
      pos.x = bounds.minX + radius;
      if (vel.x < 0) {
        impulse += (1 + restitution) * Math.abs(vel.x);
        vel.x = -vel.x * restitution;
        vel.y *= 1 - friction;
      }
    }
    // Right wall
    else if (pos.x + radius > bounds.maxX) {
      pos.x = bounds.maxX - radius;
      if (vel.x > 0) {
        impulse += (1 + restitution) * Math.abs(vel.x);
        vel.x = -vel.x * restitution;
        vel.y *= 1 - friction;
      }
    }

    // Bottom wall
    if (pos.y - radius < bounds.minY) {
      pos.y = bounds.minY + radius;
      if (vel.y < 0) {
        impulse += (1 + restitution) * Math.abs(vel.y);
        vel.y = -vel.y * restitution;
        vel.x *= 1 - friction;
      }
    }
    // Top wall
    else if (pos.y + radius > bounds.maxY) {
      pos.y = bounds.maxY - radius;
      if (vel.y > 0) {
        impulse += (1 + restitution) * Math.abs(vel.y);
        vel.y = -vel.y * restitution;
        vel.x *= 1 - friction;
      }
    }

    return impulse;
  },

  /**
   * Fast uniform spatial grid for O(N) multi-particle collision detection.
   */
  resolveParticleArrays(
    px: Float64Array | number[],
    py: Float64Array | number[],
    vx: Float64Array | number[],
    vy: Float64Array | number[],
    count: number,
    radius: number,
    mass = 1.0,
    bounds?: BoxBounds,
    restitution = 1.0
  ): { wallImpulse: number; pairCollisions: number } {
    let totalWallImpulse = 0;
    let collisionsCount = 0;

    // 1. Box collisions
    if (bounds) {
      for (let i = 0; i < count; i++) {
        const p = { x: px[i], y: py[i] };
        const v = { x: vx[i], y: vy[i] };
        const imp = Collision.resolveBox(p, v, radius, bounds, restitution);
        px[i] = p.x;
        py[i] = p.y;
        vx[i] = v.x;
        vy[i] = v.y;
        totalWallImpulse += imp * mass;
      }
    }

    // 2. Inter-particle collision with spatial hash grid
    const cellSize = radius * 2.2;
    const grid = new Map<string, number[]>();

    const getKey = (x: number, y: number) => {
      const cx = Math.floor(x / cellSize);
      const cy = Math.floor(y / cellSize);
      return `${cx},${cy}`;
    };

    for (let i = 0; i < count; i++) {
      const key = getKey(px[i], py[i]);
      let cell = grid.get(key);
      if (!cell) {
        cell = [];
        grid.set(key, cell);
      }
      cell.push(i);
    }

    const minDist = radius * 2;
    const minDistSq = minDist * minDist;

    for (let i = 0; i < count; i++) {
      const cx = Math.floor(px[i] / cellSize);
      const cy = Math.floor(py[i] / cellSize);

      // Check adjacent 9 cells
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const neighborKey = `${cx + ox},${cy + oy}`;
          const cell = grid.get(neighborKey);
          if (!cell) continue;

          for (let k = 0; k < cell.length; k++) {
            const j = cell[k];
            if (j <= i) continue; // prevent duplicate pairs

            const dx = px[j] - px[i];
            const dy = py[j] - py[i];
            const dSq = dx * dx + dy * dy;

            if (dSq < minDistSq && dSq > 0) {
              const p1 = { x: px[i], y: py[i] };
              const v1 = { x: vx[i], y: vy[i] };
              const p2 = { x: px[j], y: py[j] };
              const v2 = { x: vx[j], y: vy[j] };

              const J = Collision.resolveCircles(
                p1,
                v1,
                mass,
                radius,
                p2,
                v2,
                mass,
                radius,
                restitution
              );

              if (J > 0) {
                px[i] = p1.x;
                py[i] = p1.y;
                vx[i] = v1.x;
                vy[i] = v1.y;
                px[j] = p2.x;
                py[j] = p2.y;
                vx[j] = v2.x;
                vy[j] = v2.y;
                collisionsCount++;
              }
            }
          }
        }
      }
    }

    return { wallImpulse: totalWallImpulse, pairCollisions: collisionsCount };
  },
};
