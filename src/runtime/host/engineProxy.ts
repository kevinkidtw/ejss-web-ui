import { Engine } from '../core/engine';
import type {
  Diagnostic,
  EngineApi,
  EngineSnapshot,
  FromWorker,
  RtModel,
  SampleChannel,
  ToWorker,
} from '../core/types';

export interface EngineProxy {
  readonly mode: 'worker' | 'main';
  load(
    model: RtModel,
    channels: SampleChannel[]
  ): Promise<{ diagnostics: Diagnostic[]; snapshot: EngineSnapshot }>;
  reset(): Promise<EngineSnapshot>;
  step(): Promise<EngineSnapshot>;
  advance(realDt: number): Promise<EngineSnapshot>;
  setSpeed(speed: number): void;
  setVars(patch: Record<string, unknown>): void;
  exec(code: string): void;
  exportCSV(): Promise<string>;
  terminate(): void;
}

/**
 * Main-thread engine proxy implementation.
 */
export class InlineEngineProxy implements EngineProxy {
  readonly mode = 'main' as const;
  private engine: EngineApi;

  constructor() {
    this.engine = new Engine();
  }

  async load(
    model: RtModel,
    channels: SampleChannel[]
  ): Promise<{ diagnostics: Diagnostic[]; snapshot: EngineSnapshot }> {
    const diagnostics = this.engine.load(model, channels);
    const snapshot = this.engine.snapshot();
    return { diagnostics, snapshot };
  }

  async reset(): Promise<EngineSnapshot> {
    this.engine.reset();
    return this.engine.snapshot();
  }

  async step(): Promise<EngineSnapshot> {
    this.engine.step();
    return this.engine.snapshot();
  }

  async advance(realDt: number): Promise<EngineSnapshot> {
    this.engine.advance(realDt);
    return this.engine.snapshot();
  }

  setSpeed(speed: number): void {
    this.engine.setSpeed(speed);
  }

  setVars(patch: Record<string, unknown>): void {
    this.engine.setVars(patch);
  }

  exec(code: string): void {
    this.engine.exec(code);
  }

  async exportCSV(): Promise<string> {
    return this.engine.exportCSV();
  }

  terminate(): void {
    // No-op for inline engine
  }
}

interface PendingRequest {
  expected: 'loaded' | 'snapshot' | 'csv';
  resolve: (val: unknown) => void;
  reject: (err: Error) => void;
}

/**
 * Web Worker engine proxy implementation.
 */
export class WorkerEngineProxy implements EngineProxy {
  readonly mode = 'worker' as const;
  private worker: Worker;
  private blobUrl?: string;
  private pendingQueue: PendingRequest[] = [];
  private isTerminated = false;

  constructor(worker: Worker, blobUrl?: string) {
    this.worker = worker;
    this.blobUrl = blobUrl;

    this.worker.onmessage = (e: MessageEvent<FromWorker>) => {
      this.handleMessage(e.data);
    };

    this.worker.onerror = (e: ErrorEvent) => {
      this.handleError(new Error(e.message || 'Worker runtime error'));
    };
  }

  private handleMessage(msg: FromWorker): void {
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'fatal') {
      this.handleError(new Error(msg.message));
      return;
    }

    if (msg.type === 'ready') {
      // Ready handshake handled during construction
      return;
    }

    // Match with head of pending queue
    const next = this.pendingQueue.shift();
    if (!next) return;

    if (msg.type === 'loaded' && next.expected === 'loaded') {
      next.resolve({ diagnostics: msg.diagnostics, snapshot: msg.snapshot });
    } else if (msg.type === 'snapshot' && next.expected === 'snapshot') {
      next.resolve(msg.snapshot);
    } else if (msg.type === 'csv' && next.expected === 'csv') {
      next.resolve(msg.csv);
    } else {
      next.reject(new Error(`Unexpected worker message type: ${msg.type}`));
    }
  }

  private handleError(err: Error): void {
    while (this.pendingQueue.length > 0) {
      const req = this.pendingQueue.shift();
      req?.reject(err);
    }
  }

  private post<T>(toWorker: ToWorker, expected: PendingRequest['expected']): Promise<T> {
    if (this.isTerminated) {
      return Promise.reject(new Error('Worker already terminated'));
    }
    return new Promise<T>((resolve, reject) => {
      this.pendingQueue.push({
        expected,
        resolve: (val) => resolve(val as T),
        reject,
      });
      this.worker.postMessage(toWorker);
    });
  }

  load(
    model: RtModel,
    channels: SampleChannel[]
  ): Promise<{ diagnostics: Diagnostic[]; snapshot: EngineSnapshot }> {
    return this.post({ type: 'load', model, channels }, 'loaded');
  }

  reset(): Promise<EngineSnapshot> {
    return this.post({ type: 'reset' }, 'snapshot');
  }

  step(): Promise<EngineSnapshot> {
    return this.post({ type: 'step' }, 'snapshot');
  }

  advance(realDt: number): Promise<EngineSnapshot> {
    return this.post({ type: 'advance', realDt }, 'snapshot');
  }

  setSpeed(speed: number): void {
    if (!this.isTerminated) {
      this.worker.postMessage({ type: 'setSpeed', speed });
    }
  }

  setVars(patch: Record<string, unknown>): void {
    if (!this.isTerminated) {
      this.worker.postMessage({ type: 'setVars', patch });
    }
  }

  exec(code: string): void {
    if (!this.isTerminated) {
      this.worker.postMessage({ type: 'exec', code });
    }
  }

  exportCSV(): Promise<string> {
    return this.post({ type: 'exportCSV' }, 'csv');
  }

  terminate(): void {
    this.isTerminated = true;
    this.worker.terminate();
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
    this.handleError(new Error('Worker terminated'));
  }
}

/**
 * Creates and verifies a WorkerEngineProxy.
 * Fallback-safe: rejects if Worker cannot be created or does not send 'ready' within 2000ms.
 */
export async function createWorkerProxyWithTimeout(
  timeoutMs = 2000
): Promise<WorkerEngineProxy> {
  const scriptEl = document.getElementById('ejss-runtime');
  const code = scriptEl?.textContent;
  if (!code || !code.trim()) {
    throw new Error('ejss-runtime script content not available');
  }

  let blobUrl: string | undefined;
  let worker: Worker | undefined;

  try {
    const blob = new Blob([code], { type: 'application/javascript' });
    blobUrl = URL.createObjectURL(blob);
    worker = new Worker(blobUrl);
  } catch (err) {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    throw err;
  }

  return new Promise<WorkerEngineProxy>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (worker) {
        worker.onmessage = null;
        worker.onerror = null;
      }
    };

    timer = setTimeout(() => {
      cleanup();
      worker?.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      reject(new Error('Worker ready timeout (2s)'));
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent<FromWorker>) => {
      if (e.data && e.data.type === 'ready') {
        cleanup();
        resolve(new WorkerEngineProxy(worker!, blobUrl));
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      cleanup();
      worker?.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      reject(new Error(e.message || 'Worker instantiation error'));
    };
  });
}
