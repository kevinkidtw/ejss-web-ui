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
    ? { bg: 'bg-red-500', border: 'border-red-700', inner: 'bg-red-600', light: 'bg-red-400', text: 'text-red-100', label: '🔴 計算/約束' }
    : { bg: 'bg-green-500', border: 'border-green-700', inner: 'bg-green-600', light: 'bg-green-400', text: 'text-green-100', label: '🟢 初始化' };

  const fx = useFxInsert(page.code, (v) => update(page.id, { code: v }));

  return (
    <div className={`${color.bg} rounded-lg p-2 shadow-md border-b-4 ${color.border} mb-2`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white font-bold text-sm">{color.label}</span>
        <input
          className={`${color.light} text-white text-sm px-2 py-0.5 rounded flex-1 border border-opacity-50 border-white`}
          value={page.name}
          onChange={(e) => update(page.id, { name: e.target.value })}
        />
        <button
          onClick={fx.openPicker}
          title="插入數學函數"
          className="text-white/70 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded border border-white/30 hover:border-white/60 transition-colors flex-shrink-0"
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
        <button onClick={() => remove(page.id)} className={`${color.text} hover:text-white transition-colors`}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <textarea
        className={`${color.inner} text-white font-mono text-xs px-2 py-1 rounded w-full border border-opacity-30 border-white resize-none overflow-hidden`}
        rows={4}
        style={{ fieldSizing: 'content' } as React.CSSProperties}
        value={page.code}
        placeholder={kind === 'constraint' ? '// 例: T = 0.5*m*vx*vx;' : '// 例: x = 1.5; vx = 0.0;'}
        onChange={(e) => update(page.id, { code: e.target.value })}
        {...fx.trackProps}
      />
    </div>
  );
}
