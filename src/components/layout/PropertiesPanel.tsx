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
      <div className="w-56 bg-paper text-ink-muted p-3 flex-shrink-0 flex items-center justify-center text-xs text-center border-l border-line">
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
    <div className="w-56 bg-paper text-ink flex flex-col flex-shrink-0 overflow-y-auto border-l border-line">
      <div className="p-2.5 bg-paper flex items-center justify-between border-b border-line flex-shrink-0">
        <span className="text-xs font-bold text-ink truncate">{element.name}</span>
        <button onClick={handleDelete} className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1 rounded-control transition-colors cursor-pointer" title="刪除元件">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-2.5 border-b border-line">
        <div className="text-[10px] text-ink-muted uppercase font-semibold mb-1">元件類型</div>
        <div className="text-xs font-mono text-primary font-bold">{element.type}</div>
      </div>

      <div className="p-2.5 border-b border-line">
        <div className="text-[10px] text-ink-muted uppercase font-semibold mb-1">名稱</div>
        <input
          className="bg-card text-ink text-xs px-2 py-1.5 rounded-control w-full border border-line outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[30px]"
          value={element.name}
          onChange={(e) => updateViewElement(element.id, { name: e.target.value })}
        />
      </div>

      <div className="p-2.5 border-b border-line">
        <div className="text-[10px] text-ink-muted uppercase font-semibold mb-1">父元件</div>
        <input
          className="bg-card text-ink text-xs px-2 py-1.5 rounded-control w-full border border-line outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[30px]"
          value={element.parent}
          placeholder="（無）"
          onChange={(e) => updateViewElement(element.id, { parent: e.target.value })}
        />
      </div>

      {/* Properties */}
      <div className="p-2.5 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-ink-muted font-semibold">屬性</span>
          <button onClick={addProp} className="text-ink-muted hover:text-primary transition-colors cursor-pointer p-0.5 rounded-control" title="新增屬性">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2">
          {Object.entries(element.properties).map(([key, value]) => (
            <div key={key} className="group">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-ink font-medium">{key}</span>
                <button
                  onClick={() => removeProp(key)}
                  className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-danger hover:bg-danger-soft p-0.5 rounded-control transition-all cursor-pointer"
                  title="刪除此屬性"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Show variable dropdown for common binding props */}
              {['Value', 'X', 'Y', 'SizeX', 'SizeY', 'Checked', 'Minimum', 'Maximum'].includes(key) && varNames.length > 0 ? (
                <div className="flex gap-1">
                  <input
                    className="bg-card text-ink text-xs px-2 py-1 rounded-control flex-1 font-mono border border-line outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[28px]"
                    value={value}
                    onChange={(e) => updateProp(key, e.target.value)}
                  />
                  <select
                    className="bg-paper text-ink-muted text-xs rounded-control border border-line px-1.5 outline-none focus:border-primary cursor-pointer min-h-[28px]"
                    value=""
                    onChange={(e) => { if (e.target.value) updateProp(key, e.target.value); }}
                  >
                    <option value="" className="bg-card text-ink">變數▼</option>
                    {varNames.map((n) => <option key={n} value={n} className="bg-card text-ink">{n}</option>)}
                  </select>
                </div>
              ) : (
                <input
                  className="bg-card text-ink text-xs px-2 py-1 rounded-control w-full font-mono border border-line outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[28px]"
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
