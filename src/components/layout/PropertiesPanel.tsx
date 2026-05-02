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
      <div className="w-56 bg-gray-800 text-gray-400 p-3 flex-shrink-0 flex items-center justify-center text-xs text-center">
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
    <div className="w-56 bg-gray-800 text-white flex flex-col flex-shrink-0 overflow-y-auto">
      <div className="p-2 bg-gray-900 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 truncate">{element.name}</span>
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-1">元件類型</div>
        <div className="text-xs font-mono text-purple-300">{element.type}</div>
      </div>

      <div className="p-2 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-1">名稱</div>
        <input
          className="bg-gray-700 text-white text-xs px-2 py-1 rounded w-full"
          value={element.name}
          onChange={(e) => updateViewElement(element.id, { name: e.target.value })}
        />
      </div>

      <div className="p-2 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-1">父元件</div>
        <input
          className="bg-gray-700 text-white text-xs px-2 py-1 rounded w-full"
          value={element.parent}
          placeholder="（無）"
          onChange={(e) => updateViewElement(element.id, { parent: e.target.value })}
        />
      </div>

      {/* Properties */}
      <div className="p-2 flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">屬性</span>
          <button onClick={addProp} className="text-gray-400 hover:text-white transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          {Object.entries(element.properties).map(([key, value]) => (
            <div key={key} className="group">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{key}</span>
                <button
                  onClick={() => removeProp(key)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {/* Show variable dropdown for common binding props */}
              {['Value', 'X', 'Y', 'SizeX', 'SizeY', 'Checked', 'Minimum', 'Maximum'].includes(key) && varNames.length > 0 ? (
                <div className="flex gap-1">
                  <input
                    className="bg-gray-700 text-white text-xs px-1 py-0.5 rounded flex-1 font-mono"
                    value={value}
                    onChange={(e) => updateProp(key, e.target.value)}
                  />
                  <select
                    className="bg-gray-700 text-gray-300 text-xs rounded px-1"
                    value=""
                    onChange={(e) => { if (e.target.value) updateProp(key, e.target.value); }}
                  >
                    <option value="">變數▼</option>
                    {varNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              ) : (
                <input
                  className="bg-gray-700 text-white text-xs px-1 py-0.5 rounded w-full font-mono"
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
