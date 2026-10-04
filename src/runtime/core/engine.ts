import { createCompiler } from './compiler';
import { EventRunner, type CompiledEvent } from './events';
import { createOdeSystem, detectPairs } from './odeSystem';
import { RingBuffer } from './ringbuffer';
import { getSolver } from './solvers';
import './physics';
import type {
  BlockKind,
  CompiledCode,
  CompiledExpr,
  DerivFn,
  Diagnostic,
  EngineApi,
  EngineSnapshot,
  OdeSystem,
  RtModel,
  SampleChannel,
  SampleDelta,
  Solver,
  VarBag,
} from './types';

interface OdeRunner {
  pageId: string;
  stateNames: string[];
  compiledIncrement: CompiledExpr;
  odeSystem: OdeSystem;
  solver: Solver;
  eventRunner: EventRunner;
  y: Float64Array;
}

interface ChannelRunner {
  channel: SampleChannel;
  compiledExprs: CompiledExpr[];
  buffer: RingBuffer<number[]>;
  lastSampleT: number;
}

interface DataLogRow {
  t: number;
  vars: Record<string, unknown>;
}

export class Engine implements EngineApi {
  private model: RtModel | null = null;
  private bag: VarBag = Object.create(null) as VarBag;
  private initialBag: VarBag = Object.create(null) as VarBag;

  private running = false;
  private speed = 1;
  private maxStepsPerFrame = 2000;
  private accumulator = 0;
  private stepCount = 0;

  private odeRunners: OdeRunner[] = [];
  private compiledInit: { id: string; fn: CompiledCode }[] = [];
  private compiledConstraints: { id: string; fn: CompiledCode }[] = [];
  private channelRunners: ChannelRunner[] = [];

  private dataLog = new RingBuffer<DataLogRow>(20000);
  private pendingDelta: SampleDelta = {};
  private diagnostics: Diagnostic[] = [];
  private reportedRuntimeErrors = new Set<string>();

  // Sliding window performance tracking
  private perfHistory: { time: number; simDt: number; realDt: number; steps: number }[] = [];
  private perfStats = { stepsPerSec: 0, realtimeRatio: 1 };

  constructor() {
    this.resetBag();
  }

  private resetBag(): void {
    this.bag = Object.create(null) as VarBag;
    this.bag.t = 0;
    this.bag.dt = 0.05;
    this.bag._isLocked = false;
    this.bag._isPaused = true;
  }

