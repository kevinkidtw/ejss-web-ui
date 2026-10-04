import { describe, expect, it } from 'vitest';
import { Engine } from '../engine';
import type { RtModel } from '../types';

describe('Engine Lifecycle and Execution (Item 6)', () => {
  it('advances simulation time t exactly once per model step with multiple ODE pages', () => {
    const model: RtModel = {
      info: { title: 'Two ODE Pages' },
      variables: [
        { name: 'x', value: '0', type: 'double', scope: 'global' },
        { name: 'y', value: '0', type: 'double', scope: 'global' },
      ],
      odePages: [
        {
          id: 'ode1',
          name: 'Page 1',
          method: 'Euler',
          increment: '0.05',
          rates: [{ state: 'x', expression: '1' }],
        },
        {
          id: 'ode2',
          name: 'Page 2',
          method: 'Euler',
          increment: '0.05',
          rates: [{ state: 'y', expression: '2' }],
        },
      ],
      constraintPages: [],
      initPages: [],
      viewElements: [],
    };

    const engine = new Engine();
    const diags = engine.load(model, []);
    expect(diags.length).toBe(0);

    engine.step();
    let snap = engine.snapshot();
    expect(snap.vars.t).toBeCloseTo(0.05, 8);
    expect(snap.vars.x).toBeCloseTo(0.05, 8);
    expect(snap.vars.y).toBeCloseTo(0.1, 8);

    engine.step();
    snap = engine.snapshot();
    expect(snap.vars.t).toBeCloseTo(0.1, 8);
  });

  it('automatically pauses and generates a nan diagnostic when a variable becomes NaN/Infinity', () => {
    const model: RtModel = {
      info: { title: 'NaN Test' },
      variables: [{ name: 'x', value: '1', type: 'double', scope: 'global' }],
      odePages: [],
      constraintPages: [
        {
          id: 'c1',
          name: 'Blowup',
          code: 'x = 0 / 0;', // results in NaN
        },
      ],
      initPages: [],
      viewElements: [],
    };

    const engine = new Engine();
    engine.load(model, []);
    engine.step();

    const snap = engine.snapshot();
    expect(snap.running).toBe(false);
    const nanDiag = snap.diagnostics.find((d) => d.kind === 'nan');
    expect(nanDiag).toBeDefined();
    if (nanDiag && nanDiag.kind === 'nan') {
      expect(nanDiag.item).toBe('x');
    }
  });

  it('reports runtime diagnostics for exceptions in user constraint code without silently swallowing', () => {
    const model: RtModel = {
      info: { title: 'Runtime Exception' },
      variables: [{ name: 'a', value: '0', type: 'double', scope: 'global' }],
      odePages: [],
      constraintPages: [
        {
          id: 'c_err',
          name: 'Faulty Constraint',
          code: 'throw new Error("Explicit constraint failure");',
        },
      ],
      initPages: [],
      viewElements: [],
    };

    const engine = new Engine();
    // load executes constraints initially
    const loadDiags = engine.load(model, []);
    const runtimeDiag = loadDiags.find((d) => d.kind === 'runtime');
    expect(runtimeDiag).toBeDefined();
    expect(runtimeDiag?.message).toContain('Explicit constraint failure');
  });

  it('advance accumulator steps at rate ≈ 1/stepDt when realDt=1/60', () => {
    const stepDt = 0.01;
    const model: RtModel = {
      info: { title: 'Advance Timing' },
      variables: [{ name: 'counter', value: '0', type: 'double', scope: 'global' }],
      odePages: [
        {
          id: 'ode1',
          name: 'Counter',
          method: 'Euler',
          increment: String(stepDt),
          rates: [{ state: 'counter', expression: '1' }],
        },
      ],
      constraintPages: [],
      initPages: [],
      viewElements: [],
      runtime: { speed: 1, maxStepsPerFrame: 2000 },
    };

    const engine = new Engine();
    engine.load(model, []);

    // 60 frames of 1/60s = 1.0 real second
    const frameDt = 1 / 60;
    for (let f = 0; f < 60; f++) {
      engine.advance(frameDt);
    }

    const snap = engine.snapshot();
    // 1 real second / 0.01 stepDt = 100 steps
    expect(snap.vars.counter).toBeCloseTo(1.0, 1);
    expect(snap.vars.t).toBeCloseTo(1.0, 1);
    expect(snap.perf.stepsPerSec).toBeGreaterThanOrEqual(95);
    expect(snap.perf.stepsPerSec).toBeLessThanOrEqual(105);
    expect(snap.perf.realtimeRatio).toBeCloseTo(1.0, 1);
  });
});
