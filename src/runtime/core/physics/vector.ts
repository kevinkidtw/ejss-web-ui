/**
 * 2D Vector math helpers for physical simulations.
 */
export interface Vec2 {
  x: number;
  y: number;
}

export const Vector = {
  create(x = 0, y = 0): Vec2 {
    return { x, y };
  },

  clone(v: Vec2): Vec2 {
    return { x: v.x, y: v.y };
  },

  set(out: Vec2, x: number, y: number): Vec2 {
    out.x = x;
    out.y = y;
    return out;
  },

  add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  sub(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  scale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s };
  },

  dot(a: Vec2, b: Vec2): number {
    return a.x * b.x + a.y * b.y;
  },

  /** 2D cross product scalar: a.x * b.y - a.y * b.x */
  cross(a: Vec2, b: Vec2): number {
    return a.x * b.y - a.y * b.x;
  },

  magSq(v: Vec2): number {
    return v.x * v.x + v.y * v.y;
  },

  mag(v: Vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  dist(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  distSq(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  },

  norm(v: Vec2): Vec2 {
    const m = Math.sqrt(v.x * v.x + v.y * v.y);
    if (m === 0) return { x: 0, y: 0 };
    return { x: v.x / m, y: v.y / m };
  },

  rotate(v: Vec2, angleRad: number): Vec2 {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos,
    };
  },

  angle(v: Vec2): number {
    return Math.atan2(v.y, v.x);
  },

  lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  },

  reflect(v: Vec2, normal: Vec2): Vec2 {
    const d = 2 * (v.x * normal.x + v.y * normal.y);
    return {
      x: v.x - d * normal.x,
      y: v.y - d * normal.y,
    };
  },
};
