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
      className="fixed z-[9999] w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl flex flex-col"
      style={{ top, left, maxHeight: pickerH }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 flex-shrink-0">
        <span className="text-xs font-bold text-purple-300">𝑓(𝑥) 插入數學函數</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs leading-none">✕</button>
      </div>

      <div className="overflow-y-auto flex-1">
        {MATH_FUNCTIONS.map((group) => (
          <div key={group.category} className="border-b border-gray-800 last:border-0">
            <div className="px-3 py-1 bg-gray-800/60 text-[10px] font-bold text-gray-500 uppercase tracking-wide sticky top-0">
              {group.category}
            </div>
            <div className="py-0.5">
              {group.fns.map((fn) => (
                <button
                  key={fn.syntax}
                  onClick={() => { onSelect(fn.syntax); onClose(); }}
                  title={fn.desc}
                  className="w-full flex items-baseline gap-2 px-3 py-1 hover:bg-gray-700 text-left transition-colors group"
                >
                  <span className="font-mono text-[11px] text-green-400 whitespace-nowrap flex-shrink-0 group-hover:text-green-300">
                    {fn.syntax}
                  </span>
                  <span className="text-[10px] text-gray-500 group-hover:text-gray-300 truncate">
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
