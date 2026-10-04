export interface LayoutElement {
  id: string;
  type: string;
  name: string;
  parent?: string;
  properties: Record<string, string>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const MAIN_EL_TYPES = new Set(['Elements.DrawingPanel']);
export const CTRL_EL_TYPES = new Set([
  'Elements.Button',
  'Elements.TwoStateButton',
  'Elements.Label',
  'Elements.ParsedField',
  'Elements.Slider',
]);
export const CHART_EL_TYPES = new Set(['Elements.PlottingPanel']);

export const EL_DEF_SIZES: Record<string, [number, number]> = {
  'Elements.DrawingPanel': [400, 400],
  'Elements.PlottingPanel': [300, 200],
  'Elements.Button': [80, 32],
  'Elements.TwoStateButton': [80, 32],
  'Elements.Slider': [200, 32],
  'Elements.Label': [100, 24],
  'Elements.ParsedField': [80, 24],
};

export type ElLayout<T extends LayoutElement = LayoutElement> = {
  el: T;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function elDims(e: LayoutElement): { w: number; h: number } {
  const [defW, defH] = EL_DEF_SIZES[e.type] ?? [100, 32];
  return {
    w: e.width ?? (parseInt(e.properties.Width ?? '0', 10) || defW),
    h: e.height ?? (parseInt(e.properties.Height ?? '0', 10) || defH),
  };
}

/**
 * Lay out a group of elements. If any element has template x/y, use those
 * coordinates and normalize to (0,0). Otherwise auto-layout left-to-right.
 */
export function layoutGroup<T extends LayoutElement>(els: T[]): {
  items: ElLayout<T>[];
  panelW: number;
  panelH: number;
} {
  if (!els.length) return { items: [], panelW: 0, panelH: 0 };
  const hasCoords = els.some((e) => e.x != null);
  if (hasCoords) {
    const raw = els.map((e) => {
      const { w, h } = elDims(e);
      return { el: e, x: e.x ?? 0, y: e.y ?? 0, w, h };
    });
    const minX = Math.min(...raw.map((i) => i.x));
    const minY = Math.min(...raw.map((i) => i.y));
    const items = raw.map((i) => ({ ...i, x: i.x - minX, y: i.y - minY }));
    return {
      items,
      panelW: Math.max(...items.map((i) => i.x + i.w)),
      panelH: Math.max(...items.map((i) => i.y + i.h)),
    };
  }
  const GAP = 4;
  let curX = 0;
  let maxH = 0;
  const items = els.map((e) => {
    const { w, h } = elDims(e);
    const item = { el: e, x: curX, y: 0, w, h };
    curX += w + GAP;
    maxH = Math.max(maxH, h);
    return item;
  });
  return { items, panelW: Math.max(curX - GAP, 0), panelH: maxH };
}

export function computeSimBBox(viewElements: LayoutElement[]): { w: number; h: number } {
  const mainEls = viewElements.filter((e) => MAIN_EL_TYPES.has(e.type));
  const ctrlEls = viewElements.filter((e) => CTRL_EL_TYPES.has(e.type));
  const chartEls = viewElements.filter((e) => CHART_EL_TYPES.has(e.type));
  if (!mainEls.length && !ctrlEls.length && !chartEls.length) return { w: 400, h: 400 };

  const { panelW: mainW, panelH: mainH } = layoutGroup(mainEls);
  const { panelH: ctrlH } = layoutGroup(ctrlEls);
  const { panelW: chartW, panelH: chartH } = layoutGroup(chartEls);

  const bbW = Math.max(mainW, chartW, 200);
  return {
    w: bbW,
    h: Math.max(mainH + ctrlH + chartH, 100),
  };
}

export interface SimulationPanelLayout<T extends LayoutElement = LayoutElement> {
  bbW: number;
  bbH: number;
  mainH: number;
  ctrlH: number;
  chartH: number;
  mainItems: ElLayout<T>[];
  ctrlItems: ElLayout<T>[];
  chartItems: ElLayout<T>[];
}

export function computePanelLayout<T extends LayoutElement>(viewElements: T[]): SimulationPanelLayout<T> {
  const mainEls = viewElements.filter((e) => MAIN_EL_TYPES.has(e.type));
  const ctrlEls = viewElements.filter((e) => CTRL_EL_TYPES.has(e.type));
  const chartEls = viewElements.filter((e) => CHART_EL_TYPES.has(e.type));

  const { items: mainItems, panelW: mainW, panelH: mainH } = layoutGroup(mainEls);
  const { items: ctrlItemsRaw, panelH: ctrlH } = layoutGroup(ctrlEls);
  const { items: chartItems, panelW: chartW, panelH: chartH } = layoutGroup(chartEls);

  const bbW = Math.max(mainW, chartW, 200);
  const bbH = Math.max(mainH + ctrlH + chartH, 100);

  const ctrlCount = ctrlItemsRaw.length;
  const CTRL_GAP = 4;
  const hasCoords = ctrlEls.some((e) => e.x != null);
  const slotW = ctrlCount > 0 ? Math.floor((bbW - CTRL_GAP * (ctrlCount - 1)) / ctrlCount) : bbW;
  const ctrlItems: ElLayout<T>[] = hasCoords
    ? ctrlItemsRaw
    : ctrlItemsRaw.map((item, i) => ({
        ...item,
        x: i * (slotW + CTRL_GAP),
        w: slotW,
      }));

  return {
    bbW,
    bbH,
    mainH,
    ctrlH,
    chartH,
    mainItems,
    ctrlItems,
    chartItems,
  };
}
