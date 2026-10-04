import { THEME, isDarkColor } from '../theme';

export interface PlottingPanelState {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  logicalW: number;
  logicalH: number;
  title: string;
  axisX: string;
  axisYList: string[];
  background: string;
}

export interface PlotDataBuffer {
  xs: number[];
  series: Record<string, number[]>;
}

export function createPlottingPanel(
  canvas: HTMLCanvasElement,
  id: string,
  name: string,
  props: Record<string, string>
): PlottingPanelState {
  const dpr = window.devicePixelRatio || 1;
  const logicalW = canvas.width || 300;
  const logicalH = canvas.height || 200;

  canvas.width = logicalW * dpr;
  canvas.height = logicalH * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const title = (props.Title ?? '').replace(/^"|"$/g, '').trim();
  const axisXRaw = (props.AxisX ?? '').replace(/^"|"$/g, '').trim();
  const axisX = axisXRaw || 't';

  const axisYRaw = (props.AxisY ?? '').replace(/^"|"$/g, '').trim();
  const axisYList = axisYRaw
    ? axisYRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const bgRaw = (props.Background ?? '').replace(/^"|"$/g, '').trim();
  const background = bgRaw || '#FFFFFF';

  return {
    id,
    name,
    canvas,
    ctx,
    logicalW,
    logicalH,
    title,
    axisX,
    axisYList,
    background,
  };
}

export function createPlotDataBuffer(axisYList: string[]): PlotDataBuffer {
  const series: Record<string, number[]> = {};
  for (const y of axisYList) {
    series[y] = [];
  }
  return {
    xs: [],
    series,
  };
}

export function appendPlotDelta(
  buffer: PlotDataBuffer,
  delta: number[],
  axisYList: string[],
  capacity = 1000
): void {
  const rowLen = 1 + axisYList.length;
  if (rowLen === 0 || delta.length === 0) return;

  const rowCount = Math.floor(delta.length / rowLen);
  for (let r = 0; r < rowCount; r++) {
    const offset = r * rowLen;
    buffer.xs.push(delta[offset]);
    for (let i = 0; i < axisYList.length; i++) {
      const yName = axisYList[i];
      if (!buffer.series[yName]) {
        buffer.series[yName] = [];
      }
      buffer.series[yName].push(delta[offset + 1 + i]);
    }
  }

  // Enforce capacity
  const overflow = buffer.xs.length - capacity;
  if (overflow > 0) {
    buffer.xs.splice(0, overflow);
    for (const yName of axisYList) {
      if (buffer.series[yName]) {
        buffer.series[yName].splice(0, overflow);
      }
    }
  }
}

export function renderPlot(
  panel: PlottingPanelState,
  data: PlotDataBuffer,
  viewVars: Record<string, unknown>
): void {
  const { ctx, logicalW: W, logicalH: H, title, axisX, axisYList, background } = panel;
  const dark = isDarkColor(background);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(43, 45, 49, 0.07)';
  ctx.lineWidth = 0.5;
  for (let gi = 1; gi < 4; gi++) {
    ctx.beginPath();
    ctx.moveTo(0, (gi * H) / 4);
    ctx.lineTo(W, (gi * H) / 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((gi * W) / 4, 0);
    ctx.lineTo((gi * W) / 4, H);
    ctx.stroke();
  }

  // If no Y variables configured
  if (!axisYList.length) {
    ctx.fillStyle = dark ? THEME.tickLabelsDark : THEME.textMuted;
    ctx.font = `13px ${THEME.fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText('請在編輯器設定 Y 軸變數', W / 2, H / 2 - 10);
    ctx.font = `11px ${THEME.fontMono}`;
    ctx.fillText('(屬性 → 初始設定 → Y 軸變數)', W / 2, H / 2 + 12);
    return;
  }

  const xs = data.xs;
  if (!xs.length) {
    ctx.fillStyle = dark ? THEME.tickLabelsDark : THEME.textMuted;
    ctx.font = `14px ${THEME.fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText('執行模擬後顯示圖表', W / 2, H / 2);
    return;
  }

  const PAD = { t: 26, r: 10, b: 28, l: 10 };
  const pW = W - PAD.l - PAD.r;
  const pH = H - PAD.t - PAD.b;

  // Title
  if (title) {
    ctx.fillStyle = dark ? '#FFFFFF' : THEME.textInk;
    ctx.font = `bold 14px ${THEME.fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 18);
  }

  // Current x & t at bottom right
  ctx.fillStyle = dark ? THEME.tickLabelsDark : THEME.textMuted;
  ctx.font = `12px ${THEME.fontMono}`;
  ctx.textAlign = 'right';

  const tVal = typeof viewVars.t === 'number' ? (viewVars.t as number) : 0;
  if (axisX === 't') {
    ctx.fillText(`t=${tVal.toFixed(3)}`, W - PAD.r, H - 6);
  } else {
    const xVal = typeof viewVars[axisX] === 'number' ? (viewVars[axisX] as number) : 0;
    ctx.fillText(`${axisX}=${xVal.toFixed(2)}, t=${tVal.toFixed(2)}`, W - PAD.r, H - 6);
  }

  // Find minX and maxX
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] < minX) minX = xs[i];
    if (xs[i] > maxX) maxX = xs[i];
  }
  const spanX = maxX - minX || 1;

  // Plot lines for each Y series
  axisYList.forEach((yName, vi) => {
    const vals = data.series[yName];
    if (!vals || vals.length < 2) return;

    let minV = Infinity;
    let maxV = -Infinity;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] < minV) minV = vals[i];
      if (vals[i] > maxV) maxV = vals[i];
    }
    const spanY = maxV - minV || 1;
    const strokeColor = THEME.plotPalette[vi % THEME.plotPalette.length];

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    // Glow removed per spec
    ctx.beginPath();
    const n = vals.length;
    for (let fi = 0; fi < n; fi++) {
      const px = PAD.l + ((xs[fi] - minX) / spanX) * pW;
      const py = PAD.t + (1 - (vals[fi] - minV) / spanY) * pH;
      if (fi === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    ctx.restore();

    // Legend item at bottom: variable name + latest value
    ctx.fillStyle = strokeColor;
    ctx.font = `bold 12px ${THEME.fontMono}`;
    ctx.textAlign = 'left';
    const lastVal = vals[vals.length - 1];
    const legendX = PAD.l + vi * Math.min(pW / Math.max(axisYList.length, 1), 120);
    ctx.fillText(`${yName}=${lastVal.toFixed(3)}`, legendX, H - 6);
  });
}
