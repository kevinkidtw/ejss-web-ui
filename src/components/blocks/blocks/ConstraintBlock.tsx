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
        borderLeft: 'border-l-danger',
        textAccent: 'text-danger',
        focusAccent: 'focus:border-danger focus:ring-danger/20',
        label: '🔴 計算/約束'
      }
    : {
        borderLeft: 'border-l-teal',
        textAccent: 'text-teal',
        focusAccent: 'focus:border-teal focus:ring-teal/20',
        label: '🟢 初始化'
      };

  const fx = useFxInsert(page.code, (v) => update(page.id, { code: v }));

  return (
    <div className={`bg-card border border-line border-l-4 ${color.borderLeft} rounded-card p-3.5 shadow-xs hover:border-line/80 transition-all select-none mb-3 space-y-3`}>
      <div className="flex items-center gap-2">
        <span className={`${color.textAccent} font-bold text-sm flex-shrink-0`}>{color.label}</span>
        <input
          className={`bg-paper text-ink placeholder:text-ink-muted/50 text-xs px-2.5 py-1.5 rounded-control flex-1 border border-line outline-none focus:bg-card ${color.focusAccent} focus:ring-1 transition-all min-h-[32px]`}
          value={page.name}
          onChange={(e) => update(page.id, { name: e.target.value })}
        />
        <button
          onClick={fx.openPicker}
          title="插入數學函數"
          className="text-ink-muted hover:text-ink hover:bg-paper text-xs font-bold px-2.5 py-1.5 rounded-control border border-line transition-colors flex-shrink-0 cursor-pointer min-h-[32px] flex items-center"
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
          className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1.5 rounded-control transition-all flex-shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
          title="刪除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <textarea
        className={`bg-paper text-ink placeholder:text-ink-muted/50 font-mono text-xs px-3 py-2 rounded-control w-full border border-line outline-none focus:bg-card ${color.focusAccent} focus:ring-1 resize-none overflow-hidden leading-relaxed transition-all`}
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
