import { Plus, Trash2 } from 'lucide-react';
import type { OdePage } from '../../../types/simulation';
import { useSimulationStore } from '../../../store/simulationStore';
import { useFxInsert } from '../../../hooks/useFxInsert';
import MathFunctionPicker from '../../ui/MathFunctionPicker';

const METHODS: { value: OdePage['method']; label: string; title: string }[] = [
  { value: 'RungeKutta',  label: 'RK4 四階法（標準）',           title: '精確度高，適合大多數物理模擬，強烈建議使用' },
  { value: 'Verlet',      label: '速度 Verlet（力學守恆）',     title: '二階辛積分，適合彈簧、單擺、行星運動，長時間能量高度守恆' },
  { value: 'Yoshida4',    label: 'Yoshida 四階辛積分（天體力學）', title: '四階幾何辛積分，萬有引力/多體軌道長時間能量零漂移' },
  { value: 'RK45',        label: 'RK45 自適應（Dormand-Prince）', title: '五階(四階)自適應步長法，自動調整精度，兼顧速度與極限精確' },
  { value: 'Fehlberg78',  label: 'RKF78 高階自適應（Fehlberg）',   title: '七階(八階)高階自適應法，適合剛性方程或高精度模擬' },
  { value: 'EulerCromer', label: '半隱式歐拉法（辛 Euler）',     title: '一階辛積分法，簡諧運動能量有界不發散' },
  { value: 'Euler',       label: '歐拉法（簡易教學）',           title: '最基本的積分法，誤差較大，適合教學對照' },
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
      <span className="text-ink-muted text-xs font-mono flex-shrink-0 mt-1.5">d[</span>
      <input
        className="bg-card text-ink placeholder:text-ink-muted/50 font-mono text-xs px-2 py-1.5 rounded-control w-16 flex-shrink-0 border border-line outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[32px]"
        value={state}
        placeholder="x"
        onChange={(e) => onStateChange(e.target.value)}
      />
      <span className="text-ink-muted text-xs font-mono flex-shrink-0 mt-1.5">]/dt&nbsp;=</span>
      {/* textarea auto-expands when expression is long */}
      <textarea
        className="bg-card text-ink placeholder:text-ink-muted/50 font-mono text-xs px-2.5 py-1.5 rounded-control flex-1 min-w-0 border border-line outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none overflow-hidden leading-relaxed transition-all min-h-[32px]"
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
        className="text-primary hover:text-primary-hover hover:bg-primary-soft text-xs font-bold px-2 py-1.5 rounded-control transition-colors flex-shrink-0 mt-0.5 cursor-pointer min-h-[32px] flex items-center"
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
        className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1.5 rounded-control transition-colors flex-shrink-0 mt-0.5 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
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
    <div className="bg-card border border-line border-l-4 border-l-primary rounded-card p-3.5 shadow-xs hover:border-line/80 transition-all select-none mb-3 space-y-3">
      {/* Header row 1: label + name + trash */}
      <div className="flex items-center gap-2">
        <span className="text-primary font-bold text-sm flex-shrink-0 flex items-center gap-1.5">
          <span>🔵</span>
          <span>微分方程組</span>
        </span>
        <input
          className="bg-paper text-ink placeholder:text-ink-muted/50 text-xs px-2.5 py-1.5 rounded-control flex-1 min-w-0 border border-line outline-none focus:bg-card focus:border-primary transition-all min-h-[32px]"
          value={page.name}
          title="此微分方程組的名稱，可自行命名"
          onChange={(e) => updateOdePage(page.id, { name: e.target.value })}
        />
        <button
          onClick={() => removeOdePage(page.id)}
          className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1.5 rounded-control transition-all flex-shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
          title="刪除微分方程組"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header row 2: dt + method */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span
          className="text-ink-muted text-xs flex-shrink-0"
          title="時間步長 dt：每次計算前進的時間量，建議 0.001～0.05；越小越精確但越慢"
        >
          時間步長 dt:
        </span>
        <input
          className="bg-paper text-ink placeholder:text-ink-muted/50 font-mono text-xs px-2.5 py-1.5 rounded-control w-16 flex-shrink-0 border border-line outline-none focus:bg-card focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[32px]"
          value={page.increment}
          title="時間步長 dt：每次計算前進的時間量，建議 0.001～0.05；越小越精確但越慢"
          onChange={(e) => updateOdePage(page.id, { increment: e.target.value })}
        />
        <select
          className="bg-paper text-ink text-xs px-2 py-1.5 rounded-control border border-line flex-1 min-w-[160px] outline-none focus:bg-card focus:border-primary transition-all min-h-[32px] cursor-pointer"
          value={page.method}
          title={METHODS.find((m) => m.value === page.method)?.title ?? '選擇數值積分方法'}
          onChange={(e) => updateOdePage(page.id, { method: e.target.value as OdePage['method'] })}
        >
          {METHODS.map((m) => <option key={m.value} value={m.value} className="bg-card text-ink" title={m.title}>{m.label}</option>)}
        </select>
        {(page.method === 'RK45' || page.method === 'Fehlberg78') && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-ink-muted text-xs" title="容許誤差：控制自適應步長演算法的截斷誤差">
              容許誤差 tol:
            </span>
            <input
              className="bg-paper text-ink placeholder:text-ink-muted/50 font-mono text-xs px-2 py-1 rounded-control w-20 border border-line outline-none focus:bg-card focus:border-primary transition-all min-h-[28px]"
              value={page.tolerance ?? '1e-8'}
              placeholder="1e-8"
              title="容許誤差 (例: 1e-8)"
              onChange={(e) => updateOdePage(page.id, { tolerance: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Rate rows */}
      <div className="bg-paper/70 border border-line rounded-control p-3 space-y-2.5">
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
          className="flex items-center gap-1.5 text-primary hover:text-primary-hover text-xs transition-colors mt-1 hover:underline font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 新增方程
        </button>
      </div>
    </div>
  );
}
