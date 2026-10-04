import type { Solver, SolverMethod } from '../types';
import { EulerSolver } from './euler';
import { EulerCromerSolver } from './eulerCromer';
import { Rk4Solver } from './rk4';
import { Rk45Solver } from './rk45';
import { Rkf78Solver } from './rkf78';
import { VerletSolver } from './verlet';
import { Yoshida4Solver } from './yoshida4';

export { EulerSolver } from './euler';
export { EulerCromerSolver } from './eulerCromer';
export { Rk4Solver } from './rk4';
export { Rk45Solver } from './rk45';
export { Rkf78Solver } from './rkf78';
export { VerletSolver } from './verlet';
export { Yoshida4Solver } from './yoshida4';

export function getSolver(
  method: SolverMethod | string,
  dim: number
): { solver: Solver; warning?: string } {
  switch (method) {
    case 'Euler':
      return { solver: new EulerSolver(dim) };
    case 'EulerCromer':
      return { solver: new EulerCromerSolver(dim) };
    case 'Verlet':
      return { solver: new VerletSolver(dim) };
    case 'RungeKutta':
      return { solver: new Rk4Solver(dim) };
    case 'RK45':
      return { solver: new Rk45Solver(dim) };
    case 'Fehlberg78':
      return { solver: new Rkf78Solver(dim) };
    case 'Yoshida4':
      return { solver: new Yoshida4Solver(dim) };
    default:
      return {
        solver: new Rk4Solver(dim),
        warning: `Unknown solver method "${method}", falling back to RungeKutta`,
      };
  }
}
