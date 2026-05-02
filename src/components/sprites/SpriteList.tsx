import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import ELEMENT_SCHEMAS from '../../constants/elementSchemas';
import { BACKDROP_TEMPLATES } from '../../constants/backdropTemplates';
import AddElementModal from './AddElementModal';

interface ContextMenuState {
  x: number;
  y: number;
  elementId: string;
}

function ContextMenu({ menu, onClose }: { menu: ContextMenuState; onClose: () => void }) {
  const { viewElements, setSelectedElement, removeViewElement } = useSimulationStore();
  const el = viewElements.find((e) => e.id === menu.elementId);
  const meta = el ? ELEMENT_SCHEMAS[el.type] : null;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (!el) return null;

  const descriptions = meta?.schema.map((s) => s.description).filter(Boolean) ?? [];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[180px] text-sm"
      style={{ left: menu.x, top: menu.y }}
    >
      <div className="px-3 py-1.5 border-b border-gray-700">
        <span className="text-white font-bold text-xs">{meta?.icon} {el.name}</span>
        <div className="text-[10px] text-purple-400 font-mono">{el.type}</div>
      </div>
      {descriptions.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-700 max-w-[260px]">
          <div className="text-[10px] text-gray-500 uppercase mb-1">屬性說明</div>
          {meta!.schema.filter((s) => s.description).slice(0, 4).map((s) => (
            <div key={s.name} className="text-[11px] text-gray-300 leading-snug mb-1">
              <span className="text-yellow-400 font-mono">{s.label}：</span>{s.description}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => { setSelectedElement(el.id); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs"
      >
        ✏️ 開啟編輯頁面
      </button>
      <button
        onClick={() => { removeViewElement(el.id); setSelectedElement(null); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors text-xs"
      >
        🗑 刪除此元件
      </button>
    </div>
  );
}

function BackdropPanel() {
  const { activeBackdrop, setActiveBackdrop, addViewElement, info, variables, odePages, constraintPages, initPages } = useSimulationStore();

  const handleSelect = (templateId: string) => {
    if (activeBackdrop === templateId) return;
    const template = BACKDROP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    useSimulationStore.setState({
      info, variables, odePages, constraintPages, initPages,
      viewElements: [],
      activeBackdrop: templateId,
      selectedElementId: null,
    });
    template.elements.forEach((el) => addViewElement(el));
    setActiveBackdrop(templateId);
  };

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {BACKDROP_TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => handleSelect(t.id)}
          title={t.description}
          className={`flex flex-col items-center rounded-lg border-2 overflow-hidden transition-all w-[72px]
            ${activeBackdrop === t.id ? 'border-purple-400 ring-1 ring-purple-300' : 'border-gray-600 hover:border-gray-400'}`}
        >
          <div className="bg-gray-900 w-full h-12 flex items-center justify-center overflow-hidden">
            <img
              src={t.preview}
              alt={t.label}
              className="max-h-10 max-w-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <span className="text-[9px] text-gray-400 px-0.5 py-0.5 text-center leading-tight w-full bg-gray-800 truncate">
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function SpriteList() {
  const { viewElements, selectedElementId, setSelectedElement, removeViewElement } = useSimulationStore();
  const [showModal, setShowModal] = useState(false);
  const [showBackdrops, setShowBackdrops] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const topLevel = viewElements.filter((e) => !e.parent || !viewElements.find((p) => p.name === e.parent));

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, elementId });
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 flex flex-col flex-shrink-0 overflow-hidden" style={{ maxHeight: '55%' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-950 border-b border-gray-700 flex-shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">元件列表</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white rounded px-2 py-0.5 text-xs transition-colors"
        >
          <Plus className="w-3 h-3" /> 新增
        </button>
      </div>

      {/* Sprite cards — flex-wrap auto-wraps like word processor */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {topLevel.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-gray-600 text-xs">
            點擊「新增」加入元件
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-2">
            {topLevel.map((el) => {
              const meta = ELEMENT_SCHEMAS[el.type];
              const icon = meta?.icon ?? '□';
              const isSelected = el.id === selectedElementId;
              return (
                <div
                  key={el.id}
                  onClick={() => setSelectedElement(isSelected ? null : el.id)}
                  onContextMenu={(e) => handleContextMenu(e, el.id)}
                  className={`relative w-[72px] flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all p-1
                    ${isSelected ? 'border-purple-400 bg-purple-900/40' : 'border-gray-600 bg-gray-800 hover:border-gray-400'}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeViewElement(el.id);
                      if (isSelected) setSelectedElement(null);
                    }}
                    className="absolute top-0.5 right-0.5 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="text-xl mb-0.5">{icon}</span>
                  <span className="text-[10px] text-gray-300 truncate w-full text-center px-0.5 leading-tight">{el.name}</span>
                  <span className="text-[9px] text-gray-600 truncate w-full text-center">{el.type.split('.')[1]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backdrop toggle */}
      <button
        onClick={() => setShowBackdrops((v) => !v)}
        className="flex items-center justify-between px-3 py-1 bg-gray-800 hover:bg-gray-700 border-t border-gray-700 text-xs text-gray-400 transition-colors flex-shrink-0"
      >
        <span>🖼 背景模板</span>
        {showBackdrops ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showBackdrops && (
        <div className="border-t border-gray-700 overflow-y-auto flex-shrink-0 max-h-48">
          <BackdropPanel />
        </div>
      )}

      {showModal && <AddElementModal onClose={() => setShowModal(false)} />}
      {contextMenu && <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  );
}
