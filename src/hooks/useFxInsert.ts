import { useRef, useState } from 'react';

interface Anchor {
  top: number; left: number; right: number; bottom: number;
}

export function useFxInsert(value: string, onChange: (v: string) => void) {
  const cursorPos = useRef(value.length);
  const [pickerAnchor, setPickerAnchor] = useState<Anchor | null>(null);

  // Spread these onto the <input> or <textarea>
  const trackProps = {
    onSelect: (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      cursorPos.current = e.currentTarget.selectionStart ?? cursorPos.current;
    },
    onKeyUp: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      cursorPos.current = e.currentTarget.selectionStart ?? cursorPos.current;
    },
    onClick: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      cursorPos.current = e.currentTarget.selectionStart ?? cursorPos.current;
    },
  };

  const openPicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPickerAnchor({ top: r.top, left: r.left, right: r.right, bottom: r.bottom });
  };

  const insert = (syntax: string) => {
    const p = cursorPos.current;
    const newVal = value.slice(0, p) + syntax + value.slice(p);
    onChange(newVal);
    cursorPos.current = p + syntax.length;
  };

  return { trackProps, openPicker, insert, pickerAnchor, closePicker: () => setPickerAnchor(null) };
}
