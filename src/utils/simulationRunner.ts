import type { SimulationState } from '../types/simulation';
import { serializeToEjssXML } from './ejssParser';

export function buildSimulationHTML(state: SimulationState): string {
  const drawEl = state.viewElements.find((e) => e.type === 'Elements.DrawingPanel');
  const viewW = drawEl?.width ?? parseInt(drawEl?.properties.Width ?? '400');
  const viewH = drawEl?.height ?? parseInt(drawEl?.properties.Height ?? '400');
  const minX = parseFloat(drawEl?.properties.MinimumX ?? '-5');
  const maxX = parseFloat(drawEl?.properties.MaximumX ?? '5');
  const minY = parseFloat(drawEl?.properties.MinimumY ?? '-5');
  const maxY = parseFloat(drawEl?.properties.MaximumY ?? '5');

  const stateJson = JSON.stringify({
    variables: state.variables,
    odePages: state.odePages,
    constraintPages: state.constraintPages,
    initPages: state.initPages,
    viewElements: state.viewElements,
    info: state.info,
    isLocked: state.isLocked || false,
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>${state.info.title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #f8fafc; color: #334155; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; }
  .app-container { display: flex; width: 100%; height: 100%; overflow: hidden; }
  .desc-panel { flex: 1; overflow-y: auto; padding: 24px; background: #ffffff; border-right: 1px solid #cbd5e1; }
  .sim-panel { width: 520px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 24px; gap: 12px; overflow-y: auto; background: #f8fafc; border-left: 1px solid #cbd5e1; }
  
  /* Markdown styling inside desc-panel */
  .desc-panel h1, .desc-panel h2, .desc-panel h3 { color: #1e293b; margin-top: 24px; margin-bottom: 12px; font-weight: 700; }
  .desc-panel h1 { font-size: 1.8em; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; color: #1e3a8a; }
  .desc-panel h2 { font-size: 1.4em; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; color: #0f766e; }
  .desc-panel h3 { font-size: 1.2em; color: #c2410c; }
  .desc-panel code { font-family: monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; color: #b91c1c; font-size: 0.9em; }
  .desc-panel pre { background: #f8fafc; padding: 12px; border-radius: 8px; overflow-x: auto; border: 1px solid #cbd5e1; }
  .desc-panel pre code { background: none; padding: 0; color: #334155; }
  .desc-panel blockquote { border-left: 4px solid #4f46e5; padding-left: 12px; margin-left: 0; color: #475569; }
  .desc-panel ul, .desc-panel ol { padding-left: 20px; }
  
  /* Sim element styling */
  h3 { margin: 0; font-size: 16px; color: #4f46e5; font-weight: bold; }
  canvas { border: 1px solid #cbd5e1; background: white; border-radius: 6px; max-width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; width: 100%; }
  button { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 12px; transition: background 0.2s; }
  .play  { background: #10b981; color: white; }
  .play:hover { background: #059669; }
  .pause { background: #f59e0b; color: white; }
  .pause:hover { background: #d97706; }
  .reset { background: #6366f1; color: white; }
  .reset:hover { background: #4f46e5; }
  .step  { background: #64748b; color: white; }
  .step:hover { background: #475569; }
  .vars  { font-size: 12px; font-family: monospace; background: #ffffff; padding: 8px 12px; border: 1px solid #cbd5e1;
           border-radius: 8px; width: 100%; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .var-item { display: flex; gap: 4px; }
  .var-name  { color: #4f46e5; font-weight: bold; }
  .var-eq    { color: #64748b; }
  .var-value { color: #059669; }
  .sliders { font-size:12px; font-family:monospace; background:#ffffff; padding:8px 12px; border: 1px solid #cbd5e1;
             border-radius:8px; width:100%; display:flex; flex-direction:column; gap:6px; }
  .slider-row { display:flex; align-items:center; gap:8px; color:#475569; }
  .slider-row label { min-width:100px; flex-shrink:0; text-align: left; }
  .slider-row input[type=range] { flex:1; cursor:pointer; accent-color: #6366f1; }
  .slider-val { min-width:50px; text-align:right; color:#059669; font-weight: bold; }
  
  @media (max-width: 900px) {
    .app-container { flex-direction: column; }
    .desc-panel { border-right: none; border-bottom: 1px solid #cbd5e1; }
    .sim-panel { width: 100%; border-left: none; }
  }
</style>
</head>
<body>
<div class="app-container">
  <div class="desc-panel" id="desc-panel">
    <div id="description-content"></div>
  </div>
  
  <div class="sim-panel" id="sim-panel">
    <h3>${state.info.title || '模擬'}</h3>
    <div class="controls">
      <button class="play"  onclick="simPlay()">▶ 播放</button>
      <button class="pause" onclick="simPause()">⏸ 暫停</button>
      <button class="step"  onclick="simStep()">⏭ 步進</button>
      <button class="reset" onclick="simReset()">↺ 重置</button>
      <button class="reset" style="background:#0284c7;" onclick="simExportCSV()">📊 導出 CSV</button>
    </div>
    <canvas id="canvas" width="${viewW}" height="${viewH}"></canvas>
    <div class="sliders" id="sliders"></div>
    <div class="vars" id="varDisplay"></div>
  </div>
</div>

<script>
(function(){
const STATE = ${stateJson};
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const WORLD = { minX:${minX}, maxX:${maxX}, minY:${minY}, maxY:${maxY} };

// ── Coordinate transforms ──────────────────────────────────────────
function toPixX(x) { return (x - WORLD.minX)/(WORLD.maxX - WORLD.minX)*W; }
function toPixY(y) { return H - (y - WORLD.minY)/(WORLD.maxY - WORLD.minY)*H; }
function toPixLen(l) { return Math.abs(l)/(WORLD.maxX - WORLD.minX)*W; }
function toWorldX(px) { return WORLD.minX + (px / W) * (WORLD.maxX - WORLD.minX); }
function toWorldY(py) { return WORLD.minY + ((H - py) / H) * (WORLD.maxY - WORLD.minY); }
function toWorldLen(pl) { return (pl / W) * (WORLD.maxX - WORLD.minX); }
function darkenColor(col, percent) {
  if (!col) return col;
  col = String(col).trim();
  if (col.startsWith('#')) {
    var num = parseInt(col.slice(1), 16),
        amt = Math.round(2.55 * (percent * 100)),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
  }
  return col;
}

// ── Variable bag ──────────────────────────────────────────────────
const vars = Object.create(null);
vars.t = 0; vars.dt = 0.05;
STATE.variables.forEach(function(v) {
  if (v.type === 'boolean')     vars[v.name] = (v.value === 'true');
  else if (v.type === 'int')    vars[v.name] = parseInt(v.value) || 0;
  else if (v.type === 'String') vars[v.name] = (v.value||'').replace(/^"|"$/g,'');
  else                          vars[v.name] = parseFloat(v.value) || 0;
});
vars._isLocked = STATE.isLocked || false;
const origVars = Object.assign({}, vars);

// ── Drag & Drop handler ───────────────────────────────────────────────
var dragTarget = null;
function getMouseCoords(e) {
  var rect = canvas.getBoundingClientRect();
  var clientX = e.touches ? e.touches[0].clientX : e.clientX;
  var clientY = e.touches ? e.touches[0].clientY : e.clientY;
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function handleStart(e) {
  if (vars._isLocked) return;
  var coords = getMouseCoords(e);
  var wx = toWorldX(coords.x);
  var wy = toWorldY(coords.y);
  
  for (var i = STATE.viewElements.length - 1; i >= 0; i--) {
    var el = STATE.viewElements[i];
    var p = el.properties;
    var isVisible = p.Visible ? evalExpr(p.Visible) : true;
    if (!isVisible) continue;
    
    var isDraggable = p.Draggable && evalExpr(p.Draggable);
    if (!isDraggable) continue;

    if (el.type === 'Elements.Shape2D') {
      var sx = evalExpr(p.X || '0');
      var sy = evalExpr(p.Y || '0');
      var rx = evalExpr(p.SizeX || '0.3');
      var ry = evalExpr(p.SizeY || '0.3');
      if (Math.abs(wx - sx) <= rx && Math.abs(wy - sy) <= ry) {
        dragTarget = {
          type: 'shape',
          el: el,
          offsetX: wx - sx,
          offsetY: wy - sy,
          p: p
        };
        e.preventDefault();
        break;
      }
    } else if (el.type === 'Elements.Arrow2D') {
      var sx = evalExpr(p.X || '0');
      var sy = evalExpr(p.Y || '0');
      var vx = evalExpr(p.SizeX || '1');
      var vy = evalExpr(p.SizeY || '0');
      var ax = sx + vx;
      var ay = sy + vy;
      var dist = Math.sqrt(Math.pow(wx - ax, 2) + Math.pow(wy - ay, 2));
      var grabDistLimit = toWorldLen(16);
      if (dist <= grabDistLimit) {
        dragTarget = {
          type: 'arrow',
          el: el,
          startX: sx,
          startY: sy,
          p: p
        };
        e.preventDefault();
        break;
      }
    }
  }
}

function handleMove(e) {
  if (!dragTarget) return;
  var coords = getMouseCoords(e);
  var wx = toWorldX(coords.x);
  var wy = toWorldY(coords.y);
  var p = dragTarget.p;
  
  if (dragTarget.type === 'shape') {
    var newX = wx - dragTarget.offsetX;
    var newY = wy - dragTarget.offsetY;
    var xName = p.X || '';
    var yName = p.Y || '';
    if (xName && vars[xName] !== undefined) vars[xName] = newX;
    if (yName && vars[yName] !== undefined) vars[yName] = newY;
  } else if (dragTarget.type === 'arrow') {
    var newVx = wx - dragTarget.startX;
    var newVy = wy - dragTarget.startY;
    var sxName = p.SizeX || '';
    var syName = p.SizeY || '';
    if (sxName && vars[sxName] !== undefined) vars[sxName] = newVx;
    if (syName && vars[syName] !== undefined) vars[syName] = newVy;
  }
  
  if (!running) render();
  e.preventDefault();
}

function handleEnd() {
  dragTarget = null;
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

// ── Code executor (with = read+write variable bag) ─────────────────
function execCode(code) {
  if (!code || !code.trim()) return;
  try { new Function('_v','with(_v){'+code+'}')(vars); } catch(e){}
}

function evalExpr(expr) {
  if (!expr || !expr.trim()) return 0;
  try { return new Function('_v','with(_v){return('+expr+')}')(vars); } catch(e){ return 0; }
}

// ── Execution lifecycle ────────────────────────────────────────────
function runInit() {
  STATE.initPages.forEach(function(p){ execCode(p.code); });
}

function runFixed() {
  STATE.constraintPages.forEach(function(p){ execCode(p.code); });
}

// ODE solvers
function stepEuler(page) {
  const dt = evalExpr(page.increment) || vars.dt || 0.05;
  const derivs = {};
  page.rates.forEach(function(r){ derivs[r.state] = evalExpr(r.expression); });
  page.rates.forEach(function(r){ if(r.state in vars) vars[r.state] += derivs[r.state]*dt; });
  vars.t = (vars.t||0) + dt;
}

function stepRK4(page) {
  const dt = evalExpr(page.increment) || vars.dt || 0.05;
  const t0 = vars.t;
  const states = page.rates.map(function(r){return r.state;});
  const getRates = function(){ return page.rates.map(function(r){return evalExpr(r.expression);}); };
  const snap = {}; states.forEach(function(s){snap[s]=vars[s];});
  const k1 = getRates(); states.forEach(function(s,i){vars[s]=snap[s]+k1[i]*dt/2;}); vars.t=t0+dt/2;
  const k2 = getRates(); states.forEach(function(s,i){vars[s]=snap[s]+k2[i]*dt/2;}); vars.t=t0+dt/2;
  const k3 = getRates(); states.forEach(function(s,i){vars[s]=snap[s]+k3[i]*dt;}); vars.t=t0+dt;
  const k4 = getRates(); states.forEach(function(s,i){vars[s]=snap[s]+(k1[i]+2*k2[i]+2*k3[i]+k4[i])*dt/6;});
  vars.t = t0 + dt;
}

function stepVerlet(page) {
  const dt = evalExpr(page.increment) || vars.dt || 0.05;
  const t0 = vars.t;
  const snap = {}; page.rates.forEach(function(r){snap[r.state]=vars[r.state];});
  const a0 = {}; page.rates.forEach(function(r){a0[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=snap[r.state]+snap[r.state]*dt+0.5*a0[r.state]*dt*dt;});
  const a1 = {}; page.rates.forEach(function(r){a1[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=snap[r.state]+0.5*(a0[r.state]+a1[r.state])*dt;});
  vars.t = t0 + dt;
}

function stepODE(page) {
  if (page.method === 'RungeKutta') stepRK4(page);
  else if (page.method === 'Verlet') stepVerlet(page);
  else stepEuler(page);
}

var SIM_DATA_LOG = [];
function collectSimDataLog() {
  var entry = { t: vars.t };
  STATE.variables.filter(function(v){return v.scope==='global';}).forEach(function(v){
    entry[v.name] = vars[v.name];
  });
  SIM_DATA_LOG.push(entry);
  if (SIM_DATA_LOG.length > 100000) SIM_DATA_LOG.shift();
}
function exportCSVString() {
  var gvars = STATE.variables.filter(function(v){return v.scope==='global';});
  var headers = ['t'].concat(gvars.map(function(v){return v.name;}));
  var lines = [headers.join(',')];
  SIM_DATA_LOG.forEach(function(row) {
    var line = [row.t.toFixed(4)];
    gvars.forEach(function(v) {
      var val = row[v.name];
      if (typeof val === 'number') line.push(val.toFixed(4));
      else line.push(String(val));
    });
    lines.push(line.join(','));
  });
  return lines.join(String.fromCharCode(10));
}
window.simExportCSV = function() {
  var csv = exportCSVString();
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = (STATE.info.title || 'simulation') + '_data.csv';
  a.click();
  URL.revokeObjectURL(url);
};

function evolve() {
  runFixed();
  STATE.odePages.forEach(stepODE);
  runFixed(); // post-step constraints
  collectSimDataLog();
}

// ── Trail storage ──────────────────────────────────────────────────
const trails = {};
STATE.viewElements.forEach(function(el){
  if (el.type === 'Elements.Trail2D') trails[el.id] = [];
});

// ── Render ─────────────────────────────────────────────────────────
function drawGrid() {
  var minX = WORLD.minX, maxX = WORLD.maxX, minY = WORLD.minY, maxY = WORLD.maxY;
  var spanX = maxX - minX;
  var interval = 1.0;
  if (spanX <= 0.5) interval = 0.05;
  else if (spanX <= 1.5) interval = 0.2;
  else if (spanX <= 4) interval = 0.5;
  else if (spanX <= 12) interval = 1.0;
  else if (spanX <= 30) interval = 5.0;
  else interval = 10.0;

  ctx.save();
  // Draw grid lines
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1.0;
  var startX = Math.ceil(minX / interval) * interval;
  for (var x = startX; x <= maxX; x += interval) {
    if (Math.abs(x) < 1e-5) continue;
    var px = toPixX(x);
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
  }
  var startY = Math.ceil(minY / interval) * interval;
  for (var y = startY; y <= maxY; y += interval) {
    if (Math.abs(y) < 1e-5) continue;
    var py = toPixY(y);
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
  }

  // Draw main axes
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1.5;
  var zx = toPixX(0), zy = toPixY(0);
  if (zy > 0 && zy < H) { ctx.beginPath(); ctx.moveTo(0, zy); ctx.lineTo(W, zy); ctx.stroke(); }
  if (zx > 0 && zx < W) { ctx.beginPath(); ctx.moveTo(zx, 0); ctx.lineTo(zx, H); ctx.stroke(); }

  // Axis tick labels
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (var x = startX; x <= maxX; x += interval) {
    var px = toPixX(x);
    if (px > 10 && px < W - 10) {
      var yPos = zy > 0 && zy < H - 15 ? zy + 4 : H - 15;
      ctx.fillText(x.toFixed(1).replace(/\.0$/, ''), px, yPos);
    }
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (var y = startY; y <= maxY; y += interval) {
    var py = toPixY(y);
    if (py > 10 && py < H - 10) {
      var xPos = zx > 15 && zx < W - 5 ? zx - 4 : 20;
      ctx.fillText(y.toFixed(1).replace(/\.0$/, ''), xPos, py);
    }
  }
  ctx.restore();
}

function render() {
  ctx.clearRect(0,0,W,H);
  // Background
  const bg = (function(){
    var d = STATE.viewElements.find(function(e){return e.type==='Elements.DrawingPanel';});
    return d ? (d.properties.Background||'"white"').replace(/^"|"$/g,'') : 'white';
  }());
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  drawGrid();

  STATE.viewElements.forEach(function(el) {
    if (!el.type.startsWith('Elements.')) return;
    const p = el.properties;

    if (el.type === 'Elements.Shape2D') {
      const visible = p.Visible ? evalExpr(p.Visible) : 1;
      if (!visible) return;
      const x = evalExpr(p.X||'0'), y = evalExpr(p.Y||'0');
      const sx = toPixLen(evalExpr(p.SizeX||'0.3'));
      const sy = toPixLen(evalExpr(p.SizeY||'0.3'));
      const px = toPixX(x), py = toPixY(y);
      const fill  = (p.FillColor||'"#3b82f6"').replace(/^"|"$/g,'');
      const line  = (p.LineColor||'"#1e293b"').replace(/^"|"$/g,'');
      const angle = evalExpr(p.Transformation||'0');
      ctx.save();
      ctx.translate(px,py);
      if (angle) ctx.rotate(-angle); // negative = CCW in screen coords
      const shape = p.ShapeType||'ELLIPSE';
      ctx.strokeStyle = line; ctx.lineWidth = 1.5;
      if (shape==='ELLIPSE'||shape==='WHEEL') {
        ctx.save();
        ctx.beginPath(); ctx.ellipse(0,0,Math.max(sx,2),Math.max(sy,2),0,0,2*Math.PI);
        if (Math.abs(sx - sy) < 1e-3 && sx > 4) {
          var grad = ctx.createRadialGradient(-sx * 0.2, -sy * 0.2, sx * 0.05, 0, 0, sx);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.25, fill);
          grad.addColorStop(1, darkenColor(fill, 0.3));
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = fill;
        }
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.fill(); ctx.stroke();
        ctx.restore();
        if (shape==='WHEEL') {
          ctx.beginPath(); ctx.moveTo(0,-sy); ctx.lineTo(0,sy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-sx,0); ctx.lineTo(sx,0); ctx.stroke();
        }
      } else {
        ctx.save();
        ctx.fillStyle = fill;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(-sx,-sy,sx*2,sy*2);
        ctx.strokeRect(-sx,-sy,sx*2,sy*2);
        ctx.restore();
      }
      ctx.restore();

    } else if (el.type === 'Elements.Spring2D') {
      const x0 = toPixX(evalExpr(p.X||'0'));
      const y0 = toPixY(evalExpr(p.Y||'0'));
      const x1 = toPixX(evalExpr(p.X||'0') + evalExpr(p.SizeX||'2'));
      const y1 = toPixY(evalExpr(p.Y||'0') + evalExpr(p.SizeY||'0'));
      const color = (p.LineColor||'"#64748b"').replace(/^"|"$/g,'');
      const dx = x1-x0, dy = y1-y0;
      const len = Math.sqrt(dx*dx+dy*dy);
      const nx = -dy/len, ny = dx/len; // normal
      const coils = 8, amp = 8;
      ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i=0; i<=coils*10; i++) {
        const t = i/(coils*10);
        const s = Math.sin(t*coils*2*Math.PI)*amp;
        ctx.lineTo(x0+t*dx+s*nx, y0+t*dy+s*ny);
      }
      ctx.stroke();

    } else if (el.type === 'Elements.Arrow2D') {
      const x = evalExpr(p.X||'0'), y = evalExpr(p.Y||'0');
      const vx = evalExpr(p.SizeX||'1'), vy = evalExpr(p.SizeY||'0');
      const px = toPixX(x), py = toPixY(y);
      const ex = toPixX(x + vx), ey = toPixY(y + vy);
      const color = (p.FillColor||p.LineColor||'"#ef4444"').replace(/^"|"$/g,'');
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(ex,ey); ctx.stroke();
      // arrowhead
      const ang = Math.atan2(ey-py,ex-px);
      const aLen = 8;
      ctx.beginPath();
      ctx.moveTo(ex,ey);
      ctx.lineTo(ex-aLen*Math.cos(ang-0.4), ey-aLen*Math.sin(ang-0.4));
      ctx.lineTo(ex-aLen*Math.cos(ang+0.4), ey-aLen*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fill();

    } else if (el.type === 'Elements.Trail2D') {
      const x = evalExpr(p.X||'0'), y = evalExpr(p.Y||'0');
      const trail = trails[el.id];
      const maxPts = parseInt(p.MaximumPoints||'1000');
      trail.push([toPixX(x), toPixY(y)]);
      if (trail.length > maxPts) trail.shift();
      if (trail.length < 2) return;
      const color = (p.LineColor||'"#3b82f6"').replace(/^"|"$/g,'');
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = 1.8;
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      ctx.beginPath();
      trail.forEach(function(pt,i){ i===0 ? ctx.moveTo(pt[0],pt[1]) : ctx.lineTo(pt[0],pt[1]); });
      ctx.stroke();
      ctx.restore();
    } else if (el.type === 'Elements.CustomDraw') {
      try {
        const drawVF = function(fnFx: (x: number, y: number) => number, fnFy: (x: number, y: number) => number, stepX?: number, stepY?: number, color?: string) {
          const col = color || 'rgba(148, 163, 184, 0.25)';
          ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
          const sx = stepX || (maxX - minX) / 15;
          const sy = stepY || (maxY - minY) / 15;
          for (let wx = minX + sx/2; wx <= maxX; wx += sx) {
            for (let wy = minY + sy/2; wy <= maxY; wy += sy) {
              let fx = 0, fy = 0;
              try { fx = fnFx(wx, wy); fy = fnFy(wx, wy); } catch(e) {}
              const len = Math.sqrt(fx*fx + fy*fy);
              if (len < 1e-6) continue;
              const maxArrowLen = Math.min(toPixLen(sx), toPixLen(sy)) * 0.7;
              const arrowLen = Math.min(toPixLen(len), maxArrowLen);
              const dx = (fx / len) * arrowLen;
              const dy = (fy / len) * arrowLen;
              const px = toPixX(wx);
              const py = toPixY(wy);
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + dx, py - dy); ctx.stroke();
              const ang = Math.atan2(-dy, dx), aLen = 4;
              ctx.beginPath(); ctx.moveTo(px + dx, py - dy);
              ctx.lineTo(px + dx - aLen*Math.cos(ang-0.4), py - dy - aLen*Math.sin(ang-0.4));
              ctx.lineTo(px + dx - aLen*Math.cos(ang+0.4), py - dy - aLen*Math.sin(ang+0.4));
              ctx.closePath(); ctx.fill();
            }
          }
        };
        new Function('ctx','vars','toPixX','toPixY','toPixLen','W','H','drawVectorField', p.Code||'')(ctx, vars, toPixX, toPixY, toPixLen, W, H, drawVF);
      } catch(e) { console.warn('CustomDraw:', e); }
    }
  });

  // Variable display
  const disp = document.getElementById('varDisplay');
  if (disp) {
    disp.innerHTML = STATE.variables.filter(function(v){return v.scope==='global';}).slice(0,10).map(function(v){
      const val = vars[v.name];
      const fmt = typeof val==='number' ? val.toFixed(3) : String(val);
      return '<span class="var-item"><span class="var-name">'+v.name+'</span>'
           + '<span class="var-eq">=</span><span class="var-value">'+fmt+'</span></span>';
    }).join('');
  }
}

// ── Simulation loop ────────────────────────────────────────────────
let running = false, rafId = null;
let _isPaused = true;
let lastTs = null;

function getMinDt() {
  let dt = vars.dt || 0.05;
  STATE.odePages.forEach(function(p) {
    const d = evalExpr(p.increment) || vars.dt || 0.05;
    if (d < dt) dt = d;
  });
  return dt;
}

function loop(ts) {
  if (lastTs === null) lastTs = ts;
  const elapsed = Math.min((ts - lastTs) / 1000, 0.1);
  lastTs = ts;
  const dt = getMinDt();
  const steps = Math.min(Math.max(1, Math.round(elapsed / dt)), 500);
  for (var i = 0; i < steps; i++) evolve();
  render();
  if (running) rafId = requestAnimationFrame(loop);
}

function simPlay()  { if (!running) { running=true; _isPaused=false; lastTs=null; rafId=requestAnimationFrame(loop); } }
function simPause() { running=false; _isPaused=true; lastTs=null; if(rafId) cancelAnimationFrame(rafId); }
function simStep()  { evolve(); render(); }
function simReset() {
  simPause();
  Object.assign(vars, origVars);
  vars.t = 0;
  Object.keys(trails).forEach(function(k){ trails[k]=[]; });
  SIM_DATA_LOG = [];
  runInit();
  render();
}

// postMessage control (from parent frame)
window.addEventListener('message', function(e){
  if (e.data==='play')  simPlay();
  if (e.data==='pause') simPause();
  if (e.data==='reset') simReset();
  if (e.data==='step')  simStep();
});

// Slider init
(function(){
  var c=document.getElementById('sliders');
  if(!c) return;
  STATE.viewElements.forEach(function(el){
    if(el.type!=='Elements.Slider') return;
    var p=el.properties, vn=p.Variable||'';
    if(!vn) return;
    var row=document.createElement('div');
    row.className='slider-row';
    var lbl=document.createElement('label');
    lbl.textContent=(p.Label||vn)+':';
    var inp=document.createElement('input');
    inp.type='range'; inp.min=p.Minimum||'-10'; inp.max=p.Maximum||'10'; inp.step=p.Step||'0.1';
    inp.dataset.varname=vn;
    inp.value=vars[vn]!==undefined?String(vars[vn]):String((parseFloat(p.Minimum||'-10')+parseFloat(p.Maximum||'10'))/2);
    var val=document.createElement('span');
    val.className='slider-val';
    val.textContent=parseFloat(inp.value).toFixed(2);
    inp.addEventListener('input',function(){
      vars[vn]=parseFloat(this.value);
      val.textContent=parseFloat(this.value).toFixed(2);
      if(!running) render();
    });
    row.appendChild(lbl); row.appendChild(inp); row.appendChild(val);
    c.appendChild(row);
  });
  if(!c.children.length) c.style.display='none';
})();

// Description rendering (Markdown + LaTeX)
(function(){
  try {
    var rawDesc = ${JSON.stringify(state.description || '')};
    var hasDesc = rawDesc && rawDesc.trim().length > 0;
    if (hasDesc) {
      document.getElementById('description-content').innerHTML = marked.parse(rawDesc);
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\\\(', right: '\\\\)', display: false},
          {left: '\\\\[', right: '\\\\]', display: true}
        ],
        throwOnError: false
      });
    } else {
      var dPanel = document.getElementById('desc-panel');
      if (dPanel) dPanel.style.display = 'none';
      var sPanel = document.getElementById('sim-panel');
      if (sPanel) {
        sPanel.style.width = '100%';
        sPanel.style.maxWidth = '600px';
        sPanel.style.background = 'transparent';
        sPanel.style.margin = '0 auto';
        sPanel.style.borderLeft = 'none';
      }
    }
  } catch(e) {
    console.error('Description parse error:', e);
  }
})();

window._simRender = render;
runInit();render();
})();
</script>
</body>
</html>`;
}

const MAIN_EL_TYPES = new Set(['Elements.DrawingPanel']);
const CTRL_EL_TYPES = new Set([
  'Elements.Button','Elements.TwoStateButton',
  'Elements.Label','Elements.ParsedField','Elements.Slider',
]);
const CHART_EL_TYPES = new Set(['Elements.PlottingPanel']);

const EL_DEF_SIZES: Record<string, [number, number]> = {
  'Elements.DrawingPanel':    [400, 400],
  'Elements.PlottingPanel':   [300, 200],
  'Elements.Button':          [ 80,  32],
  'Elements.TwoStateButton':  [ 80,  32],
  'Elements.Slider':          [200,  32],
  'Elements.Label':           [100,  24],
  'Elements.ParsedField':     [ 80,  24],
};

type ElLayout = { el: SimulationState['viewElements'][number]; x: number; y: number; w: number; h: number };

function elDims(e: SimulationState['viewElements'][number]): { w: number; h: number } {
  const [defW, defH] = EL_DEF_SIZES[e.type] ?? [100, 32];
  return {
    w: e.width  ?? (parseInt(e.properties.Width  ?? '0') || defW),
    h: e.height ?? (parseInt(e.properties.Height ?? '0') || defH),
  };
}

// Lay out a group of elements. If any element has template x/y, use those
// coordinates and normalize to (0,0). Otherwise auto-layout left-to-right.
function layoutGroup(els: SimulationState['viewElements']): { items: ElLayout[]; panelW: number; panelH: number } {
  if (!els.length) return { items: [], panelW: 0, panelH: 0 };
  const hasCoords = els.some((e) => e.x != null);
  if (hasCoords) {
    const raw = els.map((e) => { const { w, h } = elDims(e); return { el: e, x: e.x ?? 0, y: e.y ?? 0, w, h }; });
    const minX = Math.min(...raw.map((i) => i.x));
    const minY = Math.min(...raw.map((i) => i.y));
    const items = raw.map((i) => ({ ...i, x: i.x - minX, y: i.y - minY }));
    return {
      items,
      panelW: Math.max(...items.map((i) => i.x + i.w)),
      panelH: Math.max(...items.map((i) => i.y + i.h)),
    };
  }
  const GAP = 4;
  let curX = 0, maxH = 0;
  const items = els.map((e) => {
    const { w, h } = elDims(e);
    const item = { el: e, x: curX, y: 0, w, h };
    curX += w + GAP;
    maxH = Math.max(maxH, h);
    return item;
  });
  return { items, panelW: Math.max(curX - GAP, 0), panelH: maxH };
}

export function computeSimBBox(viewElements: SimulationState['viewElements']): { w: number; h: number } {
  const mainEls  = viewElements.filter((e) => MAIN_EL_TYPES.has(e.type));
  const ctrlEls  = viewElements.filter((e) => CTRL_EL_TYPES.has(e.type));
  const chartEls = viewElements.filter((e) => CHART_EL_TYPES.has(e.type));
  if (!mainEls.length && !ctrlEls.length && !chartEls.length) return { w: 400, h: 400 };
  const { panelW: mainW,  panelH: mainH  } = layoutGroup(mainEls);
  const { panelH: ctrlH  } = layoutGroup(ctrlEls);
  const { panelW: chartW, panelH: chartH } = layoutGroup(chartEls);
  // ctrl-panel width adapts to main-panel — sliders stretch to fill canvas width
  const bbW = Math.max(mainW, chartW, 200);
  return {
    w: bbW,
    h: Math.max(mainH + ctrlH + chartH, 100),
  };
}

// Preview: three stacked panels — main (animation), ctrl (controls), chart (plots).
// Elements with template x/y are normalized within their panel; others are auto-laid-out.
export function buildPreviewHTML(state: SimulationState): string {
  const mainEls  = state.viewElements.filter((e) => MAIN_EL_TYPES.has(e.type));
  const ctrlEls  = state.viewElements.filter((e) => CTRL_EL_TYPES.has(e.type));
  const chartEls = state.viewElements.filter((e) => CHART_EL_TYPES.has(e.type));

  const { items: mainItems,  panelW: mainW,  panelH: mainH  } = layoutGroup(mainEls);
  const { items: ctrlItemsRaw, panelH: ctrlH  } = layoutGroup(ctrlEls);
  const { items: chartItems, panelW: chartW, panelH: chartH } = layoutGroup(chartEls);

  // ctrl-panel adapts to canvas width: evenly distribute slider widths
  const bbW = Math.max(mainW, chartW, 200);
  const bbH = Math.max(mainH + ctrlH + chartH, 100);
  const ctrlCount = ctrlItemsRaw.length;
  const CTRL_GAP = 4;
  const slotW = ctrlCount > 0 ? Math.floor((bbW - CTRL_GAP * (ctrlCount - 1)) / ctrlCount) : bbW;
  const ctrlItems: ElLayout[] = ctrlItemsRaw.map((item, i) => ({
    ...item,
    x: i * (slotW + CTRL_GAP),
    w: slotW,
  }));

  function renderItem({ el, x, y, w, h }: ElLayout): string {
    const pos = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    const p = el.properties;
    switch (el.type) {
      case 'Elements.DrawingPanel':
        return `<canvas id="dp_${el.id}" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" style="${pos}" width="${w}" height="${h}"></canvas>`;
      case 'Elements.PlottingPanel':
        return `<canvas id="pp_${el.id}" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" style="${pos}" width="${w}" height="${h}"></canvas>`;
      case 'Elements.Button': {
        const txt = (p.Text || '"按鈕"').replace(/^"|"$/g, '');
        return `<button id="btn_${el.id}" class="sim-btn" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" data-fs="15" style="${pos}">${txt}</button>`;
      }
      case 'Elements.TwoStateButton':
        return `<button id="tsb_${el.id}" class="sim-btn" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" data-fs="15" style="${pos}">▶ 播放</button>`;
      case 'Elements.Label': {
        const txt = (p.Text || '""').replace(/^"|"$/g, '');
        return `<div id="lbl_${el.id}" class="sim-label" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" data-fs="16" style="${pos}">${txt}</div>`;
      }
      case 'Elements.ParsedField':
        return `<div id="pf_${el.id}" class="sim-field" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" data-fs="15" style="${pos}">0</div>`;
      case 'Elements.Slider': {
        const vn = p.Variable || '';
        if (!vn) return '';
        return `<div id="sl_${el.id}" class="sim-slider" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" data-fs="14" style="${pos}">` +
          `<div class="sl-header"><span class="sl-lbl" data-fs="14">${p.Label || vn}</span><span id="slv_${el.id}" class="sl-val" data-fs="13">0</span></div>` +
          `<input type="range" id="slr_${el.id}" min="${p.Minimum||'0'}" max="${p.Maximum||'10'}" step="${p.Step||'0.1'}" data-var="${vn}" class="sl-inp">` +
          `</div>`;
      }
      default:
        return '';
    }
  }

  const mainHTML  = mainItems.map(renderItem).join('\n');
  const ctrlHTML  = ctrlItems.map(renderItem).join('\n');
  const chartHTML = chartItems.map(renderItem).join('\n');

  const divider = (show: boolean) => show ? 'border-top:1px solid #e2e8f0;' : '';
  const mainPanelHTML = mainH > 0
    ? `<div id="main-panel" data-x="0" data-y="0" data-w="${bbW}" data-h="${mainH}" style="position:absolute;top:0;left:0;width:${bbW}px;height:${mainH}px;">\n${mainHTML}\n</div>`
    : '';
  const ctrlPanelHTML = ctrlH > 0
    ? `<div id="ctrl-panel" data-x="0" data-y="${mainH}" data-w="${bbW}" data-h="${ctrlH}" style="position:absolute;top:${mainH}px;left:0;width:${bbW}px;height:${ctrlH}px;background:#f8fafc;${divider(mainH > 0)}">\n${ctrlHTML}\n</div>`
    : '';
  const chartPanelHTML = chartH > 0
    ? `<div id="chart-panel" data-x="0" data-y="${mainH + ctrlH}" data-w="${bbW}" data-h="${chartH}" style="position:absolute;top:${mainH + ctrlH}px;left:0;width:${bbW}px;height:${chartH}px;background:#ffffff;${divider(mainH + ctrlH > 0)}">\n${chartHTML}\n</div>`
    : '';

  const stateJson = JSON.stringify({
    variables: state.variables,
    odePages: state.odePages,
    constraintPages: state.constraintPages,
    initPages: state.initPages,
    viewElements: state.viewElements,
    info: state.info,
    isLocked: state.isLocked || false,
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:100%;height:100%;overflow:hidden;background:#f8fafc;}
#sim-root{position:absolute;top:0;left:0;width:${bbW}px;height:${bbH}px;transform-origin:top left;}
.sim-btn{cursor:pointer;font-size:15px;font-weight:bold;border:none;border-radius:6px;background:#6366f1;color:white;padding:2px 12px;}
.sim-btn:hover{background:#4f46e5;}
.sim-label{font-size:16px;font-family:sans-serif;display:flex;align-items:center;}
.sim-field{font-family:monospace;font-size:15px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;display:flex;align-items:center;justify-content:center;}
.sim-slider{display:flex;flex-direction:column;gap:2px;font-size:14px;font-family:sans-serif;padding:2px 4px;}
.sl-header{display:flex;justify-content:space-between;align-items:center;gap:4px;}
.sl-lbl{color:#374151;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sl-inp{width:100%;cursor:pointer;accent-color:#6366f1;}
.sl-val{flex-shrink:0;color:#16a34a;font-family:monospace;font-weight:bold;font-size:13px;}
</style>
</head>
<body>
<div id="sim-root" data-x="0" data-y="0" data-w="${bbW}" data-h="${bbH}">
${mainPanelHTML}
${ctrlPanelHTML}
${chartPanelHTML}
</div>
<script>
(function(){
const STATE=${stateJson};
const BBW=${bbW},BBH=${bbH};

// resizeAll is moved to the bottom to prevent layout crash from premature references

// ── Variable bag ──────────────────────────────────────────────────────
const vars=Object.create(null);
vars.t=0;vars.dt=0.05;vars._isPaused=true;
STATE.variables.forEach(function(v){
  if(v.type==='boolean')vars[v.name]=(v.value==='true');
  else if(v.type==='int')vars[v.name]=parseInt(v.value)||0;
  else if(v.type==='String')vars[v.name]=(v.value||'').replace(/^"|"$/g,'');
  else vars[v.name]=parseFloat(v.value)||0;
});
vars._isLocked = STATE.isLocked || false;
const origVars=Object.assign({},vars);

function execCode(code){if(!code||!code.trim())return;try{new Function('_v','with(_v){'+code+'}')(vars);}catch(e){}}
function evalExpr(expr){if(!expr||!expr.trim())return 0;try{return new Function('_v','with(_v){return('+expr+')}')(vars);}catch(e){return 0;}}
function darkenColor(col, percent) {
  if (!col) return col;
  col = String(col).trim();
  if (col.startsWith('#')) {
    var num = parseInt(col.slice(1), 16),
        amt = Math.round(2.55 * (percent * 100)),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R<0?0:R>255?255:R)*0x10000 + (G<0?0:G>255?255:G)*0x100 + (B<0?0:B>255?255:B)).toString(16).slice(1);
  }
  return col;
}

// ── Physics ───────────────────────────────────────────────────────────
function runInit(){STATE.initPages.forEach(function(p){execCode(p.code);});}
function runFixed(){STATE.constraintPages.forEach(function(p){execCode(p.code);});}
function stepEuler(page){
  var dt=evalExpr(page.increment)||vars.dt||0.05;
  var d={};page.rates.forEach(function(r){d[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){if(r.state in vars)vars[r.state]+=d[r.state]*dt;});
  vars.t=(vars.t||0)+dt;
}
function stepRK4(page){
  var dt=evalExpr(page.increment)||vars.dt||0.05;
  var t0=vars.t;
  var states=page.rates.map(function(r){return r.state;});
  var gr=function(){return page.rates.map(function(r){return evalExpr(r.expression);});};
  var sn={};states.forEach(function(s){sn[s]=vars[s];});
  var k1=gr();states.forEach(function(s,i){vars[s]=sn[s]+k1[i]*dt/2;});vars.t=t0+dt/2;
  var k2=gr();states.forEach(function(s,i){vars[s]=sn[s]+k2[i]*dt/2;});vars.t=t0+dt/2;
  var k3=gr();states.forEach(function(s,i){vars[s]=sn[s]+k3[i]*dt;});vars.t=t0+dt;
  var k4=gr();states.forEach(function(s,i){vars[s]=sn[s]+(k1[i]+2*k2[i]+2*k3[i]+k4[i])*dt/6;});
  vars.t=t0+dt;
}
function stepVerlet(page){
  var dt=evalExpr(page.increment)||vars.dt||0.05;
  var t0=vars.t;
  var sn={};page.rates.forEach(function(r){sn[r.state]=vars[r.state];});
  var a0={};page.rates.forEach(function(r){a0[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=sn[r.state]+sn[r.state]*dt+0.5*a0[r.state]*dt*dt;});
  var a1={};page.rates.forEach(function(r){a1[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=sn[r.state]+0.5*(a0[r.state]+a1[r.state])*dt;});
  vars.t=t0+dt;
}
var SIM_DATA_LOG = [];
function collectSimDataLog() {
  var entry = { t: vars.t };
  STATE.variables.filter(function(v){return v.scope==='global';}).forEach(function(v){
    entry[v.name] = vars[v.name];
  });
  SIM_DATA_LOG.push(entry);
  if (SIM_DATA_LOG.length > 100000) SIM_DATA_LOG.shift();
}
function exportCSVString() {
  var gvars = STATE.variables.filter(function(v){return v.scope==='global';});
  var headers = ['t'].concat(gvars.map(function(v){return v.name;}));
  var lines = [headers.join(',')];
  SIM_DATA_LOG.forEach(function(row) {
    var line = [row.t.toFixed(4)];
    gvars.forEach(function(v) {
      var val = row[v.name];
      if (typeof val === 'number') line.push(val.toFixed(4));
      else line.push(String(val));
    });
    lines.push(line.join(','));
  });
  return lines.join(String.fromCharCode(10));
}

function evolve(){
  runFixed();
  STATE.odePages.forEach(function(page){
    if(page.method==='RungeKutta')stepRK4(page);
    else if(page.method==='Verlet')stepVerlet(page);
    else stepEuler(page);
  });
  runFixed();
  collectSimDataLog();
}

// ── DrawingPanel registry ─────────────────────────────────────────────
var DRAW_PANELS=[];
STATE.viewElements.forEach(function(el){
  if(el.type!=='Elements.DrawingPanel')return;
  var c=document.getElementById('dp_'+el.id);
  if(!c)return;
  var minX=parseFloat(el.properties.MinimumX||'-5');
  var maxX=parseFloat(el.properties.MaximumX||'5');
  var minY=parseFloat(el.properties.MinimumY||'-5');
  var maxY=parseFloat(el.properties.MaximumY||'5');
  
  var dpr=window.devicePixelRatio||1;
  var logicalW=c.width;
  var logicalH=c.height;
  c.width=logicalW*dpr;
  c.height=logicalH*dpr;
  var ctx=c.getContext('2d');
  ctx.scale(dpr,dpr);

  var panelObj={
    id:el.id,el:el,c:c,ctx:ctx,
    logicalW:logicalW,logicalH:logicalH,
    minX:minX,maxX:maxX,minY:minY,maxY:maxY,
    toPixX:function(x){return(x-minX)/(maxX-minX)*panelObj.logicalW;},
    toPixY:function(y){return panelObj.logicalH-(y-minY)/(maxY-minY)*panelObj.logicalH;},
    toPixLen:function(l){return Math.abs(l)/(maxX-minX)*panelObj.logicalW;},
    toWorldX:function(px){return minX+(px/panelObj.logicalW)*(maxX-minX);},
    toWorldY:function(py){return minY+((panelObj.logicalH-py)/panelObj.logicalH)*(maxY-minY);},
    toWorldLen:function(pl){return (pl/panelObj.logicalW)*(maxX-minX);}
  };
  DRAW_PANELS.push(panelObj);
});

// ── Drag & Drop handler ───────────────────────────────────────────────
var dragTarget = null;
DRAW_PANELS.forEach(function(panel) {
  var c = panel.c;
  
  function getMouseCoords(e) {
    var rect = c.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    var scaleX = panel.logicalW / rect.width;
    var scaleY = panel.logicalH / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function handleStart(e) {
    if (vars._isLocked) return; // If locked in assignment mode, dragging is disabled
    var coords = getMouseCoords(e);
    var wx = panel.toWorldX(coords.x);
    var wy = panel.toWorldY(coords.y);
    
    for (var i = STATE.viewElements.length - 1; i >= 0; i--) {
      var el = STATE.viewElements[i];
      if (getDrawPanel(el.parent) !== panel) continue;
      var p = el.properties;
      var isVisible = p.Visible ? evalExpr(p.Visible) : true;
      if (!isVisible) continue;
      
      var isDraggable = p.Draggable && evalExpr(p.Draggable);
      if (!isDraggable) continue;

      if (el.type === 'Elements.Shape2D') {
        var sx = evalExpr(p.X || '0');
        var sy = evalExpr(p.Y || '0');
        var rx = evalExpr(p.SizeX || '0.3');
        var ry = evalExpr(p.SizeY || '0.3');
        if (Math.abs(wx - sx) <= rx && Math.abs(wy - sy) <= ry) {
          dragTarget = {
            type: 'shape',
            el: el,
            offsetX: wx - sx,
            offsetY: wy - sy,
            p: p
          };
          e.preventDefault();
          break;
        }
      } else if (el.type === 'Elements.Arrow2D') {
        var sx = evalExpr(p.X || '0');
        var sy = evalExpr(p.Y || '0');
        var vx = evalExpr(p.SizeX || '1');
        var vy = evalExpr(p.SizeY || '0');
        var ax = sx + vx;
        var ay = sy + vy;
        var dist = Math.sqrt(Math.pow(wx - ax, 2) + Math.pow(wy - ay, 2));
        var grabDistLimit = panel.toWorldLen(16);
        if (dist <= grabDistLimit) {
          dragTarget = {
            type: 'arrow',
            el: el,
            startX: sx,
            startY: sy,
            p: p
          };
          e.preventDefault();
          break;
        }
      }
    }
  }

  function handleMove(e) {
    if (!dragTarget) return;
    var coords = getMouseCoords(e);
    var wx = panel.toWorldX(coords.x);
    var wy = panel.toWorldY(coords.y);
    var p = dragTarget.p;
    
    if (dragTarget.type === 'shape') {
      var newX = wx - dragTarget.offsetX;
      var newY = wy - dragTarget.offsetY;
      var xName = p.X || '';
      var yName = p.Y || '';
      if (xName && vars[xName] !== undefined) vars[xName] = newX;
      if (yName && vars[yName] !== undefined) vars[yName] = newY;
    } else if (dragTarget.type === 'arrow') {
      var newVx = wx - dragTarget.startX;
      var newVy = wy - dragTarget.startY;
      var sxName = p.SizeX || '';
      var syName = p.SizeY || '';
      if (sxName && vars[sxName] !== undefined) vars[sxName] = newVx;
      if (syName && vars[syName] !== undefined) vars[syName] = newVy;
    }
    
    if (!running) render();
    e.preventDefault();
  }

  function handleEnd() {
    dragTarget = null;
  }

  c.addEventListener('mousedown', handleStart);
  c.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);

  c.addEventListener('touchstart', handleStart, { passive: false });
  c.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
});

// ── PlottingPanel registry ────────────────────────────────────────────
var PLOT_PANELS=[];
var PLOT_DATA={};
var CHART_COLORS=['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#d946ef'];
var MAX_PLOT_PTS=300;
STATE.viewElements.forEach(function(el){
  if(el.type!=='Elements.PlottingPanel')return;
  var c=document.getElementById('pp_'+el.id);
  if(!c)return;

  var dpr=window.devicePixelRatio||1;
  var logicalW=c.width;
  var logicalH=c.height;
  c.width=logicalW*dpr;
  c.height=logicalH*dpr;
  var ctx=c.getContext('2d');
  ctx.scale(dpr,dpr);

  PLOT_PANELS.push({id:el.id,el:el,c:c,ctx:ctx,logicalW:logicalW,logicalH:logicalH});
  PLOT_DATA[el.id]={xs:[],vals:{}};
});

var trails={};
STATE.viewElements.forEach(function(el){if(el.type==='Elements.Trail2D')trails[el.id]=[];});

// ── Canvas helpers ────────────────────────────────────────────────────
function getDrawPanel(parentId){
  if(!DRAW_PANELS.length)return null;
  if(!parentId)return DRAW_PANELS[0];
  return DRAW_PANELS.filter(function(p){return p.id===parentId||p.el.name===parentId;})[0]||DRAW_PANELS[0];
}

function drawGrid(panel){
  var ctx=panel.ctx,W=panel.logicalW,H=panel.logicalH;
  var minX=panel.minX,maxX=panel.maxX,minY=panel.minY,maxY=panel.maxY;
  var tpX=panel.toPixX,tpY=panel.toPixY;
  var spanX=maxX-minX;
  var interval=1.0;
  if(spanX<=0.5)interval=0.05;
  else if(spanX<=1.5)interval=0.2;
  else if(spanX<=4)interval=0.5;
  else if(spanX<=12)interval=1.0;
  else if(spanX<=30)interval=5.0;
  else interval=10.0;

  ctx.save();
  ctx.strokeStyle='rgba(148, 163, 184, 0.08)';ctx.lineWidth=1.0;
  var startX=Math.ceil(minX/interval)*interval;
  for(var x=startX;x<=maxX;x+=interval){
    if(Math.abs(x)<1e-5)continue;
    var px=tpX(x);ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px,H);ctx.stroke();
  }
  var startY=Math.ceil(minY/interval)*interval;
  for(var y=startY;y<=maxY;y+=interval){
    if(Math.abs(y)<1e-5)continue;
    var py=tpY(y);ctx.beginPath();ctx.moveTo(0,py);ctx.lineTo(W,py);ctx.stroke();
  }

  ctx.strokeStyle='rgba(148, 163, 184, 0.25)';ctx.lineWidth=1.5;
  var zx=tpX(0),zy=tpY(0);
  if(zy>0&&zy<H){ctx.beginPath();ctx.moveTo(0,zy);ctx.lineTo(W,zy);ctx.stroke();}
  if(zx>0&&zx<W){ctx.beginPath();ctx.moveTo(zx,0);ctx.lineTo(zx,H);ctx.stroke();}

  ctx.fillStyle='rgba(148, 163, 184, 0.6)';ctx.font='9px monospace';
  ctx.textAlign='center';ctx.textBaseline='top';
  for(var x=startX;x<=maxX;x+=interval){
    var px=tpX(x);
    if(px>10&&px<W-10){
      var yPos=zy>0&&zy<H-15?zy+4:H-15;
      ctx.fillText(x.toFixed(1).replace(/\.0$/, ''),px,yPos);
    }
  }
  ctx.textAlign='right';ctx.textBaseline='middle';
  for(var y=startY;y<=maxY;y+=interval){
    var py=tpY(y);
    if(py>10&&py<H-10){
      var xPos=zx>15&&zx<W-5?zx-4:20;
      ctx.fillText(y.toFixed(1).replace(/\.0$/, ''),xPos,py);
    }
  }
  ctx.restore();
}

function drawAxes(panel){
  drawGrid(panel);
}

function drawElements(panel){
  var ctx=panel.ctx,W=panel.logicalW,H=panel.logicalH;
  var tpX=panel.toPixX,tpY=panel.toPixY,tpL=panel.toPixLen;
  STATE.viewElements.forEach(function(el){
    try {
      var p=el.properties;
    if(el.type==='Elements.Shape2D'){
      if(getDrawPanel(el.parent)!==panel)return;
      if(p.Visible&&!evalExpr(p.Visible))return;
      var x=evalExpr(p.X||'0'),y=evalExpr(p.Y||'0');
      var sx=tpL(evalExpr(p.SizeX||'0.3')),sy=tpL(evalExpr(p.SizeY||'0.3'));
      var px=tpX(x),py=tpY(y);
      var fill=(p.FillColor||'"#3b82f6"').replace(/^"|"$/g,'');
      var line=(p.LineColor||'"#1e293b"').replace(/^"|"$/g,'');
      var angle=evalExpr(p.Transformation||'0');
      ctx.save();ctx.translate(px,py);if(angle)ctx.rotate(-angle);
      var shape=p.ShapeType||'ELLIPSE';
      ctx.strokeStyle=line;ctx.lineWidth=1.5;
      if(shape==='ELLIPSE'||shape==='WHEEL'){
        ctx.save();
        ctx.beginPath();ctx.ellipse(0,0,Math.max(sx,2),Math.max(sy,2),0,0,2*Math.PI);
        if(Math.abs(sx-sy)<1e-3 && sx>4){
          var grad=ctx.createRadialGradient(-sx*0.2,-sy*0.2,sx*0.05,0,0,sx);
          grad.addColorStop(0,'#ffffff');
          grad.addColorStop(0.25,fill);
          grad.addColorStop(1,darkenColor(fill,0.3));
          ctx.fillStyle=grad;
        } else {
          ctx.fillStyle=fill;
        }
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();ctx.stroke();
        ctx.restore();
        if(shape==='WHEEL'){ctx.beginPath();ctx.moveTo(0,-sy);ctx.lineTo(0,sy);ctx.stroke();ctx.beginPath();ctx.moveTo(-sx,0);ctx.lineTo(sx,0);ctx.stroke();}
      }else{
        ctx.save();
        ctx.fillStyle=fill;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(-sx,-sy,sx*2,sy*2);ctx.strokeRect(-sx,-sy,sx*2,sy*2);
        ctx.restore();
      }
      ctx.restore();
    }else if(el.type==='Elements.Spring2D'){
      if(getDrawPanel(el.parent)!==panel)return;
      var x0=tpX(evalExpr(p.X||'0')),y0=tpY(evalExpr(p.Y||'0'));
      var x1=tpX(evalExpr(p.X||'0')+evalExpr(p.SizeX||'2')),y1=tpY(evalExpr(p.Y||'0')+evalExpr(p.SizeY||'0'));
      var dx=x1-x0,dy=y1-y0,len=Math.sqrt(dx*dx+dy*dy)||1;
      var nx=-dy/len,ny=dx/len,coils=8,amp=8;
      ctx.strokeStyle=(p.LineColor||'"#64748b"').replace(/^"|"$/g,'');ctx.lineWidth=2;ctx.beginPath();
      for(var i=0;i<=coils*10;i++){var t=i/(coils*10),s=Math.sin(t*coils*2*Math.PI)*amp;ctx.lineTo(x0+t*dx+s*nx,y0+t*dy+s*ny);}
      ctx.stroke();
    }else if(el.type==='Elements.Arrow2D'){
      if(getDrawPanel(el.parent)!==panel)return;
      var ax=evalExpr(p.X||'0'),ay=evalExpr(p.Y||'0');
      var vx=evalExpr(p.SizeX||'1'),vy=evalExpr(p.SizeY||'0');
      var apx=tpX(ax),apy=tpY(ay),ex=tpX(ax+vx),ey=tpY(ay+vy);
      var acolor=(p.FillColor||p.LineColor||'"#ef4444"').replace(/^"|"$/g,'');
      ctx.strokeStyle=acolor;ctx.fillStyle=acolor;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(apx,apy);ctx.lineTo(ex,ey);ctx.stroke();
      var ang=Math.atan2(ey-apy,ex-apx),aLen=8;
      ctx.beginPath();ctx.moveTo(ex,ey);
      ctx.lineTo(ex-aLen*Math.cos(ang-0.4),ey-aLen*Math.sin(ang-0.4));
      ctx.lineTo(ex-aLen*Math.cos(ang+0.4),ey-aLen*Math.sin(ang+0.4));
      ctx.closePath();ctx.fill();
    }else if(el.type==='Elements.Trail2D'){
      if(getDrawPanel(el.parent)!==panel)return;
      var tx=evalExpr(p.X||'0'),ty=evalExpr(p.Y||'0');
      var trail=trails[el.id],maxPts=parseInt(p.MaximumPoints||'1000');
      trail.push([tpX(tx),tpY(ty)]);if(trail.length>maxPts)trail.shift();
      if(trail.length<2)return;
      var tcolor=(p.LineColor||'"#3b82f6"').replace(/^"|"$/g,'');
      ctx.save();
      ctx.strokeStyle=tcolor;ctx.lineWidth=1.8;
      ctx.shadowBlur=4;ctx.shadowColor=tcolor;
      ctx.beginPath();
      trail.forEach(function(pt,fi){fi===0?ctx.moveTo(pt[0],pt[1]):ctx.lineTo(pt[0],pt[1]);});ctx.stroke();
      ctx.restore();
    }else if(el.type==='Elements.CustomDraw'){
      if(getDrawPanel(el.parent)!==panel)return;
      try{
        var drawVF = function(fnFx, fnFy, stepX, stepY, color) {
          var minX = parseFloat(panel.el.properties.MinimumX||'-5');
          var maxX = parseFloat(panel.el.properties.MaximumX||'5');
          var minY = parseFloat(panel.el.properties.MinimumY||'-5');
          var maxY = parseFloat(panel.el.properties.MaximumY||'5');
          var col = color || 'rgba(148, 163, 184, 0.25)';
          ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
          var sx = stepX || (maxX - minX) / 15;
          var sy = stepY || (maxY - minY) / 15;
          for (var wx = minX + sx/2; wx <= maxX; wx += sx) {
            for (var wy = minY + sy/2; wy <= maxY; wy += sy) {
              var fx = 0, fy = 0;
              try { fx = fnFx(wx, wy); fy = fnFy(wx, wy); } catch(e) {}
              var len = Math.sqrt(fx*fx + fy*fy);
              if (len < 1e-6) continue;
              var maxArrowLen = Math.min(tpL(sx), tpL(sy)) * 0.7;
              var arrowLen = Math.min(tpL(len), maxArrowLen);
              var dx = (fx / len) * arrowLen;
              var dy = (fy / len) * arrowLen;
              var px = tpX(wx);
              var py = tpY(wy);
              ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + dx, py - dy); ctx.stroke();
              var ang = Math.atan2(-dy, dx), aLen = 4;
              ctx.beginPath(); ctx.moveTo(px + dx, py - dy);
              ctx.lineTo(px + dx - aLen*Math.cos(ang-0.4), py - dy - aLen*Math.sin(ang-0.4));
              ctx.lineTo(px + dx - aLen*Math.cos(ang+0.4), py - dy - aLen*Math.sin(ang+0.4));
              ctx.closePath(); ctx.fill();
            }
          }
        };
        new Function('ctx','vars','toPixX','toPixY','toPixLen','W','H','drawVectorField', p.Code||'')(ctx,vars,tpX,tpY,tpL,W,H,drawVF);
      }catch(e){}
    }
    } catch(err) { console.error('Error drawing element ' + el.name + ':', err); }
  });
}

// ── PlottingPanel rendering ───────────────────────────────────────────
function getPlotXName(pp){
  var xName = (pp.el.properties.AxisX || '"t"').replace(/^"|"$/g,'').trim();
  return xName || 't';
}

// If AxisY is empty, return [] so the user must explicitly set Y variables.
function getPlotYNames(pp){
  return (pp.el.properties.AxisY||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
}

function collectPlotData(){
  PLOT_PANELS.forEach(function(pp){
    var pd=PLOT_DATA[pp.id];
    var xName = getPlotXName(pp);
    var xVal = typeof vars[xName]==='number' ? vars[xName] : (vars.t || 0);
    pd.xs.push(xVal);if(pd.xs.length>MAX_PLOT_PTS)pd.xs.shift();
    getPlotYNames(pp).forEach(function(vn){
      if(!pd.vals[vn])pd.vals[vn]=[];
      pd.vals[vn].push(typeof vars[vn]==='number'?vars[vn]:0);
      if(pd.vals[vn].length>MAX_PLOT_PTS)pd.vals[vn].shift();
    });
  });
}

function renderPlot(pp){
  var pd=PLOT_DATA[pp.id],ctx=pp.ctx,W=pp.logicalW,H=pp.logicalH;
  var bgVal=(pp.el.properties.Background||'"#ffffff"').replace(/^"|"$/g,'');
  if(bgVal==='white'||bgVal==='#ffffff'||bgVal==='#f8fafc'||bgVal==='#f0f9ff'||bgVal==='#f0f4f8'||bgVal==='#0b0f19'||bgVal==='#0f172a'||bgVal==='#1e293b'||bgVal==='black') bgVal='#ffffff';
  ctx.fillStyle=bgVal;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(0,0,0,0.06)';ctx.lineWidth=0.5;
  for(var gi=1;gi<4;gi++){
    ctx.beginPath();ctx.moveTo(0,gi*H/4);ctx.lineTo(W,gi*H/4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gi*W/4,0);ctx.lineTo(gi*W/4,H);ctx.stroke();
  }
  var xs=pd.xs;
  var ynames=getPlotYNames(pp);
  // No Y variables configured
  if(!ynames.length){
    ctx.fillStyle='#475569';ctx.font='13px sans-serif';ctx.textAlign='center';
    ctx.fillText('請在編輯器設定 Y 軸變數',W/2,H/2-10);
    ctx.font='11px monospace';ctx.fillStyle='#334155';
    ctx.fillText('(屬性 → 初始設定 → Y 軸變數)',W/2,H/2+12);
    return;
  }
  // waiting for data
  if(!xs.length){
    ctx.fillStyle='#475569';ctx.font='15px sans-serif';ctx.textAlign='center';
    ctx.fillText('執行模擬後顯示圖表',W/2,H/2);return;
  }
  var PAD={t:26,r:10,b:28,l:8},pW=W-PAD.l-PAD.r,pH=H-PAD.t-PAD.b;
  // title
  var title=(pp.el.properties.Title||'""').replace(/^"|"$/g,'');
  if(title){ctx.fillStyle='#334155';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText(title,W/2,18);}
  
  var xName = getPlotXName(pp);
  // current x & t: bottom-right, directly from vars so it's always fresh
  ctx.fillStyle='#475569';ctx.font='13px monospace';ctx.textAlign='right';
  if (xName === 't') {
    ctx.fillText('t='+vars.t.toFixed(3),W-PAD.r,H-6);
  } else {
    ctx.fillText(xName+'='+vars[xName].toFixed(2)+', t='+vars.t.toFixed(2),W-PAD.r,H-6);
  }

  // x-axis: use xs values for position
  var minX=Math.min.apply(null,xs),maxX=Math.max.apply(null,xs),spanX=maxX-minX||1;
  ynames.forEach(function(vn,vi){
    var vals=pd.vals[vn];if(!vals||vals.length<2)return;
    var minV=Math.min.apply(null,vals),maxV=Math.max.apply(null,vals),spanY=maxV-minV||1;
    var strokeColor=CHART_COLORS[vi%CHART_COLORS.length];
    
    ctx.save();
    ctx.strokeStyle=strokeColor;
    ctx.lineWidth=2;
    ctx.shadowBlur=6;
    ctx.shadowColor=strokeColor;
    ctx.beginPath();
    var n=vals.length;
    for(var fi=0;fi<n;fi++){
      var px=PAD.l+((xs[fi]-minX)/spanX)*pW;
      var py=PAD.t+(1-(vals[fi]-minV)/spanY)*pH;
      fi===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();
    ctx.restore();
    
    // legend: variable name + latest value
    ctx.fillStyle=CHART_COLORS[vi%CHART_COLORS.length];ctx.font='bold 13px monospace';ctx.textAlign='left';
    var lastVal=vals[vals.length-1];
    var legendX=PAD.l+vi*Math.min(pW/Math.max(ynames.length,1),120);
    ctx.fillText(vn+'='+lastVal.toFixed(3),legendX,H-6);
  });
}

// ── HTML element updates ──────────────────────────────────────────────
function updateHTMLEls(){
  STATE.viewElements.forEach(function(el){
    var p=el.properties;
    if(el.type==='Elements.TwoStateButton'){
      var btn=document.getElementById('tsb_'+el.id);if(!btn)return;
      var isOn=!!vars[p.State||'_isPaused'];
      btn.textContent=isOn?'▶ 播放':'⏸ 暫停';
      btn.style.background=isOn?'#22c55e':'#f59e0b';
    }else if(el.type==='Elements.ParsedField'){
      var fld=document.getElementById('pf_'+el.id);if(!fld)return;
      var val=evalExpr(p.Value||'0');
      fld.textContent=typeof val==='number'?val.toFixed(2):String(val);
    }
  });
}

// ── Slider init ───────────────────────────────────────────────────────
STATE.viewElements.forEach(function(el){
  if(el.type!=='Elements.Slider')return;
  var vn=el.properties.Variable||'';if(!vn)return;
  var inp=document.getElementById('slr_'+el.id);
  var valEl=document.getElementById('slv_'+el.id);
  if(!inp||!valEl)return;
  inp.value=vars[vn]!==undefined?String(vars[vn]):inp.min;
  valEl.textContent=parseFloat(inp.value).toFixed(2);
  inp.addEventListener('input',function(){
    vars[vn]=parseFloat(this.value);
    valEl.textContent=parseFloat(this.value).toFixed(2);
    if(!running)render();
  });
});

// ── Button init ───────────────────────────────────────────────────────
function execAction(action){
  if(!action)return;
  var a=action.replace(/%/g,'').trim();
  if(a==='_play'||a==='_resume')simPlay();
  else if(a==='_pause')simPause();
  else if(a==='_reset'||a==='_initialize')simReset();
  else if(a==='_step')simStep();
  else execCode(a);
}
STATE.viewElements.forEach(function(el){
  if(el.type==='Elements.Button'){
    var b=document.getElementById('btn_'+el.id);if(!b)return;
    b.addEventListener('click',function(){execAction(el.properties.OnClick);});
  }else if(el.type==='Elements.TwoStateButton'){
    var tb=document.getElementById('tsb_'+el.id);if(!tb)return;
    tb.addEventListener('click',function(){
      var isOn=!!vars[el.properties.State||'_isPaused'];
      execAction(isOn?el.properties.OnClick:el.properties.OffClick);
    });
  }
});

// ── Render ────────────────────────────────────────────────────────────
function render(){
  try {
    DRAW_PANELS.forEach(function(panel){
      var ctx=panel.ctx,W=panel.logicalW,H=panel.logicalH;
      ctx.clearRect(0,0,W,H);
      var bgVal=(panel.el.properties.Background||'"#ffffff"').replace(/^"|"$/g,'');
      if(bgVal==='white'||bgVal==='#ffffff'||bgVal==='#f8fafc'||bgVal==='#f0f9ff'||bgVal==='#f0f4f8'||bgVal==='#0b0f19'||bgVal==='#0f172a'||bgVal==='#1e293b'||bgVal==='black') bgVal='#ffffff';
      ctx.fillStyle=bgVal;
      ctx.fillRect(0,0,W,H);
      drawAxes(panel);
      drawElements(panel);
    });
  } catch(err) { console.error('DRAW PANEL ERROR:', err); }
  
  try {
    collectPlotData();
    PLOT_PANELS.forEach(renderPlot);
    updateHTMLEls();
  } catch(err) { console.error('PLOT/HTML UPDATE ERROR:', err); }
}

// ── Simulation loop ───────────────────────────────────────────────────
var running=false,rafId=null,lastTs=null;
function getMinDt(){var dt=vars.dt||0.05;STATE.odePages.forEach(function(p){var d=evalExpr(p.increment)||vars.dt||0.05;if(d<dt)dt=d;});return dt;}
function loop(ts){
  if(lastTs===null)lastTs=ts;
  var elapsed=Math.min((ts-lastTs)/1000,0.1);lastTs=ts;
  var dt=getMinDt(),steps=Math.min(Math.max(1,Math.round(elapsed/dt)),500);
  for(var i=0;i<steps;i++)evolve();
  try{render();}catch(e){console.error('render error:',e);}
  if(running)rafId=requestAnimationFrame(loop);
}
function simPlay(){if(!running){running=true;vars._isPaused=false;lastTs=null;rafId=requestAnimationFrame(loop);}}
function simPause(){running=false;vars._isPaused=true;lastTs=null;if(rafId)cancelAnimationFrame(rafId);render();}
function simStep(){evolve();render();}
function simReset(){
  simPause();
  Object.assign(vars,origVars);vars.t=0;vars._isPaused=true;
  Object.keys(trails).forEach(function(k){trails[k]=[];});
  PLOT_PANELS.forEach(function(pp){PLOT_DATA[pp.id]={xs:[],vals:{}};});
  SIM_DATA_LOG = [];
  STATE.viewElements.forEach(function(el){
    if(el.type!=='Elements.Slider')return;
    var vn=el.properties.Variable||'';
    var inp=document.getElementById('slr_'+el.id);
    var valEl=document.getElementById('slv_'+el.id);
    if(!inp||!valEl||!vn)return;
    inp.value=String(vars[vn]||0);
    valEl.textContent=parseFloat(inp.value).toFixed(2);
  });
  runInit();render();
}

window.addEventListener('message',function(e){
  if(e.data==='play')simPlay();
  if(e.data==='pause')simPause();
  if(e.data==='reset')simReset();
  if(e.data==='step')simStep();
  if(e.data==='exportCSV') {
    var csv = exportCSVString();
    window.parent.postMessage({ type: 'csvData', csv: csv, title: STATE.info.title }, '*');
  }
});

// Dynamic sharp scaling system for High-DPI screens
function resizeAll(){
  var r=document.getElementById('sim-root');
  if(!r) return;
  var w = window.innerWidth || document.documentElement.clientWidth || 0;
  var h = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!w || !h) return;
  var s = Math.min(w/BBW, h/BBH);
  if (!s || s < 0.05 || s === Infinity || s === -Infinity || isNaN(s)) s = 1;
  
  // 1. Scale absolute sizes & positions of all panels & UI elements
  var els = document.querySelectorAll('#sim-root, #sim-root [data-w]');
  els.forEach(function(el) {
    var ox = parseFloat(el.getAttribute('data-x') || 0);
    var oy = parseFloat(el.getAttribute('data-y') || 0);
    var ow = parseFloat(el.getAttribute('data-w') || 0);
    var oh = parseFloat(el.getAttribute('data-h') || 0);
    el.style.left = (ox * s) + 'px';
    el.style.top = (oy * s) + 'px';
    el.style.width = (ow * s) + 'px';
    el.style.height = (oh * s) + 'px';
    
    // Scale font sizes
    var fs = el.getAttribute('data-fs');
    if (fs) {
      el.style.fontSize = (parseFloat(fs) * s) + 'px';
    }
  });

  // 2. Resize Canvas Drawing buffers (High-DPI sharp rendering)
  var dpr = window.devicePixelRatio || 1;
  
  DRAW_PANELS.forEach(function(panel) {
    var c = panel.c;
    var ow = parseFloat(c.getAttribute('data-w') || 0) * s;
    var oh = parseFloat(c.getAttribute('data-h') || 0) * s;
    c.width = ow * dpr;
    c.height = oh * dpr;
    panel.logicalW = ow;
    panel.logicalH = oh;
    
    var ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
  });
  
  PLOT_PANELS.forEach(function(panel) {
    var c = panel.c;
    var ow = parseFloat(c.getAttribute('data-w') || 0) * s;
    var oh = parseFloat(c.getAttribute('data-h') || 0) * s;
    c.width = ow * dpr;
    c.height = oh * dpr;
    panel.logicalW = ow;
    panel.logicalH = oh;
    
    var ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
  });
  
  try { render(); } catch(e){}
}
resizeAll();
window.addEventListener('resize', resizeAll);
// Rescheduled scaling for initial mounting
setTimeout(resizeAll, 50);
setTimeout(resizeAll, 150);
setTimeout(resizeAll, 400);
setTimeout(resizeAll, 1000);

window._simRender = render;
runInit();render();
})();
</script>
</body>
</html>`;
}

export function downloadEjssFile(state: SimulationState) {
  const xml = serializeToEjssXML(state);
  const bytes = new TextEncoder().encode('﻿' + xml);
  const blob = new Blob([bytes], { type: 'text/xml;charset=UTF-16' });
  triggerDownload(blob, `${state.info.title || 'simulation'}.ejss`);
}

export function exportStandaloneHTML(state: SimulationState) {
  const html = buildSimulationHTML(state);
  const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
  triggerDownload(blob, `${state.info.title || 'simulation'}.html`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