  load(model: RtModel, channels: SampleChannel[]): Diagnostic[] {
    this.model = model;
    this.speed = model.runtime?.speed ?? 1;
    this.maxStepsPerFrame = model.runtime?.maxStepsPerFrame ?? 2000;
    this.running = false;
    this.accumulator = 0;
    this.stepCount = 0;
    this.diagnostics = [];
    this.reportedRuntimeErrors.clear();
    this.perfHistory = [];
    this.perfStats = { stepsPerSec: 0, realtimeRatio: 1 };

    // 1. Initialize bag from model variables
    this.resetBag();
    this.bag._isLocked = model.isLocked ?? false;

    model.variables.forEach((v) => {
      if (v.type === 'boolean') {
        this.bag[v.name] = v.value === 'true';
      } else if (v.type === 'int') {
        this.bag[v.name] = parseInt(v.value, 10) || 0;
      } else if (v.type === 'String') {
        this.bag[v.name] = (v.value || '').replace(/^"|"$/g, '');
      } else {
        this.bag[v.name] = parseFloat(v.value) || 0;
      }
    });

    // Save initial state for reset()
    this.initialBag = this.shallowCloneBag();

    // 2. Compile pages
    const varNames = model.variables.map((v) => v.name);
    const compiler = createCompiler(varNames);
    const compileErrors: Diagnostic[] = [];

    // Compile init pages
    this.compiledInit = [];
    for (const p of model.initPages) {
      const res = compiler.code(p.code, { block: 'init', pageId: p.id });
      if (typeof res === 'function') {
        this.compiledInit.push({ id: p.id, fn: res });
      } else {
        compileErrors.push(res);
      }
    }

    // Compile constraint pages
    this.compiledConstraints = [];
    for (const p of model.constraintPages) {
      const res = compiler.code(p.code, { block: 'constraint', pageId: p.id });
      if (typeof res === 'function') {
        this.compiledConstraints.push({ id: p.id, fn: res });
      } else {
        compileErrors.push(res);
      }
    }

    // Compile ODE pages
    this.odeRunners = [];
    for (const p of model.odePages) {
      const stateNames = p.rates.map((r) => r.state);
      const derivRes = compiler.deriv(p, stateNames);
      if (typeof derivRes !== 'function') {
        compileErrors.push(derivRes);
        continue;
      }

      const incRes = compiler.expr(p.increment, {
        block: 'ode',
        pageId: p.id,
        item: 'increment',
      });
      let compiledIncrement: CompiledExpr = () => this.bag.dt || 0.05;
      if (typeof incRes === 'function') {
        compiledIncrement = incRes;
      } else {
        compileErrors.push(incRes);
      }

      const { pairs, free } = detectPairs(p.rates);
      const solverInfo = getSolver(p.method, stateNames.length);
      if (solverInfo.warning) {
        this.diagnostics.push({
          kind: 'warning',
          block: 'ode',
          pageId: p.id,
          message: solverInfo.warning,
        });
      }

      if (solverInfo.solver.needsPairs && pairs.length === 0) {
        this.diagnostics.push({
          kind: 'warning',
          block: 'ode',
          pageId: p.id,
          message: `Solver ${p.method} requires position/velocity pairs but none detected; falling back to RungeKutta`,
        });
      }

      const odeSystem = createOdeSystem(
        stateNames.length,
        derivRes as DerivFn,
        () => this.bag,
        pairs,
        free
      );

      // Compile events
      const compiledEvents: CompiledEvent[] = [];
      for (const ev of p.events || []) {
        const condRes = compiler.eventCondition(ev.condition, stateNames, {
          block: 'event',
          pageId: ev.id,
          item: 'condition',
        });
        if (typeof condRes !== 'function') {
          compileErrors.push(condRes);
          continue;
        }

        const actRes = compiler.code(ev.action, {
          block: 'action',
          pageId: ev.id,
          item: 'action',
        });
        if (typeof actRes !== 'function') {
          compileErrors.push(actRes);
          continue;
        }

        compiledEvents.push({
          id: ev.id,
          name: ev.name,
          kind: ev.kind,
          evalG: condRes,
          actionFn: actRes,
          tolerance: ev.tolerance ? parseFloat(ev.tolerance) : 1e-9,
          endStep: ev.endStep ?? false,
        });
      }

      const tol = p.tolerance ? parseFloat(p.tolerance) : 1e-8;
      const eventRunner = new EventRunner(
        stateNames.length,
        stateNames,
        compiledEvents,
        solverInfo.solver,
        tol
      );

      this.odeRunners.push({
        pageId: p.id,
        stateNames,
        compiledIncrement,
        odeSystem,
        solver: solverInfo.solver,
        eventRunner,
        y: new Float64Array(stateNames.length),
      });
    }

    // Compile channels
    this.channelRunners = [];
    this.pendingDelta = {};
    for (const ch of channels) {
      const exprFns: CompiledExpr[] = [];
      for (const e of ch.exprs) {
        const eRes = compiler.expr(e, { block: 'view', pageId: ch.id, item: e });
        if (typeof eRes === 'function') {
          exprFns.push(eRes);
        } else {
          compileErrors.push(eRes);
        }
      }
      this.channelRunners.push({
        channel: ch,
        compiledExprs: exprFns,
        buffer: new RingBuffer<number[]>(ch.capacity),
        lastSampleT: -Infinity,
      });
      this.pendingDelta[ch.id] = [];
    }

    if (compileErrors.length > 0) {
      this.diagnostics.push(...compileErrors);
      return this.diagnostics;
    }

    // 3. Execution lifecycle on load: init pages -> constraint pages
    this.runInitPages();
    this.runConstraintPages();

    // 4. Sample initial state
    this.sampleChannels();
    this.dataLog.clear();
    this.recordDataLog();

    return this.diagnostics;
  }

  reset(): void {
    // Restore variables from initialBag
    this.resetBag();
    for (const [k, v] of Object.entries(this.initialBag)) {
      this.bag[k] = this.cloneValue(v);
    }

    this.running = false;
    this.accumulator = 0;
    this.stepCount = 0;
    this.diagnostics = [];
    this.reportedRuntimeErrors.clear();

    // Re-run init pages and constraint pages
    this.runInitPages();
    this.runConstraintPages();

    // Clear and re-sample
    for (const cr of this.channelRunners) {
      cr.buffer.clear();
      cr.lastSampleT = -Infinity;
      this.pendingDelta[cr.channel.id] = [];
    }
    this.dataLog.clear();

    this.sampleChannels();
    this.recordDataLog();
  }

