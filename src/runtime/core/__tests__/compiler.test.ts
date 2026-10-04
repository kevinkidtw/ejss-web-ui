import { describe, expect, it } from 'vitest';
import { createCompiler } from '../compiler';
import type { RtOdePage, VarBag } from '../types';

describe('createCompiler', () => {
  it('handles write-back on assignment', () => {
    const compiler = createCompiler(['x', 'y', 'z']);
    const code = compiler.code('x = 10; y += 5; z++;', {
      block: 'constraint',
      pageId: 'p1',
    });
    expect(typeof code).toBe('function');
    if (typeof code === 'function') {
      const bag = { x: 1, y: 2, z: 3, t: 0, dt: 0.05 } as VarBag;
      code(bag);
      expect(bag.x).toBe(10);
      expect(bag.y).toBe(7);
      expect(bag.z).toBe(4);
    }
  });

  it('handles write-back even when user code returns early', () => {
    const compiler = createCompiler(['x', 'flag']);
    const code = compiler.code('if (flag) { x = 42; return; } x = 99;', {
      block: 'constraint',
      pageId: 'p2',
    });
    expect(typeof code).toBe('function');
    if (typeof code === 'function') {
      const bag = { x: 0, flag: true, t: 0, dt: 0.05 } as VarBag;
      code(bag);
      expect(bag.x).toBe(42);
    }
  });

  it('does NOT overwrite direct bag assignments like _v.x = ...', () => {
    const compiler = createCompiler(['x']);
    // x is referenced, but only _v.x is assigned directly
    const code = compiler.code('const old = x; _v.x = 999;', {
      block: 'constraint',
      pageId: 'p3',
    });
    expect(typeof code).toBe('function');
    if (typeof code === 'function') {
      const bag = { x: 5, t: 0, dt: 0.05 } as VarBag;
      code(bag);
      expect(bag.x).toBe(999);
    }
  });

  it('provides Math aliases automatically', () => {
    const compiler = createCompiler(['angle', 'res']);
    const code = compiler.code('res = sin(angle) + cos(angle);', {
      block: 'constraint',
      pageId: 'p4',
    });
    expect(typeof code).toBe('function');
    if (typeof code === 'function') {
      const bag = { angle: Math.PI / 4, res: 0, t: 0, dt: 0.05 } as VarBag;
      code(bag);
      expect(bag.res).toBeCloseTo(Math.SQRT2, 10);
    }
  });

  it('does NOT alias Math when variable name conflicts with Math function (e.g. sin)', () => {
    const compiler = createCompiler(['sin', 'y']);
    const code = compiler.code('y = sin * 2;', {
      block: 'constraint',
      pageId: 'p5',
    });
    expect(typeof code).toBe('function');
    if (typeof code === 'function') {
      const bag = { sin: 7, y: 0, t: 0, dt: 0.05 } as VarBag;
      code(bag);
      expect(bag.y).toBe(14);
    }
  });

  it('returns CompileError on syntax errors instead of throwing', () => {
    const compiler = createCompiler(['x']);
    const codeErr = compiler.code('x = ;', {
      block: 'constraint',
      pageId: 'p_err',
    });
    expect(typeof codeErr).not.toBe('function');
    if (typeof codeErr !== 'function') {
      expect(codeErr.kind).toBe('compile');
      expect(codeErr.block).toBe('constraint');
      expect(codeErr.pageId).toBe('p_err');
      expect(codeErr.message).toBeDefined();
    }

    const exprErr = compiler.expr('+++', {
      block: 'view',
      pageId: 'v_err',
      item: 'test',
    });
    expect(typeof exprErr).not.toBe('function');
    if (typeof exprErr !== 'function') {
      expect(exprErr.kind).toBe('compile');
      expect(exprErr.block).toBe('view');
      expect(exprErr.pageId).toBe('v_err');
      expect(exprErr.item).toBe('test');
    }
  });

  it('compiles expr successfully', () => {
    const compiler = createCompiler(['a', 'b']);
    const expr = compiler.expr('a * b + sin(0)', {
      block: 'view',
      pageId: 'v1',
    });
    expect(typeof expr).toBe('function');
    if (typeof expr === 'function') {
      const bag = { a: 3, b: 4, t: 0, dt: 0.05 } as VarBag;
      expect(expr(bag)).toBe(12);
    }
  });

  it('compiles deriv function and reads state variables from y array without writing to bag', () => {
    const compiler = createCompiler(['g', 'L']);
    const page: RtOdePage = {
      id: 'ode1',
      name: 'Pendulum',
      method: 'RungeKutta',
      increment: '0.05',
      rates: [
        { state: 'theta', expression: 'omega' },
        { state: 'omega', expression: '-(g / L) * sin(theta)' },
      ],
    };
    const derivFn = compiler.deriv(page, ['theta', 'omega']);
    expect(typeof derivFn).toBe('function');
    if (typeof derivFn === 'function') {
      const bag = { g: 9.8, L: 2, t: 0, dt: 0.05 } as VarBag;
      const y = new Float64Array([Math.PI / 6, 1.5]);
      const out = new Float64Array(2);
      derivFn(bag, 0, y, out);
      expect(out[0]).toBe(1.5);
      expect(out[1]).toBeCloseTo(-(9.8 / 2) * Math.sin(Math.PI / 6), 10);
      // Ensure bag is not mutated
      expect(bag.g).toBe(9.8);
      expect(bag.L).toBe(2);
      expect((bag as Record<string, unknown>).theta).toBeUndefined();
    }
  });
});
