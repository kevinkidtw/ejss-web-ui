import { useState } from 'react';
import MATH_FUNCTIONS from '../../constants/mathFunctions';

const CATEGORY_COLOR: Record<string, { badge: string; border: string; heading: string }> = {
  '三角函數':   { badge: 'bg-blue-900 text-blue-300',   border: 'border-blue-700',   heading: 'text-blue-400' },
  '指數與對數': { badge: 'bg-green-900 text-green-300', border: 'border-green-700',  heading: 'text-green-400' },
  '取值與比較': { badge: 'bg-orange-900 text-orange-300', border: 'border-orange-700', heading: 'text-orange-400' },
  '常數':       { badge: 'bg-purple-900 text-purple-300', border: 'border-purple-700', heading: 'text-purple-400' },
  '位元與整數': { badge: 'bg-gray-700 text-gray-300',   border: 'border-gray-600',   heading: 'text-gray-400' },
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
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Fixed header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3 border-b border-gray-700 bg-gray-900">
        <div className="flex items-baseline gap-3 mb-3">
          <h1 className="text-white text-lg font-bold">𝑓(𝑥) 數學函數速查表</h1>
          <span className="text-gray-500 text-xs">點擊語法方塊即可複製</span>
        </div>
        <input
          className="w-full max-w-md bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none placeholder-gray-500"
          placeholder="搜尋函數名稱、說明或應用場景…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            找不到符合「{search}」的函數
          </div>
        )}

        {filtered.map((group) => {
          const colors = CATEGORY_COLOR[group.category] ?? { badge: 'bg-gray-700 text-gray-300', border: 'border-gray-600', heading: 'text-gray-400' };
          return (
            <section key={group.category}>
              {/* Category heading */}
              <div className={`flex items-center gap-2 mb-3 pb-1.5 border-b ${colors.border}`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{group.category}</span>
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
                      className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 flex flex-col gap-2 transition-colors"
                    >
                      {/* Top row: syntax copy button + label */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => copy(fn.syntax)}
                          title="點擊複製"
                          className={`font-mono text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all text-left leading-snug
                            ${isCopied
                              ? 'bg-green-800 text-green-300 border border-green-600'
                              : 'bg-gray-900 text-green-400 border border-gray-600 hover:border-green-500 hover:bg-gray-700'}`}
                        >
                          {isCopied ? '✓ 已複製' : fn.syntax}
                        </button>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-white text-sm font-semibold leading-tight">{fn.label}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-400 text-xs leading-relaxed">{fn.desc}</p>

                      {/* Example */}
                      {fn.example && (
                        <div className="bg-gray-900 rounded-lg px-3 py-2">
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">範例</div>
                          <pre className="text-green-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">{fn.example}</pre>
                        </div>
                      )}

                      {/* Physics tip */}
                      {fn.physics && (
                        <div className="bg-blue-950/60 border border-blue-900/50 rounded-lg px-3 py-2">
                          <div className="text-[10px] text-blue-400 uppercase font-bold mb-1">物理應用</div>
                          <pre className="text-blue-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">{fn.physics}</pre>
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
