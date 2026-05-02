import { create } from 'zustand';
import type { SimulationState, SimulationVariable, OdePage, CodePage, ViewElement, OdeRate } from '../types/simulation';

const DEFAULT_STATE: SimulationState = {
  info: { title: '新模擬', author: '', keywords: '', abstract: '' },
  variables: [],
  odePages: [],
  constraintPages: [],
  initPages: [],
  viewElements: [],
};

interface SimulationStore extends SimulationState {
  selectedElementId: string | null;
  setSelectedElement: (id: string | null) => void;
  activeBackdrop: string | null;
  setActiveBackdrop: (id: string | null) => void;

  // State actions
  loadState: (state: SimulationState) => void;
  resetState: () => void;

  // Variable actions
  addVariable: (v: Omit<SimulationVariable, 'id'>) => void;
  updateVariable: (id: string, patch: Partial<SimulationVariable>) => void;
  removeVariable: (id: string) => void;

  // ODE actions
  addOdePage: () => void;
  updateOdePage: (id: string, patch: Partial<OdePage>) => void;
  addOdeRate: (pageId: string) => void;
  updateOdeRate: (pageId: string, index: number, patch: Partial<OdeRate>) => void;
  removeOdeRate: (pageId: string, index: number) => void;
  removeOdePage: (id: string) => void;

  // Constraint/Init actions
  addConstraintPage: () => void;
  updateConstraintPage: (id: string, patch: Partial<CodePage>) => void;
  removeConstraintPage: (id: string) => void;
  addInitPage: () => void;
  updateInitPage: (id: string, patch: Partial<CodePage>) => void;
  removeInitPage: (id: string) => void;

  // View actions
  addViewElement: (el: Omit<ViewElement, 'id'>) => void;
  updateViewElement: (id: string, patch: Partial<ViewElement>) => void;
  removeViewElement: (id: string) => void;
}

let idCounter = 0;
const uid = () => `id_${Date.now()}_${++idCounter}`;

export const useSimulationStore = create<SimulationStore>((set) => ({
  ...DEFAULT_STATE,
  selectedElementId: null,
  setSelectedElement: (id) => set({ selectedElementId: id }),
  activeBackdrop: null,
  setActiveBackdrop: (id) => set({ activeBackdrop: id }),

  loadState: (state) => set({ ...state }),
  resetState: () => set({ ...DEFAULT_STATE, selectedElementId: null, activeBackdrop: null }),

  addVariable: (v) =>
    set((s) => ({ variables: [...s.variables, { ...v, scope: v.scope ?? 'global', id: uid() }] })),
  updateVariable: (id, patch) =>
    set((s) => ({ variables: s.variables.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
  removeVariable: (id) =>
    set((s) => ({ variables: s.variables.filter((v) => v.id !== id) })),

  addOdePage: () =>
    set((s) => ({
      odePages: [
        ...s.odePages,
        { id: uid(), name: `方程式 ${s.odePages.length + 1}`, rates: [], method: 'RungeKutta', increment: 'dt', comment: '' },
      ],
    })),
  updateOdePage: (id, patch) =>
    set((s) => ({ odePages: s.odePages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  addOdeRate: (pageId) =>
    set((s) => ({
      odePages: s.odePages.map((p) =>
        p.id === pageId ? { ...p, rates: [...p.rates, { state: '', expression: '' }] } : p
      ),
    })),
  updateOdeRate: (pageId, index, patch) =>
    set((s) => ({
      odePages: s.odePages.map((p) =>
        p.id === pageId
          ? { ...p, rates: p.rates.map((r, i) => (i === index ? { ...r, ...patch } : r)) }
          : p
      ),
    })),
  removeOdeRate: (pageId, index) =>
    set((s) => ({
      odePages: s.odePages.map((p) =>
        p.id === pageId ? { ...p, rates: p.rates.filter((_, i) => i !== index) } : p
      ),
    })),
  removeOdePage: (id) =>
    set((s) => ({ odePages: s.odePages.filter((p) => p.id !== id) })),

  addConstraintPage: () =>
    set((s) => ({
      constraintPages: [
        ...s.constraintPages,
        { id: uid(), name: `約束 ${s.constraintPages.length + 1}`, code: '', comment: '' },
      ],
    })),
  updateConstraintPage: (id, patch) =>
    set((s) => ({ constraintPages: s.constraintPages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removeConstraintPage: (id) =>
    set((s) => ({ constraintPages: s.constraintPages.filter((p) => p.id !== id) })),

  addInitPage: () =>
    set((s) => ({
      initPages: [
        ...s.initPages,
        { id: uid(), name: `初始化 ${s.initPages.length + 1}`, code: '', comment: '' },
      ],
    })),
  updateInitPage: (id, patch) =>
    set((s) => ({ initPages: s.initPages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  removeInitPage: (id) =>
    set((s) => ({ initPages: s.initPages.filter((p) => p.id !== id) })),

  addViewElement: (el) =>
    set((s) => ({ viewElements: [...s.viewElements, { ...el, id: uid() }] })),
  updateViewElement: (id, patch) =>
    set((s) => ({ viewElements: s.viewElements.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  removeViewElement: (id) =>
    set((s) => ({ viewElements: s.viewElements.filter((e) => e.id !== id) })),
}));
