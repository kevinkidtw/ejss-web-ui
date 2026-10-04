import { startHost } from './host/host';
import { startWorker } from './worker/worker';

if (typeof window === 'undefined' && typeof self !== 'undefined') {
  startWorker();
} else {
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      startHost();
    });
  } else {
    startHost();
  }
}
