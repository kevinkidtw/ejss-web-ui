import type { CompiledExpr, RtViewElement, VarBag } from '../core/types';
import type { DrawingPanelState } from './render/drawingPanel';
import { toWorldLen, toWorldX, toWorldY } from './render/drawingPanel';
import type { EngineProxy } from './engineProxy';

export interface DragHandlerOptions {
  panel: DrawingPanelState;
  elements: RtViewElement[];
  viewVars: VarBag;
  compiledExprs: Map<string, CompiledExpr>;
  proxy: EngineProxy;
  onRender: () => void;
}

type DragTarget =
  | {
      type: 'shape';
      el: RtViewElement;
      offsetX: number;
      offsetY: number;
      p: Record<string, string>;
    }
  | {
      type: 'arrow';
      el: RtViewElement;
      startX: number;
      startY: number;
      p: Record<string, string>;
    };

export function setupDragHandler(options: DragHandlerOptions): () => void {
  const { panel, elements, viewVars, compiledExprs, proxy, onRender } = options;
  const c = panel.canvas;
  let dragTarget: DragTarget | null = null;

  function evalProp(key: string, defaultVal: number): number {
    const fn = compiledExprs.get(key);
    if (!fn) return defaultVal;
    try {
      const res = fn(viewVars);
      return typeof res === 'number' ? res : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  function evalBool(key: string, defaultVal: boolean): boolean {
    const fn = compiledExprs.get(key);
    if (!fn) return defaultVal;
    try {
      return Boolean(fn(viewVars));
    } catch {
      return defaultVal;
    }
  }

  function getMouseCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = c.getBoundingClientRect();
    const touch = 'touches' in e && e.touches.length > 0 ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
    const scaleX = panel.logicalW / (rect.width || 1);
    const scaleY = panel.logicalH / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handleStart(e: MouseEvent | TouchEvent) {
    if (viewVars._isLocked) return;
    const coords = getMouseCoords(e);
    const wx = toWorldX(panel, coords.x);
    const wy = toWorldY(panel, coords.y);

    // Scan backwards to pick topmost element
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.parent && el.parent !== panel.id && el.parent !== panel.name) continue;

      const p = el.properties;
      const isVisible = p.Visible ? evalBool(`el:${el.id}:Visible`, true) : true;
      if (!isVisible) continue;

      const isDraggable = p.Draggable ? evalBool(`el:${el.id}:Draggable`, false) : false;
      if (!isDraggable) continue;

      if (el.type === 'Elements.Shape2D') {
        const sx = evalProp(`el:${el.id}:X`, 0);
        const sy = evalProp(`el:${el.id}:Y`, 0);
        const rx = evalProp(`el:${el.id}:SizeX`, 0.3);
        const ry = evalProp(`el:${el.id}:SizeY`, 0.3);

        if (Math.abs(wx - sx) <= rx && Math.abs(wy - sy) <= ry) {
          dragTarget = {
            type: 'shape',
            el,
            offsetX: wx - sx,
            offsetY: wy - sy,
            p,
          };
          e.preventDefault();
          break;
        }
      } else if (el.type === 'Elements.Arrow2D') {
        const sx = evalProp(`el:${el.id}:X`, 0);
        const sy = evalProp(`el:${el.id}:Y`, 0);
        const vx = evalProp(`el:${el.id}:SizeX`, 1);
        const vy = evalProp(`el:${el.id}:SizeY`, 0);
        const ax = sx + vx;
        const ay = sy + vy;
        const dist = Math.sqrt(Math.pow(wx - ax, 2) + Math.pow(wy - ay, 2));
        const grabDistLimit = toWorldLen(panel, 16);

        if (dist <= grabDistLimit) {
          dragTarget = {
            type: 'arrow',
            el,
            startX: sx,
            startY: sy,
            p,
          };
          e.preventDefault();
          break;
        }
      }
    }
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!dragTarget) return;
    const coords = getMouseCoords(e);
    const wx = toWorldX(panel, coords.x);
    const wy = toWorldY(panel, coords.y);
    const p = dragTarget.p;
    const patch: Record<string, unknown> = {};

    if (dragTarget.type === 'shape') {
      const newX = wx - dragTarget.offsetX;
      const newY = wy - dragTarget.offsetY;
      const xName = p.X?.trim() ?? '';
      const yName = p.Y?.trim() ?? '';
      if (xName && viewVars[xName] !== undefined) {
        viewVars[xName] = newX;
        patch[xName] = newX;
      }
      if (yName && viewVars[yName] !== undefined) {
        viewVars[yName] = newY;
        patch[yName] = newY;
      }
    } else if (dragTarget.type === 'arrow') {
      const newVx = wx - dragTarget.startX;
      const newVy = wy - dragTarget.startY;
      const sxName = p.SizeX?.trim() ?? '';
      const syName = p.SizeY?.trim() ?? '';
      if (sxName && viewVars[sxName] !== undefined) {
        viewVars[sxName] = newVx;
        patch[sxName] = newVx;
      }
      if (syName && viewVars[syName] !== undefined) {
        viewVars[syName] = newVy;
        patch[syName] = newVy;
      }
    }

    if (Object.keys(patch).length > 0) {
      proxy.setVars(patch);
    }
    onRender();
    e.preventDefault();
  }

  function handleEnd() {
    dragTarget = null;
  }

  c.addEventListener('mousedown', handleStart);
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);

  c.addEventListener('touchstart', handleStart, { passive: false });
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);

  return function cleanup() {
    c.removeEventListener('mousedown', handleStart);
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);

    c.removeEventListener('touchstart', handleStart);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);
  };
}
