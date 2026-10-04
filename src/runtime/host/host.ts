import { createCompiler } from '../core/compiler';
import type {
  CompiledExpr,
  Diagnostic,
  EngineSnapshot,
  PerfStats,
  RtModel,
  SampleChannel,
  VarBag,
} from '../core/types';
import { createControlsManager } from './controls';
import { setupDragHandler } from './drag';
import {
  type EngineProxy,
  InlineEngineProxy,
  createWorkerProxyWithTimeout,
} from './engineProxy';
import {
  type DrawingPanelState,
  clearAndDrawGrid,
  createDrawingPanel,
  getDrawingHelpers,
} from './render/drawingPanel';
import {
  type PlotDataBuffer,
  type PlottingPanelState,
  appendPlotDelta,
  createPlotDataBuffer,
  createPlottingPanel,
  renderPlot,
} from './render/plot';
import {
  createVectorFieldRenderer,
  drawArrow2D,
  drawShape2D,
  drawSpring2D,
  drawTrail2D,
} from './render/shapes';

declare global {
  interface Window {
    __EJSS_MODEL__?: RtModel;
    __EJSS_OPTIONS__?: { mode?: 'preview' | 'export'; description?: string };
    simPlay?: () => void;
    simPause?: () => void;
    simStep?: () => void;
    simReset?: () => void;
    simExportCSV?: () => void;
    simSetSpeed?: (s: number) => void;
    _simRender?: () => void;
  }
}

