import { X } from 'lucide-react';
import { ELEMENT_TYPE_LIST } from '../../constants/elementSchemas';
import { useSimulationStore } from '../../store/simulationStore';

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
    // get the newly added element's id (appended last in store)
    const newEl = useSimulationStore.getState().viewElements.at(-1);
    if (newEl) setSelectedElement(newEl.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
          <span className="text-white font-bold text-sm">選擇元件類型</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-3 gap-3">
          {ELEMENT_TYPE_LIST.map((meta) => (
            <button
              key={meta.type}
              onClick={() => handleSelect(meta)}
              className="flex flex-col items-center gap-2 bg-gray-700 hover:bg-purple-700 rounded-lg p-3 transition-colors group"
            >
              <span className="text-3xl">{meta.icon}</span>
              <span className="text-xs text-gray-300 group-hover:text-white text-center leading-tight">{meta.label}</span>
              <span className="text-[10px] text-gray-500 group-hover:text-purple-200 font-mono truncate w-full text-center">{meta.type.split('.')[1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
