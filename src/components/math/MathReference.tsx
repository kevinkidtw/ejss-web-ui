import { useState } from 'react';
import MATH_FUNCTIONS from '../../constants/mathFunctions';

const CATEGORY_COLOR: Record<string, { badge: string; border: string; heading: string }> = {
  '三角函數':   { badge: 'bg-blue-50 text-blue-700 border-blue-200',   border: 'border-blue-200',   heading: 'text-blue-800' },
  '指數與對數': { badge: 'bg-emerald-50 text-emerald-750 border-emerald-200', border: 'border-emerald-200',  heading: 'text-emerald-800' },
  '取值與比較': { badge: 'bg-orange-50 text-orange-700 border-orange-200', border: 'border-orange-200', heading: 'text-orange-800' },
  '常數':       { badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-purple-200', heading: 'text-purple-800' },
  '位元與整數': { badge: 'bg-slate-100 text-slate-700 border-slate-200',   border: 'border-slate-200',   heading: 'text-slate-700' },
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
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Fixed header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3 border-b border-slate-200 bg-slate-100">
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-slate-800 text-lg font-bold">𝑓(𝑥) 數學函數速查表</h1>
          <span className="text-slate-500 text-xs">點擊語法方塊即可複製</span>
        </div>
        <input
          className="w-full max-w-md bg-white text-slate-800 text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none placeholder-slate-400"
          placeholder="搜尋函數名稱、說明或應用場景…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            找不到符合「{search}」的函數
          </div>
        )}

        {filtered.map((group) => {
          const colors = CATEGORY_COLOR[group.category] ?? { badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200', heading: 'text-slate-750' };
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
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col gap-2 transition-colors shadow-sm"
                    >
                      {/* Top row: syntax copy button + label */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => copy(fn.syntax)}
                          title="點擊複製"
                          className={`font-mono text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all text-left leading-snug cursor-pointer
                            ${isCopied
                              ? 'bg-emerald-55 text-emerald-700 border border-emerald-300'
                              : 'bg-slate-50 text-emerald-700 border border-slate-200 hover:border-emerald-500 hover:bg-white'}`}
                        >
                          {isCopied ? '✓ 已複製' : fn.syntax}
                        </button>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-slate-800 text-sm font-semibold leading-tight">{fn.label}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-500 text-xs leading-relaxed">{fn.desc}</p>

                      {/* Example */}
                      {fn.example && (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">範例</div>
                          <pre className="text-emerald-800 text-xs leading-relaxed whitespace-pre-wrap font-mono">{fn.example}</pre>
                        </div>
                      )}

                      {/* Physics tip */}
                      {fn.physics && (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2">
                          <div className="text-[10px] text-indigo-600 uppercase font-bold mb-1">物理應用</div>
                          <pre className="text-indigo-850 text-xs leading-relaxed whitespace-pre-wrap font-mono">{fn.physics}</pre>
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
