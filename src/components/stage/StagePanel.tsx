import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward, Download } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { buildPreviewHTML, computeSimBBox } from '../../utils/simulationRunner';

export default function StagePanel() {
  const store = useSimulationStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildAndLoad = useCallback(() => {
    const html = buildPreviewHTML({
      info: store.info,
      description: store.description,
      variables: store.variables,
      odePages: store.odePages,
      constraintPages: store.constraintPages,
      initPages: store.initPages,
      viewElements: store.viewElements,
    });
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
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

  // Listen to message from iframe for CSV download
  useEffect(() => {
    const handleCSVMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'csvData') {
        const { csv, title } = e.data;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'simulation'}_data.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    };
    window.addEventListener('message', handleCSVMessage);
    return () => window.removeEventListener('message', handleCSVMessage);
  }, []);

  const sendMsg = (msg: string) => iframeRef.current?.contentWindow?.postMessage(msg, '*');

  const handlePlay  = () => { if (!loaded) buildAndLoad(); else { sendMsg('play'); setRunning(true); } };
  const handlePause = () => { sendMsg('pause'); setRunning(false); };
  const handleStep  = () => { if (!loaded) buildAndLoad(); else sendMsg('step'); };
  const handleReset = () => { buildAndLoad(); setRunning(false); };

  const hasContent = store.variables.length > 0 || store.odePages.length > 0 || store.viewElements.length > 0;

  const bbox = computeSimBBox(store.viewElements);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        <span className="text-xs font-bold text-slate-700 mr-1 tracking-wide">{store.info.title || '無標題模擬'}</span>
        <div className="flex gap-1.5 ml-auto">
          <button
            onClick={handlePlay}
            disabled={!hasContent}
            className="flex items-center gap-1 bg-emerald-650 hover:bg-emerald-700 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded px-2.5 py-1 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> {running ? '播放中' : loaded ? '繼續' : '執行'}
          </button>
          <button
            onClick={handlePause}
            disabled={!loaded}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded px-2.5 py-1 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleStep}
            disabled={!hasContent}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-250 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-slate-700 rounded px-2.5 py-1 text-xs font-semibold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            disabled={!hasContent}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded px-2.5 py-1 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sendMsg('exportCSV')}
            disabled={!loaded}
            title="匯出物理數據軌跡成 CSV 檔案，可帶入 Python/Excel 分析"
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded px-3 py-1 text-xs font-semibold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> 匯出數據
          </button>
        </div>
      </div>

      {/* Iframe — aspect ratio from bounding box of all layout elements */}
      <div className="w-full flex-shrink-0 relative bg-slate-50 border-b border-slate-200" style={{ aspectRatio: `${bbox.w} / ${bbox.h}` }}>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-500 z-10 select-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            <div className="text-4xl mb-2.5 text-slate-400 opacity-60">💻</div>
            <p className="text-xs font-semibold text-slate-700">模擬舞台已就緒</p>
            <p className="text-[10px] text-slate-500 mt-1 text-center px-4 leading-normal">新增視覺元件後會自動在此顯示預覽，<br />或點選上方「執行」啟動積分器</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full border-none bg-transparent"
          sandbox="allow-scripts"
          title="simulation-preview"
        />
      </div>
    </div>
  );
}
