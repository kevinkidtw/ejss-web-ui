/**
 * EjsS Runtime v2 — core contracts.
 *
 * This file is the single source of truth shared by:
 *   - core/   (pure engine: compiler, solvers, events, loop) — NO DOM access
 *   - host/   (iframe main thread: rendering, controls, worker proxy)
 *   - worker/ (Web Worker entry that runs the Engine off the main thread)
 *
 * Do NOT import anything from React / the editor here.
 */

// ─────────────────────────────────────────────────────────────────────
// Model (serialized from the editor's SimulationState and injected into the iframe)
// ─────────────────────────────────────────────────────────────────────

export type VarType = 'double' | 'boolean' | 'int' | 'String';

export interface RtVariable {
  name: string;
  value: string;
  type: VarType;
  scope: 'global' | string;
}

/** Integration methods. Legacy names ('RungeKutta', 'Verlet') must stay accepted. */
export type SolverMethod =
  | 'Euler'
  | 'EulerCromer'
  | 'Verlet'        // = velocity Verlet (legacy name kept for .ejss compatibility)
  | 'RungeKutta'    // = classic RK4 (legacy name)
  | 'RK45'          // Dormand–Prince 5(4), adaptive
  | 'Fehlberg78'    // Runge–Kutta–Fehlberg 7(8), adaptive
  | 'Yoshida4';     // 4th-order symplectic

export type EventKind =
  | 'STATE'              // EjsS semantics: fires when g goes from > 0 to <= 0
  | 'CROSSING'           // fires on any sign change of g
  | 'POSITIVE_CROSSING'; // fires when g goes from < 0 to >= 0

export interface RtOdeEvent {
  id: string;
  name: string;
  kind: EventKind;
  /** Expression for g(state). */
  condition: string;
  /** Code executed at the event instant (may modify state variables). */
  action: string;
  /** Time tolerance for root location (default 1e-9). */
  tolerance?: string;
  /** If true, the remainder of the step is NOT integrated after the event (EjsS "end step"). */
  endStep?: boolean;
}

export interface RtOdePage {
  id: string;
  name: string;
  rates: { state: string; expression: string }[];
  method: SolverMethod;
  increment: string;
  /** Absolute/relative tolerance for adaptive methods (default 1e-8). */
  tolerance?: string;
  events?: RtOdeEvent[];
}

export interface RtCodePage {
  id: string;
  name: string;
  code: string;
}

