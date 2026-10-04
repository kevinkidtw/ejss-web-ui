import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import ELEMENT_SCHEMAS from '../../constants/elementSchemas';
import type { PropSchema } from '../../constants/elementSchemas';
import type { ViewElement } from '../../types/simulation';
import HelpTooltip from '../ui/HelpTooltip';
import MathFunctionPicker from '../ui/MathFunctionPicker';
import { useFxInsert } from '../../hooks/useFxInsert';
import ElementIcon from '../common/ElementIcon';

type EditorTab = 'init' | 'behavior' | 'visual';

const TAB_LABELS: Record<EditorTab, string> = {
  init: '🏁 初始設定',
  behavior: '⚙️ 行為規則',
  visual: '🎨 外觀屬性',
};

function Label({ schema }: { schema: PropSchema }) {
  return (
    <div className="flex items-center gap-1 mb-0.5">
      <span className="text-xs text-ink-muted">{schema.label}</span>
      {schema.description && <HelpTooltip text={schema.description} />}
    </div>
  );
}

function PropRow({ schema, value, onChange }: { schema: PropSchema; value: string; onChange: (v: string) => void }) {
  const fx = useFxInsert(value, onChange);

  if (schema.type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-1">
          <span className="text-xs text-ink">{schema.label}</span>
          {schema.description && <HelpTooltip text={schema.description} />}
        </div>
        <button
          onClick={() => onChange(value === 'true' ? 'false' : 'true')}
          className={`w-11 h-6 rounded-full transition-colors text-[10px] font-bold cursor-pointer
            ${value === 'true' ? 'bg-teal text-white shadow-xs' : 'bg-paper text-ink-muted border border-line'}`}
        >
          {value === 'true' ? 'ON' : 'OFF'}
        </button>
      </div>
    );
  }
  if (schema.type === 'select' && schema.options) {
    return (
      <div className="py-1.5">
        <Label schema={schema} />
        <select
          className="bg-paper text-ink text-xs px-2.5 py-1.5 rounded-control border border-line w-full outline-none focus:bg-card focus:border-primary transition-all min-h-[32px] cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {schema.options.map((o) => <option key={o} value={o} className="bg-card text-ink">{o}</option>)}
        </select>
      </div>
    );
  }
  if (schema.type === 'code') {
    return (
      <div className="py-1.5">
        <div className="flex items-center justify-between mb-0.5">
          <Label schema={schema} />
          <button
            onClick={fx.openPicker}
            title="插入數學函數"
            className="text-[10px] text-ink-muted hover:text-primary font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          >𝑓𝑥</button>
          {fx.pickerAnchor && (
            <MathFunctionPicker anchor={fx.pickerAnchor} onSelect={fx.insert} onClose={fx.closePicker} />
          )}
        </div>
        <textarea
          className="bg-paper text-ink font-mono text-xs px-2.5 py-1.5 border border-line rounded-control w-full resize-none overflow-hidden outline-none focus:bg-card focus:border-primary transition-all leading-relaxed"
          rows={3}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...fx.trackProps}
        />
      </div>
    );
  }
  if (schema.type === 'color') {
    const raw = value.replace(/^"|"$/g, '');
    return (
      <div className="py-1.5">
        <Label schema={schema} />
        <div className="flex items-center gap-2">
          <input
            className="bg-paper text-ink text-xs px-2.5 py-1.5 border border-line rounded-control flex-1 font-mono outline-none focus:bg-card focus:border-primary transition-all min-h-[32px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            type="color"
            value={raw.startsWith('#') ? raw : '#ffffff'}
            onChange={(e) => onChange(`"${e.target.value}"`)}
            className="w-7 h-7 rounded-control cursor-pointer border border-line p-0 flex-shrink-0"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <Label schema={schema} />
        <button
          onClick={fx.openPicker}
          title="插入數學函數"
          className="text-[10px] text-ink-muted hover:text-primary font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
        >𝑓𝑥</button>
        {fx.pickerAnchor && (
          <MathFunctionPicker anchor={fx.pickerAnchor} onSelect={fx.insert} onClose={fx.closePicker} />
        )}
      </div>
      <input
        className="bg-paper text-ink text-xs px-2.5 py-1.5 border border-line rounded-control w-full font-mono outline-none focus:bg-card focus:border-primary transition-all min-h-[32px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...fx.trackProps}
      />
    </div>
  );
}

