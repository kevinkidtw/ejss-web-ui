import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import EXAMPLES from '../../constants/examples';
import { useSimulationStore } from '../../store/simulationStore';

const DIFFICULTY_COLOR: Record<string, string> = {
  '入門': 'bg-green-700 text-green-200',
  '基礎': 'bg-blue-700 text-blue-200',
  '進階': 'bg-purple-700 text-purple-200',
};

const PREVIEW_ICON: Record<string, string> = {
  shm:        '〰️',
  pendulum:   '🔵',
  projectile: '🟠',
  damped:     '📉',
  orbit:      '🪐',
  threebody:  '✴️',
};

interface Props {
  onClose: () => void;
}

export default function ExamplesModal({ onClose }: Props) {
  const store = useSimulationStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const load = (exId: string) => {
    const ex = EXAMPLES.find((e) => e.id === exId);
    if (!ex) return;
    const { id: _id, description: _desc, difficulty: _diff, ...state } = ex;
    store.loadState(state);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">📚 範例庫</h2>
            <p className="text-gray-400 text-xs mt-0.5">選擇範例後會取代目前的模擬內容</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Example cards */}
        <div className="overflow-y-auto flex-1 p-4 grid grid-cols-1 gap-3">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.id}
              className="bg-gray-800 border border-gray-700 hover:border-purple-500 rounded-lg p-4 flex gap-4 cursor-pointer transition-all group"
              onClick={() => load(ex.id)}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-gray-700 group-hover:bg-gray-600 rounded-lg flex items-center justify-center text-2xl transition-colors">
                {PREVIEW_ICON[ex.id] ?? '🧪'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-bold text-sm">{ex.info.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${DIFFICULTY_COLOR[ex.difficulty]}`}>
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{ex.description}</p>
                {/* Quick stats */}
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] text-gray-500">
                    📦 {ex.variables.length} 個變數
                  </span>
                  <span className="text-[10px] text-gray-500">
                    🔵 {ex.odePages.length} 個方程組
                  </span>
                  <span className="text-[10px] text-gray-500">
                    🎨 {ex.viewElements.filter(e => e.type !== 'Elements.DrawingPanel').length} 個元件
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 self-center text-gray-600 group-hover:text-purple-400 transition-colors text-sm font-bold">
                載入 →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
