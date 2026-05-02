import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import ELEMENT_SCHEMAS from '../../constants/elementSchemas';
import type { PropSchema } from '../../constants/elementSchemas';
import type { ViewElement } from '../../types/simulation';
import HelpTooltip from '../ui/HelpTooltip';
import MathFunctionPicker from '../ui/MathFunctionPicker';
import { useFxInsert } from '../../hooks/useFxInsert';

type EditorTab = 'init' | 'behavior' | 'visual';

const TAB_LABELS: Record<EditorTab, string> = {
  init: '🏁 初始設定',
  behavior: '⚙️ 行為規則',
  visual: '🎨 外觀屬性',
};

function Label({ schema }: { schema: PropSchema }) {
  return (
    <div className="flex items-center gap-1 mb-0.5">
      <span className="text-xs text-gray-400">{schema.label}</span>
      {schema.description && <HelpTooltip text={schema.description} />}
    </div>
  );
}

function PropRow({ schema, value, onChange }: { schema: PropSchema; value: string; onChange: (v: string) => void }) {
  const fx = useFxInsert(value, onChange);

  if (schema.type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-300">{schema.label}</span>
          {schema.description && <HelpTooltip text={schema.description} />}
        </div>
        <button
          onClick={() => onChange(value === 'true' ? 'false' : 'true')}
          className={`w-10 h-5 rounded-full transition-colors text-[10px] font-bold
            ${value === 'true' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'}`}
        >
          {value === 'true' ? 'ON' : 'OFF'}
        </button>
      </div>
    );
  }
  if (schema.type === 'select' && schema.options) {
    return (
      <div className="py-1">
        <Label schema={schema} />
        <select
          className="bg-gray-700 text-white text-xs px-2 py-1 rounded w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {schema.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (schema.type === 'code') {
    return (
      <div className="py-1">
        <div className="flex items-center justify-between mb-0.5">
          <Label schema={schema} />
          <button
            onClick={fx.openPicker}
            title="插入數學函數"
            className="text-[10px] text-gray-500 hover:text-purple-400 font-bold px-1 transition-colors"
          >𝑓𝑥</button>
          {fx.pickerAnchor && (
            <MathFunctionPicker anchor={fx.pickerAnchor} onSelect={fx.insert} onClose={fx.closePicker} />
          )}
        </div>
        <textarea
          className="bg-gray-700 text-green-300 font-mono text-xs px-2 py-1 rounded w-full resize-none overflow-hidden"
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
      <div className="py-1">
        <Label schema={schema} />
        <div className="flex items-center gap-2">
          <input
            className="bg-gray-700 text-white text-xs px-1 py-0.5 rounded flex-1 font-mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            type="color"
            value={raw.startsWith('#') ? raw : '#ffffff'}
            onChange={(e) => onChange(`"${e.target.value}"`)}
            className="w-6 h-6 rounded cursor-pointer border-0 p-0 flex-shrink-0"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-0.5">
        <Label schema={schema} />
        <button
          onClick={fx.openPicker}
          title="插入數學函數"
          className="text-[10px] text-gray-500 hover:text-purple-400 font-bold px-1 transition-colors"
        >𝑓𝑥</button>
        {fx.pickerAnchor && (
          <MathFunctionPicker anchor={fx.pickerAnchor} onSelect={fx.insert} onClose={fx.closePicker} />
        )}
      </div>
      <input
        className="bg-gray-700 text-white text-xs px-2 py-1 rounded w-full font-mono"
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
    <div className="mt-3 pt-3 border-t border-gray-700">
      <div className="text-[10px] text-gray-500 uppercase mb-1">其他屬性</div>
      {extraEntries.map(([k, v]) => (
        <div key={k} className="py-1">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-gray-400 font-mono">{k}</span>
            <button
              onClick={() => {
                const props = { ...el.properties };
                delete props[k];
                updateViewElement(el.id, { properties: props });
              }}
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <input
            className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded w-full font-mono"
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
    <div className="flex flex-col h-full bg-gray-800 overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700 flex-shrink-0">
        <span className="text-lg">{meta?.icon ?? '□'}</span>
        <div className="flex-1 min-w-0">
          <input
            className="bg-transparent text-white text-sm font-bold w-full truncate focus:outline-none focus:bg-gray-700 rounded px-1"
            value={el.name}
            onChange={(e) => updateViewElement(el.id, { name: e.target.value })}
          />
          <div className="text-[10px] text-purple-400 font-mono">{el.type}</div>
        </div>
        <button onClick={handleDelete} className="text-gray-500 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        {(Object.keys(TAB_LABELS) as EditorTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs py-1.5 transition-colors
              ${activeTab === tab ? 'bg-gray-700 text-white font-bold border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {schemaForTab.length === 0 && activeTab !== 'visual' && (
          <p className="text-xs text-gray-600 text-center py-4">此元件在此頁沒有設定項</p>
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
