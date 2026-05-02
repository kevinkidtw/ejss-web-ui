import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  text: string;
  side?: 'top' | 'right';
  className?: string;
}

export default function HelpTooltip({ text, side = 'top', className = '' }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (side === 'right') {
      setPos({ top: r.top + r.height / 2, left: r.right + 8 });
    } else {
      setPos({ top: r.top - 8, left: r.left });
    }
    setVisible(true);
  };

  return (
    <span
      ref={ref}
      className={`inline-flex cursor-help select-none ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="text-[10px] text-gray-500 hover:text-blue-400 leading-none">ⓘ</span>
      {visible && createPortal(
        <span
          className="fixed z-[9999] w-56 rounded bg-gray-900 border border-gray-600 px-2.5 py-2 text-[11px] text-gray-200 leading-snug shadow-xl whitespace-normal text-left pointer-events-none"
          style={
            side === 'right'
              ? { top: pos.top, left: pos.left, transform: 'translateY(-50%)' }
              : { top: pos.top, left: pos.left, transform: 'translateY(-100%)' }
          }
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  );
}
