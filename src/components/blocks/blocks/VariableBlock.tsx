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
    <div className="bg-yellow-400 rounded-lg p-2 shadow-md border-b-4 border-yellow-600 select-none mb-2 space-y-1.5">
      {/* Row 1: label + trash */}
      <div className="flex items-center justify-between">
        <span className="text-yellow-900 font-bold text-sm">📦 模型變數</span>
        <button
          onClick={() => removeVariable(variable.id)}
          className="text-yellow-800 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Row 2: name + type */}
      <div className="flex gap-1.5">
        <input
          className="bg-yellow-200 text-yellow-900 font-mono text-sm px-2 py-0.5 rounded w-[72px] flex-shrink-0 border border-yellow-500"
          value={variable.name}
          placeholder="名稱"
          title="變數名稱，建議用英文，如 x、vx、mass，在微分方程和元件屬性中都可使用"
          onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
        />
        <select
          className="bg-yellow-200 text-yellow-900 text-xs px-1 py-0.5 rounded border border-yellow-500 flex-1 min-w-0"
          value={variable.type}
          title={VAR_TYPES.find((t) => t.value === variable.type)?.title ?? '變數型別'}
          onChange={(e) => updateVariable(variable.id, { type: e.target.value as VarType })}
        >
          {VAR_TYPES.map((t) => <option key={t.value} value={t.value} title={t.title}>{t.label}</option>)}
        </select>
      </div>

      {/* Row 3: = + value + comment */}
      <div className="flex items-center gap-1.5">
        <span className="text-yellow-900 text-sm flex-shrink-0">=</span>
        <input
          className="bg-yellow-200 text-yellow-900 font-mono text-sm px-2 py-0.5 rounded w-[72px] flex-shrink-0 border border-yellow-500"
          value={variable.value}
          placeholder="初始值"
          title="模擬開始時此變數的初始值，例如 0、1.5、true"
          onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
        />
        <input
          className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded flex-1 min-w-0 border border-yellow-400"
          value={variable.comment}
          placeholder="說明（選填）"
          title="自己寫下這個變數代表什麼，例如「質點的 X 位置（公尺）」"
          onChange={(e) => updateVariable(variable.id, { comment: e.target.value })}
        />
      </div>
    </div>
  );
}
