/**
 * Field line tracing and vector field utilities.
 */

export interface PointCharge {
  x: number;
  y: number;
  q: number;
}

export const Fields = {
  /**
   * Evaluates electric field vector (Ex, Ey) at point (x, y) due to point charges.
   */
  electricField(
    x: number,
    y: number,
    charges: PointCharge[],
    k = 1.0,
    softening = 1e-3
  ): { ex: number; ey: number } {
    let ex = 0;
    let ey = 0;

    for (let i = 0; i < charges.length; i++) {
      const c = charges[i];
      const dx = x - c.x;
      const dy = y - c.y;
      const rSq = dx * dx + dy * dy + softening * softening;
      const r = Math.sqrt(rSq);
      const factor = (k * c.q) / (rSq * r);
      ex += dx * factor;
      ey += dy * factor;
    }

    return { ex, ey };
  },

  /**
   * Traces an electric field line from (startX, startY) using RK2/RK4 streamline integration.
   * Returns an array of [x, y] coordinates.
   */
  traceFieldLine(
    startX: number,
    startY: number,
    charges: PointCharge[],
    stepSize = 0.05,
    maxSteps = 400,
    bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 }
  ): [number, number][] {
    const points: [number, number][] = [[startX, startY]];
    let cx = startX;
    let cy = startY;

    for (let s = 0; s < maxSteps; s++) {
      // RK2 midpoint step
      const f1 = Fields.electricField(cx, cy, charges);
      const mag1 = Math.sqrt(f1.ex * f1.ex + f1.ey * f1.ey);
      if (mag1 < 1e-6) break;

      const dirX1 = f1.ex / mag1;
      const dirY1 = f1.ey / mag1;

      const midX = cx + 0.5 * stepSize * dirX1;
      const midY = cy + 0.5 * stepSize * dirY1;

      const f2 = Fields.electricField(midX, midY, charges);
      const mag2 = Math.sqrt(f2.ex * f2.ex + f2.ey * f2.ey);
      if (mag2 < 1e-6) break;

      const dirX2 = f2.ex / mag2;
      const dirY2 = f2.ey / mag2;

      cx += stepSize * dirX2;
      cy += stepSize * dirY2;

      points.push([cx, cy]);

      // Check boundary
      if (
        cx < bounds.minX ||
        cx > bounds.maxX ||
        cy < bounds.minY ||
        cy > bounds.maxY
      ) {
        break;
      }

      // Check proximity to negative charges (line terminates on negative charge)
      let reachedCharge = false;
      for (let i = 0; i < charges.length; i++) {
        const c = charges[i];
        if (c.q < 0) {
          const dx = cx - c.x;
          const dy = cy - c.y;
          if (dx * dx + dy * dy < (stepSize * 1.5) ** 2) {
            reachedCharge = true;
            break;
          }
        }
      }
      if (reachedCharge) break;
    }

    return points;
  },
};