function ExtraProps({ el }: { el: ViewElement }) {
  const { updateViewElement } = useSimulationStore();
  const meta = ELEMENT_SCHEMAS[el.type];
  const knownKeys = new Set(meta?.schema.map((s) => s.name) ?? []);
  const extraEntries = Object.entries(el.properties).filter(([k]) => !knownKeys.has(k));

  if (extraEntries.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-line">
      <div className="text-[10px] text-ink-muted uppercase mb-1 font-semibold">其他屬性</div>
      {extraEntries.map(([k, v]) => (
        <div key={k} className="py-1.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-ink-muted font-mono">{k}</span>
            <button
              onClick={() => {
                const props = { ...el.properties };
                delete props[k];
                updateViewElement(el.id, { properties: props });
              }}
              className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1 rounded-control transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <input
            className="bg-paper text-ink text-xs px-2.5 py-1.5 border border-line rounded-control w-full font-mono outline-none focus:bg-card focus:border-primary transition-all min-h-[32px]"
            value={v}
            onChange={(e) => updateViewElement(el.id, { properties: { ...el.properties, [k]: e.target.value } })}
          />
        </div>
      ))}
    </div>
  );
}

interface Props {
  elementId: string;
}

export default function SpriteEditor({ elementId }: Props) {
  const { viewElements, setSelectedElement, updateViewElement, removeViewElement } = useSimulationStore();
  const [activeTab, setActiveTab] = useState<EditorTab>('init');

  const el = viewElements.find((e) => e.id === elementId) ?? null;

  if (!el) return null;

  const meta = ELEMENT_SCHEMAS[el.type];
  const schemaForTab = (meta?.schema ?? []).filter((s) => s.tab === activeTab);

  const updateProp = (key: string, value: string) => {
    updateViewElement(el.id, { properties: { ...el.properties, [key]: value } });
  };

  const handleDelete = () => {
    removeViewElement(elementId);
    setSelectedElement(null);
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-paper border-b border-line flex-shrink-0">
        <div className="w-8 h-8 bg-card border border-line rounded-control flex items-center justify-center flex-shrink-0 shadow-xs">
          <ElementIcon type={el.type} className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            className="bg-transparent text-ink text-sm font-bold w-full truncate focus:outline-none focus:bg-card rounded-control px-1 py-0.5"
            value={el.name}
            onChange={(e) => updateViewElement(el.id, { name: e.target.value })}
          />
          <div className="text-[10px] text-primary font-mono leading-none mt-0.5">{el.type}</div>
        </div>
        <button onClick={handleDelete} className="text-ink-muted hover:text-danger p-1.5 hover:bg-danger-soft rounded-control transition-colors cursor-pointer" title="刪除元件">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-paper border-b border-line flex-shrink-0">
        {(Object.keys(TAB_LABELS) as EditorTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs py-2 min-h-[36px] transition-all cursor-pointer border-b-2
              ${activeTab === tab ? 'bg-card text-primary font-bold border-primary' : 'text-ink-muted hover:text-ink hover:bg-paper/80 border-transparent font-medium'}`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 bg-card">
        {schemaForTab.length === 0 && activeTab !== 'visual' && (
          <p className="text-xs text-ink-muted text-center py-6">此元件在此頁沒有設定項</p>
        )}
        {schemaForTab.map((s) => (
          <PropRow
            key={s.name}
            schema={s}
            value={el.properties[s.name] ?? s.defaultValue}
            onChange={(v) => updateProp(s.name, v)}
          />
        ))}
        {activeTab === 'visual' && <ExtraProps el={el} />}
      </div>
    </div>
  );
}
