import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import ELEMENT_SCHEMAS from '../../constants/elementSchemas';
import AddElementModal from './AddElementModal';
import ElementIcon from '../common/ElementIcon';

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
      className="fixed z-50 bg-card border border-line rounded-control shadow-xl py-1 min-w-[180px] text-sm"
      style={{ left: menu.x, top: menu.y }}
    >
      <div className="px-3 py-1.5 border-b border-line">
        <span className="text-ink font-bold text-xs flex items-center gap-1.5">
          <ElementIcon type={el.type} className="w-3.5 h-3.5 text-primary inline-block" />
          {el.name}
        </span>
        <div className="text-[10px] text-primary font-mono">{el.type}</div>
      </div>
      {descriptions.length > 0 && (
        <div className="px-3 py-2 border-b border-line max-w-[260px]">
          <div className="text-[10px] text-ink-muted uppercase mb-1">屬性說明</div>
          {meta!.schema.filter((s) => s.description).slice(0, 4).map((s) => (
            <div key={s.name} className="text-[11px] text-ink-muted leading-snug mb-1">
              <span className="text-primary font-mono">{s.label}：</span>{s.description}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => { setSelectedElement(el.id); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-ink hover:bg-primary-soft transition-colors text-xs cursor-pointer"
      >
        ✏️ 開啟編輯頁面
      </button>
      <button
        onClick={() => { removeViewElement(el.id); setSelectedElement(null); onClose(); }}
        className="w-full text-left px-3 py-1.5 text-danger hover:bg-danger-soft transition-colors text-xs cursor-pointer"
      >
        🗑 刪除此元件
      </button>
    </div>
  );
}

export default function SpriteList() {
  const { viewElements, selectedElementId, setSelectedElement, removeViewElement } = useSimulationStore();
  const [showModal, setShowModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const topLevel = viewElements.filter((e) => !e.parent || !viewElements.find((p) => p.name === e.parent));
  const childrenOf = (parentName: string) => viewElements.filter((e) => e.parent === parentName);

  const handleContextMenu = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, elementId });
  };

  return (
    <div className="bg-paper flex flex-col overflow-hidden h-full border-r border-line">
      {/* Header */}
      <div className="flex items-center bg-paper border-b border-line flex-shrink-0 px-3 py-2 gap-1.5">
        <span className="flex-1 text-[11px] font-bold text-ink-muted tracking-wide">元件列表</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-0.5 bg-primary hover:bg-primary-hover text-white rounded-control px-2.5 py-1 text-xs font-semibold transition-all shadow-xs flex-shrink-0 cursor-pointer min-h-[30px]"
        >
          <Plus className="w-3.5 h-3.5" /> 新增
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {topLevel.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-center px-3">
            <span className="text-2xl opacity-20">🖼</span>
            <p className="text-ink-muted text-[11px] leading-snug font-medium">尚無元件<br />點擊上方「新增」加入畫布元件</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 p-2">
            {topLevel.map((el) => {
              const isSelected = el.id === selectedElementId;
              const children = childrenOf(el.name);
              return (
                <div key={el.id}>
                  <div
                    onClick={() => setSelectedElement(isSelected ? null : el.id)}
                    onContextMenu={(e) => handleContextMenu(e, el.id)}
                    className={`relative flex items-center gap-2 rounded-control border-2 cursor-pointer transition-all px-2.5 py-1.5 min-h-[38px]
                      ${isSelected ? 'border-primary bg-primary-soft/50 shadow-xs' : 'border-line bg-card hover:border-line/80'}`}
                  >
                    <div className="w-7 h-7 bg-paper border border-line rounded-control flex items-center justify-center flex-shrink-0">
                      <ElementIcon type={el.type} className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-ink font-semibold truncate leading-tight">{el.name}</div>
                      <div className="text-[10px] text-ink-muted truncate font-mono">{el.type.split('.')[1]}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeViewElement(el.id); if (isSelected) setSelectedElement(null); }}
                      className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1 rounded-control transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {children.length > 0 && (
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-line pl-2">
                      {children.map((child) => {
                        const cSelected = child.id === selectedElementId;
                        return (
                          <div
                            key={child.id}
                            onClick={() => setSelectedElement(cSelected ? null : child.id)}
                            onContextMenu={(e) => handleContextMenu(e, child.id)}
                            className={`relative flex items-center gap-2 rounded-control border cursor-pointer transition-all px-2 py-1 min-h-[34px]
                              ${cSelected ? 'border-primary bg-primary-soft/40 shadow-xs' : 'border-line bg-card/80 hover:border-line/80'}`}
                          >
                            <div className="w-6 h-6 bg-paper border border-line rounded flex items-center justify-center flex-shrink-0">
                              <ElementIcon type={child.type} className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] text-ink font-medium truncate leading-tight">{child.name}</div>
                              <div className="text-[10px] text-ink-muted truncate font-mono">{child.type.split('.')[1]}</div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeViewElement(child.id); if (cSelected) setSelectedElement(null); }}
                              className="text-ink-muted hover:text-danger hover:bg-danger-soft p-1 rounded-control transition-colors flex-shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <AddElementModal onClose={() => setShowModal(false)} />}
      {contextMenu && <ContextMenu menu={contextMenu} onClose={() => setContextMenu(null)} />}
    </div>
  );
}
