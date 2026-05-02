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

  // ─────────────────────────────────────────────
  // 7. 雙擺
  // ─────────────────────────────────────────────
  {
    id: 'doublepend',
    description: '兩個串聯的擺，展現混沌系統的特性。即使初始角度只差一點點，長時間後軌跡會完全不同——對初始條件的極端敏感性。',
    difficulty: '進階',
    info: { title: '雙擺', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'dpp-t1', name: 'theta1', value: '1.5708', type: 'double', comment: '擺1角度（弧度，π/2）', page: 'Variables', scope: 'global' },
      { id: 'dpp-t2', name: 'theta2', value: '2.1',    type: 'double', comment: '擺2角度（弧度）', page: 'Variables', scope: 'global' },
      { id: 'dpp-w1', name: 'omega1', value: '0',      type: 'double', comment: '擺1角速度', page: 'Variables', scope: 'global' },
      { id: 'dpp-w2', name: 'omega2', value: '0',      type: 'double', comment: '擺2角速度', page: 'Variables', scope: 'global' },
      { id: 'dpp-L1', name: 'L1',     value: '1.5',    type: 'double', comment: '擺1長度（公尺）', page: 'Variables', scope: 'global' },
      { id: 'dpp-L2', name: 'L2',     value: '1.2',    type: 'double', comment: '擺2長度（公尺）', page: 'Variables', scope: 'global' },
      { id: 'dpp-m1', name: 'm1',     value: '1',      type: 'double', comment: '擺1質量（kg）', page: 'Variables', scope: 'global' },
      { id: 'dpp-m2', name: 'm2',     value: '1',      type: 'double', comment: '擺2質量（kg）', page: 'Variables', scope: 'global' },
      { id: 'dpp-g',  name: 'g',      value: '9.8',    type: 'double', comment: '重力加速度', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'dpp-ode', name: '雙擺方程（Lagrangian）', method: 'RungeKutta', increment: '0.005', comment: '',
      rates: [
        { state: 'theta1', expression: 'omega1' },
        { state: 'theta2', expression: 'omega2' },
        { state: 'omega1', expression: '(-g*(2*m1+m2)*Math.sin(theta1) - m2*g*Math.sin(theta1-2*theta2) - 2*Math.sin(theta1-theta2)*m2*(omega2*omega2*L2+omega1*omega1*L1*Math.cos(theta1-theta2))) / (L1*(2*m1+m2-m2*Math.cos(2*theta1-2*theta2)))' },
        { state: 'omega2', expression: '(2*Math.sin(theta1-theta2)*(omega1*omega1*L1*(m1+m2)+g*(m1+m2)*Math.cos(theta1)+omega2*omega2*L2*m2*Math.cos(theta1-theta2))) / (L2*(2*m1+m2-m2*Math.cos(2*theta1-2*theta2)))' },
      ],
    }],
    constraintPages: [],
    initPages: [],
    viewElements: [
      {
        id: 'dpp-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '400', Height: '380', MinimumX: '-3', MaximumX: '3', MinimumY: '-3', MaximumY: '1.5', Background: '"#0f172a"', SquareAspect: 'true' },
      },
      {
        id: 'dpp-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)+L2*Math.sin(theta2)', Y: '-(L1*Math.cos(theta1)+L2*Math.cos(theta2))', LineColor: '"#ec4899"', MaximumPoints: '2500' },
      },
      {
        id: 'dpp-rod1', type: 'Elements.Arrow2D', name: '擺桿1', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: 'L1*Math.sin(theta1)', SizeY: '-L1*Math.cos(theta1)', FillColor: '"#94a3b8"' },
      },
      {
        id: 'dpp-rod2', type: 'Elements.Arrow2D', name: '擺桿2', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)', Y: '-L1*Math.cos(theta1)', SizeX: 'L2*Math.sin(theta2)', SizeY: '-L2*Math.cos(theta2)', FillColor: '"#94a3b8"' },
      },
      {
        id: 'dpp-pivot', type: 'Elements.Shape2D', name: '支點', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '0.09', SizeY: '0.09', ShapeType: 'ELLIPSE', FillColor: '"#64748b"', LineColor: '"#64748b"', Visible: 'true' },
      },
      {
        id: 'dpp-bob1', type: 'Elements.Shape2D', name: '擺錘1', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)', Y: '-L1*Math.cos(theta1)', SizeX: '0.2', SizeY: '0.2', ShapeType: 'ELLIPSE', FillColor: '"#f97316"', LineColor: '"#c2410c"', Visible: 'true' },
      },
      {
        id: 'dpp-bob2', type: 'Elements.Shape2D', name: '擺錘2', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)+L2*Math.sin(theta2)', Y: '-(L1*Math.cos(theta1)+L2*Math.cos(theta2))', SizeX: '0.2', SizeY: '0.2', ShapeType: 'ELLIPSE', FillColor: '"#a78bfa"', LineColor: '"#7c3aed"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. 陰極射線管（CRT）— 電磁場偏折電子束
  // 電場（Ey）造成拋物線偏折，磁場（Bz）造成圓弧偏折
  // 滑桿即時調整，觀察洛倫茲力複合效果
  // ─────────────────────────────────────────────
  {
    id: 'crt',
    description: '模擬陰極射線管（CRT）中的電子束：洛倫茲力方程式 dvx/dt = -vy·Bz、dvy/dt = vx·Bz - Ey 驅動電子運動。電場（Ey）使電子做拋物線偏折，磁場（Bz）使其做圓弧偏折。拉動滑桿即時觀察偏折效果。',
    difficulty: '進階',
    info: { title: '陰極射線管（電磁偏折）', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'crt-x',  name: 'x',  value: '-3.8', type: 'double', comment: '電子 X 位置', page: 'Variables', scope: 'global' },
      { id: 'crt-y',  name: 'y',  value: '0',    type: 'double', comment: '電子 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'crt-vx', name: 'vx', value: '5',    type: 'double', comment: '電子 X 速度', page: 'Variables', scope: 'global' },
      { id: 'crt-vy', name: 'vy', value: '0',    type: 'double', comment: '電子 Y 速度', page: 'Variables', scope: 'global' },
      { id: 'crt-Ey', name: 'Ey', value: '0',    type: 'double', comment: '電場（Y方向，正值向下偏折電子）', page: 'Variables', scope: 'global' },
      { id: 'crt-Bz', name: 'Bz', value: '0',    type: 'double', comment: '磁場（垂直螢幕，正值指向外側）', page: 'Variables', scope: 'global' },
      { id: 'crt-v0', name: 'v0', value: '5',    type: 'double', comment: '電子初速（由電子槍加速決定）', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'crt-ode', name: '電子洛倫茲運動', method: 'RungeKutta', increment: '0.004', comment: '',
      rates: [
        { state: 'x',  expression: 'vx' },
        { state: 'y',  expression: 'vy' },
        { state: 'vx', expression: '-vy * Bz' },
        { state: 'vy', expression: 'vx * Bz - Ey' },
      ],
    }],
    constraintPages: [{
      id: 'crt-con', name: '邊界重置', comment: '',
      code: 'if(x >= 4.1 || Math.abs(y) >= 2.8) {\n  x = -3.8; y = 0; vx = v0; vy = 0;\n}',
    }],
    initPages: [{
      id: 'crt-init', name: '設定初速', comment: '',
      code: 'x = -3.8; y = 0; vx = v0; vy = 0;',
    }],
    viewElements: [
      {
        id: 'crt-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '500', Height: '300', MinimumX: '-5', MaximumX: '5', MinimumY: '-3', MaximumY: '3', Background: '"#0a0a1a"', SquareAspect: 'false' },
      },
      {
        id: 'crt-sEy', type: 'Elements.Slider', name: '電場滑桿', parent: '',
        properties: { Variable: 'Ey', Minimum: '-4', Maximum: '4', Step: '0.1', Label: '電場 Ey' },
      },
      {
        id: 'crt-sBz', type: 'Elements.Slider', name: '磁場滑桿', parent: '',
        properties: { Variable: 'Bz', Minimum: '-3', Maximum: '3', Step: '0.1', Label: '磁場 Bz' },
      },
      {
        id: 'crt-sv0', type: 'Elements.Slider', name: '初速滑桿', parent: '',
        properties: { Variable: 'v0', Minimum: '1', Maximum: '9', Step: '0.5', Label: '初速 v₀' },
      },
      {
        id: 'crt-draw', type: 'Elements.CustomDraw', name: 'CRTDraw', parent: 'DrawingPanel1',
        properties: {
          Code: [
            'var Ey=vars.Ey,Bz=vars.Bz,v0=vars.v0,ex=vars.x,ey2=vars.y;',
            'ctx.save();',
            'ctx.fillStyle="#0a0a1a";ctx.fillRect(0,0,W,H);',
            // tube outline
            'ctx.strokeStyle="#1e293b";ctx.lineWidth=1.5;',
            'ctx.strokeRect(toPixX(-5),toPixY(2.8),toPixX(5)-toPixX(-5),toPixY(-2.8)-toPixY(2.8));',
            // screen
            'var sx=toPixX(4.2);',
            'ctx.strokeStyle="rgba(34,211,238,0.5)";ctx.lineWidth=4;',
            'ctx.beginPath();ctx.moveTo(sx,toPixY(2.8));ctx.lineTo(sx,toPixY(-2.8));ctx.stroke();',
            // electron gun
            'ctx.fillStyle="#2d3748";',
            'ctx.fillRect(toPixX(-5),toPixY(0.45),toPixX(-3.8)-toPixX(-5),toPixY(-0.45)-toPixY(0.45));',
            'ctx.strokeStyle="#4b5563";ctx.lineWidth=1;',
            'ctx.strokeRect(toPixX(-5),toPixY(0.45),toPixX(-3.8)-toPixX(-5),toPixY(-0.45)-toPixY(0.45));',
            // B field
            'if(Math.abs(Bz)>0.01){',
            '  ctx.fillStyle="rgba(167,139,250,0.07)";ctx.fillRect(0,toPixY(2.8),W,toPixY(-2.8)-toPixY(2.8));',
            '  var bsym=Bz>0?"·":"×";',
            '  ctx.fillStyle="rgba(167,139,250,0.55)";ctx.font="11px monospace";ctx.textAlign="center";',
            '  for(var xi=-4;xi<=4;xi+=1.8)for(var yi=-2;yi<=2;yi+=1.2)ctx.fillText(bsym,toPixX(xi),toPixY(yi));',
            '}',
            // E field plates + arrows
            'if(Math.abs(Ey)>0.01){',
            '  ctx.fillStyle=Ey>0?"rgba(239,68,68,0.4)":"rgba(59,130,246,0.4)";',
            '  ctx.fillRect(toPixX(-3.8),toPixY(2.3),toPixX(3.8)-toPixX(-3.8),toPixY(1.9)-toPixY(2.3));',
            '  ctx.fillStyle=Ey>0?"rgba(59,130,246,0.4)":"rgba(239,68,68,0.4)";',
            '  ctx.fillRect(toPixX(-3.8),toPixY(-1.9),toPixX(3.8)-toPixX(-3.8),toPixY(-2.3)-toPixY(-1.9));',
            '  ctx.strokeStyle=Ey>0?"rgba(239,68,68,0.6)":"rgba(59,130,246,0.6)";ctx.lineWidth=1;',
            '  for(var xi2=-3;xi2<=3;xi2+=1.5){',
            '    var xa=toPixX(xi2),ya1=toPixY(1.9),ya2=toPixY(-1.9),dir=Ey>0?-1:1;',
            '    ctx.beginPath();ctx.moveTo(xa,ya1);ctx.lineTo(xa,ya2);ctx.stroke();',
            '    var tip=Ey>0?ya2:ya1;',
            '    ctx.beginPath();ctx.moveTo(xa,tip);ctx.lineTo(xa-4,tip+dir*8);ctx.moveTo(xa,tip);ctx.lineTo(xa+4,tip+dir*8);ctx.stroke();',
            '  }',
            '}',
            // pre-computed trajectory guide (faint)
            'var path=[],ppx=-3.8,ppy=0,pvx=v0,pvy=0,dts=0.004;',
            'for(var i=0;i<5000;i++){',
            '  var aax=-pvy*Bz,aay=pvx*Bz-Ey;',
            '  pvx+=aax*dts;pvy+=aay*dts;ppx+=pvx*dts;ppy+=pvy*dts;',
            '  path.push([ppx,ppy]);',
            '  if(ppx>=4.2||Math.abs(ppy)>=2.8) break;',
            '}',
            'var plen=path.length;',
            'if(plen>1){',
            '  ctx.strokeStyle="rgba(250,204,21,0.25)";ctx.lineWidth=1.5;ctx.setLineDash([4,4]);',
            '  ctx.beginPath();ctx.moveTo(toPixX(-3.8),toPixY(0));',
            '  for(var k=0;k<plen;k++)ctx.lineTo(toPixX(path[k][0]),toPixY(path[k][1]));',
            '  ctx.stroke();ctx.setLineDash([]);',
            '  var hp=path[plen-1];',
            '  if(hp[0]>=4.1){',
            '    ctx.fillStyle="rgba(34,211,238,0.7)";ctx.shadowBlur=16;ctx.shadowColor="#22d3ee";',
            '    ctx.beginPath();ctx.arc(sx,toPixY(hp[1]),7,0,2*Math.PI);ctx.fill();',
            '    ctx.shadowBlur=0;',
            '    ctx.fillStyle="#e2e8f0";ctx.font="11px monospace";ctx.textAlign="left";',
            '    ctx.fillText("y="+hp[1].toFixed(2),sx+8,toPixY(hp[1])+4);',
            '  }',
            '}',
            // labels
            'ctx.font="12px monospace";ctx.textAlign="left";ctx.fillStyle="#e2e8f0";',
            'ctx.fillText("Ey = "+Ey.toFixed(2),8,18);',
            'ctx.fillText("Bz = "+Bz.toFixed(2),8,34);',
            'ctx.fillText("v₀ = "+v0.toFixed(1),8,50);',
            'ctx.fillStyle="#64748b";ctx.textAlign="center";',
            'ctx.fillText("電子槍",toPixX(-4.5),toPixY(-2.5));',
            'ctx.fillText("螢光屏",toPixX(4.6),toPixY(-2.5));',
            'ctx.restore();',
          ].join('\n'),
        },
      },
      {
        id: 'crt-electron', type: 'Elements.Shape2D', name: '電子', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.18', SizeY: '0.18', ShapeType: 'ELLIPSE', FillColor: '"#fde047"', LineColor: '"#fbbf24"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. 折射（Snell's Law — 波前動畫）
  // 以平行波前填色動畫展示光進入玻璃後波長縮短、折射角變小
  // ─────────────────────────────────────────────
  {
    id: 'snell',
    description: '以波前動畫展示折射定律：光束從空氣進入玻璃後，波前間距縮短（λ₂ = λ₁/n₂），傳播方向依 Snell 定律偏折。黃色條紋為空氣中波前，青色為玻璃中波前。',
    difficulty: '基礎',
    info: { title: '折射定律（波前動畫）', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'sn-t1',  name: 'theta1', value: '0.7854', type: 'double', comment: '入射角（rad），45° = π/4', page: 'Variables', scope: 'global' },
      { id: 'sn-t2',  name: 'theta2', value: '0',      type: 'double', comment: '折射角（rad），由 Snell 定律計算', page: 'Variables', scope: 'global' },
      { id: 'sn-n1',  name: 'n1',     value: '1.0',    type: 'double', comment: '空氣折射率', page: 'Variables', scope: 'global' },
      { id: 'sn-n2',  name: 'n2',     value: '1.5',    type: 'double', comment: '玻璃折射率（調大可觀察更強折射）', page: 'Variables', scope: 'global' },
      { id: 'sn-ph',  name: 'phase',  value: '0',      type: 'double', comment: '波動相位（動畫驅動）', page: 'Variables', scope: 'global' },
      { id: 'sn-bw',  name: 'beamHW', value: '1.2',    type: 'double', comment: '光束半寬（世界座標）', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'sn-ode', name: '相位推進', method: 'Euler', increment: '0.02', comment: '',
      rates: [
        { state: 'phase', expression: '1' },
      ],
    }],
    constraintPages: [{
      id: 'sn-con', name: 'Snell 定律', comment: '',
      code: 'theta2 = Math.asin(Math.min(1, n1 * Math.sin(theta1) / n2));',
    }],
    initPages: [],
    viewElements: [
      {
        id: 'sn-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '420', Height: '300', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"#0f172a"', SquareAspect: 'false' },
      },
      {
        id: 'sn-draw', type: 'Elements.CustomDraw', name: 'WavefrontDraw', parent: 'DrawingPanel1',
        properties: {
          Code: [
            'var t1=vars.theta1,t2=vars.theta2,n1=vars.n1,n2=vars.n2,ph=vars.phase,bHW=vars.beamHW;',
            'var lam1=1.0,lam2=n1/n2,iy=toPixY(0);',
            'ctx.save();',
            'ctx.fillStyle="rgba(20,60,120,0.2)";ctx.fillRect(0,0,W,iy);',
            'ctx.fillStyle="rgba(30,90,160,0.4)";ctx.fillRect(0,iy,W,H-iy);',
            'ctx.setLineDash([8,4]);ctx.strokeStyle="rgba(200,220,255,0.5)";ctx.lineWidth=1.5;',
            'ctx.beginPath();ctx.moveTo(0,iy);ctx.lineTo(W,iy);ctx.stroke();ctx.setLineDash([]);',
            'ctx.font="12px monospace";ctx.textAlign="left";',
            'ctx.fillStyle="rgba(180,220,255,0.85)";',
            'ctx.fillText("空氣  n₁="+n1.toFixed(1),6,18);',
            'ctx.fillText("玻璃  n₂="+n2.toFixed(1),6,iy+18);',
            'ctx.fillStyle="rgba(255,230,100,0.85)";ctx.textAlign="right";',
            'ctx.fillText("θ₁="+(t1*180/Math.PI).toFixed(1)+"°",W-6,18);',
            'ctx.fillText("θ₂="+(t2*180/Math.PI).toFixed(1)+"°",W-6,iy+18);',
            'ctx.strokeStyle="rgba(200,200,200,0.25)";ctx.lineWidth=1;ctx.setLineDash([4,3]);',
            'ctx.beginPath();ctx.moveTo(toPixX(0),0);ctx.lineTo(toPixX(0),H);ctx.stroke();ctx.setLineDash([]);',
            'var s1=Math.sin(t1),c1=Math.cos(t1),s2=Math.sin(t2),c2=Math.cos(t2);',
            'var airOff=ph%lam1;',
            'ctx.save();ctx.beginPath();ctx.rect(0,0,W,iy);ctx.clip();',
            'for(var ai=0;ai<20;ai++){',
            '  var fa=airOff-ai*lam1,ba=fa-lam1;',
            '  ctx.fillStyle=ai%2===0?"rgba(255,220,60,0.4)":"rgba(255,180,30,0.6)";',
            '  ctx.beginPath();',
            '  ctx.moveTo(toPixX(fa*s1+bHW*c1),toPixY(-fa*c1+bHW*s1));',
            '  ctx.lineTo(toPixX(fa*s1-bHW*c1),toPixY(-fa*c1-bHW*s1));',
            '  ctx.lineTo(toPixX(ba*s1-bHW*c1),toPixY(-ba*c1-bHW*s1));',
            '  ctx.lineTo(toPixX(ba*s1+bHW*c1),toPixY(-ba*c1+bHW*s1));',
            '  ctx.closePath();ctx.fill();',
            '}',
            'ctx.restore();',
            'var glassBase=(ph*lam2)%lam2,gs=glassBase-lam2;',
            'ctx.save();ctx.beginPath();ctx.rect(0,iy,W,H-iy);ctx.clip();',
            'for(var gi=0;gi<25;gi++){',
            '  var fg=gs+gi*lam2,bg=fg+lam2;',
            '  ctx.fillStyle=gi%2===0?"rgba(80,200,255,0.4)":"rgba(40,160,230,0.65)";',
            '  ctx.beginPath();',
            '  ctx.moveTo(toPixX(fg*s2+bHW*c2),toPixY(-fg*c2+bHW*s2));',
            '  ctx.lineTo(toPixX(fg*s2-bHW*c2),toPixY(-fg*c2-bHW*s2));',
            '  ctx.lineTo(toPixX(bg*s2-bHW*c2),toPixY(-bg*c2-bHW*s2));',
            '  ctx.lineTo(toPixX(bg*s2+bHW*c2),toPixY(-bg*c2+bHW*s2));',
            '  ctx.closePath();ctx.fill();',
            '}',
            'ctx.restore();',
            'ctx.restore();',
          ].join('\n'),
        },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. 理想氣體（多粒子模型）
  // N 個硬球在密閉容器中碰壁，展示 T、P、PV=NkT
  // ─────────────────────────────────────────────
  {
    id: 'idealgas',
    description: '密閉容器中 50～300 個等質量粒子的硬球模擬，展示氣體動力論：溫度正比平均動能，壓力來自壁面衝量，並驗證 PV ≈ NkT。',
    difficulty: '基礎',
    info: { title: '理想氣體（多粒子模型）', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'ig-N', name: 'nParticles', value: '100', type: 'double', comment: '粒子數（50~300）', page: 'Variables', scope: 'global' },
      { id: 'ig-T', name: 'temperature', value: '1.0', type: 'double', comment: '目標溫度',        page: 'Variables', scope: 'global' },
      { id: 'ig-P', name: 'pressure',    value: '0',   type: 'double', comment: '即時壓力',         page: 'Variables', scope: 'global' },
    ],
    odePages: [],
    constraintPages: [{
      id: 'ig-con', name: '多粒子物理', comment: '',
      code: [
        '_v._fc=(_v._fc||0)+1;',
        'if(_v._fc%2===0)return;',
        'var N=Math.max(50,Math.min(300,Math.round(nParticles)));',
        'var L=3.5,r=0.07,dt=0.025;',
        'if(!_v._px||_v._px.length!==N){',
        '  _v._px=[];_v._py=[];_v._vx=[];_v._vy=[];',
        '  for(var i=0;i<N;i++){',
        '    _v._px[i]=(Math.random()*2-1)*(L-r*3);',
        '    _v._py[i]=(Math.random()*2-1)*(L-r*3);',
        '    var spd=Math.sqrt(Math.max(0.1,temperature))*(0.5+Math.random());',
        '    var ang=Math.random()*Math.PI*2;',
        '    _v._vx[i]=spd*Math.cos(ang);_v._vy[i]=spd*Math.sin(ang);',
        '  }',
        '  _v._imp=0;_v._impN=0;',
        '}',
        'for(var i=0;i<N;i++){_v._px[i]+=_v._vx[i]*dt;_v._py[i]+=_v._vy[i]*dt;}',
        'var imp=0;',
        'for(var i=0;i<N;i++){',
        '  if(_v._px[i]>L-r){_v._px[i]=2*(L-r)-_v._px[i];imp+=2*Math.abs(_v._vx[i]);_v._vx[i]=-Math.abs(_v._vx[i]);}',
        '  if(_v._px[i]<-(L-r)){_v._px[i]=-2*(L-r)-_v._px[i];imp+=2*Math.abs(_v._vx[i]);_v._vx[i]=Math.abs(_v._vx[i]);}',
        '  if(_v._py[i]>L-r){_v._py[i]=2*(L-r)-_v._py[i];imp+=2*Math.abs(_v._vy[i]);_v._vy[i]=-Math.abs(_v._vy[i]);}',
        '  if(_v._py[i]<-(L-r)){_v._py[i]=-2*(L-r)-_v._py[i];imp+=2*Math.abs(_v._vy[i]);_v._vy[i]=Math.abs(_v._vy[i]);}',
        '}',
        '_v._imp+=imp;_v._impN++;',
        'if(_v._impN>=20){',
        '  pressure=_v._imp/(20*dt*8*L);',
        '  _v._imp=0;_v._impN=0;',
        '}',
        'var sumKE=0;',
        'for(var i=0;i<N;i++)sumKE+=_v._vx[i]*_v._vx[i]+_v._vy[i]*_v._vy[i];',
        'var Tc=sumKE/(2*N),Tt=Math.max(0.01,temperature);',
        'var sc=Math.sqrt(Tt/Math.max(0.001,Tc));',
        'sc=Math.min(1.1,Math.max(0.9,sc));',
        'for(var i=0;i<N;i++){_v._vx[i]*=sc;_v._vy[i]*=sc;}',
      ].join('\n'),
    }],
    initPages: [],
    viewElements: [
      {
        id: 'ig-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '420', Height: '420', MinimumX: '-4', MaximumX: '4', MinimumY: '-4', MaximumY: '4', Background: '"#0f172a"', SquareAspect: 'true' },
      },
      {
        id: 'ig-sN', type: 'Elements.Slider', name: 'Slider_N', parent: '',
        properties: { Variable: 'nParticles', Minimum: '50', Maximum: '300', Step: '10', Label: '粒子數 N' },
      },
      {
        id: 'ig-sT', type: 'Elements.Slider', name: 'Slider_T', parent: '',
        properties: { Variable: 'temperature', Minimum: '0.1', Maximum: '4.0', Step: '0.1', Label: '溫度 T' },
      },
      {
        id: 'ig-draw', type: 'Elements.CustomDraw', name: 'GasDraw', parent: 'DrawingPanel1',
        properties: {
          Code: [
            'var N=Math.round(vars.nParticles||100);',
            'var L=3.5,r=0.07;',
            'var px=vars._px,py=vars._py,vx=vars._vx,vy=vars._vy;',
            'ctx.strokeStyle="#475569";ctx.lineWidth=2;',
            'var bx0=toPixX(-L),by0=toPixY(L),bw=toPixLen(2*L),bh=toPixLen(2*L);',
            'ctx.strokeRect(bx0,by0,bw,bh);',
            'if(px&&px.length>=N){',
            '  var pr=Math.max(2,toPixLen(r));',
            '  for(var i=0;i<N;i++){',
            '    var spd=Math.sqrt(vx[i]*vx[i]+vy[i]*vy[i]);',
            '    var t=Math.min(1,spd/4);',
            '    var R=Math.round(30+t*220),G=Math.round(120+t*80),B=Math.round(240-t*220);',
            '    ctx.fillStyle="rgb("+R+","+G+","+B+")";',
            '    ctx.beginPath();ctx.arc(toPixX(px[i]),toPixY(py[i]),pr,0,Math.PI*2);ctx.fill();',
            '  }',
            '}',
            'var T=vars.temperature||1,P=vars.pressure||0;',
            'var V=4*L*L,pv_nkt=P>0.01?((P*V)/(N*T)).toFixed(2):"...";',
            'ctx.fillStyle="rgba(0,0,0,0.65)";',
            'ctx.fillRect(W-140,6,134,90);',
            'ctx.fillStyle="#e2e8f0";ctx.font="bold 12px monospace";',
            'ctx.fillText("粒子數 N = "+N,W-132,24);',
            'ctx.fillText("溫度  T = "+T.toFixed(2),W-132,42);',
            'ctx.fillText("壓力  P = "+P.toFixed(2),W-132,60);',
            'ctx.fillStyle="#86efac";',
            'ctx.fillText("PV/NkT = "+pv_nkt,W-132,82);',
          ].join('\n'),
        },
      },
    ],
  },
];

export default EXAMPLES;
