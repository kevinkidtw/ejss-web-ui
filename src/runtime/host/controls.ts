import type { CompiledExpr, RtViewElement, VarBag } from '../core/types';
import type { EngineProxy } from './engineProxy';

export interface ControlActions {
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onRender: () => void;
}

export interface ControlsManager {
  bind(viewElements: RtViewElement[], proxy: EngineProxy, actions: ControlActions): void;
  update(viewVars: VarBag): void;
}

export function createControlsManager(
  compiledExprs: Map<string, CompiledExpr>
): ControlsManager {
  let boundElements: RtViewElement[] = [];

  function execAction(action: string | undefined, proxy: EngineProxy, actions: ControlActions) {
    if (!action) return;
    const a = action.replace(/%/g, '').trim();
    if (a === '_play' || a === '_resume') {
      actions.onPlay();
    } else if (a === '_pause') {
      actions.onPause();
    } else if (a === '_reset' || a === '_initialize') {
      actions.onReset();
    } else if (a === '_step') {
      actions.onStep();
    } else {
      proxy.exec(a);
    }
  }

  return {
    bind(viewElements: RtViewElement[], proxy: EngineProxy, actions: ControlActions) {
      boundElements = viewElements;

      viewElements.forEach((el) => {
        const p = el.properties;

        if (el.type === 'Elements.Slider') {
          const vn = p.Variable || '';
          if (!vn) return;
          const inp = document.getElementById(`slr_${el.id}`) as HTMLInputElement | null;
          const valEl = document.getElementById(`slv_${el.id}`);
          if (!inp) return;

          inp.addEventListener('input', () => {
            const num = parseFloat(inp.value);
            if (valEl) {
              valEl.textContent = num.toFixed(2);
            }
            proxy.setVars({ [vn]: num });
            actions.onRender();
          });
        } else if (el.type === 'Elements.Button') {
          const btn = document.getElementById(`btn_${el.id}`);
          if (!btn) return;
          btn.addEventListener('click', () => {
            execAction(p.OnClick, proxy, actions);
          });
        } else if (el.type === 'Elements.TwoStateButton') {
          const btn = document.getElementById(`tsb_${el.id}`);
          if (!btn) return;
          btn.addEventListener('click', () => {
            const stateVar = p.State || '_isPaused';
            const isOn = btn.dataset.state === 'true';
            proxy.setVars({ [stateVar]: !isOn });
            execAction(isOn ? p.OnClick : p.OffClick, proxy, actions);
          });
        }
      });
    },

    update(viewVars: VarBag) {
      boundElements.forEach((el) => {
        const p = el.properties;

        if (el.type === 'Elements.TwoStateButton') {
          const btn = document.getElementById(`tsb_${el.id}`);
          if (!btn) return;
          const stateVar = p.State || '_isPaused';
          const isOn = Boolean(viewVars[stateVar]);
          btn.dataset.state = String(isOn);
          btn.textContent = isOn ? '▶ 播放' : '⏸ 暫停';
          btn.style.background = isOn ? '#2A9D8F' : '#E9A23B';
        } else if (el.type === 'Elements.ParsedField') {
          const fld = document.getElementById(`pf_${el.id}`);
          if (!fld) return;
          const exprFn = compiledExprs.get(`pf:${el.id}`);
          if (exprFn) {
            try {
              const val = exprFn(viewVars);
              fld.textContent = typeof val === 'number' ? val.toFixed(2) : String(val ?? '');
            } catch {
              // ignore eval error
            }
          }
        } else if (el.type === 'Elements.Slider') {
          const vn = p.Variable || '';
          if (!vn) return;
          const inp = document.getElementById(`slr_${el.id}`) as HTMLInputElement | null;
          const valEl = document.getElementById(`slv_${el.id}`);
          if (!inp) return;
          // Only update if not currently focused by user
          if (document.activeElement !== inp && viewVars[vn] !== undefined) {
            const currentVal = Number(viewVars[vn]);
            inp.value = String(currentVal);
            if (valEl) {
              valEl.textContent = currentVal.toFixed(2);
            }
          }
        }
      });
    },
  };
}
