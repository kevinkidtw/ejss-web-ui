import { useSimulationStore } from '../../store/simulationStore';
import HelpTooltip from '../ui/HelpTooltip';

const MODEL_ACTIONS = [
  {
    category: '📦 模型變數',
    action: 'addVariable',
    label: '+ 新增模型變數',
    color: 'bg-amber-50 hover:bg-amber-100/80 text-amber-800 border-amber-200 hover:border-amber-300 active:bg-amber-100/60',
    desc: '整個模擬都能存取的數值，例如位置 x、速度 vx、質量 m。在微分方程和元件屬性中都能直接用變數名稱引用。',
  },
  {
    category: '🔵 微分方程',
    action: 'addOdePage',
    label: '+ 新增方程組',
    color: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-850 border-indigo-200 hover:border-indigo-300 active:bg-indigo-100/60',
    desc: '描述變數隨時間如何變化，如 dx/dt = vx。模擬器每個時間步用 RK4 等數值積分法自動更新。',
  },
  {
    category: '🔴 計算／約束',
    action: 'addConstraintPage',
    label: '+ 新增約束',
    color: 'bg-rose-50 hover:bg-rose-100/80 text-rose-800 border-rose-200 hover:border-rose-300 active:bg-rose-100/60',
    desc: '每個時間步都重新執行的計算，例如 F = -k*x（彈力）、碰壁反彈、壓力累積。',
  },
  {
    category: '🟢 初始化',
    action: 'addInitPage',
    label: '+ 新增初始化',
    color: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-250/70 hover:border-emerald-300 active:bg-emerald-100/60',
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
    <aside className="w-full h-full bg-slate-100 text-slate-800 flex flex-col overflow-y-auto">

      {/* Context header */}
      <div className="px-3 py-3 border-b border-slate-200 flex-shrink-0">
        {selectedEl ? (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 animate-pulse" />
            <div className="min-w-0">
              <div className="text-[9px] text-purple-650 uppercase tracking-widest font-bold leading-none mb-1">編輯元件</div>
              <div className="text-xs font-semibold text-slate-800 truncate">{selectedEl.name}</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[9px] text-slate-450 uppercase tracking-widest font-bold leading-none mb-1">積木面板</div>
            <div className="text-[10px] text-slate-500 font-medium">廣域模式（未選取元件）</div>
          </div>
        )}
      </div>

      {/* Action blocks */}
      <div className="flex flex-col flex-1 py-1">
        {MODEL_ACTIONS.map((item) => (
          <div key={item.category} className="px-3 py-3 border-b border-slate-200/50 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600 tracking-wide">{item.category}</span>
              <HelpTooltip text={item.desc} side="right" />
            </div>
            <button
              onClick={() => handleModelAction(item.action)}
              className={`${item.color} rounded-md px-3 py-1.5 text-xs font-semibold w-full text-left transition-all duration-150 border shadow-sm cursor-pointer active:scale-[0.98]`}
            >
              {item.action === 'addVariable' && selectedEl ? '+ 新增元件變數' : item.label}
            </button>
          </div>
        ))}
      </div>

    </aside>
  );
}
