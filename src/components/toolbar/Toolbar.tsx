import { useRef, useState } from 'react';
import { FolderOpen, Save, Download, RefreshCw, MonitorPlay, BookOpen, Calculator } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { readEjssFile } from '../../utils/ejssParser';
import { downloadEjssFile, exportStandaloneHTML } from '../../utils/simulationRunner';
import ExamplesModal from './ExamplesModal';

interface Props {
  stageOpen: boolean;
  onToggleStage: () => void;
  onOpenMath: () => void;
}

export default function Toolbar({ stageOpen, onToggleStage, onOpenMath }: Props) {
  const store = useSimulationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExamples, setShowExamples] = useState(false);

  const getState = () => ({
    info: store.info,
    variables: store.variables,
    odePages: store.odePages,
    constraintPages: store.constraintPages,
    initPages: store.initPages,
    viewElements: store.viewElements,
  });

  const handleOpen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const state = await readEjssFile(file);
      store.loadState(state);
    } catch (err) {
      alert('無法讀取檔案：' + err);
    }
    e.target.value = '';
  };

  return (
    <>
    <header className="h-10 bg-gray-950 flex items-center px-3 gap-3 flex-shrink-0 border-b border-gray-700">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-2">
        <span className="text-lg">🧩</span>
        <span className="text-white font-bold text-sm">EjsS</span>
        <span className="text-purple-400 font-bold text-sm">Web UI</span>
      </div>

      {/* File actions */}
      <button
        onClick={() => store.resetState()}
        className="flex items-center gap-1 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-xs transition-colors"
      >
        <RefreshCw className="w-3 h-3" /> 新增
      </button>

      <button
        onClick={() => setShowExamples(true)}
        className="flex items-center gap-1 text-yellow-300 hover:text-yellow-100 bg-yellow-800/50 hover:bg-yellow-700/60 px-2 py-1 rounded text-xs transition-colors"
      >
        <BookOpen className="w-3 h-3" /> 範例
      </button>

      <button
        onClick={onOpenMath}
        className="flex items-center gap-1 text-cyan-300 hover:text-cyan-100 bg-cyan-900/50 hover:bg-cyan-800/60 px-2 py-1 rounded text-xs transition-colors"
      >
        <Calculator className="w-3 h-3" /> 數學速查
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-xs transition-colors"
      >
        <FolderOpen className="w-3 h-3" /> 開啟 .ejss
      </button>
      <input ref={fileInputRef} type="file" accept=".ejss" className="hidden" onChange={handleOpen} />

      <button
        onClick={() => downloadEjssFile(getState())}
        className="flex items-center gap-1 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-xs transition-colors"
      >
        <Save className="w-3 h-3" /> 儲存 .ejss
      </button>

      <button
        onClick={() => exportStandaloneHTML(getState())}
        className="flex items-center gap-1 text-white bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded text-xs transition-colors"
      >
        <Download className="w-3 h-3" /> 匯出 HTML
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Simulation title */}
      <input
        className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600 w-40"
        value={store.info.title}
        placeholder="模擬名稱"
        onChange={(e) => store.loadState({ ...getState(), info: { ...store.info, title: e.target.value } })}
      />

      {/* Stage toggle */}
      <button
        onClick={onToggleStage}
        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors
          ${stageOpen
            ? 'bg-green-600 hover:bg-green-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
      >
        <MonitorPlay className="w-3.5 h-3.5" />
        {stageOpen ? '← 返回編輯' : '🎮 模擬舞台'}
      </button>
    </header>
    {showExamples && <ExamplesModal onClose={() => setShowExamples(false)} />}
    </>
  );
}
