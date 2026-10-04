import { Trash2 } from 'lucide-react';
import type { SimulationVariable, VarType } from '../../../types/simulation';
import { useSimulationStore } from '../../../store/simulationStore';

const VAR_TYPES: { value: VarType; label: string; title: string }[] = [
  { value: 'double',  label: '實數（小數）',   title: '可有小數點的數，如 1.5、-3.14，物理量最常用' },
  { value: 'int',     label: '整數',           title: '只能是整數，如 1、-5、100，適合計數用' },
  { value: 'boolean', label: '布林值（真/假）', title: '只有 true（真）或 false（假），適合開關狀態' },
  { value: 'String',  label: '文字',           title: '用雙引號包起來的字串，如 "紅色"，較少用於物理模擬' },
];

export default function VariableBlock({ variable }: { variable: SimulationVariable }) {
  const { updateVariable, removeVariable } = useSimulationStore();

  return (
    <div className="bg-card border border-line border-l-4 border-l-amber rounded-card p-3 shadow-xs hover:border-line/80 transition-all select-none mb-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-amber text-sm flex-shrink-0" title="模型變數">📦</span>
        {/* 名稱 */}
        <input
          className="bg-paper text-ink placeholder:text-ink-muted/50 font-mono text-xs px-2.5 py-1.5 rounded-control w-20 flex-shrink-0 border border-line outline-none focus:bg-card focus:border-amber focus:ring-1 focus:ring-amber/20 transition-all min-h-[32px]"
          value={variable.name}
          placeholder="名稱"
          title="變數名稱，建議用英文，如 x、vx、mass"
          onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
        />
        {/* 型別 */}
        <select
          className="bg-paper text-ink text-xs px-2 py-1.5 rounded-control border border-line w-[124px] flex-shrink-0 outline-none focus:bg-card focus:border-amber transition-all min-h-[32px] cursor-pointer"
          value={variable.type}
          title={VAR_TYPES.find((t) => t.value === variable.type)?.title ?? '變數型別'}
          onChange={(e) => updateVariable(variable.id, { type: e.target.value as VarType })}
        >
          {VAR_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-card text-ink" title={t.title}>{t.label}</option>)}
        </select>
        <span className="text-ink-muted text-xs flex-shrink-0 font-mono">=</span>
        {/* 初始值 */}
        <input
          className="bg-paper text-ink placeholder:text-ink-muted/50 font-mono text-xs px-2.5 py-1.5 rounded-control w-28 flex-shrink-0 border border-line outline-none focus:bg-card focus:border-amber focus:ring-1 focus:ring-amber/20 transition-all min-h-[32px]"
          value={variable.value}
          placeholder="初始值"
          title="模擬開始時此變數的初始值，例如 0、1.5、true"
          onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
        />
        {/* 說明 */}
        <input
          className="bg-paper text-ink placeholder:text-ink-muted/50 text-xs px-2.5 py-1.5 rounded-control flex-1 min-w-[120px] border border-line outline-none focus:bg-card focus:border-amber transition-all min-h-[32px]"
          value={variable.comment}
          placeholder="說明（選填）"
          title="自己寫下這個變數代表什麼，例如「質點的 X 位置（公尺）」"
          onChange={(e) => updateVariable(variable.id, { comment: e.target.value })}
        />
        <button
          onClick={() => removeVariable(variable.id)}
          className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1.5 rounded-control transition-all flex-shrink-0 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
          title="刪除此變數"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
