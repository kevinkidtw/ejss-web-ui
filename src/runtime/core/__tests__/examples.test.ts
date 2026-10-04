import { describe, expect, it } from 'vitest';
import EXAMPLES from '../../../constants/examples';
import { Engine } from '../engine';

describe('All Built-in Examples Run 2000 Steps (Item 7)', () => {
  it('runs all examples for 2000 steps without CompileError or NaN', () => {
    expect(EXAMPLES.length).toBeGreaterThan(0);

    for (const ex of EXAMPLES) {
      const engine = new Engine();
      const diags = engine.load(ex, []);

      // 1. Verify no CompileError
      const compileErrors = diags.filter((d) => d.kind === 'compile');
      expect(
        compileErrors,
        `Compile error in example "${ex.id}" (${ex.info.title}): ${JSON.stringify(compileErrors)}`
      ).toEqual([]);

      // 2. Run 2000 model steps
      for (let s = 0; s < 2000; s++) {
        engine.step();
      }

      // 3. Verify no NaN diagnostics and variables remain valid
      const snap = engine.snapshot();
      const nanDiags = snap.diagnostics.filter((d) => d.kind === 'nan');
      expect(
        nanDiags,
        `NaN error in example "${ex.id}" (${ex.info.title}): ${JSON.stringify(nanDiags)}`
      ).toEqual([]);

      // Verify that numeric variables in bag are not NaN
      for (const [key, val] of Object.entries(snap.vars)) {
        if (typeof val === 'number') {
          expect(
            isNaN(val),
            `Variable "${key}" in example "${ex.id}" is NaN`
          ).toBe(false);
        }
      }
    }
  });
});
