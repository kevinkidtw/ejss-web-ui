import type {
  BlockKind,
  CompileError,
  CompiledCode,
  CompiledExpr,
  DerivFn,
  RtOdePage,
  VarBag,
} from './types';

const MATH_NAMES = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'sqrt',
  'exp',
  'log',
  'pow',
  'abs',
  'floor',
  'ceil',
  'round',
  'min',
  'max',
  'hypot',
  'sign',
  'PI',
  'E',
]);

/**
 * Strips comments and string literals by replacing them with spaces of the same length,
 * so token boundaries, line counts, and offsets are preserved.
 */
function stripCommentsAndStrings(src: string): string {
  return src.replace(
    /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g,
    (m) => ' '.repeat(m.length)
  );
}

/**
 * Extracts all identifier names not preceded by '.' or '?.' property access.
 */
function extractUsedIdentifiers(stripped: string): Set<string> {
  const result = new Set<string>();
  const re = /(?<![.\w$])([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(stripped)) !== null) {
    result.add(match[1]);
  }
  return result;
}

/**
 * Detects whether an identifier `name` is assigned to in `stripped`:
 * - Postfix ++ / --
 * - Prefix ++ / --
 * - Direct or compound assignment (=, +=, -=, etc., excluding == and ===)
 */
function isAssigned(name: string, stripped: string): boolean {
  const escaped = name.replace(/\$/g, '\\$');
  // 1. Postfix: name++ or name--
  const postfix = new RegExp(`(?<![.\\w$])${escaped}\\s*(\\+\\+|--)`);
  if (postfix.test(stripped)) return true;

  // 2. Prefix: ++name or --name
  const prefix = new RegExp(`(\\+\\+|--)\\s*${escaped}(?![\\w$])`);
  if (prefix.test(stripped)) return true;

  // 3. Direct or compound assignment
  const assign = new RegExp(
    `(?<![.\\w$])${escaped}\\s*(=|\\+=|-=|\\*=|/=|%=|\\*\\*=|&=|\\|=|\\^=|<<=|>>=|>>>=|&&=|\\|\\|=|\\?\\?=)(?!=)`
  );
  if (assign.test(stripped)) return true;

  return false;
}

