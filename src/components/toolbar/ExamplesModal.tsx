import { useEffect, useRef } from 'react';
import { X, Activity, Disc, Flame, TrendingDown, Orbit, Infinity as InfinityIcon, Workflow, Tv, Sun, Atom } from 'lucide-react';
import EXAMPLES from '../../constants/examples';
import { useSimulationStore } from '../../store/simulationStore';

const DIFFICULTY_COLOR: Record<string, string> = {
  '入門': 'bg-teal-soft text-teal border border-teal/30',
  '基礎': 'bg-primary-soft text-primary border border-primary/30',
  '進階': 'bg-amber-soft text-amber-hover border border-amber/30',
};

const DIFFICULTY_ORDER: Record<string, number> = { '入門': 0, '基礎': 1, '進階': 2 };
const DIFFICULTY_LEVELS = ['入門', '基礎', '進階'] as const;

// Token palette icon mappings with soft tinted backgrounds and matching ink colors
const EXAMPLE_METADATA: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  shm:        { icon: Activity,     color: 'text-primary',          bg: 'bg-primary-soft/60 border-primary/20 shadow-xs' },
  pendulum:   { icon: Disc,         color: 'text-amber-hover',      bg: 'bg-amber-soft/60 border-amber/20 shadow-xs' },
  projectile: { icon: Flame,        color: 'text-teal',             bg: 'bg-teal-soft/60 border-teal/20 shadow-xs' },
  damped:     { icon: TrendingDown, color: 'text-danger',           bg: 'bg-danger-soft/60 border-danger/20 shadow-xs' },
  orbit:      { icon: Orbit,        color: 'text-primary',          bg: 'bg-primary-soft/60 border-primary/20 shadow-xs' },
  threebody:  { icon: InfinityIcon, color: 'text-amber-hover',      bg: 'bg-amber-soft/60 border-amber/20 shadow-xs' },
  doublepend: { icon: Workflow,     color: 'text-pastel-world-ink', bg: 'bg-pastel-world/60 border-pastel-world-ink/20 shadow-xs' },
  crt:        { icon: Tv,           color: 'text-primary',          bg: 'bg-primary-soft/60 border-primary/20 shadow-xs' },
  snell:      { icon: Sun,          color: 'text-amber-hover',      bg: 'bg-amber-soft/60 border-amber/20 shadow-xs' },
  idealgas:   { icon: Atom,         color: 'text-teal',             bg: 'bg-teal-soft/60 border-teal/20 shadow-xs' },
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
    const { id: _id, listDescription: _ldesc, difficulty: _diff, ...state } = ex as unknown as Record<string, unknown>;
    void _id; void _ldesc; void _diff;
    store.loadState(state as unknown as Parameters<typeof store.loadState>[0]);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-card border border-line rounded-card shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-paper flex-shrink-0">
          <div>
            <h2 className="text-ink font-bold text-base flex items-center gap-2">
              <Orbit className="w-5 h-5 text-primary animate-spin-slow" />
              物理科學範例庫
            </h2>
            <p className="text-ink-muted text-xs mt-0.5">選擇頂尖科學模擬範例以載入當前工作區</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors p-1.5 hover:bg-paper rounded-control cursor-pointer" title="關閉">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Example cards grouped by difficulty */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5 bg-card">
          {DIFFICULTY_LEVELS.map((level) => {
            const group = [...EXAMPLES]
              .filter((ex) => ex.difficulty === level)
              .sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 9) - (DIFFICULTY_ORDER[b.difficulty] ?? 9));
            if (group.length === 0) return null;
            return (
              <div key={level} className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-control font-bold border ${DIFFICULTY_COLOR[level]}`}>{level}</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {group.map((ex) => (
                    <div
                      key={ex.id}
                      className="bg-paper/60 border border-line hover:border-primary rounded-card p-4 flex gap-4 cursor-pointer transition-all hover:bg-card hover:shadow-xs group"
                      onClick={() => load(ex.id)}
                    >
                      {(() => {
                        const meta = EXAMPLE_METADATA[ex.id];
                        const IconComp = meta ? meta.icon : Atom;
                        return (
                          <div className={`flex-shrink-0 w-12 h-12 ${meta ? meta.bg : 'bg-paper border-line shadow-xs'} border rounded-control flex items-center justify-center transition-all group-hover:scale-105`}>
                            <IconComp className={`w-6 h-6 ${meta ? meta.color : 'text-ink-muted'}`} />
                          </div>
                        );
                      })()}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-ink font-bold text-sm group-hover:text-primary transition-colors">{ex.info.title}</span>
                        </div>
                        <p className="text-ink-muted text-xs leading-relaxed">{ex.listDescription}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] text-ink-muted font-mono">📦 {ex.variables.length} VARS</span>
                          <span className="text-[10px] text-ink-muted font-mono">⚡ {ex.odePages.length} ODE</span>
                          <span className="text-[10px] text-ink-muted font-mono">🎨 {ex.viewElements.filter(e => e.type !== 'Elements.DrawingPanel').length} SPRITES</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 self-center text-ink-muted group-hover:text-primary transition-colors text-xs font-bold font-mono tracking-wider">
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
