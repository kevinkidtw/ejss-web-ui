import { THEME, getGridTheme } from '../theme';

export interface GridParams {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  toPixX: (x: number) => number;
  toPixY: (y: number) => number;
  bgColStr: string;
}

function formatTick(val: number): string {
  const str = val.toFixed(1);
  return str.endsWith('.0') ? val.toFixed(0) : str;
}

export function drawGrid(params: GridParams): void {
  const { ctx, W, H, minX, maxX, minY, maxY, toPixX, toPixY, bgColStr } = params;
  const theme = getGridTheme(bgColStr);

  const spanX = maxX - minX;
  let interval: number;
  if (spanX <= 0.5) interval = 0.05;
  else if (spanX <= 1.5) interval = 0.2;
  else if (spanX <= 4) interval = 0.5;
  else if (spanX <= 12) interval = 1.0;
  else if (spanX <= 30) interval = 5.0;
  else interval = 10.0;

  ctx.save();

  // Grid lines
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1.0;

  const startX = Math.ceil(minX / interval) * interval;
  for (let x = startX; x <= maxX; x += interval) {
    if (Math.abs(x) < 1e-5) continue;
    const px = toPixX(x);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, H);
    ctx.stroke();
  }

  const startY = Math.ceil(minY / interval) * interval;
  for (let y = startY; y <= maxY; y += interval) {
    if (Math.abs(y) < 1e-5) continue;
    const py = toPixY(y);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W, py);
    ctx.stroke();
  }

  // Main axes (x = 0 and y = 0)
  ctx.strokeStyle = theme.axisLine;
  ctx.lineWidth = 1.5;
  const zx = toPixX(0);
  const zy = toPixY(0);

  if (zy > 0 && zy < H) {
    ctx.beginPath();
    ctx.moveTo(0, zy);
    ctx.lineTo(W, zy);
    ctx.stroke();
  }
  if (zx > 0 && zx < W) {
    ctx.beginPath();
    ctx.moveTo(zx, 0);
    ctx.lineTo(zx, H);
    ctx.stroke();
  }

  // Tick labels
  ctx.fillStyle = theme.tickLabel;
  ctx.font = `9px ${THEME.fontMono}`;

  // X-axis ticks
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let x = startX; x <= maxX; x += interval) {
    const px = toPixX(x);
    if (px > 10 && px < W - 10) {
      const yPos = zy > 0 && zy < H - 15 ? zy + 4 : H - 15;
      ctx.fillText(formatTick(x), px, yPos);
    }
  }

  // Y-axis ticks
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let y = startY; y <= maxY; y += interval) {
    const py = toPixY(y);
    if (py > 10 && py < H - 10) {
      const xPos = zx > 15 && zx < W - 5 ? zx - 4 : 20;
      ctx.fillText(formatTick(y), xPos, py);
    }
  }

  ctx.restore();
}