export function createCompiler(varNames: string[]) {
  const varSet = new Set(varNames);
  varSet.add('t');
  varSet.add('dt');

  return {
    expr(
      src: string,
      ctx: { block: BlockKind; pageId: string; item?: string }
    ): CompiledExpr | CompileError {
      const trimmed = src.trim();
      if (!trimmed) {
        return () => undefined;
      }

      const stripped = stripCommentsAndStrings(trimmed);
      const usedIdents = extractUsedIdentifiers(stripped);

      // Variables to destructure from _v
      const usedVars: string[] = [];
      for (const id of usedIdents) {
        if (varSet.has(id)) {
          usedVars.push(id);
        }
      }

      // Math aliases: used math names that do NOT collide with varNames
      const usedMath: string[] = [];
      for (const id of usedIdents) {
        if (MATH_NAMES.has(id) && !varSet.has(id)) {
          usedMath.push(id);
        }
      }

      const mathPreamble =
        usedMath.length > 0 ? `const { ${usedMath.join(', ')} } = Math;\n` : '';
      const varPreamble =
        usedVars.length > 0
          ? `var { ${usedVars.join(', ')} } = _v || {};\n`
          : '';

      const fnBody = `${mathPreamble}${varPreamble}return (${trimmed});`;

      try {
        const fn = new Function('_v', fnBody) as CompiledExpr;
        return fn;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          kind: 'compile',
          block: ctx.block,
          pageId: ctx.pageId,
          item: ctx.item,
          message,
        };
      }
    },

    code(
      src: string,
      ctx: { block: BlockKind; pageId: string; item?: string }
    ): CompiledCode | CompileError {
      const trimmed = src.trim();
      if (!trimmed) {
        return () => {};
      }

      const stripped = stripCommentsAndStrings(trimmed);
      const usedIdents = extractUsedIdentifiers(stripped);

      // Variables to destructure from _v
      const usedVars: string[] = [];
      const assignedVars: string[] = [];

      for (const id of usedIdents) {
        if (varSet.has(id)) {
          usedVars.push(id);
          if (isAssigned(id, stripped)) {
            assignedVars.push(id);
          }
        }
      }

      // Math aliases: used math names that do NOT collide with varNames
      const usedMath: string[] = [];
      for (const id of usedIdents) {
        if (MATH_NAMES.has(id) && !varSet.has(id)) {
          usedMath.push(id);
        }
      }

      const mathPreamble =
        usedMath.length > 0 ? `const { ${usedMath.join(', ')} } = Math;\n` : '';
      const varPreamble =
        usedVars.length > 0
          ? `var { ${usedVars.join(', ')} } = _v || {};\n`
          : '';

      const codeBody =
        assignedVars.length > 0
          ? `try {\n${src}\n} finally { ${assignedVars.map((v) => `_v.${v} = ${v};`).join(' ')} }`
          : `${src}`;

      const fnBody = `${mathPreamble}${varPreamble}${codeBody}`;

      try {
        const fn = new Function('_v', fnBody) as CompiledCode;
        return fn;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          kind: 'compile',
          block: ctx.block,
          pageId: ctx.pageId,
          item: ctx.item,
          message,
        };
      }
    },

    deriv(page: RtOdePage, stateNames: string[]): DerivFn | CompileError {
      const stateSet = new Set(stateNames);

      // Combine expressions to inspect used identifiers
      const allExprs = page.rates.map((r) => r.expression).join('\n');
      const stripped = stripCommentsAndStrings(allExprs);
      const usedIdents = extractUsedIdentifiers(stripped);

      // Parameters to read from _v: in varSet, but NOT in stateNames and NOT t
      const usedVars: string[] = [];
      for (const id of usedIdents) {
        if (varSet.has(id) && !stateSet.has(id) && id !== 't') {
          usedVars.push(id);
        }
      }

      // Math aliases: in MATH_NAMES, but NOT in varSet and NOT in stateSet
      const usedMath: string[] = [];
      for (const id of usedIdents) {
        if (MATH_NAMES.has(id) && !varSet.has(id) && !stateSet.has(id)) {
          usedMath.push(id);
        }
      }

      const mathPreamble =
        usedMath.length > 0 ? `const { ${usedMath.join(', ')} } = Math;\n` : '';
      const varPreamble =
        usedVars.length > 0
          ? `var { ${usedVars.join(', ')} } = _v || {};\n`
          : '';
      const tPreamble = usedIdents.has('t') ? 'const t = _t;\n' : '';
      const statePreamble =
        stateNames.length > 0
          ? `let ${stateNames.map((s, i) => `${s} = _y[${i}]`).join(', ')};\n`
          : '';

      const rateAssignments = page.rates
        .map((r) => {
          const idx = stateNames.indexOf(r.state);
          if (idx === -1) return '';
          return `_out[${idx}] = (${r.expression});`;
        })
        .filter(Boolean)
        .join('\n');

      const fnBody = `${mathPreamble}${varPreamble}${tPreamble}${statePreamble}${rateAssignments}`;

      try {
        const fn = new Function(
          '_v',
          '_t',
          '_y',
          '_out',
          fnBody
        ) as DerivFn;
        return fn;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        // Identify which rate expression failed if possible
        for (const r of page.rates) {
          try {
            new Function(
              '_v',
              '_t',
              '_y',
              `${mathPreamble}${varPreamble}${tPreamble}${statePreamble}return (${r.expression});`
            );
          } catch (rateErr: unknown) {
            return {
              kind: 'compile',
              block: 'ode',
              pageId: page.id,
              item: r.state,
              message:
                rateErr instanceof Error ? rateErr.message : String(rateErr),
            };
          }
        }
        return {
          kind: 'compile',
          block: 'ode',
          pageId: page.id,
          message,
        };
      }
    },

    eventCondition(
      src: string,
      stateNames: string[],
      ctx: { block: BlockKind; pageId: string; item?: string }
    ): ((v: VarBag, t: number, y: Float64Array) => number) | CompileError {
      const stateSet = new Set(stateNames);
      const trimmed = src.trim();
      const stripped = stripCommentsAndStrings(trimmed);
      const usedIdents = extractUsedIdentifiers(stripped);

      const usedVars: string[] = [];
      for (const id of usedIdents) {
        if (varSet.has(id) && !stateSet.has(id) && id !== 't') {
          usedVars.push(id);
        }
      }

      const usedMath: string[] = [];
      for (const id of usedIdents) {
        if (MATH_NAMES.has(id) && !varSet.has(id) && !stateSet.has(id)) {
          usedMath.push(id);
        }
      }

      const mathPreamble =
        usedMath.length > 0 ? `const { ${usedMath.join(', ')} } = Math;\n` : '';
      const varPreamble =
        usedVars.length > 0
          ? `var { ${usedVars.join(', ')} } = _v || {};\n`
          : '';
      const tPreamble = usedIdents.has('t') ? 'const t = _t;\n' : '';
      const statePreamble =
        stateNames.length > 0
          ? `let ${stateNames.map((s, i) => `${s} = _y[${i}]`).join(', ')};\n`
          : '';

      const fnBody = `${mathPreamble}${varPreamble}${tPreamble}${statePreamble}return Number(${trimmed});`;

      try {
        const fn = new Function(
          '_v',
          '_t',
          '_y',
          fnBody
        ) as (v: VarBag, t: number, y: Float64Array) => number;
        return fn;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          kind: 'compile',
          block: ctx.block,
          pageId: ctx.pageId,
          item: ctx.item,
          message,
        };
      }
    },
  };
}
