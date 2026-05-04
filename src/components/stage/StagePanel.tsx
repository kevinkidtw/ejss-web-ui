import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';
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
  const handleReset = () => { buildAndLoad(); setRunning(false); };

  const hasContent = store.variables.length > 0 || store.odePages.length > 0 || store.viewElements.length > 0;

  const bbox = computeSimBBox(store.viewElements);

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

      {/* Iframe — aspect ratio from bounding box of all layout elements */}
      <div className="w-full flex-shrink-0 relative bg-gray-900" style={{ aspectRatio: `${bbox.w} / ${bbox.h}` }}>
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
    </div>
  );
}
