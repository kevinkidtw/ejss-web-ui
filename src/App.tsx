import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Toolbar from './components/toolbar/Toolbar';
import BlockPalette from './components/blocks/BlockPalette';
import ScriptCanvas from './components/blocks/ScriptCanvas';
import StagePanel from './components/stage/StagePanel';
import SpriteList from './components/sprites/SpriteList';
import SpriteEditor from './components/sprites/SpriteEditor';
import MathReference from './components/math/MathReference';
import DescriptionEditor from './components/description/DescriptionEditor';
import { useSimulationStore } from './store/simulationStore';
import ELEMENT_SCHEMAS from './constants/elementSchemas';
import ElementIcon from './components/common/ElementIcon';

const DESC_TAB   = '__description__';
const SCRIPT_TAB = '__script__';
const STAGE_TAB  = '__stage__';
const MATH_TAB   = '__math__';

interface TabInfo { id: string; label: string; icon: string; }

export default function App() {
  const { selectedElementId, setSelectedElement, viewElements, isLocked, loadState } = useSimulationStore();
  const [openTabIds, setOpenTabIds] = useState<string[]>([DESC_TAB, SCRIPT_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>(DESC_TAB);
  const [showRightStage, setShowRightStage] = useState(true);

  // Load state from URL import if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const importData = params.get('import');
    if (importData) {
      try {
        const jsonStr = decodeURIComponent(escape(atob(importData)));
        const state = JSON.parse(jsonStr);
        if (state && typeof state === 'object') {
          loadState(state);
          // Clear query param to keep URL clean
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('Failed to import state from URL:', err);
      }
    }
  }, [loadState]);

  // If locked, restrict open tabs to Description and Stage
  useEffect(() => {
    if (isLocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenTabIds([DESC_TAB, STAGE_TAB]);
      if (activeTabId !== DESC_TAB && activeTabId !== STAGE_TAB) {
        setActiveTabId(DESC_TAB);
      }
    }
  }, [isLocked, activeTabId]);

  const stageFullscreen = activeTabId === STAGE_TAB;

  const handleOpenMath = () => {
    setOpenTabIds((prev) => prev.includes(MATH_TAB) ? prev : [...prev, MATH_TAB]);
    setActiveTabId(MATH_TAB);
  };

  // When an element is selected, open/activate its tab
  useEffect(() => {
    if (!selectedElementId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenTabIds((prev) => prev.includes(selectedElementId) ? prev : [...prev, selectedElementId]);
    setActiveTabId(selectedElementId);
  }, [selectedElementId]);

  // Sync activeTabId → store selectedElementId
  useEffect(() => {
    const isElementTab =
      activeTabId !== SCRIPT_TAB &&
      activeTabId !== STAGE_TAB &&
      activeTabId !== DESC_TAB &&
      activeTabId !== MATH_TAB;
    setSelectedElement(isElementTab ? activeTabId : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  // Close tabs for deleted elements
  useEffect(() => {
    const liveIds = new Set(viewElements.map((e) => e.id));
    const isSpecial = (id: string) =>
      id === SCRIPT_TAB || id === STAGE_TAB || id === DESC_TAB || id === MATH_TAB;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenTabIds((prev) => {
      const next = prev.filter((id) => isSpecial(id) || liveIds.has(id));
      return next.length ? next : [DESC_TAB, SCRIPT_TAB];
    });
    setActiveTabId((prev) => {
      if (isSpecial(prev) || liveIds.has(prev)) return prev;
      return DESC_TAB;
    });
  }, [viewElements]);

  const buildTabInfo = (id: string): TabInfo => {
    if (id === DESC_TAB)   return { id, label: '模擬實驗講義', icon: '📝' };
    if (id === SCRIPT_TAB) return { id, label: '廣域腳本', icon: '📜' };
    if (id === STAGE_TAB)  return { id, label: '模擬舞台', icon: '🎮' };
    if (id === MATH_TAB)   return { id, label: '數學速查', icon: '𝑓𝑥' };
    const el = viewElements.find((e) => e.id === id);
    if (!el) return { id, label: id, icon: '□' };
    const meta = ELEMENT_SCHEMAS[el.type];
    return { id, label: el.name, icon: meta?.icon ?? '□' };
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabId === SCRIPT_TAB || tabId === STAGE_TAB || tabId === DESC_TAB) return;
    setOpenTabIds((prev) => prev.filter((id) => id !== tabId));
    if (activeTabId === tabId) setActiveTabId(DESC_TAB);
  };

  return (
    <div className="h-screen flex flex-col bg-paper overflow-hidden text-ink font-sans">
      <Toolbar showRightStage={showRightStage} onToggleRightStage={() => setShowRightStage((v) => !v)} onOpenMath={handleOpenMath} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: block palette (top) + element list / backdrop tabs (bottom) */}
        {!stageFullscreen && !isLocked && (
          <div className="w-[312px] flex flex-col flex-shrink-0 border-r border-line bg-card overflow-hidden min-h-0">
            <div className="flex-shrink-0 overflow-y-auto max-h-[56%]">
              <BlockPalette />
            </div>
            <div className="flex-1 border-t border-line overflow-hidden min-h-0">
              <SpriteList />
            </div>
          </div>
        )}

        {/* Center: tabs */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0 bg-paper">
          {/* Tab bar */}
          <div className="flex items-end bg-paper border-b border-line px-2 gap-1 overflow-x-auto flex-shrink-0 pt-1.5">
            {openTabIds.map((tabId) => {
              const info = buildTabInfo(tabId);
              const isActive = activeTabId === tabId;
              return (
                <div
                  key={tabId}
                  onClick={() => setActiveTabId(tabId)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 cursor-pointer text-xs rounded-t-control border-t border-x transition-all min-h-[38px]
                    ${isActive
                      ? 'bg-card border-line border-b-transparent text-primary font-bold shadow-xs -mb-px z-10'
                      : 'border-transparent text-ink-muted hover:text-ink hover:bg-card/50'}`}
                >
                  <span className="flex items-center gap-1">
                    {tabId === SCRIPT_TAB || tabId === STAGE_TAB || tabId === DESC_TAB || tabId === MATH_TAB ? (
                      info.icon
                    ) : (
                      (() => {
                        const el = viewElements.find((e) => e.id === tabId);
                        return el ? <ElementIcon type={el.type} className="w-3.5 h-3.5 text-primary inline" /> : '□';
                      })()
                    )}
                  </span>
                  <span className="max-w-[120px] truncate">{info.label}</span>
                  {tabId !== SCRIPT_TAB && tabId !== DESC_TAB && (
                    <button onClick={(e) => closeTab(tabId, e)} className="ml-1.5 text-ink-muted hover:text-danger transition-colors cursor-pointer p-0.5 rounded-full hover:bg-paper">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tab content — each child must be h-full to scroll properly */}
          <div className="flex-1 min-h-0 overflow-hidden bg-paper">
            {activeTabId === STAGE_TAB ? (
              <StagePanel />
            ) : activeTabId === MATH_TAB ? (
              <MathReference />
            ) : activeTabId === SCRIPT_TAB ? (
              <ScriptCanvas />
            ) : activeTabId === DESC_TAB ? (
              <DescriptionEditor />
            ) : (
              <SpriteEditor key={activeTabId} elementId={activeTabId} />
            )}
          </div>
        </div>

        {/* Right: simulation stage only */}
        {!stageFullscreen && showRightStage && (
          <div className="flex-1 flex flex-col border-l border-line min-w-0 min-h-0">
            <StagePanel />
          </div>
        )}
      </div>
    </div>
  );
}
