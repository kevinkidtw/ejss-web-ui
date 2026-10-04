import { THEME } from '../theme';
import { drawGrid } from './grid';
import type { DrawingHelpers } from './shapes';

export interface DrawingPanelState {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  logicalW: number;
  logicalH: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  background: string;
}

export function createDrawingPanel(
  canvas: HTMLCanvasElement,
  id: string,
  name: string,
  props: Record<string, string>
): DrawingPanelState {
  const minX = parseFloat(props.MinimumX ?? '-5');
  const maxX = parseFloat(props.MaximumX ?? '5');
  const minY = parseFloat(props.MinimumY ?? '-5');
  const maxY = parseFloat(props.MaximumY ?? '5');
  const bgRaw = (props.Background ?? '').replace(/^"|"$/g, '').trim();
  const background = bgRaw || THEME.defaultCanvasBg;

  const dpr = window.devicePixelRatio || 1;
  const logicalW = canvas.width || 400;
  const logicalH = canvas.height || 400;

  canvas.width = logicalW * dpr;
  canvas.height = logicalH * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  return {
    id,
    name,
    canvas,
    ctx,
    logicalW,
    logicalH,
    minX,
    maxX,
    minY,
    maxY,
    background,
  };
}

export function getDrawingHelpers(panel: DrawingPanelState): DrawingHelpers {
  const { logicalW, logicalH, minX, maxX, minY, maxY } = panel;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  return {
    W: logicalW,
    H: logicalH,
    minX,
    maxX,
    minY,
    maxY,
    toPixX: (x: number) => ((x - minX) / spanX) * logicalW,
    toPixY: (y: number) => logicalH - ((y - minY) / spanY) * logicalH,
    toPixLen: (l: number) => (Math.abs(l) / spanX) * logicalW,
  };
}

export function toWorldX(panel: DrawingPanelState, px: number): number {
  return panel.minX + (px / panel.logicalW) * (panel.maxX - panel.minX);
}

export function toWorldY(panel: DrawingPanelState, py: number): number {
  return panel.minY + ((panel.logicalH - py) / panel.logicalH) * (panel.maxY - panel.minY);
}

export function toWorldLen(panel: DrawingPanelState, pl: number): number {
  return (pl / panel.logicalW) * (panel.maxX - panel.minX);
}

export function clearAndDrawGrid(panel: DrawingPanelState): void {
  const { ctx, logicalW, logicalH, minX, maxX, minY, maxY, background } = panel;
  ctx.clearRect(0, 0, logicalW, logicalH);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, logicalW, logicalH);

  const helpers = getDrawingHelpers(panel);
  drawGrid({
    ctx,
    W: logicalW,
    H: logicalH,
    minX,
    maxX,
    minY,
    maxY,
    toPixX: helpers.toPixX,
    toPixY: helpers.toPixY,
    bgColStr: background,
  });
}
