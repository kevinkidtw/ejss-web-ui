import type { EventKind, OdeSystem, Solver, VarBag } from './types';

export interface CompiledEvent {
  id: string;
  name: string;
  kind: EventKind;
  evalG: (v: VarBag, t: number, y: Float64Array) => number;
  actionFn: (v: VarBag) => void;
  tolerance: number;
  endStep: boolean;
}

export function checkTrigger(kind: EventKind, g0: number, g1: number): boolean {
  switch (kind) {
    case 'STATE':
      // EjsS semantics: fires when g goes from > 0 to <= 0
      return g0 > 0 && g1 <= 0;
    case 'CROSSING':
      // Fires on any sign change of g
      return (g0 > 0 && g1 <= 0) || (g0 < 0 && g1 >= 0);
    case 'POSITIVE_CROSSING':
      // Fires when g goes from < 0 to >= 0
      return g0 < 0 && g1 >= 0;
  }
}

export class EventRunner {
  readonly dim: number;
  readonly stateNames: string[];
  readonly events: CompiledEvent[];
  readonly solver: Solver;
  readonly tol: number;

  private readonly y0: Float64Array;
  private readonly y1: Float64Array;
  private readonly yTrial: Float64Array;
  private readonly yAtR: Float64Array;
  private readonly earliestEventState: Float64Array;
  private readonly g0: Float64Array;
  private readonly g1: Float64Array;

  constructor(
    dim: number,
    stateNames: string[],
    events: CompiledEvent[],
    solver: Solver,
    tol: number = 1e-8
  ) {
    this.dim = dim;
    this.stateNames = stateNames;
    this.events = events;
    this.solver = solver;
    this.tol = tol;

    this.y0 = new Float64Array(dim);
    this.y1 = new Float64Array(dim);
    this.yTrial = new Float64Array(dim);
    this.yAtR = new Float64Array(dim);
    this.earliestEventState = new Float64Array(dim);
    this.g0 = new Float64Array(events.length);
    this.g1 = new Float64Array(events.length);
  }

  /**
   * Advances y from tStart by totalDt, handling any event crossings.
   * State in bag is updated at event actions and synchronized with y.
   */
  step(
    sys: OdeSystem,
    tStart: number,
    y: Float64Array,
    totalDt: number,
    bag: VarBag,
    onWarning?: (msg: string) => void
  ): number {
    const numEvents = this.events.length;
    if (numEvents === 0) {
      this.solver.step(sys, tStart, y, totalDt, this.tol);
      this.writeStateToBag(y, bag);
      return totalDt;
    }

    let t0 = tStart;
    let dt = totalDt;
    let eventCount = 0;
    const maxEvents = 100;

    // Compute initial g0 at t0
    for (let i = 0; i < numEvents; i++) {
      this.g0[i] = this.events[i].evalG(bag, t0, y);
    }

    while (dt > 1e-12) {
      this.y0.set(y);
      this.y1.set(y);

      // Advance by dt with solver
      this.solver.step(sys, t0, this.y1, dt, this.tol);

      // Compute g1 at t0 + dt
      for (let i = 0; i < numEvents; i++) {
        this.g1[i] = this.events[i].evalG(bag, t0 + dt, this.y1);
      }

      // Check which events triggered
      const triggeredIndices: number[] = [];
      for (let i = 0; i < numEvents; i++) {
        if (checkTrigger(this.events[i].kind, this.g0[i], this.g1[i])) {
          triggeredIndices.push(i);
        }
      }

      if (triggeredIndices.length === 0) {
        // No event triggered in [t0, t0 + dt]
        y.set(this.y1);
        this.writeStateToBag(y, bag);
        break;
      }

      // Locate root for each triggered event, select the earliest
      let earliestTau = dt + 1;
      let earliestEventIdx = -1;

      for (let k = 0; k < triggeredIndices.length; k++) {
        const evIdx = triggeredIndices[k];
        const ev = this.events[evIdx];
        const rootTol = ev.tolerance > 0 ? ev.tolerance : 1e-9;

        let tL = 0;
        let tR = dt;
        this.yAtR.set(this.y1);

        for (let iter = 0; iter < 60; iter++) {
          if (tR - tL <= rootTol) break;

          const tM = 0.5 * (tL + tR);
          this.yTrial.set(this.y0);
          this.solver.step(sys, t0, this.yTrial, tM, this.tol);

          const gM = ev.evalG(bag, t0 + tM, this.yTrial);
          if (checkTrigger(ev.kind, this.g0[evIdx], gM)) {
            // Triggered at tM -> root in [tL, tM]
            tR = tM;
            this.yAtR.set(this.yTrial);
          } else {
            // Not triggered at tM -> root in [tM, tR]
            tL = tM;
          }
        }

        if (tR < earliestTau) {
          earliestTau = tR;
          earliestEventIdx = evIdx;
          this.earliestEventState.set(this.yAtR);
        }
      }

      if (earliestEventIdx === -1) {
        y.set(this.y1);
        this.writeStateToBag(y, bag);
        break;
      }

      eventCount++;
      if (eventCount > maxEvents) {
        onWarning?.('Maximum 100 events per step exceeded (possible Zeno effect)');
        y.set(this.earliestEventState);
        this.writeStateToBag(y, bag);
        break;
      }

      const ev = this.events[earliestEventIdx];
      const tEvent = t0 + earliestTau;

      // Update state at event instant
      y.set(this.earliestEventState);
      bag.t = tEvent;
      this.writeStateToBag(y, bag);

      // Execute event action (may modify bag variables)
      ev.actionFn(bag);

      // Read back state from bag
      this.readStateFromBag(y, bag);

      if (ev.endStep) {
        // End step: do not integrate remaining time
        break;
      }

      // Continue integrating remainder of dt
      const dtRem = dt - earliestTau;
      if (dtRem <= 1e-12) {
        break;
      }

      t0 = tEvent;
      dt = dtRem;

      // Recompute g0 at tEvent with state after action
      for (let i = 0; i < numEvents; i++) {
        this.g0[i] = this.events[i].evalG(bag, t0, y);
      }
    }

    return totalDt;
  }

  private writeStateToBag(y: Float64Array, bag: VarBag): void {
    for (let i = 0; i < this.stateNames.length; i++) {
      bag[this.stateNames[i]] = y[i];
    }
  }

  private readStateFromBag(y: Float64Array, bag: VarBag): void {
    for (let i = 0; i < this.stateNames.length; i++) {
      const val = bag[this.stateNames[i]];
      if (typeof val === 'number') {
        y[i] = val;
      }
    }
  }
}
