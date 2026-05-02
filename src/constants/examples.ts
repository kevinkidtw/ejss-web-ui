import type { SimulationState } from '../types/simulation';

const EXAMPLES: (SimulationState & { id: string; description: string; difficulty: '入門' | '基礎' | '進階' })[] = [
  // ─────────────────────────────────────────────
  // 1. 簡諧運動
  // ─────────────────────────────────────────────
  {
    id: 'shm',
    description: '彈簧與質點的來回振盪，觀察位置、速度與能量之間的轉換關係。',
    difficulty: '入門',
    info: { title: '簡諧運動', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'shm-x',  name: 'x',  value: '2',   type: 'double', comment: '質點位置（公尺）', page: 'Variables', scope: 'global' },
      { id: 'shm-vx', name: 'vx', value: '0',   type: 'double', comment: '質點速度（公尺/秒）', page: 'Variables', scope: 'global' },
      { id: 'shm-k',  name: 'k',  value: '8',   type: 'double', comment: '彈簧係數（N/m）', page: 'Variables', scope: 'global' },
      { id: 'shm-m',  name: 'm',  value: '1',   type: 'double', comment: '質量（kg）', page: 'Variables', scope: 'global' },
      { id: 'shm-F',  name: 'F',  value: '0',   type: 'double', comment: '彈力（N）', page: 'Variables', scope: 'global' },
      { id: 'shm-E',  name: 'E',  value: '0',   type: 'double', comment: '總機械能（J）', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'shm-ode', name: '運動方程', method: 'RungeKutta', increment: '0.02', comment: '',
      rates: [
        { state: 'x',  expression: 'vx' },
        { state: 'vx', expression: '-k * x / m' },
      ],
    }],
    constraintPages: [{
      id: 'shm-con', name: '計算能量與力', comment: '',
      code: 'F = -k * x;\nE = 0.5 * m * vx * vx + 0.5 * k * x * x;',
    }],
    initPages: [],
    viewElements: [
      {
        id: 'shm-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '400', Height: '300', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"white"', SquareAspect: 'false' },
      },
      {
        id: 'shm-trail', type: 'Elements.Trail2D', name: 'Trail1', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', LineColor: '"#94a3b8"', MaximumPoints: '300' },
      },
      {
        id: 'shm-arrow', type: 'Elements.Arrow2D', name: '彈力箭頭', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', SizeX: 'F * 0.15', SizeY: '0', FillColor: '"#ef4444"' },
      },
      {
        id: 'shm-ball', type: 'Elements.Shape2D', name: '質點', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', SizeX: '0.3', SizeY: '0.3', ShapeType: 'ELLIPSE', FillColor: '"#3b82f6"', LineColor: '"#1e40af"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. 單擺
  // ─────────────────────────────────────────────
  {
    id: 'pendulum',
    description: '以角度為變數描述單擺運動，可調整初始擺角，觀察大角度與小角度的差異。',
    difficulty: '入門',
    info: { title: '單擺', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'pen-theta', name: 'theta', value: '1.2',  type: 'double', comment: '擺角（弧度）', page: 'Variables', scope: 'global' },
      { id: 'pen-omega', name: 'omega', value: '0',    type: 'double', comment: '角速度（弧度/秒）', page: 'Variables', scope: 'global' },
      { id: 'pen-L',     name: 'L',     value: '2.5',  type: 'double', comment: '擺長（公尺）', page: 'Variables', scope: 'global' },
      { id: 'pen-g',     name: 'g',     value: '9.8',  type: 'double', comment: '重力加速度', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'pen-ode', name: '擺動方程', method: 'RungeKutta', increment: '0.01', comment: '',
      rates: [
        { state: 'theta', expression: 'omega' },
        { state: 'omega', expression: '-(g / L) * Math.sin(theta)' },
      ],
    }],
    constraintPages: [],
    initPages: [],
    viewElements: [
      {
        id: 'pen-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '400', Height: '350', MinimumX: '-3', MaximumX: '3', MinimumY: '-3', MaximumY: '1.2', Background: '"#f8fafc"', SquareAspect: 'true' },
      },
      {
        id: 'pen-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'L * Math.sin(theta)', Y: '-L * Math.cos(theta)', LineColor: '"#94a3b8"', MaximumPoints: '400' },
      },
      {
        id: 'pen-rod', type: 'Elements.Arrow2D', name: '擺桿', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: 'L * Math.sin(theta)', SizeY: '-L * Math.cos(theta)', FillColor: '"#475569"' },
      },
      {
        id: 'pen-pivot', type: 'Elements.Shape2D', name: '支點', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '0.08', SizeY: '0.08', ShapeType: 'ELLIPSE', FillColor: '"#1e293b"', LineColor: '"#1e293b"', Visible: 'true' },
      },
      {
        id: 'pen-bob', type: 'Elements.Shape2D', name: '擺錘', parent: 'DrawingPanel1',
        properties: { X: 'L * Math.sin(theta)', Y: '-L * Math.cos(theta)', SizeX: '0.22', SizeY: '0.22', ShapeType: 'ELLIPSE', FillColor: '"#f97316"', LineColor: '"#c2410c"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. 拋體運動
  // ─────────────────────────────────────────────
  {
    id: 'projectile',
    description: '水平拋出的球體受重力影響做拋物線運動，碰到地面後會反彈（能量略有損失）。',
    difficulty: '入門',
    info: { title: '拋體運動', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'pro-x',   name: 'x',   value: '-4',  type: 'double', comment: 'X 位置', page: 'Variables', scope: 'global' },
      { id: 'pro-y',   name: 'y',   value: '2',   type: 'double', comment: 'Y 位置', page: 'Variables', scope: 'global' },
      { id: 'pro-vx',  name: 'vx',  value: '4',   type: 'double', comment: 'X 速度', page: 'Variables', scope: 'global' },
      { id: 'pro-vy',  name: 'vy',  value: '3',   type: 'double', comment: 'Y 速度', page: 'Variables', scope: 'global' },
      { id: 'pro-g',   name: 'g',   value: '9.8', type: 'double', comment: '重力加速度', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'pro-ode', name: '拋體方程', method: 'RungeKutta', increment: '0.02', comment: '',
      rates: [
        { state: 'x',  expression: 'vx' },
        { state: 'y',  expression: 'vy' },
        { state: 'vx', expression: '0' },
        { state: 'vy', expression: '-g' },
      ],
    }],
    constraintPages: [{
      id: 'pro-con', name: '地面反彈', comment: '',
      code: 'if (y < -3.5) {\n  y = -3.5;\n  vy = -0.65 * vy;\n  vx = 0.98 * vx;\n}',
    }],
    initPages: [{
      id: 'pro-init', name: '重設位置', comment: '',
      code: 'x = -4; y = 2; vx = 4; vy = 3;',
    }],
    viewElements: [
      {
        id: 'pro-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '480', Height: '300', MinimumX: '-5', MaximumX: '5', MinimumY: '-4', MaximumY: '4', Background: '"#f0f9ff"', SquareAspect: 'false' },
      },
      {
        id: 'pro-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', LineColor: '"#7dd3fc"', MaximumPoints: '500' },
      },
      {
        id: 'pro-ball', type: 'Elements.Shape2D', name: '球', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.25', SizeY: '0.25', ShapeType: 'ELLIPSE', FillColor: '"#f97316"', LineColor: '"#ea580c"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. 阻尼振盪
  // ─────────────────────────────────────────────
  {
    id: 'damped',
    description: '彈簧振盪加上阻力，振幅隨時間衰減。試著改變阻尼係數 b，觀察臨界阻尼與過阻尼現象。',
    difficulty: '基礎',
    info: { title: '阻尼振盪', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'dmp-x',  name: 'x',  value: '3',   type: 'double', comment: '質點位置', page: 'Variables', scope: 'global' },
      { id: 'dmp-vx', name: 'vx', value: '0',   type: 'double', comment: '質點速度', page: 'Variables', scope: 'global' },
      { id: 'dmp-k',  name: 'k',  value: '5',   type: 'double', comment: '彈簧係數', page: 'Variables', scope: 'global' },
      { id: 'dmp-m',  name: 'm',  value: '1',   type: 'double', comment: '質量', page: 'Variables', scope: 'global' },
      { id: 'dmp-b',  name: 'b',  value: '0.8', type: 'double', comment: '阻尼係數（試試 0、1、4、6）', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'dmp-ode', name: '阻尼方程', method: 'RungeKutta', increment: '0.02', comment: '',
      rates: [
        { state: 'x',  expression: 'vx' },
        { state: 'vx', expression: '(-k * x - b * vx) / m' },
      ],
    }],
    constraintPages: [],
    initPages: [],
    viewElements: [
      {
        id: 'dmp-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '400', Height: '260', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"white"', SquareAspect: 'false' },
      },
      {
        id: 'dmp-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', LineColor: '"#a78bfa"', MaximumPoints: '800' },
      },
      {
        id: 'dmp-spring', type: 'Elements.Spring2D', name: '彈簧', parent: 'DrawingPanel1',
        properties: { X: '-4', Y: '0', SizeX: 'x + 4', SizeY: '0', LineColor: '"#64748b"' },
      },
      {
        id: 'dmp-ball', type: 'Elements.Shape2D', name: '質點', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', SizeX: '0.28', SizeY: '0.28', ShapeType: 'ELLIPSE', FillColor: '"#8b5cf6"', LineColor: '"#6d28d9"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. 行星軌道
  // ─────────────────────────────────────────────
  {
    id: 'orbit',
    description: '行星受萬有引力吸引繞太陽運行，軌道為橢圓（克卜勒第一定律）。改變初速度可得到不同形狀的軌道。',
    difficulty: '進階',
    info: { title: '行星軌道', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'orb-x',   name: 'x',   value: '2',   type: 'double', comment: '行星 X 位置', page: 'Variables', scope: 'global' },
      { id: 'orb-y',   name: 'y',   value: '0',   type: 'double', comment: '行星 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'orb-vx',  name: 'vx',  value: '0',   type: 'double', comment: '行星 X 速度', page: 'Variables', scope: 'global' },
      { id: 'orb-vy',  name: 'vy',  value: '0.8', type: 'double', comment: '行星 Y 速度（試試 0.7～1.4）', page: 'Variables', scope: 'global' },
      { id: 'orb-GM',  name: 'GM',  value: '1',   type: 'double', comment: '重力常數 × 太陽質量', page: 'Variables', scope: 'global' },
      { id: 'orb-r',   name: 'r',   value: '0',   type: 'double', comment: '行星與太陽距離', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'orb-ode', name: '重力方程', method: 'RungeKutta', increment: '0.005', comment: '',
      rates: [
        { state: 'x',  expression: 'vx' },
        { state: 'y',  expression: 'vy' },
        { state: 'vx', expression: '-GM * x / Math.pow(x*x + y*y, 1.5)' },
        { state: 'vy', expression: '-GM * y / Math.pow(x*x + y*y, 1.5)' },
      ],
    }],
    constraintPages: [{
      id: 'orb-con', name: '計算距離', comment: '',
      code: 'r = Math.sqrt(x*x + y*y);',
    }],
    initPages: [],
    viewElements: [
      {
        id: 'orb-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '380', Height: '380', MinimumX: '-3', MaximumX: '3', MinimumY: '-3', MaximumY: '3', Background: '"#0f172a"', SquareAspect: 'true' },
      },
      {
        id: 'orb-trail', type: 'Elements.Trail2D', name: '軌道', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', LineColor: '"#38bdf8"', MaximumPoints: '1500' },
      },
      {
        id: 'orb-sun', type: 'Elements.Shape2D', name: '太陽', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '0.18', SizeY: '0.18', ShapeType: 'ELLIPSE', FillColor: '"#fbbf24"', LineColor: '"#f59e0b"', Visible: 'true' },
      },
      {
        id: 'orb-planet', type: 'Elements.Shape2D', name: '行星', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.12', SizeY: '0.12', ShapeType: 'ELLIPSE', FillColor: '"#34d399"', LineColor: '"#059669"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. 三體問題（8字形軌道）
  // Chenciner & Montgomery (2000) 精確初始條件
  // G=1，三顆等質量 m=1 的星體沿同一條 8 字形路徑追逐
  // ─────────────────────────────────────────────
  {
    id: 'threebody',
    description: '三顆等質量星體互相以萬有引力吸引，沿同一條 8 字形軌道追逐（Chenciner-Montgomery 穩定解）。這是三體問題中極少數已知的週期解之一。',
    difficulty: '進階',
    info: { title: '三體問題（8字形軌道）', author: '', keywords: '', abstract: '' },
    variables: [
      // Body 1
      { id: 'tb-x1',  name: 'x1',  value: '0.97000436',   type: 'double', comment: '星體1 X 位置', page: 'Variables', scope: 'global' },
      { id: 'tb-y1',  name: 'y1',  value: '-0.24308753',  type: 'double', comment: '星體1 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'tb-vx1', name: 'vx1', value: '0.46620368',   type: 'double', comment: '星體1 X 速度', page: 'Variables', scope: 'global' },
      { id: 'tb-vy1', name: 'vy1', value: '0.43236573',   type: 'double', comment: '星體1 Y 速度', page: 'Variables', scope: 'global' },
      // Body 2
      { id: 'tb-x2',  name: 'x2',  value: '-0.97000436',  type: 'double', comment: '星體2 X 位置', page: 'Variables', scope: 'global' },
      { id: 'tb-y2',  name: 'y2',  value: '0.24308753',   type: 'double', comment: '星體2 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'tb-vx2', name: 'vx2', value: '0.46620368',   type: 'double', comment: '星體2 X 速度', page: 'Variables', scope: 'global' },
      { id: 'tb-vy2', name: 'vy2', value: '0.43236573',   type: 'double', comment: '星體2 Y 速度', page: 'Variables', scope: 'global' },
      // Body 3
      { id: 'tb-x3',  name: 'x3',  value: '0',            type: 'double', comment: '星體3 X 位置', page: 'Variables', scope: 'global' },
      { id: 'tb-y3',  name: 'y3',  value: '0',            type: 'double', comment: '星體3 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'tb-vx3', name: 'vx3', value: '-0.93240737',  type: 'double', comment: '星體3 X 速度', page: 'Variables', scope: 'global' },
      { id: 'tb-vy3', name: 'vy3', value: '-0.86473146',  type: 'double', comment: '星體3 Y 速度', page: 'Variables', scope: 'global' },
      // Mass
      { id: 'tb-m',   name: 'm',   value: '1',            type: 'double', comment: '星體質量（三顆相同）', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'tb-ode', name: '三體重力方程', method: 'RungeKutta', increment: '0.001', comment: '',
      rates: [
        // Body 1
        { state: 'x1',  expression: 'vx1' },
        { state: 'y1',  expression: 'vy1' },
        { state: 'vx1', expression: 'm*(x2-x1)/Math.pow(Math.hypot(x2-x1,y2-y1),3) + m*(x3-x1)/Math.pow(Math.hypot(x3-x1,y3-y1),3)' },
        { state: 'vy1', expression: 'm*(y2-y1)/Math.pow(Math.hypot(x2-x1,y2-y1),3) + m*(y3-y1)/Math.pow(Math.hypot(x3-x1,y3-y1),3)' },
        // Body 2
        { state: 'x2',  expression: 'vx2' },
        { state: 'y2',  expression: 'vy2' },
        { state: 'vx2', expression: 'm*(x1-x2)/Math.pow(Math.hypot(x1-x2,y1-y2),3) + m*(x3-x2)/Math.pow(Math.hypot(x3-x2,y3-y2),3)' },
        { state: 'vy2', expression: 'm*(y1-y2)/Math.pow(Math.hypot(x1-x2,y1-y2),3) + m*(y3-y2)/Math.pow(Math.hypot(x3-x2,y3-y2),3)' },
        // Body 3
        { state: 'x3',  expression: 'vx3' },
        { state: 'y3',  expression: 'vy3' },
        { state: 'vx3', expression: 'm*(x1-x3)/Math.pow(Math.hypot(x1-x3,y1-y3),3) + m*(x2-x3)/Math.pow(Math.hypot(x2-x3,y2-y3),3)' },
        { state: 'vy3', expression: 'm*(y1-y3)/Math.pow(Math.hypot(x1-x3,y1-y3),3) + m*(y2-y3)/Math.pow(Math.hypot(x2-x3,y2-y3),3)' },
      ],
    }],
    constraintPages: [],
    initPages: [],
    viewElements: [
      {
        id: 'tb-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '400', Height: '300', MinimumX: '-1.6', MaximumX: '1.6', MinimumY: '-1.2', MaximumY: '1.2', Background: '"#020617"', SquareAspect: 'true' },
      },
      {
        id: 'tb-trail1', type: 'Elements.Trail2D', name: '軌跡1', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', LineColor: '"#f87171"', MaximumPoints: '2000' },
      },
      {
        id: 'tb-trail2', type: 'Elements.Trail2D', name: '軌跡2', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', LineColor: '"#4ade80"', MaximumPoints: '2000' },
      },
      {
        id: 'tb-trail3', type: 'Elements.Trail2D', name: '軌跡3', parent: 'DrawingPanel1',
        properties: { X: 'x3', Y: 'y3', LineColor: '"#60a5fa"', MaximumPoints: '2000' },
      },
      {
        id: 'tb-star1', type: 'Elements.Shape2D', name: '星體1', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', SizeX: '0.07', SizeY: '0.07', ShapeType: 'ELLIPSE', FillColor: '"#fca5a5"', LineColor: '"#ef4444"', Visible: 'true' },
      },
      {
        id: 'tb-star2', type: 'Elements.Shape2D', name: '星體2', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', SizeX: '0.07', SizeY: '0.07', ShapeType: 'ELLIPSE', FillColor: '"#86efac"', LineColor: '"#22c55e"', Visible: 'true' },
      },
      {
        id: 'tb-star3', type: 'Elements.Shape2D', name: '星體3', parent: 'DrawingPanel1',
        properties: { X: 'x3', Y: 'y3', SizeX: '0.07', SizeY: '0.07', ShapeType: 'ELLIPSE', FillColor: '"#93c5fd"', LineColor: '"#3b82f6"', Visible: 'true' },
      },
    ],
  },
];

export default EXAMPLES;