export async function startHost(): Promise<void> {
  const model = window.__EJSS_MODEL__;
  if (!model) {
    console.warn('[EjsS Host] No __EJSS_MODEL__ found on window.');
    return;
  }

  // 1. Initial Bag
  const viewVars: VarBag = Object.create(null);
  viewVars.t = 0;
  viewVars.dt = 0.05;
  viewVars._isPaused = true;
  viewVars._isLocked = model.isLocked ?? false;

  model.variables.forEach((v) => {
    if (v.type === 'boolean') {
      viewVars[v.name] = v.value === 'true';
    } else if (v.type === 'int') {
      viewVars[v.name] = parseInt(v.value, 10) || 0;
    } else if (v.type === 'String') {
      viewVars[v.name] = (v.value || '').replace(/^"|"$/g, '');
    } else {
      viewVars[v.name] = parseFloat(v.value) || 0;
    }
  });

  // 2. Compile view expressions
  const varNames = model.variables.map((v) => v.name);
  const compiler = createCompiler(varNames);
  const compiledExprs = new Map<string, CompiledExpr>();
  const initialDiagnostics: Diagnostic[] = [];

  const compileExprSafe = (key: string, src: string | undefined, elId: string, item: string) => {
    if (!src || !src.trim()) return;
    const res = compiler.expr(src.trim(), { block: 'view', pageId: elId, item });
    if (typeof res === 'function') {
      compiledExprs.set(key, res);
    } else {
      initialDiagnostics.push(res);
    }
  };

  model.viewElements.forEach((el) => {
    const p = el.properties;
    if (el.type === 'Elements.Shape2D') {
      compileExprSafe(`el:${el.id}:X`, p.X, el.id, 'X');
      compileExprSafe(`el:${el.id}:Y`, p.Y, el.id, 'Y');
      compileExprSafe(`el:${el.id}:SizeX`, p.SizeX, el.id, 'SizeX');
      compileExprSafe(`el:${el.id}:SizeY`, p.SizeY, el.id, 'SizeY');
      compileExprSafe(`el:${el.id}:Visible`, p.Visible, el.id, 'Visible');
      compileExprSafe(`el:${el.id}:Draggable`, p.Draggable, el.id, 'Draggable');
      compileExprSafe(`el:${el.id}:Transformation`, p.Transformation, el.id, 'Transformation');
    } else if (el.type === 'Elements.Spring2D') {
      compileExprSafe(`el:${el.id}:X`, p.X, el.id, 'X');
      compileExprSafe(`el:${el.id}:Y`, p.Y, el.id, 'Y');
      compileExprSafe(`el:${el.id}:SizeX`, p.SizeX, el.id, 'SizeX');
      compileExprSafe(`el:${el.id}:SizeY`, p.SizeY, el.id, 'SizeY');
      compileExprSafe(`el:${el.id}:Visible`, p.Visible, el.id, 'Visible');
    } else if (el.type === 'Elements.Arrow2D') {
      compileExprSafe(`el:${el.id}:X`, p.X, el.id, 'X');
      compileExprSafe(`el:${el.id}:Y`, p.Y, el.id, 'Y');
      compileExprSafe(`el:${el.id}:SizeX`, p.SizeX, el.id, 'SizeX');
      compileExprSafe(`el:${el.id}:SizeY`, p.SizeY, el.id, 'SizeY');
      compileExprSafe(`el:${el.id}:Visible`, p.Visible, el.id, 'Visible');
      compileExprSafe(`el:${el.id}:Draggable`, p.Draggable, el.id, 'Draggable');
    } else if (el.type === 'Elements.Trail2D') {
      compileExprSafe(`el:${el.id}:X`, p.X, el.id, 'X');
      compileExprSafe(`el:${el.id}:Y`, p.Y, el.id, 'Y');
      compileExprSafe(`el:${el.id}:Visible`, p.Visible, el.id, 'Visible');
    } else if (el.type === 'Elements.ParsedField') {
      compileExprSafe(`pf:${el.id}`, p.Value, el.id, 'Value');
    }
  });

  // 3. Setup Sample Channels
  const channels: SampleChannel[] = [];
  const trailBuffers = new Map<string, [number, number][]>();
  const plotBuffers = new Map<string, PlotDataBuffer>();
  const trailCapacities = new Map<string, number>();

  model.viewElements.forEach((el) => {
    const p = el.properties;
    if (el.type === 'Elements.Trail2D') {
      const cap = parseInt(p.MaximumPoints ?? '1000', 10) || 1000;
      channels.push({
        id: `trail:${el.id}`,
        exprs: [p.X?.trim() || '0', p.Y?.trim() || '0'],
        capacity: cap,
      });
      trailBuffers.set(el.id, []);
      trailCapacities.set(el.id, cap);
    } else if (el.type === 'Elements.PlottingPanel') {
      const axisX = (p.AxisX ?? '').replace(/^"|"$/g, '').trim() || 't';
      const axisYRaw = (p.AxisY ?? '').replace(/^"|"$/g, '').trim();
      const axisYList = axisYRaw
        ? axisYRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      channels.push({
        id: `plot:${el.id}`,
        exprs: [axisX, ...axisYList],
        capacity: 1000,
      });
      plotBuffers.set(el.id, createPlotDataBuffer(axisYList));
    }
  });

  // 4. Setup Engine Proxy (Worker or Main-thread)
  const reqMode = model.runtime?.mode ?? 'auto';
  let proxy: EngineProxy;

  if (reqMode === 'main') {
    proxy = new InlineEngineProxy();
  } else {
    try {
      proxy = await createWorkerProxyWithTimeout(2000);
    } catch (err) {
      console.warn('[EjsS Host] Worker fallback to main thread:', err);
      proxy = new InlineEngineProxy();
    }
  }

  // 5. Load model into Engine
  const { diagnostics: loadDiagnostics, snapshot: initialSnapshot } = await proxy.load(
    model,
    channels
  );
  const allInitialDiagnostics = [...initialDiagnostics, ...loadDiagnostics];
  if (allInitialDiagnostics.length > 0) {
    window.parent.postMessage(
      { type: 'ejss:diagnostics', diagnostics: allInitialDiagnostics },
      '*'
    );
  }

  // Apply initial snapshot
  Object.assign(viewVars, initialSnapshot.vars);

  // 6. Setup Panels & CustomDraw functions
  const drawingPanels: DrawingPanelState[] = [];
  const plottingPanels: PlottingPanelState[] = [];
  const customDrawFns = new Map<
    string,
    (
      ctx: CanvasRenderingContext2D,
      vars: VarBag,
      toPixX: (x: number) => number,
      toPixY: (y: number) => number,
      toPixLen: (l: number) => number,
      W: number,
      H: number,
      drawVF: unknown
    ) => void
  >();

  model.viewElements.forEach((el) => {
    if (el.type === 'Elements.DrawingPanel') {
      const c = document.getElementById(`dp_${el.id}`) as HTMLCanvasElement | null;
      if (c) {
        drawingPanels.push(createDrawingPanel(c, el.id, el.name, el.properties));
      }
    } else if (el.type === 'Elements.PlottingPanel') {
      const c = document.getElementById(`pp_${el.id}`) as HTMLCanvasElement | null;
      if (c) {
        plottingPanels.push(createPlottingPanel(c, el.id, el.name, el.properties));
      }
    } else if (el.type === 'Elements.CustomDraw') {
      try {
        const fn = new Function(
          'ctx',
          'vars',
          'toPixX',
          'toPixY',
          'toPixLen',
          'W',
          'H',
          'drawVectorField',
          el.properties.Code || ''
        ) as (
          ctx: CanvasRenderingContext2D,
          vars: VarBag,
          toPixX: (x: number) => number,
          toPixY: (y: number) => number,
          toPixLen: (l: number) => number,
          W: number,
          H: number,
          drawVF: unknown
        ) => void;
        customDrawFns.set(el.id, fn);
      } catch (err) {
        console.warn(`[EjsS Host] CustomDraw error on ${el.name}:`, err);
      }
    }
  });

  function getPanelForEl(parentName?: string): DrawingPanelState | undefined {
    if (!drawingPanels.length) return undefined;
    if (!parentName) return drawingPanels[0];
    return (
      drawingPanels.find((p) => p.id === parentName || p.name === parentName) ??
      drawingPanels[0]
    );
  }

  // 7. Render function
  function renderAll() {
    // 7.1 Drawing panels
    drawingPanels.forEach((panel) => {
      clearAndDrawGrid(panel);
      const helpers = getDrawingHelpers(panel);

      model!.viewElements.forEach((el) => {
        const p = el.properties;
        const targetPanel = getPanelForEl(el.parent);
        if (targetPanel && targetPanel !== panel) return;

        const isVisible = p.Visible
          ? Boolean(compiledExprs.get(`el:${el.id}:Visible`)?.(viewVars) ?? true)
          : true;
        if (!isVisible) return;

        if (el.type === 'Elements.Shape2D') {
          const x = Number(compiledExprs.get(`el:${el.id}:X`)?.(viewVars) ?? 0);
          const y = Number(compiledExprs.get(`el:${el.id}:Y`)?.(viewVars) ?? 0);
          const sizeX = Number(compiledExprs.get(`el:${el.id}:SizeX`)?.(viewVars) ?? 0.3);
          const sizeY = Number(compiledExprs.get(`el:${el.id}:SizeY`)?.(viewVars) ?? 0.3);
          const transformation = Number(
            compiledExprs.get(`el:${el.id}:Transformation`)?.(viewVars) ?? 0
          );

          drawShape2D(panel.ctx, helpers, {
            x,
            y,
            sizeX,
            sizeY,
            fillColor: p.FillColor,
            lineColor: p.LineColor,
            transformation,
            shapeType: p.ShapeType,
          });
        } else if (el.type === 'Elements.Spring2D') {
          const x = Number(compiledExprs.get(`el:${el.id}:X`)?.(viewVars) ?? 0);
          const y = Number(compiledExprs.get(`el:${el.id}:Y`)?.(viewVars) ?? 0);
          const sizeX = Number(compiledExprs.get(`el:${el.id}:SizeX`)?.(viewVars) ?? 2);
          const sizeY = Number(compiledExprs.get(`el:${el.id}:SizeY`)?.(viewVars) ?? 0);

          drawSpring2D(panel.ctx, helpers, {
            x,
            y,
            sizeX,
            sizeY,
            lineColor: p.LineColor,
          });
        } else if (el.type === 'Elements.Arrow2D') {
          const x = Number(compiledExprs.get(`el:${el.id}:X`)?.(viewVars) ?? 0);
          const y = Number(compiledExprs.get(`el:${el.id}:Y`)?.(viewVars) ?? 0);
          const sizeX = Number(compiledExprs.get(`el:${el.id}:SizeX`)?.(viewVars) ?? 1);
          const sizeY = Number(compiledExprs.get(`el:${el.id}:SizeY`)?.(viewVars) ?? 0);

          drawArrow2D(panel.ctx, helpers, {
            x,
            y,
            sizeX,
            sizeY,
            fillColor: p.FillColor,
            lineColor: p.LineColor,
          });
        } else if (el.type === 'Elements.Trail2D') {
          const pts = trailBuffers.get(el.id) ?? [];
          drawTrail2D(panel.ctx, helpers, pts, p.LineColor);
        } else if (el.type === 'Elements.CustomDraw') {
          const fn = customDrawFns.get(el.id);
          if (fn) {
            try {
              const vf = createVectorFieldRenderer(panel.ctx, helpers);
              fn(
                panel.ctx,
                viewVars,
                helpers.toPixX,
                helpers.toPixY,
                helpers.toPixLen,
                helpers.W,
                helpers.H,
                vf
              );
            } catch (err) {
              console.warn(`[EjsS Host] CustomDraw error:`, err);
            }
          }
        }
      });
    });

    // 7.2 Plotting panels
    plottingPanels.forEach((pp) => {
      const buffer = plotBuffers.get(pp.id);
      if (buffer) {
        renderPlot(pp, buffer, viewVars);
      }
    });

    // 7.3 Controls update
    controlsManager.update(viewVars);

    // Frame counter for FPS
    frameCount++;
  }

  // 8. Snapshot processing
  function processSnapshot(snapshot: EngineSnapshot) {
    Object.assign(viewVars, snapshot.vars);

    // Process sample deltas
    for (const [channelId, delta] of Object.entries(snapshot.samples)) {
      if (channelId.startsWith('trail:')) {
        const elId = channelId.slice(6);
        const pts = trailBuffers.get(elId);
        const cap = trailCapacities.get(elId) ?? 1000;
        if (pts && delta.length >= 2) {
          for (let i = 0; i < delta.length; i += 2) {
            pts.push([delta[i], delta[i + 1]]);
          }
          if (pts.length > cap) {
            pts.splice(0, pts.length - cap);
          }
        }
      } else if (channelId.startsWith('plot:')) {
        const elId = channelId.slice(5);
        const buffer = plotBuffers.get(elId);
        const pp = plottingPanels.find((p) => p.id === elId);
        if (buffer && pp && delta.length > 0) {
          appendPlotDelta(buffer, delta, pp.axisYList, 1000);
        }
      }
    }

    // Diagnostics forwarding
    if (snapshot.diagnostics.length > 0) {
      window.parent.postMessage(
        { type: 'ejss:diagnostics', diagnostics: snapshot.diagnostics },
        '*'
      );
    }
  }

  // 9. Controls manager & drag handlers
  const controlsManager = createControlsManager(compiledExprs);

  const controlActions = {
    onPlay: () => doPlay(),
    onPause: () => doPause(),
    onReset: () => doReset(),
    onStep: () => doStep(),
    onRender: () => renderAll(),
  };

  controlsManager.bind(model.viewElements, proxy, controlActions);

  drawingPanels.forEach((panel) => {
    setupDragHandler({
      panel,
      elements: model!.viewElements,
      viewVars,
      compiledExprs,
      proxy,
      onRender: () => renderAll(),
    });
  });

  // 10. Simulation Loop with Backpressure
  let running = false;
  let rafId: number | null = null;
  let lastTs: number | null = null;
  let pendingDt = 0;
  let isAdvanceInFlight = false;
  let frameCount = 0;
  let lastFpsTs = performance.now();
  let currentFps = 60;
  let lastPerf: Pick<PerfStats, 'stepsPerSec' | 'realtimeRatio'> = {
    stepsPerSec: 0,
    realtimeRatio: 1,
  };

  function loop(ts: number) {
    if (lastTs === null) lastTs = ts;
    const realDt = Math.min((ts - lastTs) / 1000, 0.25);
    lastTs = ts;

    if (running) {
      pendingDt += realDt;
      if (!isAdvanceInFlight && pendingDt > 0) {
        isAdvanceInFlight = true;
        const sendDt = pendingDt;
        pendingDt = 0;

        proxy
          .advance(sendDt)
          .then((snapshot) => {
            isAdvanceInFlight = false;
            lastPerf = snapshot.perf;
            processSnapshot(snapshot);
            renderAll();
          })
          .catch((err) => {
            isAdvanceInFlight = false;
            console.error('[EjsS Host] advance error:', err);
          });
      }
    }

    if (running) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function doPlay() {
    if (!running) {
      running = true;
      viewVars._isPaused = false;
      lastTs = null;
      pendingDt = 0;
      rafId = requestAnimationFrame(loop);
    }
  }

  function doPause() {
    running = false;
    viewVars._isPaused = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    renderAll();
  }

  async function doStep() {
    const snapshot = await proxy.step();
    lastPerf = snapshot.perf;
    processSnapshot(snapshot);
    renderAll();
  }

  async function doReset() {
    doPause();
    trailBuffers.forEach((pts) => {
      pts.length = 0;
    });
    plotBuffers.forEach((buf) => {
      buf.xs.length = 0;
      for (const key of Object.keys(buf.series)) {
        buf.series[key] = [];
      }
    });

    const snapshot = await proxy.reset();
    processSnapshot(snapshot);
    renderAll();
  }

  // 11. Status heartbeat (every 500ms)
  setInterval(() => {
    const now = performance.now();
    const elapsed = (now - lastFpsTs) / 1000;
    if (elapsed >= 0.5) {
      currentFps = Math.round(frameCount / elapsed);
      frameCount = 0;
      lastFpsTs = now;
    }

    const perf: PerfStats = {
      stepsPerSec: lastPerf.stepsPerSec,
      realtimeRatio: lastPerf.realtimeRatio,
      fps: currentFps,
    };

    window.parent.postMessage(
      {
        type: 'ejss:status',
        running,
        t: viewVars.t,
        perf,
        mode: proxy.mode,
      },
      '*'
    );
  }, 500);

  // 12. Message listener for parent / editor control
  window.addEventListener('message', async (e: MessageEvent) => {
    const data = e.data;
    if (data === 'play') doPlay();
    else if (data === 'pause') doPause();
    else if (data === 'step') doStep();
    else if (data === 'reset') doReset();
    else if (data === 'exportCSV') {
      const csv = await proxy.exportCSV();
      window.parent.postMessage(
        { type: 'csvData', csv, title: model.info.title || 'simulation' },
        '*'
      );
    } else if (data && typeof data === 'object') {
      if (data.type === 'ejss:setSpeed') {
        proxy.setSpeed(data.speed);
      } else if (data.type === 'ejss:setVars') {
        Object.assign(viewVars, data.patch);
        proxy.setVars(data.patch);
        renderAll();
      }
    }
  });

  // 13. Expose functions to window (for standalone export HTML UI)
  window.simPlay = doPlay;
  window.simPause = doPause;
  window.simStep = doStep;
  window.simReset = doReset;
  window.simSetSpeed = (s: number) => proxy.setSpeed(s);
  window.simExportCSV = async () => {
    const csv = await proxy.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.info.title || 'simulation'}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  window._simRender = renderAll;

  // 14. Responsive scaling for High-DPI screens
  function resizeAll() {
    const root = document.getElementById('sim-root');
    if (!root) return;

    const bbwAttr = parseFloat(root.getAttribute('data-w') || '400') || 400;
    const bbhAttr = parseFloat(root.getAttribute('data-h') || '400') || 400;

    const w = window.innerWidth || document.documentElement.clientWidth || 0;
    const h = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!w || !h) return;

    let s = Math.min(w / bbwAttr, h / bbhAttr);
    if (!s || s < 0.05 || !Number.isFinite(s)) s = 1;

    // Scale absolute sizes & positions
    const els = document.querySelectorAll<HTMLElement>('#sim-root, #sim-root [data-w]');
    els.forEach((el) => {
      const ox = parseFloat(el.getAttribute('data-x') || '0');
      const oy = parseFloat(el.getAttribute('data-y') || '0');
      const ow = parseFloat(el.getAttribute('data-w') || '0');
      const oh = parseFloat(el.getAttribute('data-h') || '0');
      el.style.left = `${ox * s}px`;
      el.style.top = `${oy * s}px`;
      el.style.width = `${ow * s}px`;
      el.style.height = `${oh * s}px`;

      const fs = el.getAttribute('data-fs');
      if (fs) {
        el.style.fontSize = `${parseFloat(fs) * s}px`;
      }
    });

    // Resize canvas buffers
    const dpr = window.devicePixelRatio || 1;

    drawingPanels.forEach((panel) => {
      const c = panel.canvas;
      const ow = parseFloat(c.getAttribute('data-w') || '0') * s;
      const oh = parseFloat(c.getAttribute('data-h') || '0') * s;
      if (ow > 0 && oh > 0) {
        c.width = ow * dpr;
        c.height = oh * dpr;
        panel.logicalW = ow;
        panel.logicalH = oh;
        const ctx = c.getContext('2d')!;
        ctx.scale(dpr, dpr);
      }
    });

    plottingPanels.forEach((panel) => {
      const c = panel.canvas;
      const ow = parseFloat(c.getAttribute('data-w') || '0') * s;
      const oh = parseFloat(c.getAttribute('data-h') || '0') * s;
      if (ow > 0 && oh > 0) {
        c.width = ow * dpr;
        c.height = oh * dpr;
        panel.logicalW = ow;
        panel.logicalH = oh;
        const ctx = c.getContext('2d')!;
        ctx.scale(dpr, dpr);
      }
    });

    renderAll();
  }

  window.addEventListener('resize', resizeAll);
  resizeAll();
  setTimeout(resizeAll, 50);
  setTimeout(resizeAll, 150);
  setTimeout(resizeAll, 400);

  // Initial render
  renderAll();
}
