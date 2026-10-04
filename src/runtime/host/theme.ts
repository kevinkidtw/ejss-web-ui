/**
 * Centralized theme configuration for EjsS Runtime v2.
 * "Lab notebook" style with automatic light/dark adaptive grid and tick contrast.
 */

export const THEME = {
  pageBg: '#FAF8F3',
  cardBg: '#FFFFFF',
  border: '#E5E1D8',
  textInk: '#2B2D31',
  textMuted: '#6B6F76',
  primary: '#2F6FB0',
  primaryHover: '#275D94',
  teal: '#2A9D8F',
  amber: '#E9A23B',
  danger: '#D1495B',
  defaultCanvasBg: '#FFFDF8',
  gridLinesLight: 'rgba(43, 45, 49, 0.07)',
  axesLight: 'rgba(43, 45, 49, 0.22)',
  tickLabelsLight: '#6B6F76',
  gridLinesDark: 'rgba(255, 255, 255, 0.12)',
  axesDark: 'rgba(255, 255, 255, 0.35)',
  tickLabelsDark: 'rgba(255, 255, 255, 0.75)',
  plotPalette: ['#2F6FB0', '#2A9D8F', '#E9A23B', '#D1495B', '#7A5BA6', '#5C8A3A'],
  fontSans: "'Noto Sans TC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  radiusBtn: '10px',
  radiusCard: '12px',
};

const COLOR_NAMES: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',
  transparent: 'rgba(0,0,0,0)',
};

/**
 * Parses hex or rgb/rgba color string into [r, g, b] (0-255).
 */
export function parseRGB(colStr: string): [number, number, number] | null {
  if (!colStr) return null;
  const col = colStr.trim().toLowerCase();
  const hex = COLOR_NAMES[col] ?? col;

  if (hex.startsWith('#')) {
    const raw = hex.slice(1);
    if (raw.length === 3) {
      return [
        parseInt(raw[0] + raw[0], 16),
        parseInt(raw[1] + raw[1], 16),
        parseInt(raw[2] + raw[2], 16),
      ];
    }
    if (raw.length === 6 || raw.length === 8) {
      return [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ];
    }
  }

  const rgbMatch = hex.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return null;
}

/**
 * Computes sRGB relative luminance (0 to 1).
 */
export function getRelativeLuminance(colStr: string): number {
  const rgb = parseRGB(colStr);
  if (!rgb) return 1.0; // default to light if unknown
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Returns true if the color is considered dark (relative luminance < 0.4).
 */
export function isDarkColor(colStr: string): boolean {
  return getRelativeLuminance(colStr) < 0.4;
}

/**
 * Returns grid and tick styling based on background luminance.
 */
export function getGridTheme(bgColStr: string) {
  const dark = isDarkColor(bgColStr);
  return {
    isDark: dark,
    gridLine: dark ? THEME.gridLinesDark : THEME.gridLinesLight,
    axisLine: dark ? THEME.axesDark : THEME.axesLight,
    tickLabel: dark ? THEME.tickLabelsDark : THEME.tickLabelsLight,
  };
}

/**
 * Darkens a hex color by a percentage (0.0 to 1.0).
 */
export function darkenColor(col: string, percent: number): string {
  if (!col) return col;
  const c = col.trim();
  if (c.startsWith('#') && (c.length === 7 || c.length === 4)) {
    const rgb = parseRGB(c);
    if (!rgb) return col;
    const amt = Math.round(255 * percent);
    const R = Math.max(0, rgb[0] - amt);
    const G = Math.max(0, rgb[1] - amt);
    const B = Math.max(0, rgb[2] - amt);
    return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
  }
  return col;
}
