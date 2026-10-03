import { useEffect, useRef } from 'react';
import { X, Activity, Disc, Flame, TrendingDown, Orbit, Infinity as InfinityIcon, Workflow, Tv, Sun, Atom } from 'lucide-react';
import EXAMPLES from '../../constants/examples';
import { useSimulationStore } from '../../store/simulationStore';

const DIFFICULTY_COLOR: Record<string, string> = {
  '入門': 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  '基礎': 'bg-blue-50 text-blue-700 border border-blue-200/60',
  '進階': 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
};

const DIFFICULTY_ORDER: Record<string, number> = { '入門': 0, '基礎': 1, '進階': 2 };
const DIFFICULTY_LEVELS = ['入門', '基礎', '進階'] as const;

// Light-theme Lucide icon mappings with soft pastel gradients and matching vibrant text colors
const EXAMPLE_METADATA: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  shm:        { icon: Activity,     color: 'text-sky-600',    bg: 'from-sky-50 to-sky-100/30 border-sky-200/60 shadow-sm' },
  pendulum:   { icon: Disc,         color: 'text-orange-600', bg: 'from-orange-50 to-orange-100/30 border-orange-200/60 shadow-sm' },
  projectile: { icon: Flame,        color: 'text-emerald-600',  bg: 'from-emerald-50 to-emerald-100/30 border-emerald-200/60 shadow-sm' },
  damped:     { icon: TrendingDown, color: 'text-rose-600',   bg: 'from-rose-50 to-rose-100/30 border-rose-200/60 shadow-sm' },
  orbit:      { icon: Orbit,        color: 'text-indigo-600', bg: 'from-indigo-50 to-indigo-100/30 border-indigo-200/60 shadow-sm' },
  threebody:  { icon: InfinityIcon, color: 'text-amber-600', bg: 'from-amber-50 to-amber-100/30 border-amber-200/60 shadow-sm' },
  doublepend: { icon: Workflow,     color: 'text-fuchsia-600',bg: 'from-fuchsia-50 to-fuchsia-100/30 border-fuchsia-200/60 shadow-sm' },
  crt:        { icon: Tv,           color: 'text-cyan-600',   bg: 'from-cyan-50 to-cyan-100/30 border-cyan-200/60 shadow-sm' },
  snell:      { icon: Sun,          color: 'text-amber-600',  bg: 'from-amber-50 to-amber-100/30 border-amber-200/60 shadow-sm' },
  idealgas:   { icon: Atom,         color: 'text-teal-600',   bg: 'from-teal-50 to-teal-100/30 border-teal-200/60 shadow-sm' },
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
    const { id: _id, listDescription: _ldesc, difficulty: _diff, ...state } = ex as any;
    store.loadState(state);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-slate-800 font-bold text-base flex items-center gap-2">
              <Orbit className="w-5 h-5 text-indigo-600 animate-spin-slow" />
              物理科學範例庫
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">選擇頂尖科學模擬範例以載入當前工作區</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Example cards grouped by difficulty */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5 bg-white">
          {DIFFICULTY_LEVELS.map((level) => {
            const group = [...EXAMPLES]
              .filter((ex) => ex.difficulty === level)
              .sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 9) - (DIFFICULTY_ORDER[b.difficulty] ?? 9));
            if (group.length === 0) return null;
            return (
              <div key={level} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold border ${DIFFICULTY_COLOR[level]}`}>{level}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {group.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-slate-50 border border-slate-200 hover:border-indigo-500 rounded-lg p-4 flex gap-4 cursor-pointer transition-all hover:bg-white hover:shadow-sm group"
                      onClick={() => load(ex.id)}
                    >
                      {(() => {
                        const meta = EXAMPLE_METADATA[ex.id];
                        const IconComp = meta ? meta.icon : Atom;
                        return (
                          <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${meta ? meta.bg : 'from-slate-50 to-slate-100/30 border-slate-200/60'} border rounded-lg flex items-center justify-center transition-all group-hover:scale-105`}>
                            <IconComp className={`w-6 h-6 ${meta ? meta.color : 'text-slate-500'}`} />
                          </div>
                        );
                      })()}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-800 font-bold text-sm group-hover:text-indigo-600 transition-colors">{ex.info.title}</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">{ex.listDescription}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] text-slate-400 font-mono">📦 {ex.variables.length} VARS</span>
                          <span className="text-[10px] text-slate-400 font-mono">⚡ {ex.odePages.length} ODE</span>
                          <span className="text-[10px] text-slate-400 font-mono">🎨 {ex.viewElements.filter(e => e.type !== 'Elements.DrawingPanel').length} SPRITES</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 self-center text-slate-400 group-hover:text-indigo-600 transition-colors text-xs font-bold font-mono tracking-wider">
                        LOAD →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