  step(): void {
    // 1. Pre-step constraints
    this.runConstraintPages();

    // 2. Determine stepDt: min increment across all ODE pages
    let stepDt = Number(this.bag.dt) || 0.05;
    if (this.odeRunners.length > 0) {
      let minDt = Infinity;
      for (const ode of this.odeRunners) {
        let val = Number(ode.compiledIncrement(this.bag));
        if (isNaN(val) || val <= 0) {
          val = Number(this.bag.dt) || 0.05;
        }
        if (val < minDt) minDt = val;
      }
      if (minDt < Infinity && minDt > 0) {
        stepDt = minDt;
      }
    }

    const tStart = this.bag.t;

    // 3. Advance each ODE page
    for (const ode of this.odeRunners) {
      for (let i = 0; i < ode.stateNames.length; i++) {
        const val = this.bag[ode.stateNames[i]];
        ode.y[i] = typeof val === 'number' ? val : 0;
      }

      ode.eventRunner.step(
        ode.odeSystem,
        tStart,
        ode.y,
        stepDt,
        this.bag,
        (msg) => {
          this.diagnostics.push({
            kind: 'warning',
            block: 'event',
            pageId: ode.pageId,
            message: msg,
          });
        }
      );

      for (let i = 0; i < ode.stateNames.length; i++) {
        this.bag[ode.stateNames[i]] = ode.y[i];
      }
    }

    // 4. Advance simulation time t exactly ONCE per model step
    this.bag.t = tStart + stepDt;

    // 5. Post-step constraints
    this.runConstraintPages();

    // 6. NaN / Infinity check
    for (const [k, val] of Object.entries(this.bag)) {
      if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) {
        this.running = false;
        this.diagnostics.push({
          kind: 'nan',
          block: 'ode',
          pageId: '',
          item: k,
          message: `Variable "${k}" became ${val}`,
          t: this.bag.t,
        });
        return;
      }
    }

    this.stepCount++;

    // 7. Data log
    const logInterval = Math.max(1, Math.round(0.01 / stepDt));
    if (this.stepCount % logInterval === 0) {
      this.recordDataLog();
    }

