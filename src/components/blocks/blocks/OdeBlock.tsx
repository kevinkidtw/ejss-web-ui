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
    <div className="space-y-0.5">
      {/* d[state]/dt = label row */}
      <div className="flex items-center gap-1">
        <span className="text-blue-100 text-xs font-mono flex-shrink-0">d[</span>
        <input
          className="bg-blue-400 text-white font-mono text-sm px-1.5 py-0.5 rounded w-14 border border-blue-300 flex-shrink-0"
          value={state}
          placeholder="x"
          onChange={(e) => onStateChange(e.target.value)}
        />
        <span className="text-blue-100 text-xs font-mono flex-shrink-0">]/dt =</span>
      </div>
      {/* expression row — textarea auto-expands on long input */}
      <div className="flex items-start gap-1">
        <textarea
          className="bg-blue-400 text-white font-mono text-xs px-1.5 py-0.5 rounded flex-1 min-w-0 border border-blue-300 resize-none overflow-hidden leading-relaxed"
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
          className="text-blue-200 hover:text-white text-xs font-bold px-1 transition-colors flex-shrink-0 mt-0.5"
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
        <button onClick={onRemove} className="text-blue-200 hover:text-red-300 transition-colors flex-shrink-0 mt-0.5">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function OdeBlock({ page }: { page: OdePage }) {
  const { updateOdePage, addOdeRate, updateOdeRate, removeOdeRate, removeOdePage } = useSimulationStore();

  return (
    <div className="bg-blue-500 rounded-lg p-2 shadow-md border-b-4 border-blue-700 mb-2 space-y-1.5">
      {/* Header row 1: label + name + trash */}
      <div className="flex items-center gap-1.5">
        <span className="text-white font-bold text-sm flex-shrink-0">🔵 微分方程組</span>
        <input
          className="bg-blue-300 text-blue-900 text-sm px-2 py-0.5 rounded flex-1 min-w-0 border border-blue-400"
          value={page.name}
          title="此微分方程組的名稱，可自行命名"
          onChange={(e) => updateOdePage(page.id, { name: e.target.value })}
        />
        <button onClick={() => removeOdePage(page.id)} className="text-blue-200 hover:text-red-300 transition-colors flex-shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header row 2: dt + method */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-blue-100 text-xs flex-shrink-0"
          title="時間步長 dt：每次計算前進的時間量，建議 0.001～0.05；越小越精確但越慢"
        >
          時間步長 dt:
        </span>
        <input
          className="bg-blue-300 text-blue-900 font-mono text-sm px-2 py-0.5 rounded w-14 flex-shrink-0 border border-blue-400"
          value={page.increment}
          title="時間步長 dt：每次計算前進的時間量，建議 0.001～0.05；越小越精確但越慢"
          onChange={(e) => updateOdePage(page.id, { increment: e.target.value })}
        />
        <select
          className="bg-blue-300 text-blue-900 text-xs px-1 py-0.5 rounded border border-blue-400 flex-1 min-w-0"
          value={page.method}
          title={METHODS.find((m) => m.value === page.method)?.title ?? '選擇數值積分方法'}
          onChange={(e) => updateOdePage(page.id, { method: e.target.value as OdePage['method'] })}
        >
          {METHODS.map((m) => <option key={m.value} value={m.value} title={m.title}>{m.label}</option>)}
        </select>
      </div>

      {/* Rate rows */}
      <div className="bg-blue-600 rounded p-2 space-y-2">
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
          className="flex items-center gap-1 text-blue-200 hover:text-white text-xs transition-colors mt-1"
        >
          <Plus className="w-3.5 h-3.5" /> 新增方程
        </button>
      </div>
    </div>
  );
}
