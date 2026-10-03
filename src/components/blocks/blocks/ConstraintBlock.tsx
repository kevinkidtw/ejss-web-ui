import { Trash2 } from 'lucide-react';
import type { CodePage } from '../../../types/simulation';
import { useSimulationStore } from '../../../store/simulationStore';
import { useFxInsert } from '../../../hooks/useFxInsert';
import MathFunctionPicker from '../../ui/MathFunctionPicker';

interface Props {
  page: CodePage;
  kind: 'constraint' | 'init';
}

export default function ConstraintBlock({ page, kind }: Props) {
  const { updateConstraintPage, removeConstraintPage, updateInitPage, removeInitPage } = useSimulationStore();

  const update = kind === 'constraint' ? updateConstraintPage : updateInitPage;
  const remove = kind === 'constraint' ? removeConstraintPage : removeInitPage;

  const color = kind === 'constraint'
    ? {
        borderLeft: 'border-l-rose-500',
        textAccent: 'text-rose-600',
        focusAccent: 'focus:border-rose-500/80 focus:ring-rose-500/15',
        label: '🔴 計算/約束'
      }
    : {
        borderLeft: 'border-l-emerald-500',
        textAccent: 'text-emerald-600',
        focusAccent: 'focus:border-emerald-500/80 focus:ring-emerald-500/15',
        label: '🟢 初始化'
      };

  const fx = useFxInsert(page.code, (v) => update(page.id, { code: v }));

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${color.borderLeft} rounded-lg p-3.5 shadow-sm hover:border-slate-300/85 transition-all select-none mb-3 space-y-3`}>
      <div className="flex items-center gap-2">
        <span className={`${color.textAccent} font-bold text-sm flex-shrink-0`}>{color.label}</span>
        <input
          className={`bg-slate-50 text-slate-800 placeholder-slate-400 text-xs px-2.5 py-1 rounded flex-1 border border-slate-200 outline-none focus:bg-white ${color.focusAccent} focus:ring-1 transition-all`}
          value={page.name}
          onChange={(e) => update(page.id, { name: e.target.value })}
        />
        <button
          onClick={fx.openPicker}
          title="插入數學函數"
          className="text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold px-2 py-1 rounded border border-slate-200 hover:border-slate-300 transition-colors flex-shrink-0"
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
          onClick={() => remove(page.id)}
          className="text-slate-400 hover:text-rose-600 hover:bg-slate-100 p-1.5 rounded transition-all flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <textarea
        className={`bg-slate-50 text-slate-800 placeholder-slate-400 font-mono text-xs px-3 py-2 rounded w-full border border-slate-200 outline-none focus:bg-white ${color.focusAccent} focus:ring-1 resize-none overflow-hidden leading-relaxed transition-all`}
        style={{ fieldSizing: 'content' } as React.CSSProperties}
        rows={4}
        value={page.code}
        placeholder={kind === 'constraint' ? '// 例: E = 0.5 * m * vx * vx + 0.5 * k * x * x;' : '// 例: x = 2.0; vx = 0.0;'}
        onChange={(e) => update(page.id, { code: e.target.value })}
        {...fx.trackProps}
      />
    </div>
  );
}
