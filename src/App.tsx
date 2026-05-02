import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Toolbar from './components/toolbar/Toolbar';
import BlockPalette from './components/blocks/BlockPalette';
import ScriptCanvas from './components/blocks/ScriptCanvas';
import StagePanel from './components/stage/StagePanel';
import SpriteList from './components/sprites/SpriteList';
import SpriteEditor from './components/sprites/SpriteEditor';
import MathReference from './components/math/MathReference';
import { useSimulationStore } from './store/simulationStore';
import ELEMENT_SCHEMAS from './constants/elementSchemas';

const SCRIPT_TAB = '__script__';
const STAGE_TAB  = '__stage__';
const MATH_TAB   = '__math__';

interface TabInfo { id: string; label: string; icon: string; }

export default function App() {
  const { selectedElementId, setSelectedElement, viewElements } = useSimulationStore();
  const [openTabIds, setOpenTabIds] = useState<string[]>([SCRIPT_TAB]);
  const [activeTabId, setActiveTabId] = useState<string>(SCRIPT_TAB);

  const stageFullscreen = activeTabId === STAGE_TAB;

  const handleOpenMath = () => {
    setOpenTabIds((prev) => prev.includes(MATH_TAB) ? prev : [...prev, MATH_TAB]);
    setActiveTabId(MATH_TAB);
  };

  const handleToggleStage = () => {
    if (stageFullscreen) {
      setOpenTabIds((prev) => prev.filter((id) => id !== STAGE_TAB));
      setActiveTabId(SCRIPT_TAB);
    } else {
      setOpenTabIds((prev) => prev.includes(STAGE_TAB) ? prev : [...prev, STAGE_TAB]);
      setActiveTabId(STAGE_TAB);
    }
  };

  // When an element is selected, open/activate its tab
  useEffect(() => {
    if (!selectedElementId) return;
    setOpenTabIds((prev) => prev.includes(selectedElementId) ? prev : [...prev, selectedElementId]);
    setActiveTabId(selectedElementId);
  }, [selectedElementId]);

  // Sync activeTabId → store selectedElementId
  useEffect(() => {
    const isElementTab = activeTabId !== SCRIPT_TAB && activeTabId !== STAGE_TAB;
    setSelectedElement(isElementTab ? activeTabId : null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  // Close tabs for deleted elements
  useEffect(() => {
    const liveIds = new Set(viewElements.map((e) => e.id));
    const isSpecial = (id: string) => id === SCRIPT_TAB || id === STAGE_TAB;
    setOpenTabIds((prev) => {
      const next = prev.filter((id) => isSpecial(id) || liveIds.has(id));
      return next.length ? next : [SCRIPT_TAB];
    });
    setActiveTabId((prev) => {
      if (isSpecial(prev) || liveIds.has(prev)) return prev;
      return SCRIPT_TAB;
    });
  }, [viewElements]);

  const buildTabInfo = (id: string): TabInfo => {
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
    if (tabId === SCRIPT_TAB || tabId === STAGE_TAB) return;
    setOpenTabIds((prev) => prev.filter((id) => id !== tabId));
    if (activeTabId === tabId) setActiveTabId(SCRIPT_TAB);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Toolbar stageOpen={stageFullscreen} onToggleStage={handleToggleStage} onOpenMath={handleOpenMath} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: block palette (top) + element list / backdrop tabs (bottom) */}
        {!stageFullscreen && (
          <div className="w-52 flex flex-col flex-shrink-0 border-r border-gray-700 overflow-hidden min-h-0">
            <div className="flex-shrink-0 overflow-y-auto max-h-[56%]">
              <BlockPalette />
            </div>
            <div className="flex-1 border-t border-gray-700 overflow-hidden min-h-0">
              <SpriteList />
            </div>
          </div>
        )}

        {/* Center: tabs */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 min-h-0">
          {/* Tab bar */}
          <div className="flex items-end bg-gray-800 border-b border-gray-700 overflow-x-auto flex-shrink-0">
            {openTabIds.map((tabId) => {
              const info = buildTabInfo(tabId);
              const isActive = activeTabId === tabId;
              return (
                <div
                  key={tabId}
                  onClick={() => setActiveTabId(tabId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-xs border-b-2 whitespace-nowrap flex-shrink-0 transition-colors
                    ${isActive
                      ? 'border-purple-400 text-white'
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'}`}
                >
                  <span>{info.icon}</span>
                  <span className="max-w-[120px] truncate">{info.label}</span>
                  {tabId !== SCRIPT_TAB && (
                    <button onClick={(e) => closeTab(tabId, e)} className="ml-1 text-gray-500 hover:text-white transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tab content — each child must be h-full to scroll properly */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTabId === STAGE_TAB ? (
              <StagePanel />
            ) : activeTabId === MATH_TAB ? (
              <MathReference />
            ) : activeTabId === SCRIPT_TAB ? (
              <ScriptCanvas />
            ) : (
              <SpriteEditor key={activeTabId} elementId={activeTabId} />
            )}
          </div>
        </div>

        {/* Right: simulation stage only */}
        {!stageFullscreen && (
          <div className="flex flex-col border-l border-gray-700 flex-shrink-0 w-[480px] min-h-0">
            <StagePanel />
          </div>
        )}
      </div>
    </div>
  );
}
