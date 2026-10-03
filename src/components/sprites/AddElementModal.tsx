import { X } from 'lucide-react';
import { ELEMENT_TYPE_LIST } from '../../constants/elementSchemas';
import { useSimulationStore } from '../../store/simulationStore';
import ElementIcon from '../common/ElementIcon';

interface Props {
  onClose: () => void;
}

export default function AddElementModal({ onClose }: Props) {
  const { addViewElement, setSelectedElement } = useSimulationStore();

  const handleSelect = (meta: typeof ELEMENT_TYPE_LIST[number]) => {
    const name = meta.type.split('.').pop()!.toLowerCase() + '_' + Date.now().toString(36);
    const props: Record<string, string> = {};
    meta.schema.forEach((s) => { props[s.name] = s.defaultValue; });
    addViewElement({
      type: meta.type,
      name,
      parent: '',
      properties: props,
      x: 20,
      y: 20,
      width: meta.defaultWidth,
      height: meta.defaultHeight,
    });
    const newEl = useSimulationStore.getState().viewElements.at(-1);
    if (newEl) setSelectedElement(newEl.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-2xl w-[580px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div>
            <h3 className="text-slate-800 font-bold text-base flex items-center gap-2">選擇元件類型</h3>
            <p className="text-slate-500 text-xs mt-0.5">點擊元件為您的模擬場景添加物理表徵與控制項</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto grid grid-cols-3 gap-3 bg-white">
          {ELEMENT_TYPE_LIST.map((meta) => (
            <button
              key={meta.type}
              onClick={() => handleSelect(meta)}
              className="flex flex-col items-center gap-2.5 bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-xl p-4 transition-all hover:bg-white hover:shadow-sm group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-200/60 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm">
                <ElementIcon type={meta.type} className="w-6 h-6 text-indigo-650 group-hover:text-indigo-700" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors text-center leading-tight">{meta.label}</span>
              <span className="text-[9px] text-slate-400 group-hover:text-indigo-500/80 font-mono truncate w-full text-center">{meta.type.split('.')[1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
