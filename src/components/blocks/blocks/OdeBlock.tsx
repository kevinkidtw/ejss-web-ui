import { Plus, Trash2 } from 'lucide-react';
import type { OdePage } from '../../../types/simulation';
import { useSimulationStore } from '../../../store/simulationStore';
import { useFxInsert } from '../../../hooks/useFxInsert';
import MathFunctionPicker from '../../ui/MathFunctionPicker';

const METHODS: { value: OdePage['method']; label: string; title: string }[] = [
  { value: 'Euler',      label: '歐拉法（簡易）',     title: '最基本的積分法，誤差較大，適合學習用' },
  { value: 'RungeKutta', label: 'RK4 四階法（推薦）', title: '精確度高，適合大多數物理模擬，強烈建議使用' },
  { value: 'Verlet',     label: 'Verlet 積分（力學）', title: '適合能量守恆問題，如彈簧、行星運動' },
  { value: 'Fehlberg78', label: '自適應步長法',        title: '自動調整精度，適合剛性或複雜方程' },
];

function RateRow({ state, expression, onStateChange, onExprChange, onRemove }: {
  state: string; expression: string;
  onStateChange: (v: string) => void;
  onExprChange: (v: string) => void;
  onRemove: () => void;
}) {
  const fx = useFxInsert(expression, onExprChange);

  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 text-xs font-mono flex-shrink-0 mt-1.5">d[</span>
      <input
        className="bg-slate-50 text-slate-800 placeholder-slate-450 font-mono text-xs px-2 py-1 rounded w-16 flex-shrink-0 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/15 transition-all"
        value={state}
        placeholder="x"
        onChange={(e) => onStateChange(e.target.value)}
      />
      <span className="text-slate-400 text-xs font-mono flex-shrink-0 mt-1.5">]/dt&nbsp;=</span>
      {/* textarea auto-expands when expression is long */}
      <textarea
        className="bg-slate-50 text-slate-800 placeholder-slate-450 font-mono text-xs px-2.5 py-1 rounded flex-1 min-w-0 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/15 resize-none overflow-hidden leading-relaxed transition-all"
        rows={1}
        style={{ fieldSizing: 'content' } as React.CSSProperties}
        value={expression}
        placeholder="vx"
        onChange={(e) => onExprChange(e.target.value)}
        {...fx.trackProps}
      />
      <button
        onClick={fx.openPicker}
        title="插入數學函數"
        className="text-indigo-600 hover:text-indigo-850 text-xs font-bold px-2 py-1 rounded hover:bg-slate-100 transition-colors flex-shrink-0 mt-0.5"
      >
        𝑓𝑥
      </button>
      {fx.pickerAnchor && (
        <MathFunctionPicker
          anchor={fx.pickerAnchor}
          onSelect={fx.insert}
          onClose={fx.closePicker}
        />
      )}
      <button
        onClick={onRemove}
        className="text-slate-450 hover:text-rose-600 hover:bg-slate-100 p-1.5 rounded transition-colors flex-shrink-0 mt-0.5"
        title="刪除方程"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function OdeBlock({ page }: { page: OdePage }) {
  const { updateOdePage, addOdeRate, updateOdeRate, removeOdeRate, removeOdePage } = useSimulationStore();

  return (
    <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-lg p-3.5 shadow-sm hover:border-slate-300/85 transition-all select-none mb-3 space-y-3">
      {/* Header row 1: label + name + trash */}
      <div className="flex items-center gap-2">
        <span className="text-indigo-600 font-bold text-sm flex-shrink-0 flex items-center gap-1">
          <span>🔵</span>
          <span>微分方程組</span>
        </span>
        <input
          className="bg-slate-50 text-slate-800 placeholder-slate-400 text-xs px-2.5 py-1 rounded flex-1 min-w-0 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500/80 transition-all"
          value={page.name}
          title="此微分方程組的名稱，可自行命名"
          onChange={(e) => updateOdePage(page.id, { name: e.target.value })}
        />
        <button
          onClick={() => removeOdePage(page.id)}
          className="text-slate-450 hover:text-rose-650 hover:bg-slate-100 p-1.5 rounded transition-all flex-shrink-0"
          title="刪除微分方程組"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header row 2: dt + method */}
      <div className="flex items-center gap-2.5">
        <span
          className="text-slate-500 text-xs flex-shrink-0"
          title="時間步長 dt：每次計算前進的時間量，建議 0.001～0.05；越小越精確但越慢"
        >
          時間步長 dt:
        </span>
        <input
          className="bg-slate-50 text-slate-800 placeholder-slate-400 font-mono text-xs px-2.5 py-1 rounded w-16 flex-shrink-0 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/15 transition-all"
          value={page.increment}
          title="時間步長 dt：每次計算前進的時間量，建議 0.001～0.05；越小越精確但越慢"
          onChange={(e) => updateOdePage(page.id, { increment: e.target.value })}
        />
        <select
          className="bg-slate-50 text-slate-700 text-xs px-2 py-1 rounded border border-slate-200 flex-1 min-w-0 outline-none focus:bg-white focus:border-indigo-500/80 transition-all"
          value={page.method}
          title={METHODS.find((m) => m.value === page.method)?.title ?? '選擇數值積分方法'}
          onChange={(e) => updateOdePage(page.id, { method: e.target.value as OdePage['method'] })}
        >
          {METHODS.map((m) => <option key={m.value} value={m.value} className="bg-white text-slate-850" title={m.title}>{m.label}</option>)}
        </select>
      </div>

      {/* Rate rows */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 space-y-2.5">
        {page.rates.map((rate, i) => (
          <RateRow
            key={i}
            state={rate.state}
            expression={rate.expression}
            onStateChange={(v) => updateOdeRate(page.id, i, { state: v })}
            onExprChange={(v) => updateOdeRate(page.id, i, { expression: v })}
            onRemove={() => removeOdeRate(page.id, i)}
          />
        ))}
        <button
          onClick={() => addOdeRate(page.id)}
          className="flex items-center gap-1.5 text-indigo-650 hover:text-indigo-800 text-xs transition-colors mt-1 hover:underline font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 新增方程
        </button>
      </div>
    </div>
  );
}
