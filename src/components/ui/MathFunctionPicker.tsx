import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import MATH_FUNCTIONS from '../../constants/mathFunctions';

interface Props {
  anchor: { top: number; left: number; right: number; bottom: number };
  onSelect: (syntax: string) => void;
  onClose: () => void;
}

export default function MathFunctionPicker({ anchor, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const t = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('keydown', onKey);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Position below anchor; flip up if too close to bottom
  const pickerH = Math.min(window.innerHeight * 0.6, 400);
  const spaceBelow = window.innerHeight - anchor.bottom;
  const top = spaceBelow > pickerH + 8 ? anchor.bottom + 4 : anchor.top - pickerH - 4;
  // Position left-aligned to anchor; clamp so it doesn't overflow right edge
  const left = Math.min(anchor.left, window.innerWidth - 320 - 8);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] w-80 bg-white border border-slate-200 rounded-lg shadow-2xl flex flex-col"
      style={{ top, left, maxHeight: pickerH }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 flex-shrink-0">
        <span className="text-xs font-bold text-indigo-650">𝑓(𝑥) 插入數學函數</span>
        <button onClick={onClose} className="text-slate-450 hover:text-slate-700 text-xs leading-none cursor-pointer">✕</button>
      </div>

      <div className="overflow-y-auto flex-1">
        {MATH_FUNCTIONS.map((group) => (
          <div key={group.category} className="border-b border-slate-100 last:border-0">
            <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wide sticky top-0">
              {group.category}
            </div>
            <div className="py-0.5">
              {group.fns.map((fn) => (
                <button
                  key={fn.syntax}
                  onClick={() => { onSelect(fn.syntax); onClose(); }}
                  title={fn.desc}
                  className="w-full flex items-baseline gap-2 px-3 py-1 hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                >
                  <span className="font-mono text-[11px] text-emerald-700 whitespace-nowrap flex-shrink-0 group-hover:text-emerald-800">
                    {fn.syntax}
                  </span>
                  <span className="text-[10px] text-slate-450 group-hover:text-slate-600 truncate">
                    {fn.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
