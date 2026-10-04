import { useState } from 'react';
import MATH_FUNCTIONS from '../../constants/mathFunctions';

const CATEGORY_COLOR: Record<string, { badge: string; border: string; heading: string }> = {
  '三角函數':   { badge: 'bg-primary-soft text-primary border-primary/20',   border: 'border-primary/20',   heading: 'text-primary' },
  '指數與對數': { badge: 'bg-teal-soft text-teal border-teal/20', border: 'border-teal/20',  heading: 'text-teal' },
  '取值與比較': { badge: 'bg-amber-soft text-amber-hover border-amber/20', border: 'border-amber/20', heading: 'text-amber-hover' },
  '常數':       { badge: 'bg-pastel-world text-pastel-world-ink border-pastel-world-ink/20', border: 'border-pastel-world-ink/20', heading: 'text-pastel-world-ink' },
  '位元與整數': { badge: 'bg-paper text-ink-muted border-line',   border: 'border-line',   heading: 'text-ink-muted' },
};

export default function MathReference() {
  const [search, setSearch] = useState('');
  const [copiedSyntax, setCopiedSyntax] = useState<string | null>(null);

  const q = search.toLowerCase();
  const filtered = MATH_FUNCTIONS.map((group) => ({
    ...group,
    fns: group.fns.filter((fn) =>
      !q ||
      fn.syntax.toLowerCase().includes(q) ||
      fn.label.toLowerCase().includes(q) ||
      fn.desc.toLowerCase().includes(q) ||
      (fn.example ?? '').toLowerCase().includes(q) ||
      (fn.physics ?? '').toLowerCase().includes(q)
    ),
  })).filter((g) => g.fns.length > 0);

  const copy = (syntax: string) => {
    navigator.clipboard.writeText(syntax).catch(() => {});
    setCopiedSyntax(syntax);
    setTimeout(() => setCopiedSyntax(null), 1500);
  };

  return (
    <div className="h-full flex flex-col bg-paper overflow-hidden">
      {/* Fixed header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3.5 border-b border-line bg-paper">
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-ink text-lg font-bold">𝑓(𝑥) 數學函數速查表</h1>
          <span className="text-ink-muted text-xs">點擊語法方塊即可複製</span>
        </div>
        <input
          className="w-full max-w-md bg-card text-ink text-sm px-3 py-2 rounded-control border border-line focus:border-primary focus:outline-none placeholder:text-ink-muted/50 shadow-xs min-h-[36px]"
          placeholder="搜尋函數名稱、說明或應用場景…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8 bg-paper">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-ink-muted text-sm">
            找不到符合「{search}」的函數
          </div>
        )}

        {filtered.map((group) => {
          const colors = CATEGORY_COLOR[group.category] ?? { badge: 'bg-paper text-ink-muted border-line', border: 'border-line', heading: 'text-ink-muted' };
          return (
            <section key={group.category}>
              {/* Category heading */}
              <div className={`flex items-center gap-2 mb-3 pb-1.5 border-b ${colors.border}`}>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>{group.category}</span>
                <span className={`text-xs font-bold uppercase tracking-wide ${colors.heading}`}>
                  {group.fns.length} 個函數
                </span>
              </div>

              {/* Function cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {group.fns.map((fn) => {
                  const isCopied = copiedSyntax === fn.syntax;
                  return (
                    <div
                      key={fn.syntax}
                      className="bg-card border border-line hover:border-line/80 rounded-card p-4 flex flex-col gap-2 transition-colors shadow-xs"
                    >
                      {/* Top row: syntax copy button + label */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => copy(fn.syntax)}
                          title="點擊複製"
                          className={`font-mono text-xs px-2.5 py-1.5 rounded-control flex-shrink-0 transition-all text-left leading-snug cursor-pointer min-h-[32px]
                            ${isCopied
                              ? 'bg-teal-soft text-teal border border-teal/30'
                              : 'bg-paper text-primary border border-line hover:border-primary hover:bg-card'}`}
                        >
                          {isCopied ? '✓ 已複製' : fn.syntax}
                        </button>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-ink text-sm font-semibold leading-tight">{fn.label}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-ink-muted text-xs leading-relaxed">{fn.desc}</p>

                      {/* Example */}
                      {fn.example && (
                        <div className="bg-paper border border-line rounded-control px-3 py-2">
                          <div className="text-[10px] text-ink-muted uppercase font-bold mb-1">範例</div>
                          <pre className="text-teal text-xs leading-relaxed whitespace-pre-wrap font-mono">{fn.example}</pre>
                        </div>
                      )}

                      {/* Physics tip */}
                      {fn.physics && (
                        <div className="bg-primary-soft/40 border border-primary/20 rounded-control px-3 py-2">
                          <div className="text-[10px] text-primary uppercase font-bold mb-1">物理應用</div>
                          <pre className="text-primary text-xs leading-relaxed whitespace-pre-wrap font-mono">{fn.physics}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
