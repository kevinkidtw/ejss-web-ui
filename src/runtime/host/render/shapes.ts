import { THEME } from '../theme';

export interface DrawingHelpers {
  toPixX: (x: number) => number;
  toPixY: (y: number) => number;
  toPixLen: (l: number) => number;
  W: number;
  H: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function drawShape2D(
  ctx: CanvasRenderingContext2D,
  helpers: DrawingHelpers,
  props: {
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;
    fillColor?: string;
    lineColor?: string;
    transformation?: number;
    shapeType?: string;
  }
): void {
  const { toPixX, toPixY, toPixLen } = helpers;
  const sx = toPixLen(props.sizeX || 0.3);
  const sy = toPixLen(props.sizeY || 0.3);
  const px = toPixX(props.x || 0);
  const py = toPixY(props.y || 0);
  const fill = (props.fillColor || THEME.primary).replace(/^"|"$/g, '');
  const line = (props.lineColor || THEME.textInk).replace(/^"|"$/g, '');
  const angle = props.transformation || 0;
  const shape = props.shapeType || 'ELLIPSE';

  ctx.save();
  ctx.translate(px, py);
  if (angle) {
    ctx.rotate(-angle); // negative = CCW in screen coords
  }
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = fill;

  if (shape === 'ELLIPSE' || shape === 'WHEEL') {
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(sx, 2), Math.max(sy, 2), 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    if (shape === 'WHEEL') {
      ctx.beginPath();
      ctx.moveTo(0, -sy);
      ctx.lineTo(0, sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-sx, 0);
      ctx.lineTo(sx, 0);
      ctx.stroke();
    }
  } else {
    ctx.fillRect(-sx, -sy, sx * 2, sy * 2);
    ctx.strokeRect(-sx, -sy, sx * 2, sy * 2);
  }

  ctx.restore();
}

export function drawSpring2D(
  ctx: CanvasRenderingContext2D,
  helpers: DrawingHelpers,
  props: {
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;
    lineColor?: string;
  }
): void {
  const { toPixX, toPixY } = helpers;
  const x0 = toPixX(props.x || 0);
  const y0 = toPixY(props.y || 0);
  const x1 = toPixX((props.x || 0) + (props.sizeX || 2));
  const y1 = toPixY((props.y || 0) + (props.sizeY || 0));
  const color = (props.lineColor || THEME.textMuted).replace(/^"|"$/g, '');

  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const coils = 8;
  const amp = 8;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= coils * 10; i++) {
    const t = i / (coils * 10);
    const s = Math.sin(t * coils * 2 * Math.PI) * amp;
    const px = x0 + t * dx + s * nx;
    const py = y0 + t * dy + s * ny;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.restore();
}

export function drawArrow2D(
  ctx: CanvasRenderingContext2D,
  helpers: DrawingHelpers,
  props: {
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;
    fillColor?: string;
    lineColor?: string;
  }
): void {
  const { toPixX, toPixY } = helpers;
  const ax = props.x || 0;
  const ay = props.y || 0;
  const vx = props.sizeX || 1;
  const vy = props.sizeY || 0;
  const apx = toPixX(ax);
  const apy = toPixY(ay);
  const ex = toPixX(ax + vx);
  const ey = toPixY(ay + vy);
  const color = (props.fillColor || props.lineColor || THEME.danger).replace(/^"|"$/g, '');

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(apx, apy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const ang = Math.atan2(ey - apy, ex - apx);
  const aLen = 8;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - aLen * Math.cos(ang - 0.4), ey - aLen * Math.sin(ang - 0.4));
  ctx.lineTo(ex - aLen * Math.cos(ang + 0.4), ey - aLen * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawTrail2D(
  ctx: CanvasRenderingContext2D,
  helpers: DrawingHelpers,
  pts: [number, number][],
  lineColor?: string
): void {
  if (pts.length < 2) return;
  const { toPixX, toPixY } = helpers;
  const color = (lineColor || THEME.primary).replace(/^"|"$/g, '');

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = toPixX(pts[i][0]);
    const py = toPixY(pts[i][1]);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.restore();
}

export type VectorFieldFn = (x: number, y: number) => number;

export function createVectorFieldRenderer(
  ctx: CanvasRenderingContext2D,
  helpers: DrawingHelpers
) {
  const { minX, maxX, minY, maxY, toPixX, toPixY, toPixLen } = helpers;

  return function drawVectorField(
    fnFx: VectorFieldFn,
    fnFy: VectorFieldFn,
    stepX?: number,
    stepY?: number,
    color?: string
  ): void {
    const col = color || THEME.gridLinesLight;
    ctx.save();
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 1;

    const sx = stepX || (maxX - minX) / 15;
    const sy = stepY || (maxY - minY) / 15;

    for (let wx = minX + sx / 2; wx <= maxX; wx += sx) {
      for (let wy = minY + sy / 2; wy <= maxY; wy += sy) {
        let fx = 0;
        let fy = 0;
        try {
          fx = fnFx(wx, wy);
          fy = fnFy(wx, wy);
        } catch {
          // ignore evaluation error in vector field
        }
        const len = Math.sqrt(fx * fx + fy * fy);
        if (len < 1e-6) continue;

        const maxArrowLen = Math.min(toPixLen(sx), toPixLen(sy)) * 0.7;
        const arrowLen = Math.min(toPixLen(len), maxArrowLen);
        const dx = (fx / len) * arrowLen;
        const dy = (fy / len) * arrowLen;
        const px = toPixX(wx);
        const py = toPixY(wy);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + dx, py - dy);
        ctx.stroke();

        const ang = Math.atan2(-dy, dx);
        const aLen = 4;
        ctx.beginPath();
        ctx.moveTo(px + dx, py - dy);
        ctx.lineTo(px + dx - aLen * Math.cos(ang - 0.4), py - dy - aLen * Math.sin(ang - 0.4));
        ctx.lineTo(px + dx - aLen * Math.cos(ang + 0.4), py - dy - aLen * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  };
}
