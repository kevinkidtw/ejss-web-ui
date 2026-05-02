export type VarType = 'double' | 'boolean' | 'int' | 'String';

export interface SimulationVariable {
  id: string;
  name: string;
  value: string;
  type: VarType;
  comment: string;
  page: string;
  scope: 'global' | string; // 'global' or elementId
}

export interface OdeRate {
  state: string;
  expression: string;
}

export interface OdePage {
  id: string;
  name: string;
  rates: OdeRate[];
  method: 'Euler' | 'RungeKutta' | 'Verlet' | 'Fehlberg78';
  increment: string;
  comment: string;
}

export interface CodePage {
  id: string;
  name: string;
  code: string;
  comment: string;
}

export interface ViewElementProperty {
  name: string;
  value: string;
}

export interface ViewElement {
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

export interface SimulationInfo {
  title: string;
  author: string;
  keywords: string;
  abstract: string;
}

export interface SimulationState {
  info: SimulationInfo;
  variables: SimulationVariable[];
  odePages: OdePage[];
  constraintPages: CodePage[];
  initPages: CodePage[];
  viewElements: ViewElement[];
}

export type BlockCategory = 'variables' | 'ode' | 'constraints' | 'init' | 'view';
