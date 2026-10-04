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
  'Elements.DrawingPanel': 'bg-card border-line',
  'Elements.PlottingPanel': 'bg-primary-soft/40 border-primary/30',
  'Elements.Slider': 'bg-paper border-line',
  'Elements.Button': 'bg-primary-soft border-primary/30',
  'Elements.TwoStateButton': 'bg-teal-soft border-teal/30',
  'Elements.CheckBox': 'bg-paper border-line',
  'Elements.Label': 'bg-amber-soft border-amber/30',
  'Elements.ParsedField': 'bg-card border-line',
};

function ElementPreview({ el }: { el: ViewElement }) {
  const icon = ELEMENT_ICONS[el.type] ?? '□';
  const bg = ELEMENT_BG[el.type] ?? 'bg-primary-soft border-primary/30';
  const label = el.properties.Text?.replace(/^"|"$/g, '') ?? el.properties.Title?.replace(/^"|"$/g, '') ?? el.name;
  const isDrawing = el.type === 'Elements.DrawingPanel' || el.type === 'Elements.PlottingPanel';

  return (
    <div className={`w-full h-full rounded-control border-2 ${bg} flex flex-col items-center justify-center overflow-hidden shadow-xs`}>
      {isDrawing ? (
        <div className="w-full h-full bg-card flex items-center justify-center text-ink-muted/50 text-2xl">{icon}</div>
      ) : (
        <>
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-ink truncate px-1 max-w-full font-medium">{label}</span>
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
        className="flex-1 relative overflow-auto bg-paper"
        style={{ backgroundImage: 'linear-gradient(#E5E1D8 1px, transparent 1px), linear-gradient(90deg, #E5E1D8 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        onClick={() => setSelectedId(null)}
      >
        {viewElements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted/50 pointer-events-none">
            <div className="text-4xl mb-3">🎛</div>
            <p className="text-base font-semibold text-ink">從左側面板點擊 UI 元件加入佈局</p>
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
            style={{ outline: selectedId === el.id ? '2px solid #2F6FB0' : 'none', zIndex: selectedId === el.id ? 10 : 1 }}
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