    // 8. Sampling
    this.sampleChannels();
  }

  advance(realDt: number): void {
    const effectiveRealDt = Math.max(0, Math.min(realDt, 0.25));
    this.accumulator += effectiveRealDt * this.speed;

    const stepDt = this.getStepDt();
    let n = 0;
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    while (this.accumulator >= stepDt && n < this.maxStepsPerFrame) {
      this.step();
      this.accumulator -= stepDt;
      n++;

      // If NaN or error occurred and paused, break
      if (this.diagnostics.some((d) => d.kind === 'nan')) {
        break;
      }

      // 12ms frame time budget
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - startTime > 12) {
        this.accumulator = 0; // drop excess
        break;
      }
    }

    if (n >= this.maxStepsPerFrame) {
      this.accumulator = 0; // drop excess
    }

    this.updatePerfStats(n * stepDt, effectiveRealDt, n);
  }

  setSpeed(speed: number): void {
    if (speed > 0) {
      this.speed = speed;
    }
  }

  setVars(patch: Record<string, unknown>): void {
    for (const [k, v] of Object.entries(patch)) {
      this.bag[k] = v;
    }
    this.runConstraintPages();
  }

  exec(code: string): void {
    if (!code || !code.trim()) return;
    const varNames = this.model ? this.model.variables.map((v) => v.name) : Object.keys(this.bag);
    const compiler = createCompiler(varNames);
    const res = compiler.code(code, { block: 'action', pageId: 'exec' });
    if (typeof res === 'function') {
      try {
        res(this.bag);
      } catch (err: unknown) {
        this.reportRuntimeError('action', 'exec', err);
      }
    } else {
      this.diagnostics.push(res);
    }
  }

  snapshot(): EngineSnapshot {
    const vars: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(this.bag)) {
      if (typeof val === 'function') continue;
      if (Array.isArray(val)) {
        vars[k] = val.slice();
      } else if (
        ArrayBuffer.isView(val) &&
        'slice' in val &&
        typeof (val as Float64Array).slice === 'function'
      ) {
        vars[k] = (val as Float64Array).slice();
      } else {
        vars[k] = val;
      }
    }

    const samples: SampleDelta = {};
    for (const [id, delta] of Object.entries(this.pendingDelta)) {
      samples[id] = delta.slice();
      this.pendingDelta[id] = [];
    }

    const diagnostics = this.diagnostics.slice();
    this.diagnostics = [];

    return {
      vars,
      samples,
      running: this.running,
      perf: {
        stepsPerSec: this.perfStats.stepsPerSec,
        realtimeRatio: this.perfStats.realtimeRatio,
      },
      diagnostics,
    };
  }

  exportCSV(): string {
    const gvars = this.model
      ? this.model.variables.filter((v) => v.scope === 'global')
      : [];
    const headers = ['t', ...gvars.map((v) => v.name)];
    const lines = [headers.join(',')];

    this.dataLog.forEach((row) => {
      const line = [row.t.toFixed(4)];
      for (const gv of gvars) {
        const val = row.vars[gv.name];
        if (typeof val === 'number') {
          line.push(val.toFixed(4));
        } else {
          line.push(String(val ?? ''));
        }
      }
      lines.push(line.join(','));
    });

    return lines.join('\n');
  }

  private getStepDt(): number {
    let stepDt = Number(this.bag.dt) || 0.05;
    if (this.odeRunners.length > 0) {
      let minDt = Infinity;
      for (const ode of this.odeRunners) {
        let val = Number(ode.compiledIncrement(this.bag));
        if (isNaN(val) || val <= 0) val = Number(this.bag.dt) || 0.05;
        if (val < minDt) minDt = val;
      }
      if (minDt < Infinity && minDt > 0) stepDt = minDt;
    }
    return stepDt;
  }

  private runInitPages(): void {
    for (const p of this.compiledInit) {
      try {
        p.fn(this.bag);
      } catch (err: unknown) {
        this.reportRuntimeError('init', p.id, err);
      }
    }
  }

  private runConstraintPages(): void {
    for (const p of this.compiledConstraints) {
      try {
        p.fn(this.bag);
      } catch (err: unknown) {
        this.reportRuntimeError('constraint', p.id, err);
      }
    }
  }

  private sampleChannels(): void {
    const t = this.bag.t;
    for (const cr of this.channelRunners) {
      const minInt = cr.channel.minInterval ?? 0;
      if (minInt > 0 && t - cr.lastSampleT < minInt - 1e-12) {
        continue;
      }
      cr.lastSampleT = t;

      const row: number[] = [];
      for (const expr of cr.compiledExprs) {
        const val = Number(expr(this.bag));
        row.push(isNaN(val) ? 0 : val);
      }

      cr.buffer.push(row);

      if (!this.pendingDelta[cr.channel.id]) {
        this.pendingDelta[cr.channel.id] = [];
      }
      // Flat row pushed into pending delta
      for (let i = 0; i < row.length; i++) {
        this.pendingDelta[cr.channel.id].push(row[i]);
      }
    }
  }

  private recordDataLog(): void {
    const snapshotVars: Record<string, unknown> = {};
    const gvars = this.model ? this.model.variables : [];
    for (const v of gvars) {
      snapshotVars[v.name] = this.bag[v.name];
    }
    this.dataLog.push({ t: this.bag.t, vars: snapshotVars });
  }

  private reportRuntimeError(block: BlockKind, pageId: string, err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    const key = `${block}:${pageId}:${message}`;
    if (!this.reportedRuntimeErrors.has(key)) {
      this.reportedRuntimeErrors.add(key);
      this.diagnostics.push({
        kind: 'runtime',
        block,
        pageId,
        message,
        t: this.bag.t,
      });
    }
  }

  private updatePerfStats(simDt: number, realDt: number, steps: number): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.perfHistory.push({ time: now, simDt, realDt, steps });

    // Keep entries within last 1000ms
    const cutoff = now - 1000;
    while (this.perfHistory.length > 0 && this.perfHistory[0].time < cutoff) {
      this.perfHistory.shift();
    }

    let totalSteps = 0;
    let totalSimDt = 0;
    let totalRealDt = 0;
    for (const p of this.perfHistory) {
      totalSteps += p.steps;
      totalSimDt += p.simDt;
      totalRealDt += p.realDt;
    }

    if (totalRealDt > 0) {
      this.perfStats.stepsPerSec = totalSteps / totalRealDt;
      this.perfStats.realtimeRatio = totalSimDt / totalRealDt;
    } else {
      this.perfStats.stepsPerSec = 0;
      this.perfStats.realtimeRatio = 1;
    }
  }

  private shallowCloneBag(): VarBag {
    const copy = Object.create(null) as VarBag;
    for (const [k, v] of Object.entries(this.bag)) {
      copy[k] = this.cloneValue(v);
    }
    return copy;
  }

  private cloneValue(v: unknown): unknown {
    if (Array.isArray(v)) return v.slice();
    if (
      ArrayBuffer.isView(v) &&
      'slice' in v &&
      typeof (v as Float64Array).slice === 'function'
    ) {
      return (v as Float64Array).slice();
    }
    return v;
  }
}
