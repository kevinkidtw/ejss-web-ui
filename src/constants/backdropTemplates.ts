import type { ViewElement } from '../types/simulation';

export interface BackdropTemplate {
  id: string;
  label: string;
  description: string;
  preview: string;
  elements: Omit<ViewElement, 'id'>[];
}

let _n = 0;
const mk = (overrides: Omit<ViewElement, 'id'>): Omit<ViewElement, 'id'> => overrides;

export const BACKDROP_TEMPLATES: BackdropTemplate[] = [
  {
    id: '01_SingleDrawing',
    label: '單一繪圖面板',
    description: '一個 400×400 繪圖畫布＋控制列',
    preview: '/backdrops/01_SingleDrawing.gif',
    elements: [
      mk({ type: 'Elements.DrawingPanel', name: 'drawingPanel', parent: '', properties: { Width: '400', Height: '400', MinimumX: '-5', MaximumX: '5', MinimumY: '-5', MaximumY: '5' }, x: 20, y: 20, width: 400, height: 400 }),
      mk({ type: 'Elements.TwoStateButton', name: 'runPauseButton', parent: '', properties: { State: '_isPaused', OnClick: '%_play%', OffClick: '%_pause%', Tooltip: '"Play/Pause"' }, x: 20, y: 440, width: 80, height: 36 }),
      mk({ type: 'Elements.Button', name: 'resetButton', parent: '', properties: { Text: '"重置"', OnClick: '%_reset%' }, x: 110, y: 440, width: 80, height: 36 }),
    ],
  },
  {
    id: '02_SinglePlot',
    label: '單一圖表面板',
    description: '一個 400×300 折線圖表＋控制列',
    preview: '/backdrops/02_SinglePlot.gif',
    elements: [
      mk({ type: 'Elements.PlottingPanel', name: 'plottingPanel', parent: '', properties: { Width: '400', Height: '300', Title: '"圖表"', AutoScaleX: 'true', AutoScaleY: 'true' }, x: 20, y: 20, width: 400, height: 300 }),
      mk({ type: 'Elements.TwoStateButton', name: 'runPauseButton', parent: '', properties: { State: '_isPaused', OnClick: '%_play%', OffClick: '%_pause%', Tooltip: '"Play/Pause"' }, x: 20, y: 340, width: 80, height: 36 }),
      mk({ type: 'Elements.Button', name: 'resetButton', parent: '', properties: { Text: '"重置"', OnClick: '%_reset%' }, x: 110, y: 340, width: 80, height: 36 }),
    ],
  },
  {
    id: '03_Drawing3DPanel',
    label: '3D 繪圖面板',
    description: '一個 3D 顯示面板（需要 Display3D 元件）',
    preview: '/backdrops/03_Drawing3DPanel.gif',
    elements: [
      mk({ type: 'Elements.DrawingPanel', name: 'drawingPanel', parent: '', properties: { Width: '400', Height: '400', MinimumX: '-5', MaximumX: '5', MinimumY: '-5', MaximumY: '5' }, x: 20, y: 20, width: 400, height: 400 }),
      mk({ type: 'Elements.TwoStateButton', name: 'runPauseButton', parent: '', properties: { State: '_isPaused', OnClick: '%_play%', OffClick: '%_pause%' }, x: 20, y: 440, width: 80, height: 36 }),
    ],
  },
  {
    id: '10_ThreePanels',
    label: '三面板佈局',
    description: '繪圖面板 + 兩個圖表，並排顯示',
    preview: '/backdrops/10_ThreePanels.gif',
    elements: [
      mk({ type: 'Elements.DrawingPanel',  name: 'drawingPanel',   parent: '', properties: { Width: '300', Height: '300', MinimumX: '-5', MaximumX: '5', MinimumY: '-5', MaximumY: '5' }, x: 20,  y: 20, width: 300, height: 300 }),
      mk({ type: 'Elements.PlottingPanel', name: 'plottingPanel',  parent: '', properties: { Width: '300', Height: '300', AutoScaleX: 'true', AutoScaleY: 'true' }, x: 340, y: 20, width: 300, height: 300 }),
      mk({ type: 'Elements.PlottingPanel', name: 'plottingPanel2', parent: '', properties: { Width: '300', Height: '300', AutoScaleX: 'true', AutoScaleY: 'true' }, x: 660, y: 20, width: 300, height: 300 }),
      mk({ type: 'Elements.TwoStateButton', name: 'runPauseButton', parent: '', properties: { State: '_isPaused', OnClick: '%_play%', OffClick: '%_pause%' }, x: 20, y: 340, width: 80, height: 36 }),
      mk({ type: 'Elements.Button', name: 'resetButton', parent: '', properties: { Text: '"重置"', OnClick: '%_reset%' }, x: 110, y: 340, width: 80, height: 36 }),
    ],
  },
  {
    id: '20_ControlPanel',
    label: '控制面板',
    description: '帶播放/暫停/重置控制列 + 時間顯示',
    preview: '/backdrops/20_ControlPanel.gif',
    elements: [
      mk({ type: 'Elements.TwoStateButton', name: 'playPauseButton', parent: '', properties: { State: '_isPaused', OnClick: '%_play%', OffClick: '%_pause%', Tooltip: '"Play/Pause"' }, x: 20, y: 20, width: 80, height: 36 }),
      mk({ type: 'Elements.Button', name: 'stepButton', parent: '', properties: { Text: '"步進"', OnClick: '%_step%' }, x: 110, y: 20, width: 80, height: 36 }),
      mk({ type: 'Elements.Button', name: 'initButton', parent: '', properties: { Text: '"初始化"', OnClick: '%_initialize%' }, x: 200, y: 20, width: 80, height: 36 }),
      mk({ type: 'Elements.Button', name: 'resetButton', parent: '', properties: { Text: '"重置"', OnClick: '%_reset%' }, x: 290, y: 20, width: 80, height: 36 }),
      mk({ type: 'Elements.Label',       name: 'timeLabel', parent: '', properties: { Text: '"時間:"' }, x: 380, y: 20, width: 60, height: 36 }),
      mk({ type: 'Elements.ParsedField', name: 'timeField', parent: '', properties: { Value: '0', Format: '"0.00"', Editable: 'false' }, x: 440, y: 20, width: 80, height: 36 }),
    ],
  },
];
// suppress unused var from the counter helper
void _n;
