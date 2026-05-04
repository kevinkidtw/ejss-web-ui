import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { buildPreviewHTML } from '../../utils/simulationRunner';

const CHART_COLORS = ['#a78bfa', '#34d399', '#f59e0b', '#f87171', '#38bdf8', '#fb923c', '#e879f9'];
const CHART_MAX = 300;

interface FrameData { t: number; vars: Record<string, number>; }

function LiveChart({ frames }: { frames: FrameData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth || 460;
    const H = 160;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    if (frames.length < 2) {
      ctx.fillStyle = '#475569';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('執行模擬後顯示即時圖表', W / 2, H / 2);
      return;
    }

    const varNames = Object.keys(frames[0].vars);
    const PAD = { top: 6, right: 8, bottom: 22, left: 4 };
    const pW = W - PAD.left - PAD.right;
    const pH = H - PAD.top - PAD.bottom;

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (i / 4) * pH;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
    }

    varNames.forEach((vn, vi) => {
      const vals = frames.map(f => f.vars[vn]).filter(v => Number.isFinite(v));
      if (vals.length < 2) return;
      const minV = Math.min(...vals);
      const maxV = Math.max(...vals);
      const span = maxV - minV || 1;
      const color = CHART_COLORS[vi % CHART_COLORS.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      frames.forEach((f, fi) => {
        const v = f.vars[vn];
        if (!Number.isFinite(v)) return;
        const x = PAD.left + (fi / (frames.length - 1)) * pW;
        const y = PAD.top + (1 - (v - minV) / span) * pH;
        fi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      const cur = frames[frames.length - 1].vars[vn];
      const legendSlot = pW / Math.max(varNames.length, 1);
      ctx.fillStyle = color;
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${vn}=${Number.isFinite(cur) ? cur.toFixed(3) : '?'}`, PAD.left + vi * Math.min(legendSlot, 90), H - 5);
    });
  }, [frames]);

  return <canvas ref={canvasRef} className="w-full block" style={{ height: '160px' }} />;
}

export default function StagePanel() {
  const store = useSimulationStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sliderVals, setSliderVals] = useState<Record<string, number>>({});
  const [chartFrames, setChartFrames] = useState<FrameData[]>([]);
  const lastChartTs = useRef(0);

  const sliders = store.viewElements.filter(e => e.type === 'Elements.Slider');

  const getInitSliderVals = useCallback(() => {
    const vals: Record<string, number> = {};
    store.viewElements.filter(e => e.type === 'Elements.Slider').forEach(sl => {
      const vn = sl.properties.Variable;
      if (!vn) return;
      const sv = store.variables.find(v => v.name === vn);
      vals[vn] = parseFloat(sv?.value ?? sl.properties.Minimum ?? '0') || 0;
    });
    return vals;
  }, [store.viewElements, store.variables]);

  // Sync slider initial values when elements change
  useEffect(() => {
    setSliderVals(getInitSliderVals());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.viewElements]);

  // Receive frameVars from iframe (throttled to ~20fps for chart)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object' || e.data.type !== 'frameVars') return;
      const now = Date.now();
      if (now - lastChartTs.current < 50) return;
      lastChartTs.current = now;
      setChartFrames(prev => {
        const next = [...prev, { t: e.data.t as number, vars: e.data.vars as Record<string, number> }];
        return next.length > CHART_MAX ? next.slice(-CHART_MAX) : next;
      });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const buildAndLoad = useCallback(() => {
    const html = buildPreviewHTML({
      info: store.info,
      variables: store.variables,
      odePages: store.odePages,
      constraintPages: store.constraintPages,
      initPages: store.initPages,
      viewElements: store.viewElements,
    });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    if (iframeRef.current) {
      iframeRef.current.src = url;
      setLoaded(true);
      setRunning(false);
    }
  }, [store]);

  // Auto-preview with 300ms debounce whenever model changes
  useEffect(() => {
    if (store.viewElements.length === 0 && store.odePages.length === 0 && store.variables.length === 0) {
      setLoaded(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(buildAndLoad, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.viewElements, store.odePages, store.variables, store.initPages, store.constraintPages]);

  const sendMsg = (msg: string) => iframeRef.current?.contentWindow?.postMessage(msg, '*');

  const handlePlay  = () => { if (!loaded) buildAndLoad(); else { sendMsg('play'); setRunning(true); } };
  const handlePause = () => { sendMsg('pause'); setRunning(false); };
  const handleStep  = () => { if (!loaded) buildAndLoad(); else sendMsg('step'); };
  const handleReset = () => {
    buildAndLoad();
    setRunning(false);
    setChartFrames([]);
    setSliderVals(getInitSliderVals());
  };

  const handleSliderChange = (varName: string, value: number) => {
    setSliderVals(prev => ({ ...prev, [varName]: value }));
    iframeRef.current?.contentWindow?.postMessage({ type: 'setVar', name: varName, value }, '*');
  };

  const hasContent = store.variables.length > 0 || store.odePages.length > 0 || store.viewElements.length > 0;
  const globalVars = store.variables.filter((v) => v.scope === 'global');

  const dpEl = store.viewElements.find((e) => e.type === 'Elements.DrawingPanel');
  const dpW = parseInt(dpEl?.properties?.Width ?? '400') || 400;
  const dpH = parseInt(dpEl?.properties?.Height ?? '400') || 400;

  return (
    <div className="flex flex-col h-full bg-gray-950 overflow-y-auto">
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <span className="text-xs font-bold text-gray-300 mr-1">{store.info.title || '模擬'}</span>
        <div className="flex gap-1 ml-auto">
          <button onClick={handlePlay} disabled={!hasContent}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded px-3 py-1 text-xs font-bold transition-colors">
            <Play className="w-3.5 h-3.5" /> {running ? '播放中' : loaded ? '繼續' : '執行'}
          </button>
          <button onClick={handlePause} disabled={!loaded}
            className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white rounded px-3 py-1 text-xs transition-colors">
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleStep} disabled={!hasContent}
            className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-40 text-white rounded px-3 py-1 text-xs transition-colors">
            <StepForward className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleReset} disabled={!hasContent}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded px-3 py-1 text-xs transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Iframe — fixed aspect ratio based on DrawingPanel dimensions */}
      <div className="w-full flex-shrink-0 relative bg-gray-900" style={{ aspectRatio: `${dpW} / ${dpH}` }}>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 z-10 select-none">
            <div className="text-5xl mb-3">▶</div>
            <p className="text-sm">新增元件後自動預覽，或按「執行」啟動</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full border-none"
          sandbox="allow-scripts"
          title="simulation-preview"
        />
      </div>

      {/* React slider controls — outside iframe, no overlap */}
      {sliders.length > 0 && (
        <div className="px-3 py-2 bg-gray-900 border-t border-gray-700 flex-shrink-0">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">滑桿控制</div>
          <div className="space-y-2">
            {sliders.map(sl => {
              const vn = sl.properties.Variable || '';
              const label = sl.properties.Label || vn;
              const min = parseFloat(sl.properties.Minimum || '0');
              const max = parseFloat(sl.properties.Maximum || '10');
              const step = parseFloat(sl.properties.Step || '0.1');
              const val = sliderVals[vn] ?? min;
              const decimals = step < 0.1 ? 3 : step < 1 ? 2 : 1;
              if (!vn) return null;
              return (
                <div key={sl.id} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-[72px] flex-shrink-0 font-mono truncate">{label}</span>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={val}
                    onChange={e => handleSliderChange(vn, parseFloat(e.target.value))}
                    className="flex-1 h-1 cursor-pointer accent-purple-400"
                  />
                  <span className="text-[10px] text-green-400 font-mono w-[38px] text-right flex-shrink-0">
                    {val.toFixed(decimals)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Variable bar */}
      {globalVars.length > 0 && (
        <div className="px-3 pt-1 pb-1.5 bg-gray-900 border-t border-gray-700 flex-shrink-0">
          <div className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wide">初始值</div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5">
            {globalVars.slice(0, 12).map((v) => (
              <span key={v.id} className="text-xs font-mono" title={v.comment || `變數 ${v.name} 的初始值為 ${v.value}`}>
                <span className="text-yellow-400">{v.name}</span>
                <span className="text-gray-600"> = </span>
                <span className="text-green-400">{v.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live chart */}
      {hasContent && (
        <div className="border-t border-gray-700 bg-gray-950 flex-shrink-0">
          <div className="flex items-center px-3 pt-1.5 pb-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">即時圖表</span>
            {chartFrames.length > 0 && (
              <button
                onClick={() => setChartFrames([])}
                className="ml-auto text-[9px] text-gray-600 hover:text-gray-400 transition-colors"
              >
                清除
              </button>
            )}
          </div>
          <LiveChart frames={chartFrames} />
        </div>
      )}
    </div>
  );
}
