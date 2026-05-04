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
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<title>${state.info.title}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: sans-serif; background: #1a1a2e; color: #e0e0e0;
         display: flex; flex-direction: column; align-items: center; padding: 8px; gap: 6px; }
  h3 { margin: 0; font-size: 13px; color: #a78bfa; }
  canvas { border: 1px solid #334155; background: white; border-radius: 4px; max-width: 100%; }
  .controls { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  button { padding: 5px 14px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 12px; }
  .play  { background: #22c55e; color: white; }
  .pause { background: #f59e0b; color: white; }
  .reset { background: #6366f1; color: white; }
  .step  { background: #64748b; color: white; }
  .vars  { font-size: 11px; font-family: monospace; background: #1e293b; padding: 6px 10px;
           border-radius: 6px; width: 100%; max-width: 500px; display: flex; flex-wrap: wrap; gap: 8px; }
  .var-item { display: flex; gap: 4px; }
  .var-name  { color: #fbbf24; }
  .var-eq    { color: #64748b; }
  .var-value { color: #4ade80; }
  .sliders { font-size:11px; font-family:monospace; background:#1e293b; padding:6px 10px;
             border-radius:6px; width:100%; max-width:500px; display:flex; flex-direction:column; gap:4px; }
  .slider-row { display:flex; align-items:center; gap:6px; color:#e2e8f0; }
  .slider-row label { min-width:100px; flex-shrink:0; }
  .slider-row input[type=range] { flex:1; cursor:pointer; }
  .slider-val { min-width:42px; text-align:right; color:#4ade80; }
</style>
</head>
<body>
<h3>${state.info.title || '模擬'}</h3>
<div class="controls">
  <button class="play"  onclick="simPlay()">▶ 播放</button>
  <button class="pause" onclick="simPause()">⏸ 暫停</button>
  <button class="step"  onclick="simStep()">⏭ 步進</button>
  <button class="reset" onclick="simReset()">↺ 重置</button>
</div>
<canvas id="canvas" width="${viewW}" height="${viewH}"></canvas>
<div class="sliders" id="sliders"></div>
<div class="vars" id="varDisplay"></div>

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

// ── Variable bag ──────────────────────────────────────────────────
const vars = Object.create(null);
vars.t = 0; vars.dt = 0.05;
STATE.variables.forEach(function(v) {
  if (v.type === 'boolean')     vars[v.name] = (v.value === 'true');
  else if (v.type === 'int')    vars[v.name] = parseInt(v.value) || 0;
  else if (v.type === 'String') vars[v.name] = (v.value||'').replace(/^"|"$/g,'');
  else                          vars[v.name] = parseFloat(v.value) || 0;
});
const origVars = Object.assign({}, vars);

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
  const states = page.rates.map(function(r){return r.state;});
  const getRates = function(){ return page.rates.map(function(r){return evalExpr(r.expression);}); };
  const snap = {}; states.forEach(function(s){snap[s]=vars[s];});
  const k1 = getRates();
  states.forEach(function(s,i){vars[s]=snap[s]+k1[i]*dt/2;});
  const k2 = getRates();
  states.forEach(function(s,i){vars[s]=snap[s]+k2[i]*dt/2;});
  const k3 = getRates();
  states.forEach(function(s,i){vars[s]=snap[s]+k3[i]*dt;});
  const k4 = getRates();
  states.forEach(function(s,i){vars[s]=snap[s]+(k1[i]+2*k2[i]+2*k3[i]+k4[i])*dt/6;});
  vars.t = (snap.t||0) + dt;
}

function stepVerlet(page) {
  // Velocity Verlet: x(t+dt) = x(t) + v*dt + 0.5*a*dt^2
  const dt = evalExpr(page.increment) || vars.dt || 0.05;
  const snap = {}; page.rates.forEach(function(r){snap[r.state]=vars[r.state];});
  const a0 = {}; page.rates.forEach(function(r){a0[r.state]=evalExpr(r.expression);});
  // half-step positions
  page.rates.forEach(function(r){vars[r.state]=snap[r.state]+snap[r.state]*dt+0.5*a0[r.state]*dt*dt;});
  const a1 = {}; page.rates.forEach(function(r){a1[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=snap[r.state]+0.5*(a0[r.state]+a1[r.state])*dt;});
  vars.t = (snap.t||0) + dt;
}

function stepODE(page) {
  if (page.method === 'RungeKutta') stepRK4(page);
  else if (page.method === 'Verlet') stepVerlet(page);
  else stepEuler(page);
}

function evolve() {
  runFixed();
  STATE.odePages.forEach(stepODE);
  runFixed(); // post-step constraints
}

// ── Trail storage ──────────────────────────────────────────────────
const trails = {};
STATE.viewElements.forEach(function(el){
  if (el.type === 'Elements.Trail2D') trails[el.id] = [];
});

// ── Render ─────────────────────────────────────────────────────────
function drawAxes() {
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 0.5;
  const zx = toPixX(0), zy = toPixY(0);
  if (zy>0 && zy<H) { ctx.beginPath(); ctx.moveTo(0,zy); ctx.lineTo(W,zy); ctx.stroke(); }
  if (zx>0 && zx<W) { ctx.beginPath(); ctx.moveTo(zx,0); ctx.lineTo(zx,H); ctx.stroke(); }
}

function render() {
  ctx.clearRect(0,0,W,H);
  // Background
  const bg = (function(){
    var d = STATE.viewElements.find(function(e){return e.type==='Elements.DrawingPanel';});
    return d ? (d.properties.Background||'"white"').replace(/^"|"$/g,'') : 'white';
  }());
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  drawAxes();

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
      ctx.fillStyle = fill; ctx.strokeStyle = line; ctx.lineWidth = 1.5;
      const shape = p.ShapeType||'ELLIPSE';
      if (shape==='ELLIPSE'||shape==='WHEEL') {
        ctx.beginPath(); ctx.ellipse(0,0,Math.max(sx,2),Math.max(sy,2),0,0,2*Math.PI);
        ctx.fill(); ctx.stroke();
        if (shape==='WHEEL') {
          ctx.beginPath(); ctx.moveTo(0,-sy); ctx.lineTo(0,sy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-sx,0); ctx.lineTo(sx,0); ctx.stroke();
        }
      } else {
        ctx.fillRect(-sx,-sy,sx*2,sy*2);
        ctx.strokeRect(-sx,-sy,sx*2,sy*2);
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
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.beginPath();
      trail.forEach(function(pt,i){ i===0 ? ctx.moveTo(pt[0],pt[1]) : ctx.lineTo(pt[0],pt[1]); });
      ctx.stroke();
    } else if (el.type === 'Elements.CustomDraw') {
      try {
        new Function('ctx','vars','toPixX','toPixY','toPixLen','W','H', p.Code||'')(ctx, vars, toPixX, toPixY, toPixLen, W, H);
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

runInit();render();
})();
</script>
</body>
</html>`;
}

const LAYOUT_EL_TYPES = new Set([
  'Elements.DrawingPanel','Elements.PlottingPanel',
  'Elements.Button','Elements.TwoStateButton',
  'Elements.Label','Elements.ParsedField','Elements.Slider',
]);

export function computeSimBBox(viewElements: SimulationState['viewElements']): { w: number; h: number } {
  const layoutEls = viewElements.filter((e) => LAYOUT_EL_TYPES.has(e.type));
  if (!layoutEls.length) return { w: 400, h: 400 };
  const w = Math.max(...layoutEls.map((e) => (e.x ?? 0) + (e.width ?? (parseInt(e.properties.Width ?? '100') || 100))));
  const h = Math.max(...layoutEls.map((e) => (e.y ?? 0) + (e.height ?? (parseInt(e.properties.Height ?? '100') || 100))));
  return { w: Math.max(w, 200), h: Math.max(h, 100) };
}

// Preview: absolute-positioned layout matching template x/y/width/height.
// All element types rendered; controlled by postMessage from parent frame.
export function buildPreviewHTML(state: SimulationState): string {
  const bbox = computeSimBBox(state.viewElements);
  const bbW = bbox.w, bbH = bbox.h;

  // ── Generate HTML elements ────────────────────────────────────────────
  const elementsHTML = state.viewElements.map((el) => {
    const x = el.x ?? 0;
    const y = el.y ?? 0;
    const w = el.width  ?? (parseInt(el.properties.Width  ?? '100') || 100);
    const h = el.height ?? (parseInt(el.properties.Height ?? '100') || 100);
    const pos = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    const p = el.properties;

    switch (el.type) {
      case 'Elements.DrawingPanel':
        return `<canvas id="dp_${el.id}" style="position:absolute;${pos}" width="${w}" height="${h}"></canvas>`;
      case 'Elements.PlottingPanel':
        return `<canvas id="pp_${el.id}" style="position:absolute;${pos}" width="${w}" height="${h}"></canvas>`;
      case 'Elements.Button': {
        const txt = (p.Text || '"按鈕"').replace(/^"|"$/g, '');
        return `<button id="btn_${el.id}" class="sim-btn" style="position:absolute;${pos}">${txt}</button>`;
      }
      case 'Elements.TwoStateButton':
        return `<button id="tsb_${el.id}" class="sim-btn" style="position:absolute;${pos}">▶ 播放</button>`;
      case 'Elements.Label': {
        const txt = (p.Text || '""').replace(/^"|"$/g, '');
        return `<div id="lbl_${el.id}" class="sim-label" style="position:absolute;${pos}">${txt}</div>`;
      }
      case 'Elements.ParsedField':
        return `<div id="pf_${el.id}" class="sim-field" style="position:absolute;${pos}">0</div>`;
      case 'Elements.Slider': {
        const vn = p.Variable || '';
        if (!vn) return '';
        return `<div id="sl_${el.id}" class="sim-slider" style="position:absolute;${pos}">` +
          `<label class="sl-lbl">${p.Label || vn}</label>` +
          `<input type="range" id="slr_${el.id}" min="${p.Minimum||'0'}" max="${p.Maximum||'10'}" step="${p.Step||'0.1'}" data-var="${vn}" class="sl-inp">` +
          `<span id="slv_${el.id}" class="sl-val">0</span></div>`;
      }
      default:
        return '';
    }
  }).join('\n');

  const stateJson = JSON.stringify({
    variables: state.variables,
    odePages: state.odePages,
    constraintPages: state.constraintPages,
    initPages: state.initPages,
    viewElements: state.viewElements,
    info: state.info,
  });

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:100%;height:100%;overflow:hidden;background:#f8fafc;}
#sim-root{position:absolute;top:0;left:0;width:${bbW}px;height:${bbH}px;transform-origin:top left;}
.sim-btn{cursor:pointer;font-size:12px;font-weight:bold;border:none;border-radius:4px;background:#6366f1;color:white;padding:0 8px;}
.sim-btn:hover{background:#4f46e5;}
.sim-label{font-size:13px;font-family:sans-serif;display:flex;align-items:center;}
.sim-field{font-family:monospace;font-size:12px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:3px;display:flex;align-items:center;justify-content:center;}
.sim-slider{display:flex;align-items:center;gap:4px;font-size:11px;font-family:monospace;}
.sl-lbl{min-width:60px;flex-shrink:0;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sl-inp{flex:1;cursor:pointer;min-width:0;}
.sl-val{min-width:36px;text-align:right;color:#16a34a;}
</style>
</head>
<body>
<div id="sim-root">
${elementsHTML}
</div>
<script>
(function(){
const STATE=${stateJson};
const BBW=${bbW},BBH=${bbH};

// Scale sim-root to fill the iframe viewport
function scaleToFit(){
  var r=document.getElementById('sim-root');
  var s=Math.min(window.innerWidth/BBW,window.innerHeight/BBH);
  r.style.transform='scale('+s+')';
}
scaleToFit();
window.addEventListener('resize',scaleToFit);

// ── Variable bag ──────────────────────────────────────────────────────
const vars=Object.create(null);
vars.t=0;vars.dt=0.05;vars._isPaused=true;
STATE.variables.forEach(function(v){
  if(v.type==='boolean')vars[v.name]=(v.value==='true');
  else if(v.type==='int')vars[v.name]=parseInt(v.value)||0;
  else if(v.type==='String')vars[v.name]=(v.value||'').replace(/^"|"$/g,'');
  else vars[v.name]=parseFloat(v.value)||0;
});
const origVars=Object.assign({},vars);

function execCode(code){if(!code||!code.trim())return;try{new Function('_v','with(_v){'+code+'}')(vars);}catch(e){}}
function evalExpr(expr){if(!expr||!expr.trim())return 0;try{return new Function('_v','with(_v){return('+expr+')}')(vars);}catch(e){return 0;}}

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
  var states=page.rates.map(function(r){return r.state;});
  var gr=function(){return page.rates.map(function(r){return evalExpr(r.expression);});};
  var sn={};states.forEach(function(s){sn[s]=vars[s];});
  var k1=gr();states.forEach(function(s,i){vars[s]=sn[s]+k1[i]*dt/2;});
  var k2=gr();states.forEach(function(s,i){vars[s]=sn[s]+k2[i]*dt/2;});
  var k3=gr();states.forEach(function(s,i){vars[s]=sn[s]+k3[i]*dt;});
  var k4=gr();states.forEach(function(s,i){vars[s]=sn[s]+(k1[i]+2*k2[i]+2*k3[i]+k4[i])*dt/6;});
  vars.t=(sn.t||0)+dt;
}
function stepVerlet(page){
  var dt=evalExpr(page.increment)||vars.dt||0.05;
  var sn={};page.rates.forEach(function(r){sn[r.state]=vars[r.state];});
  var a0={};page.rates.forEach(function(r){a0[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=sn[r.state]+sn[r.state]*dt+0.5*a0[r.state]*dt*dt;});
  var a1={};page.rates.forEach(function(r){a1[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=sn[r.state]+0.5*(a0[r.state]+a1[r.state])*dt;});
  vars.t=(sn.t||0)+dt;
}
function evolve(){
  runFixed();
  STATE.odePages.forEach(function(page){
    if(page.method==='RungeKutta')stepRK4(page);
    else if(page.method==='Verlet')stepVerlet(page);
    else stepEuler(page);
  });
  runFixed();
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
  DRAW_PANELS.push({
    id:el.id,el:el,c:c,ctx:c.getContext('2d'),
    toPixX:function(x){return(x-minX)/(maxX-minX)*c.width;},
    toPixY:function(y){return c.height-(y-minY)/(maxY-minY)*c.height;},
    toPixLen:function(l){return Math.abs(l)/(maxX-minX)*c.width;}
  });
});

// ── PlottingPanel registry ────────────────────────────────────────────
var PLOT_PANELS=[];
var PLOT_DATA={};
var CHART_COLORS=['#a78bfa','#34d399','#f59e0b','#f87171','#38bdf8','#fb923c'];
var MAX_PLOT_PTS=500;
STATE.viewElements.forEach(function(el){
  if(el.type!=='Elements.PlottingPanel')return;
  var c=document.getElementById('pp_'+el.id);
  if(!c)return;
  PLOT_PANELS.push({id:el.id,el:el,c:c,ctx:c.getContext('2d')});
  PLOT_DATA[el.id]={ts:[],vals:{}};
});

var trails={};
STATE.viewElements.forEach(function(el){if(el.type==='Elements.Trail2D')trails[el.id]=[];});

// ── Canvas helpers ────────────────────────────────────────────────────
function getDrawPanel(parentId){
  if(!DRAW_PANELS.length)return null;
  if(!parentId)return DRAW_PANELS[0];
  return DRAW_PANELS.filter(function(p){return p.id===parentId||p.el.name===parentId;})[0]||DRAW_PANELS[0];
}

function drawAxes(panel){
  var ctx=panel.ctx,W=panel.c.width,H=panel.c.height;
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=0.5;
  var zx=panel.toPixX(0),zy=panel.toPixY(0);
  if(zy>0&&zy<H){ctx.beginPath();ctx.moveTo(0,zy);ctx.lineTo(W,zy);ctx.stroke();}
  if(zx>0&&zx<W){ctx.beginPath();ctx.moveTo(zx,0);ctx.lineTo(zx,H);ctx.stroke();}
}

function drawElements(panel){
  var ctx=panel.ctx,W=panel.c.width,H=panel.c.height;
  var tpX=panel.toPixX,tpY=panel.toPixY,tpL=panel.toPixLen;
  STATE.viewElements.forEach(function(el){
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
      ctx.fillStyle=fill;ctx.strokeStyle=line;ctx.lineWidth=1.5;
      var shape=p.ShapeType||'ELLIPSE';
      if(shape==='ELLIPSE'||shape==='WHEEL'){
        ctx.beginPath();ctx.ellipse(0,0,Math.max(sx,2),Math.max(sy,2),0,0,2*Math.PI);ctx.fill();ctx.stroke();
        if(shape==='WHEEL'){ctx.beginPath();ctx.moveTo(0,-sy);ctx.lineTo(0,sy);ctx.stroke();ctx.beginPath();ctx.moveTo(-sx,0);ctx.lineTo(sx,0);ctx.stroke();}
      }else{ctx.fillRect(-sx,-sy,sx*2,sy*2);ctx.strokeRect(-sx,-sy,sx*2,sy*2);}
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
      ctx.strokeStyle=(p.LineColor||'"#3b82f6"').replace(/^"|"$/g,'');ctx.lineWidth=1.5;ctx.beginPath();
      trail.forEach(function(pt,fi){fi===0?ctx.moveTo(pt[0],pt[1]):ctx.lineTo(pt[0],pt[1]);});ctx.stroke();
    }else if(el.type==='Elements.CustomDraw'){
      if(getDrawPanel(el.parent)!==panel)return;
      try{new Function('ctx','vars','toPixX','toPixY','toPixLen','W','H',p.Code||'')(ctx,vars,tpX,tpY,tpL,W,H);}catch(e){}
    }
  });
}

// ── PlottingPanel rendering ───────────────────────────────────────────
function collectPlotData(){
  var gvars=STATE.variables.filter(function(v){return v.scope==='global'&&v.type!=='boolean'&&v.type!=='String';});
  PLOT_PANELS.forEach(function(pp){
    var pd=PLOT_DATA[pp.id];
    pd.ts.push(vars.t);if(pd.ts.length>MAX_PLOT_PTS)pd.ts.shift();
    gvars.forEach(function(v){
      if(!pd.vals[v.name])pd.vals[v.name]=[];
      pd.vals[v.name].push(typeof vars[v.name]==='number'?vars[v.name]:0);
      if(pd.vals[v.name].length>MAX_PLOT_PTS)pd.vals[v.name].shift();
    });
  });
}

function renderPlot(pp){
  var pd=PLOT_DATA[pp.id],ctx=pp.ctx,W=pp.c.width,H=pp.c.height;
  ctx.fillStyle='#0f172a';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#1e293b';ctx.lineWidth=0.5;
  for(var gi=1;gi<4;gi++){
    ctx.beginPath();ctx.moveTo(0,gi*H/4);ctx.lineTo(W,gi*H/4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(gi*W/4,0);ctx.lineTo(gi*W/4,H);ctx.stroke();
  }
  var vnames=Object.keys(pd.vals).filter(function(n){return pd.vals[n].length>1;});
  if(!vnames.length){
    ctx.fillStyle='#475569';ctx.font='11px monospace';ctx.textAlign='center';
    ctx.fillText('執行模擬後顯示圖表',W/2,H/2);return;
  }
  var PAD={t:6,r:8,b:22,l:4},pW=W-PAD.l-PAD.r,pH=H-PAD.t-PAD.b;
  vnames.forEach(function(vn,vi){
    var vals=pd.vals[vn],minV=Math.min.apply(null,vals),maxV=Math.max.apply(null,vals),span=maxV-minV||1;
    ctx.strokeStyle=CHART_COLORS[vi%CHART_COLORS.length];ctx.lineWidth=1.2;ctx.beginPath();
    vals.forEach(function(v,fi){
      var x=PAD.l+fi/(vals.length-1)*pW,y=PAD.t+(1-(v-minV)/span)*pH;
      fi===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.stroke();
    ctx.fillStyle=CHART_COLORS[vi%CHART_COLORS.length];ctx.font='9px monospace';ctx.textAlign='left';
    ctx.fillText(vn+'='+vals[vals.length-1].toFixed(3),PAD.l+vi*Math.min(pW/Math.max(vnames.length,1),90),H-5);
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
  DRAW_PANELS.forEach(function(panel){
    var ctx=panel.ctx,W=panel.c.width,H=panel.c.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=(panel.el.properties.Background||'"white"').replace(/^"|"$/g,'');
    ctx.fillRect(0,0,W,H);
    drawAxes(panel);
    drawElements(panel);
  });
  collectPlotData();
  PLOT_PANELS.forEach(renderPlot);
  updateHTMLEls();
}

// ── Simulation loop ───────────────────────────────────────────────────
var running=false,rafId=null,lastTs=null;
function getMinDt(){var dt=vars.dt||0.05;STATE.odePages.forEach(function(p){var d=evalExpr(p.increment)||vars.dt||0.05;if(d<dt)dt=d;});return dt;}
function loop(ts){
  if(lastTs===null)lastTs=ts;
  var elapsed=Math.min((ts-lastTs)/1000,0.1);lastTs=ts;
  var dt=getMinDt(),steps=Math.min(Math.max(1,Math.round(elapsed/dt)),500);
  for(var i=0;i<steps;i++)evolve();
  render();
  if(running)rafId=requestAnimationFrame(loop);
}
function simPlay(){if(!running){running=true;vars._isPaused=false;lastTs=null;rafId=requestAnimationFrame(loop);}}
function simPause(){running=false;vars._isPaused=true;lastTs=null;if(rafId)cancelAnimationFrame(rafId);render();}
function simStep(){evolve();render();}
function simReset(){
  simPause();
  Object.assign(vars,origVars);vars.t=0;vars._isPaused=true;
  Object.keys(trails).forEach(function(k){trails[k]=[];});
  PLOT_PANELS.forEach(function(pp){PLOT_DATA[pp.id]={ts:[],vals:{}};});
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
});

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