export interface RtViewElement {
  id: string;
  type: string;
  name: string;
  parent: string;
  properties: Record<string, string>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type ExecutionMode = 'auto' | 'worker' | 'main';

export interface RtModel {
  info: { title: string; author?: string; keywords?: string; abstract?: string };
  variables: RtVariable[];
  odePages: RtOdePage[];
  constraintPages: RtCodePage[];
  initPages: RtCodePage[];
  viewElements: RtViewElement[];
  isLocked?: boolean;
  /** Execution options (all optional). */
  runtime?: {
    mode?: ExecutionMode;   // default 'auto' → worker if available, else main thread
    speed?: number;         // sim-seconds per real-second, default 1
    maxStepsPerFrame?: number; // default 2000
  };
}

// ─────────────────────────────────────────────────────────────────────
// Variable bag
// ─────────────────────────────────────────────────────────────────────

/**
 * The variable bag. Plain object (Object.create(null)), keyed by variable name.
 * User code may also store arbitrary private data on it (e.g. `_v._px = []`).
 * Always contains `t` and `dt`.
 */
export type VarBag = Record<string, unknown> & { t: number; dt: number };

// ─────────────────────────────────────────────────────────────────────
// Compiler
// ─────────────────────────────────────────────────────────────────────

export type BlockKind = 'ode' | 'event' | 'constraint' | 'init' | 'view' | 'action';

export interface CompileError {
  kind: 'compile';
  block: BlockKind;
  pageId: string;
  /** e.g. rate state name, event name, view property name */
  item?: string;
  message: string;
}

export type CompiledExpr = (v: VarBag) => unknown;
export type CompiledCode = (v: VarBag) => void;

/**
 * Derivative function for one ODE page.
 * Reads parameters from `v`, state values from `y`, writes dy/dt into `out`.
 * MUST NOT write into `v` (pure w.r.t. the bag) so that solvers can call it at trial states.
 */
export type DerivFn = (v: VarBag, t: number, y: Float64Array, out: Float64Array) => void;

// ─────────────────────────────────────────────────────────────────────
// Solvers
// ─────────────────────────────────────────────────────────────────────

export interface OdeSystem {
  dim: number;
  /** Evaluate derivatives. */
  f: (t: number, y: Float64Array, out: Float64Array) => void;
  /**
   * For symplectic / Verlet-family methods: index pairs [posIndex, velIndex]
   * where dy[pos]/dt == y[vel] exactly. Empty when not applicable.
   */
  pairs: [number, number][];
  /** Indices not covered by `pairs` (integrated with RK4 inside split methods). */
  free: number[];
}

export interface StepResult {
  /** Time actually advanced (adaptive methods always reach the requested dt via sub-steps). */
  dtTaken: number;
  /** Suggested next internal step for adaptive methods (0 for fixed-step methods). */
  dtNext: number;
  /** Number of f() evaluations (for diagnostics/benchmarks). */
  evals: number;
}

export interface Solver {
  readonly name: SolverMethod;
  readonly order: number;
  readonly adaptive: boolean;
  /** True for methods that require position/velocity pairs. */
  readonly needsPairs: boolean;
  /**
   * Advance y (in place) from t to t+dt.
   * Adaptive solvers sub-step internally with error control (tol) and must land exactly on t+dt.
   */
  step(sys: OdeSystem, t: number, y: Float64Array, dt: number, tol: number): StepResult;
}

// ─────────────────────────────────────────────────────────────────────
// Diagnostics
// ─────────────────────────────────────────────────────────────────────

export interface RuntimeErrorInfo {
  kind: 'runtime' | 'nan';
  block: BlockKind;
  pageId: string;
  item?: string;
  message: string;
  t: number;
}

export type Diagnostic = CompileError | RuntimeErrorInfo | {
  kind: 'warning';
  block: BlockKind;
  pageId: string;
  message: string;
};

export interface PerfStats {
  /** Model steps executed during the last second. */
  stepsPerSec: number;
  /** Achieved sim-time / requested sim-time over the last second (1 = real time). */
  realtimeRatio: number;
  /** Rendered frames during the last second (host only). */
  fps: number;
}

// ─────────────────────────────────────────────────────────────────────
// Sampling channels (trails, plots, CSV) — sampled in the engine, not in render
// ─────────────────────────────────────────────────────────────────────

export interface SampleChannel {
  /** Unique id, e.g. `trail:<elementId>` or `plot:<elementId>`. */
  id: string;
  /** Expressions sampled together (e.g. [X, Y] for a trail, [AxisX, ...AxisY] for a plot). */
  exprs: string[];
  /** Ring buffer capacity (points). */
  capacity: number;
  /** Minimum sim-time between samples (0 = every model step). */
  minInterval?: number;
}

/** New samples since the last snapshot, per channel: flat array of rows (row length = exprs.length). */
export type SampleDelta = Record<string, number[]>;

// ─────────────────────────────────────────────────────────────────────
// Engine API (implemented by core/engine.ts; used directly on main thread or wrapped by the worker)
// ─────────────────────────────────────────────────────────────────────

export interface EngineSnapshot {
  /** Plain-data copy of the bag (structured-clone safe: numbers, strings, booleans, arrays, typed arrays). */
  vars: Record<string, unknown>;
  samples: SampleDelta;
  running: boolean;
  perf: Pick<PerfStats, 'stepsPerSec' | 'realtimeRatio'>;
  diagnostics: Diagnostic[];
}

export interface EngineApi {
  /** (Re)load a model: compiles everything, resets vars, runs init pages + fixed relations. */
  load(model: RtModel, channels: SampleChannel[]): Diagnostic[];
  reset(): void;
  /** Exactly one model step (fixed relations → ODE pages with events → fixed relations → sampling). */
  step(): void;
  /**
   * Advance by real elapsed time using a fixed-step accumulator:
   *   acc += min(realDt, 0.25) * speed; while (acc >= stepDt && n < maxSteps) { step(); acc -= stepDt; }
   * If maxSteps is hit, the excess is dropped (sim runs slower than real time; realtimeRatio < 1).
   */
  advance(realDt: number): void;
  setSpeed(speed: number): void;
  setVars(patch: Record<string, unknown>): void;
  /** Execute arbitrary user code against the bag (Button OnClick etc.). */
  exec(code: string): void;
  /** Collect a snapshot and clear the pending sample deltas & diagnostics. */
  snapshot(): EngineSnapshot;
  /** CSV of the data log (t + global variables). */
  exportCSV(): string;
}

// ─────────────────────────────────────────────────────────────────────
// Host ⇄ Worker protocol
// ─────────────────────────────────────────────────────────────────────

export type ToWorker =
  | { type: 'load'; model: RtModel; channels: SampleChannel[] }
  | { type: 'reset' }
  | { type: 'step' }
  | { type: 'advance'; realDt: number }
  | { type: 'setSpeed'; speed: number }
  | { type: 'setVars'; patch: Record<string, unknown> }
  | { type: 'exec'; code: string }
  | { type: 'exportCSV' };

export type FromWorker =
  | { type: 'ready' }
  | { type: 'loaded'; diagnostics: Diagnostic[]; snapshot: EngineSnapshot }
  | { type: 'snapshot'; snapshot: EngineSnapshot }
  | { type: 'csv'; csv: string }
  | { type: 'fatal'; message: string };

// ─────────────────────────────────────────────────────────────────────
// Iframe ⇄ Editor (parent window) protocol
// ─────────────────────────────────────────────────────────────────────

/** Legacy string commands ('play' | 'pause' | 'reset' | 'step' | 'exportCSV') remain supported. */
export type ToIframe =
  | 'play' | 'pause' | 'reset' | 'step' | 'exportCSV'
  | { type: 'ejss:setSpeed'; speed: number }
  | { type: 'ejss:setVars'; patch: Record<string, unknown> };

export type FromIframe =
  | { type: 'csvData'; csv: string; title: string }
  | { type: 'ejss:diagnostics'; diagnostics: Diagnostic[] }
  | { type: 'ejss:status'; running: boolean; t: number; perf: PerfStats; mode: 'worker' | 'main' };
