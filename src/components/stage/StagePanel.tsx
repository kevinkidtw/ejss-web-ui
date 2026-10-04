import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Download,
  AlertTriangle,
  Cpu,
  Gauge,
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { buildPreviewHTML, computeSimBBox } from '../../utils/simulationRunner';
import type { Diagnostic, PerfStats } from '../../runtime/core/types';

export default function StagePanel() {
  const store = useSimulationStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [statusInfo, setStatusInfo] = useState<{
    t: number;
    mode: 'worker' | 'main';
    perf: PerfStats;
  }>({
    t: 0,
    mode: 'worker',
    perf: { stepsPerSec: 0, realtimeRatio: 1, fps: 60 },
  });

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
      isLocked: store.isLocked,
    });
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
      setLoaded(true);
      setRunning(false);
      setDiagnostics([]);
    }
  }, [store]);

  // Auto-preview with 300ms debounce whenever model changes
  useEffect(() => {
    if (
      store.viewElements.length === 0 &&
      store.odePages.length === 0 &&
      store.variables.length === 0
    ) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setLoaded(false);
      }, 0);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(buildAndLoad, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    store.viewElements,
    store.odePages,
    store.variables,
    store.initPages,
    store.constraintPages,
    store.isLocked,
    buildAndLoad,
  ]);

  // Listen to messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'csvData') {
        const { csv, title } = data;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'simulation'}_data.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (data.type === 'ejss:diagnostics') {
        setDiagnostics(data.diagnostics || []);
      } else if (data.type === 'ejss:status') {
        setRunning(Boolean(data.running));
        setStatusInfo({
          t: Number(data.t) || 0,
          mode: data.mode === 'worker' ? 'worker' : 'main',
          perf: data.perf || { stepsPerSec: 0, realtimeRatio: 1, fps: 60 },
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendMsg = (msg: string | { type: string; [key: string]: unknown }) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  };

  const handlePlay = () => {
    if (!loaded) buildAndLoad();
    else {
      sendMsg('play');
      setRunning(true);
    }
  };

  const handlePause = () => {
    sendMsg('pause');
    setRunning(false);
  };

  const handleStep = () => {
    if (!loaded) buildAndLoad();
    else sendMsg('step');
  };

  const handleReset = () => {
    buildAndLoad();
    setRunning(false);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    sendMsg({ type: 'ejss:setSpeed', speed: newSpeed });
  };

  const hasContent =
    store.variables.length > 0 || store.odePages.length > 0 || store.viewElements.length > 0;

  const bbox = computeSimBBox(store.viewElements);

  return (
    <div className="flex flex-col h-full bg-[#FAF8F3] overflow-y-auto text-[#2B2D31]">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] border-b border-[#E5E1D8] flex-shrink-0">
        <span className="text-xs font-bold text-[#2B2D31] mr-1 tracking-wide truncate max-w-[140px]">
          {store.info.title || '無標題模擬'}
        </span>

        {/* Speed menu */}
        <div className="flex items-center gap-1 ml-auto text-xs font-medium text-[#6B6F76]">
          <Gauge className="w-3.5 h-3.5 text-[#6B6F76]" />
          <select
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="text-xs bg-[#FAF8F3] border border-[#E5E1D8] text-[#2B2D31] rounded px-1.5 py-0.5 font-medium cursor-pointer outline-none"
          >
            <option value={0.1}>0.1×</option>
            <option value={0.25}>0.25×</option>
            <option value={0.5}>0.5×</option>
            <option value={1}>1.0×</option>
            <option value={2}>2.0×</option>
            <option value={4}>4.0×</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex gap-1.5">
          <button
            onClick={handlePlay}
            disabled={!hasContent}
            className="flex items-center gap-1 bg-[#E9A23B] hover:bg-[#D58F28] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded-[10px] px-2.5 py-1 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> {running ? '播放中' : loaded ? '繼續' : '執行'}
          </button>
          <button
            onClick={handlePause}
            disabled={!loaded}
            className="flex items-center gap-1 bg-[#6B6F76] hover:bg-[#565A60] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded-[10px] px-2 py-1 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleStep}
            disabled={!hasContent}
            className="flex items-center gap-1 bg-[#2F6FB0] hover:bg-[#275D94] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded-[10px] px-2 py-1 text-xs font-semibold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            disabled={!hasContent}
            className="flex items-center gap-1 bg-[#2B2D31] hover:bg-[#1C1E22] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded-[10px] px-2 py-1 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => sendMsg('exportCSV')}
            disabled={!loaded}
            title="匯出物理數據軌跡成 CSV 檔案"
            className="flex items-center gap-1 bg-[#2A9D8F] hover:bg-[#228478] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed text-white rounded-[10px] px-2.5 py-1 text-xs font-semibold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> 匯出數據
          </button>
        </div>
      </div>

      {/* Stage Container */}
      <div
        className="w-full flex-shrink-0 relative bg-[#FFFFFF] border-b border-[#E5E1D8]"
        style={{ aspectRatio: `${bbox.w} / ${bbox.h}` }}
      >
        {!loaded && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF8F3] text-[#6B6F76] z-10 select-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #E5E1D8 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <div className="text-4xl mb-2.5 text-[#6B6F76] opacity-60">💻</div>
            <p className="text-xs font-semibold text-[#2B2D31]">模擬舞台已就緒</p>
            <p className="text-[10px] text-[#6B6F76] mt-1 text-center px-4 leading-normal">
              新增視覺元件後會自動在此顯示預覽，
              <br />
              或點選上方「執行」啟動積分器
            </p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="absolute inset-0 w-full h-full border-none bg-transparent"
          sandbox="allow-scripts allow-downloads"
          title="simulation-preview"
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#FFFFFF] border-b border-[#E5E1D8] text-[11px] text-[#6B6F76] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#2F6FB0]" />
            模式:{' '}
            <span
              className={`font-semibold ${statusInfo.mode === 'worker' ? 'text-[#2A9D8F]' : 'text-[#E9A23B]'}`}
            >
              {statusInfo.mode === 'worker' ? 'Web Worker' : '主執行緒 (Main)'}
            </span>
          </span>
          <span>
            步數/秒: <span className="font-mono text-[#2B2D31]">{statusInfo.perf.stepsPerSec}</span>
          </span>
          <span>
            即時比:{' '}
            <span className="font-mono text-[#2B2D31]">
              {(statusInfo.perf.realtimeRatio * 100).toFixed(0)}%
            </span>
          </span>
          <span>
            FPS: <span className="font-mono text-[#2B2D31]">{statusInfo.perf.fps}</span>
          </span>
        </div>
        <div className="font-mono text-[#2B2D31] font-medium">
          t = {statusInfo.t.toFixed(3)} s
        </div>
      </div>

      {/* Diagnostics Panel */}
      {diagnostics.length > 0 && (
        <div className="p-3 bg-[#FFFDF8] border-b border-[#E5E1D8] flex flex-col gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#D1495B]">
            <AlertTriangle className="w-4 h-4" />
            診斷訊息 ({diagnostics.length})
          </div>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto text-xs">
            {diagnostics.map((d, i) => (
              <div
                key={i}
                className="p-1.5 rounded bg-white border border-[#E5E1D8] flex flex-col gap-0.5 text-[#2B2D31]"
              >
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={`px-1 py-0.2 rounded font-bold ${
                      d.kind === 'compile'
                        ? 'bg-rose-100 text-rose-800'
                        : d.kind === 'nan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {d.kind}
                  </span>
                  <span className="text-[#6B6F76]">區塊: {d.block}</span>
                  <span className="text-[#6B6F76]">頁面: {d.pageId}</span>
                  {'item' in d && d.item && <span className="text-[#6B6F76]">項目: {d.item}</span>}
                </div>
                <div className="text-[12px] text-[#D1495B] font-mono whitespace-pre-wrap">
                  {d.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
