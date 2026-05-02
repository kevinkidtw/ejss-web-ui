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

// Initial render
runInit();
render();
})();
</script>
</body>
</html>`;
}

// Preview version: no inner buttons, canvas fills the container,
// controlled entirely by postMessage from the outer React frame.
export function buildPreviewHTML(state: SimulationState): string {
  const drawEl = state.viewElements.find((e) => e.type === 'Elements.DrawingPanel');
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

  // Reuse the same simulation script as buildSimulationHTML but
  // canvas fills the window (100vw×100vh) and there are no inner buttons.
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; overflow: hidden; width: 100vw; height: 100vh; }
  canvas { display: block; width: 100%; height: 100%; object-fit: contain; }
  .vars { position: fixed; bottom: 0; left: 0; right: 0;
          font-size: 11px; font-family: monospace; background: rgba(15,23,42,0.85);
          padding: 4px 10px; display: flex; flex-wrap: wrap; gap: 8px; z-index: 10; }
  .var-name  { color: #fbbf24; }
  .var-eq    { color: #64748b; }
  .var-value { color: #4ade80; }
</style>
</head>
<body>
<canvas id="canvas"></canvas>
<div class="vars" id="varDisplay"></div>
<script>
(function(){
const STATE = ${stateJson};
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width  = canvas.clientWidth  || window.innerWidth;
  canvas.height = canvas.clientHeight || window.innerHeight;
}
resize();
window.addEventListener('resize', function(){ resize(); render(); });

const W = function(){ return canvas.width; };
const H = function(){ return canvas.height; };
const WORLD = { minX:${minX}, maxX:${maxX}, minY:${minY}, maxY:${maxY} };

function toPixX(x) { return (x-WORLD.minX)/(WORLD.maxX-WORLD.minX)*W(); }
function toPixY(y) { return H()-(y-WORLD.minY)/(WORLD.maxY-WORLD.minY)*H(); }
function toPixLen(l){ return Math.abs(l)/(WORLD.maxX-WORLD.minX)*W(); }

const vars = Object.create(null);
vars.t = 0; vars.dt = 0.05;
STATE.variables.forEach(function(v){
  if (v.type==='boolean')     vars[v.name]=(v.value==='true');
  else if (v.type==='int')    vars[v.name]=parseInt(v.value)||0;
  else if (v.type==='String') vars[v.name]=(v.value||'').replace(/^"|"$/g,'');
  else                        vars[v.name]=parseFloat(v.value)||0;
});
const origVars = Object.assign({},vars);

function execCode(code){ if(!code||!code.trim())return; try{new Function('_v','with(_v){'+code+'}')(vars);}catch(e){} }
function evalExpr(expr){ if(!expr||!expr.trim())return 0; try{return new Function('_v','with(_v){return('+expr+')}')(vars);}catch(e){return 0;} }

function runInit(){ STATE.initPages.forEach(function(p){execCode(p.code);}); }
function runFixed(){ STATE.constraintPages.forEach(function(p){execCode(p.code);}); }

function stepEuler(page){
  const dt=evalExpr(page.increment)||vars.dt||0.05;
  const d={};page.rates.forEach(function(r){d[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){if(r.state in vars)vars[r.state]+=d[r.state]*dt;});
  vars.t=(vars.t||0)+dt;
}
function stepRK4(page){
  const dt=evalExpr(page.increment)||vars.dt||0.05;
  const states=page.rates.map(function(r){return r.state;});
  const gr=function(){return page.rates.map(function(r){return evalExpr(r.expression);});};
  const sn={};states.forEach(function(s){sn[s]=vars[s];});
  const k1=gr();states.forEach(function(s,i){vars[s]=sn[s]+k1[i]*dt/2;});
  const k2=gr();states.forEach(function(s,i){vars[s]=sn[s]+k2[i]*dt/2;});
  const k3=gr();states.forEach(function(s,i){vars[s]=sn[s]+k3[i]*dt;});
  const k4=gr();states.forEach(function(s,i){vars[s]=sn[s]+(k1[i]+2*k2[i]+2*k3[i]+k4[i])*dt/6;});
  vars.t=(sn.t||0)+dt;
}
function stepVerlet(page){
  const dt=evalExpr(page.increment)||vars.dt||0.05;
  const sn={};page.rates.forEach(function(r){sn[r.state]=vars[r.state];});
  const a0={};page.rates.forEach(function(r){a0[r.state]=evalExpr(r.expression);});
  page.rates.forEach(function(r){vars[r.state]=sn[r.state]+sn[r.state]*dt+0.5*a0[r.state]*dt*dt;});
  const a1={};page.rates.forEach(function(r){a1[r.state]=evalExpr(r.expression);});
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

const trails={};
STATE.viewElements.forEach(function(el){if(el.type==='Elements.Trail2D')trails[el.id]=[];});

function drawAxes(){
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=0.5;
  const zx=toPixX(0),zy=toPixY(0);
  if(zy>0&&zy<H()){ctx.beginPath();ctx.moveTo(0,zy);ctx.lineTo(W(),zy);ctx.stroke();}
  if(zx>0&&zx<W()){ctx.beginPath();ctx.moveTo(zx,0);ctx.lineTo(zx,H());ctx.stroke();}
}

function render(){
  ctx.clearRect(0,0,W(),H());
  const bgEl=STATE.viewElements.find(function(e){return e.type==='Elements.DrawingPanel';});
  ctx.fillStyle=bgEl?(bgEl.properties.Background||'"white"').replace(/^"|"$/g,''):'white';
  ctx.fillRect(0,0,W(),H());
  drawAxes();
  STATE.viewElements.forEach(function(el){
    if(!el.type.startsWith('Elements.'))return;
    const p=el.properties;
    if(el.type==='Elements.Shape2D'){
      if(p.Visible&&!evalExpr(p.Visible))return;
      const x=evalExpr(p.X||'0'),y=evalExpr(p.Y||'0');
      const sx=toPixLen(evalExpr(p.SizeX||'0.3')),sy=toPixLen(evalExpr(p.SizeY||'0.3'));
      const px=toPixX(x),py=toPixY(y);
      const fill=(p.FillColor||'"#3b82f6"').replace(/^"|"$/g,'');
      const line=(p.LineColor||'"#1e293b"').replace(/^"|"$/g,'');
      const angle=evalExpr(p.Transformation||'0');
      ctx.save();ctx.translate(px,py);if(angle)ctx.rotate(-angle);
      ctx.fillStyle=fill;ctx.strokeStyle=line;ctx.lineWidth=1.5;
      const shape=p.ShapeType||'ELLIPSE';
      if(shape==='ELLIPSE'||shape==='WHEEL'){
        ctx.beginPath();ctx.ellipse(0,0,Math.max(sx,2),Math.max(sy,2),0,0,2*Math.PI);
        ctx.fill();ctx.stroke();
        if(shape==='WHEEL'){ctx.beginPath();ctx.moveTo(0,-sy);ctx.lineTo(0,sy);ctx.stroke();ctx.beginPath();ctx.moveTo(-sx,0);ctx.lineTo(sx,0);ctx.stroke();}
      }else{ctx.fillRect(-sx,-sy,sx*2,sy*2);ctx.strokeRect(-sx,-sy,sx*2,sy*2);}
      ctx.restore();
    }else if(el.type==='Elements.Spring2D'){
      const x0=toPixX(evalExpr(p.X||'0')),y0=toPixY(evalExpr(p.Y||'0'));
      const x1=toPixX(evalExpr(p.X||'0')+evalExpr(p.SizeX||'2')),y1=toPixY(evalExpr(p.Y||'0')+evalExpr(p.SizeY||'0'));
      const dx=x1-x0,dy=y1-y0,len=Math.sqrt(dx*dx+dy*dy);
      const nx=-dy/len,ny=dx/len,coils=8,amp=8;
      ctx.strokeStyle=(p.LineColor||'"#64748b"').replace(/^"|"$/g,'');ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<=coils*10;i++){const t=i/(coils*10);const s=Math.sin(t*coils*2*Math.PI)*amp;ctx.lineTo(x0+t*dx+s*nx,y0+t*dy+s*ny);}
      ctx.stroke();
    }else if(el.type==='Elements.Arrow2D'){
      const x=evalExpr(p.X||'0'),y=evalExpr(p.Y||'0');
      const vx=evalExpr(p.SizeX||'1'),vy=evalExpr(p.SizeY||'0');
      const px=toPixX(x),py=toPixY(y),ex=toPixX(x+vx),ey=toPixY(y+vy);
      const color=(p.FillColor||p.LineColor||'"#ef4444"').replace(/^"|"$/g,'');
      ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(ex,ey);ctx.stroke();
      const ang=Math.atan2(ey-py,ex-px),aLen=8;
      ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-aLen*Math.cos(ang-0.4),ey-aLen*Math.sin(ang-0.4));ctx.lineTo(ex-aLen*Math.cos(ang+0.4),ey-aLen*Math.sin(ang+0.4));ctx.closePath();ctx.fill();
    }else if(el.type==='Elements.Trail2D'){
      const x=evalExpr(p.X||'0'),y=evalExpr(p.Y||'0');
      const trail=trails[el.id],maxPts=parseInt(p.MaximumPoints||'1000');
      trail.push([toPixX(x),toPixY(y)]);if(trail.length>maxPts)trail.shift();
      if(trail.length<2)return;
      ctx.strokeStyle=(p.LineColor||'"#3b82f6"').replace(/^"|"$/g,'');ctx.lineWidth=1.5;ctx.beginPath();
      trail.forEach(function(pt,i){i===0?ctx.moveTo(pt[0],pt[1]):ctx.lineTo(pt[0],pt[1]);});ctx.stroke();
    }
  });
  const disp=document.getElementById('varDisplay');
  if(disp){disp.innerHTML=STATE.variables.filter(function(v){return v.scope==='global';}).slice(0,10).map(function(v){
    const val=vars[v.name],fmt=typeof val==='number'?val.toFixed(3):String(val);
    return '<span style="display:inline-flex;gap:3px"><span class="var-name">'+v.name+'</span><span class="var-eq">=</span><span class="var-value">'+fmt+'</span></span>';
  }).join('');}
}

let running=false,rafId=null,lastTs=null;
function getMinDt(){var dt=vars.dt||0.05;STATE.odePages.forEach(function(p){var d=evalExpr(p.increment)||vars.dt||0.05;if(d<dt)dt=d;});return dt;}
function loop(ts){if(lastTs===null)lastTs=ts;var elapsed=Math.min((ts-lastTs)/1000,0.1);lastTs=ts;var dt=getMinDt();var steps=Math.min(Math.max(1,Math.round(elapsed/dt)),500);for(var i=0;i<steps;i++)evolve();render();if(running)rafId=requestAnimationFrame(loop);}
function simPlay(){if(!running){running=true;lastTs=null;rafId=requestAnimationFrame(loop);}}
function simPause(){running=false;lastTs=null;if(rafId)cancelAnimationFrame(rafId);}
function simStep(){evolve();render();}
function simReset(){simPause();Object.assign(vars,origVars);vars.t=0;Object.keys(trails).forEach(function(k){trails[k]=[];});runInit();render();}

window.addEventListener('message',function(e){
  if(e.data==='play')simPlay();if(e.data==='pause')simPause();
  if(e.data==='reset')simReset();if(e.data==='step')simStep();
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

