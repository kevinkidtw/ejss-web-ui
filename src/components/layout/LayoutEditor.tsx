import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { useSimulationStore } from '../../store/simulationStore';
import type { ViewElement } from '../../types/simulation';
import PropertiesPanel from './PropertiesPanel';

const ELEMENT_ICONS: Record<string, string> = {
  'Elements.DrawingPanel': '🖼',
  'Elements.PlottingPanel': '📊',
  'Elements.Slider': '⬜',
  'Elements.Button': '▣',
  'Elements.TwoStateButton': '▶⏸',
  'Elements.CheckBox': '✓',
  'Elements.Label': '🏷',
  'Elements.ParsedField': '🔢',
  'Elements.Shape2D': '⚪',
  'Elements.Spring2D': '〰',
  'Elements.Arrow2D': '➡',
  'Elements.Trail2D': '〜',
};

const ELEMENT_BG: Record<string, string> = {
  'Elements.DrawingPanel': 'bg-slate-200 border-slate-400',
  'Elements.PlottingPanel': 'bg-indigo-100 border-indigo-400',
  'Elements.Slider': 'bg-gray-100 border-gray-400',
  'Elements.Button': 'bg-blue-100 border-blue-400',
  'Elements.CheckBox': 'bg-gray-100 border-gray-400',
  'Elements.Label': 'bg-yellow-50 border-yellow-300',
  'Elements.ParsedField': 'bg-white border-gray-400',
};

function ElementPreview({ el }: { el: ViewElement }) {
  const icon = ELEMENT_ICONS[el.type] ?? '□';
  const bg = ELEMENT_BG[el.type] ?? 'bg-purple-100 border-purple-400';
  const label = el.properties.Text?.replace(/^"|"$/g, '') ?? el.properties.Title?.replace(/^"|"$/g, '') ?? el.name;
  const isDrawing = el.type === 'Elements.DrawingPanel' || el.type === 'Elements.PlottingPanel';

  return (
    <div className={`w-full h-full rounded border-2 ${bg} flex flex-col items-center justify-center overflow-hidden`}>
      {isDrawing ? (
        <div className="w-full h-full bg-white flex items-center justify-center text-gray-400 text-2xl">{icon}</div>
      ) : (
        <>
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-gray-600 truncate px-1 max-w-full">{label}</span>
        </>
      )}
    </div>
  );
}

export default function LayoutEditor() {
  const { viewElements, updateViewElement } = useSimulationStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = viewElements.find((e) => e.id === selectedId) ?? null;

  const topLevel = viewElements.filter((e) => !e.parent || !viewElements.find((p) => p.name === e.parent));

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Canvas area */}
      <div
        className="flex-1 relative overflow-auto bg-gray-200"
        style={{ backgroundImage: 'linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        onClick={() => setSelectedId(null)}
      >
        {viewElements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-4xl mb-3">🎛</div>
            <p className="text-base font-medium">從左側面板點擊 UI 元件加入佈局</p>
          </div>
        )}

        {topLevel.map((el) => (
          <Rnd
            key={el.id}
            size={{ width: el.width ?? 200, height: el.height ?? 60 }}
            position={{ x: el.x ?? 20, y: el.y ?? 20 }}
            onDragStop={(_e, d) => updateViewElement(el.id, { x: d.x, y: d.y })}
            onResizeStop={(_e, _dir, ref, _delta, pos) =>
              updateViewElement(el.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), x: pos.x, y: pos.y })
            }
            minWidth={60}
            minHeight={30}
            bounds="parent"
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedId(el.id); }}
            style={{ outline: selectedId === el.id ? '2px solid #6366f1' : 'none', zIndex: selectedId === el.id ? 10 : 1 }}
          >
            <ElementPreview el={el} />
          </Rnd>
        ))}
      </div>

      {/* Properties panel */}
      <PropertiesPanel element={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
