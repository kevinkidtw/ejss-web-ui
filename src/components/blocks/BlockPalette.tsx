import { useSimulationStore } from '../../store/simulationStore';
import HelpTooltip from '../ui/HelpTooltip';

const MODEL_ACTIONS = [
  {
    category: '📦 模型變數',
    action: 'addVariable',
    label: '+ 新增模型變數',
    color: 'bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-yellow-900',
    desc: '整個模擬都能存取的數值，例如位置 x、速度 vx、質量 m。在微分方程和元件屬性中都能直接用變數名稱引用。',
  },
  {
    category: '🔵 微分方程',
    action: 'addOdePage',
    label: '+ 新增方程組',
    color: 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white',
    desc: '描述變數隨時間如何變化，如 dx/dt = vx。模擬器每個時間步用 RK4 等數值積分法自動更新。',
  },
  {
    category: '🔴 計算／約束',
    action: 'addConstraintPage',
    label: '+ 新增約束',
    color: 'bg-red-500 hover:bg-red-400 active:bg-red-600 text-white',
    desc: '每個時間步都重新執行的計算，例如 F = -k*x（彈力）、碰壁反彈、壓力累積。',
  },
  {
    category: '🟢 初始化',
    action: 'addInitPage',
    label: '+ 新增初始化',
    color: 'bg-green-500 hover:bg-green-400 active:bg-green-600 text-white',
    desc: '模擬開始或重置時只執行一次，用來設定初始條件，例如 x = 1.5; vx = 0。',
  },
];

export default function BlockPalette() {
  const store = useSimulationStore();
  const { selectedElementId, viewElements } = store;
  const selectedEl = selectedElementId ? viewElements.find((e) => e.id === selectedElementId) : null;

  const handleModelAction = (action: string) => {
    if (action === 'addVariable') {
      store.addVariable({ name: 'x', value: '0', type: 'double', comment: '', page: 'Variables', scope: selectedElementId ?? 'global' });
    } else if (action === 'addOdePage') {
      store.addOdePage();
    } else if (action === 'addConstraintPage') {
      store.addConstraintPage();
    } else if (action === 'addInitPage') {
      store.addInitPage();
    }
  };

  return (
    <aside className="w-full h-full bg-gray-800 text-white flex flex-col overflow-y-auto">

      {/* Context header */}
      <div className="px-3 pt-3 pb-2.5 border-b border-gray-700 flex-shrink-0">
        {selectedEl ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] text-purple-400 uppercase tracking-widest font-bold leading-none mb-0.5">編輯元件</div>
              <div className="text-xs font-semibold text-purple-100 truncate">{selectedEl.name}</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-none mb-0.5">積木面板</div>
            <div className="text-[10px] text-gray-400">廣域模式（未選取元件）</div>
          </div>
        )}
      </div>

      {/* Action blocks */}
      <div className="flex flex-col flex-1 py-1">
        {MODEL_ACTIONS.map((item) => (
          <div key={item.category} className="px-3 py-2.5 border-b border-gray-700/40 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-200 tracking-wide">{item.category}</span>
              <HelpTooltip text={item.desc} side="right" />
            </div>
            <button
              onClick={() => handleModelAction(item.action)}
              className={`${item.color} rounded-md px-3 py-1.5 text-xs font-bold w-full text-left transition-colors`}
            >
              {item.action === 'addVariable' && selectedEl ? '+ 新增元件變數' : item.label}
            </button>
          </div>
        ))}
      </div>

    </aside>
  );
}
