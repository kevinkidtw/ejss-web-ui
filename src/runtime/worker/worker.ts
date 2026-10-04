import { Engine } from '../core/engine';
import type { FromWorker, ToWorker } from '../core/types';

export function startWorker(): void {
  const engine = new Engine();

  const post = (msg: FromWorker) => {
    self.postMessage(msg);
  };

  self.onmessage = (e: MessageEvent<ToWorker>) => {
    try {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'load': {
          const diagnostics = engine.load(data.model, data.channels);
          const snapshot = engine.snapshot();
          post({ type: 'loaded', diagnostics, snapshot });
          break;
        }
        case 'reset': {
          engine.reset();
          post({ type: 'snapshot', snapshot: engine.snapshot() });
          break;
        }
        case 'step': {
          engine.step();
          post({ type: 'snapshot', snapshot: engine.snapshot() });
          break;
        }
        case 'advance': {
          engine.advance(data.realDt);
          post({ type: 'snapshot', snapshot: engine.snapshot() });
          break;
        }
        case 'setSpeed': {
          engine.setSpeed(data.speed);
          break;
        }
        case 'setVars': {
          engine.setVars(data.patch);
          break;
        }
        case 'exec': {
          engine.exec(data.code);
          break;
        }
        case 'exportCSV': {
          const csv = engine.exportCSV();
          post({ type: 'csv', csv });
          break;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      post({ type: 'fatal', message });
    }
  };

  post({ type: 'ready' });
}
