import { X } from 'lucide-react';
import { ELEMENT_TYPE_LIST } from '../../constants/elementSchemas';
import { useSimulationStore } from '../../store/simulationStore';
import ElementIcon from '../common/ElementIcon';

interface Props {
  onClose: () => void;
}

function generateElementName(type: string): string {
  return type.split('.').pop()!.toLowerCase() + '_' + Date.now().toString(36);
}

export default function AddElementModal({ onClose }: Props) {
  const { addViewElement, setSelectedElement } = useSimulationStore();

  const handleSelect = (meta: typeof ELEMENT_TYPE_LIST[number]) => {
    const name = generateElementName(meta.type);
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
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-card border border-line rounded-card shadow-2xl w-[580px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-paper border-b border-line flex-shrink-0">
          <div>
            <h3 className="text-ink font-bold text-base flex items-center gap-2">選擇元件類型</h3>
            <p className="text-ink-muted text-xs mt-0.5">點擊元件為您的模擬場景添加物理表徵與控制項</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1.5 hover:bg-paper rounded-control cursor-pointer" title="關閉">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto grid grid-cols-3 gap-3 bg-card">
          {ELEMENT_TYPE_LIST.map((meta) => (
            <button
              key={meta.type}
              onClick={() => handleSelect(meta)}
              className="flex flex-col items-center gap-2.5 bg-paper/60 border border-line hover:border-primary rounded-card p-4 transition-all hover:bg-card hover:shadow-xs group cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-soft/60 border border-primary/20 rounded-card flex items-center justify-center transition-all group-hover:scale-105 shadow-xs">
                <ElementIcon type={meta.type} className="w-6 h-6 text-primary group-hover:text-primary-hover" />
              </div>
              <span className="text-xs font-bold text-ink group-hover:text-primary transition-colors text-center leading-tight">{meta.label}</span>
              <span className="text-[9px] text-ink-muted group-hover:text-primary/80 font-mono truncate w-full text-center">{meta.type.split('.')[1]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
