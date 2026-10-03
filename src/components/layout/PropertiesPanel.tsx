import { Trash2, Plus } from 'lucide-react';
import type { ViewElement } from '../../types/simulation';
import { useSimulationStore } from '../../store/simulationStore';

interface Props {
  element: ViewElement | null;
  onClose: () => void;
}

export default function PropertiesPanel({ element, onClose }: Props) {
  const { updateViewElement, removeViewElement, variables } = useSimulationStore();

  if (!element) {
    return (
      <div className="w-56 bg-slate-100 text-slate-400 p-3 flex-shrink-0 flex items-center justify-center text-xs text-center border-l border-slate-200">
        點選畫布上的元件<br />來查看屬性
      </div>
    );
  }

  const varNames = variables.map((v) => v.name);

  const updateProp = (key: string, value: string) => {
    updateViewElement(element.id, { properties: { ...element.properties, [key]: value } });
  };

  const addProp = () => {
    const key = prompt('屬性名稱？');
    if (key) updateProp(key, '');
  };

  const removeProp = (key: string) => {
    const props = { ...element.properties };
    delete props[key];
    updateViewElement(element.id, { properties: props });
  };

  const handleDelete = () => {
    removeViewElement(element.id);
    onClose();
  };

  return (
    <div className="w-56 bg-slate-100 text-slate-800 flex flex-col flex-shrink-0 overflow-y-auto border-l border-slate-200">
      <div className="p-2 bg-slate-200/50 flex items-center justify-between border-b border-slate-200 flex-shrink-0">
        <span className="text-xs font-bold text-slate-700 truncate">{element.name}</span>
        <button onClick={handleDelete} className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 border-b border-slate-200">
        <div className="text-xs text-slate-500 mb-1">元件類型</div>
        <div className="text-xs font-mono text-indigo-650">{element.type}</div>
      </div>

      <div className="p-2 border-b border-slate-200">
        <div className="text-xs text-slate-500 mb-1">名稱</div>
        <input
          className="bg-white text-slate-800 text-xs px-2 py-1 rounded w-full border border-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
          value={element.name}
          onChange={(e) => updateViewElement(element.id, { name: e.target.value })}
        />
      </div>

      <div className="p-2 border-b border-slate-200">
        <div className="text-xs text-slate-500 mb-1">父元件</div>
        <input
          className="bg-white text-slate-800 text-xs px-2 py-1 rounded w-full border border-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
          value={element.parent}
          placeholder="（無）"
          onChange={(e) => updateViewElement(element.id, { parent: e.target.value })}
        />
      </div>

      {/* Properties */}
      <div className="p-2 flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500 font-semibold">屬性</span>
          <button onClick={addProp} className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-1.5">
          {Object.entries(element.properties).map(([key, value]) => (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-slate-600 font-medium">{key}</span>
                <button
                  onClick={() => removeProp(key)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Show variable dropdown for common binding props */}
              {['Value', 'X', 'Y', 'SizeX', 'SizeY', 'Checked', 'Minimum', 'Maximum'].includes(key) && varNames.length > 0 ? (
                <div className="flex gap-1">
                  <input
                    className="bg-white text-slate-800 text-xs px-1.5 py-0.5 rounded flex-1 font-mono border border-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                    value={value}
                    onChange={(e) => updateProp(key, e.target.value)}
                  />
                  <select
                    className="bg-slate-50 text-slate-600 text-xs rounded border border-slate-300 px-1 outline-none focus:border-indigo-500 cursor-pointer"
                    value=""
                    onChange={(e) => { if (e.target.value) updateProp(key, e.target.value); }}
                  >
                    <option value="">變數▼</option>
                    {varNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ) : (
                <input
                  className="bg-white text-slate-800 text-xs px-1.5 py-0.5 rounded w-full font-mono border border-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                  value={value}
                  onChange={(e) => updateProp(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
