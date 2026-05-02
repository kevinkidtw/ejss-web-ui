import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import HelpTooltip from '../ui/HelpTooltip';
import MATH_FUNCTIONS from '../../constants/mathFunctions';

const MODEL_ACTIONS = [
  {
    category: '📦 模型變數', action: 'addVariable', label: '+ 新增模型變數',
    color: 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900',
    desc: '整個模擬都能存取的數值，例如位置 x、速度 vx、質量 m。在微分方程和元件屬性中都能直接用變數名稱引用。',
  },
  {
    category: '🔵 微分方程', action: 'addOdePage', label: '+ 新增方程組',
    color: 'bg-blue-500 hover:bg-blue-400 text-white',
    desc: '描述變數隨時間如何變化。例如 dx/dt = vx 表示位置的變化率等於速度。模擬器每個時間步都會用數值積分法（如 RK4）自動更新這些變數。',
  },
  {
    category: '🔴 計算/約束', action: 'addConstraintPage', label: '+ 新增約束',
    color: 'bg-red-500 hover:bg-red-400 text-white',
    desc: '每個時間步都重新執行的計算。用來算出依賴其他變數的量，例如 F = -k*x（彈力）或 E = 0.5*m*vx*vx（動能）。',
  },
  {
    category: '🟢 初始化', action: 'addInitPage', label: '+ 新增初始化',
    color: 'bg-green-500 hover:bg-green-400 text-white',
    desc: '模擬開始（或按重置）時只執行一次的程式碼。用來設定初始條件，例如 x=2; vx=0。比直接填初始值更靈活，可以寫計算式。',
  },
];

export default function BlockPalette() {
  const store = useSimulationStore();
  const { selectedElementId, viewElements } = store;
  const [showMath, setShowMath] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const selectedEl = selectedElementId ? viewElements.find((e) => e.id === selectedElementId) : null;

  const handleModelAction = (action: string) => {
    if (action === 'addVariable') {
      const scope = selectedElementId ?? 'global';
      store.addVariable({ name: 'x', value: '0', type: 'double', comment: '', page: 'Variables', scope });
    } else if (action === 'addOdePage') {
      store.addOdePage();
    } else if (action === 'addConstraintPage') {
      store.addConstraintPage();
    } else if (action === 'addInitPage') {
      store.addInitPage();
    }
  };

  const copyFn = (syntax: string) => {
    navigator.clipboard.writeText(syntax).catch(() => {});
    setCopied(syntax);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <aside className="w-full h-full bg-gray-800 text-white flex flex-col overflow-y-auto">
      <div className="p-2 bg-gray-900 text-xs font-bold uppercase tracking-wide text-gray-400">積木面板</div>

      {/* Context label */}
      {selectedEl ? (
        <div className="px-2 py-1 bg-purple-900/40 border-b border-purple-700">
          <div className="text-[10px] text-purple-300 uppercase tracking-wide">目前元件</div>
          <div className="text-xs text-white font-bold truncate">{selectedEl.name}</div>
        </div>
      ) : (
        <div className="px-2 py-1 bg-gray-700/40 border-b border-gray-700">
          <div className="text-[10px] text-gray-400">廣域模式（無選中元件）</div>
        </div>
      )}

      {MODEL_ACTIONS.map((item) => (
        <div key={item.category} className="p-2 border-b border-gray-700">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-gray-400">{item.category}</span>
            {item.action === 'addVariable' && selectedEl && (
              <span className="text-[10px] text-purple-300">(元件)</span>
            )}
            <HelpTooltip text={item.desc} side="right" />
          </div>
          <button
            onClick={() => handleModelAction(item.action)}
            className={`${item.color} rounded px-2 py-1 text-xs font-bold w-full text-left transition-colors`}
          >
            {item.action === 'addVariable' && selectedEl ? '+ 新增元件變數' : item.label}
          </button>
        </div>
      ))}

      {/* Math function reference */}
      <button
        onClick={() => setShowMath((v) => !v)}
        className="flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 border-t border-gray-600 text-xs text-gray-300 transition-colors flex-shrink-0 mt-auto sticky bottom-0"
      >
        <span>𝑓(𝑥) 數學函數速查</span>
        {showMath ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showMath && (
        <div className="border-t border-gray-600 bg-gray-850 overflow-y-auto flex-shrink-0 max-h-96">
          {MATH_FUNCTIONS.map((group) => (
            <div key={group.category} className="border-b border-gray-700 last:border-0">
              <div className="px-2 py-1 bg-gray-900/60 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                {group.category}
              </div>
              {group.fns.map((fn) => (
                <button
                  key={fn.syntax}
                  onClick={() => copyFn(fn.syntax)}
                  title={fn.desc}
                  className="w-full flex items-center justify-between gap-1 px-2 py-1 hover:bg-gray-700 text-left transition-colors group"
                >
                  <span className="font-mono text-[10px] text-green-400 truncate group-hover:text-green-300">
                    {fn.syntax}
                  </span>
                  <span className={`text-[9px] flex-shrink-0 transition-colors ${copied === fn.syntax ? 'text-green-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {copied === fn.syntax ? '✓ 已複製' : '複製'}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
