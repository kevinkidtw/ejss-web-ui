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
  // 8. 帶電粒子在磁場中（洛倫茲力）
  // ─────────────────────────────────────────────
  {
    id: 'cyclotron',
    description: '帶電粒子在均勻磁場（垂直螢幕）中受洛倫茲力作用，做等速圓周運動（迴旋加速器原理）。圓周半徑 r = mv/(qB)。',
    difficulty: '基礎',
    info: { title: '帶電粒子在磁場', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'cy-x',  name: 'x',  value: '-1',  type: 'double', comment: '粒子 X 位置', page: 'Variables', scope: 'global' },
      { id: 'cy-y',  name: 'y',  value: '0',   type: 'double', comment: '粒子 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'cy-vx', name: 'vx', value: '0',   type: 'double', comment: '粒子 X 速度', page: 'Variables', scope: 'global' },
      { id: 'cy-vy', name: 'vy', value: '2',   type: 'double', comment: '粒子 Y 速度', page: 'Variables', scope: 'global' },
      { id: 'cy-q',  name: 'q',  value: '1',   type: 'double', comment: '電荷量（C）', page: 'Variables', scope: 'global' },
      { id: 'cy-m',  name: 'm',  value: '1',   type: 'double', comment: '質量（kg）', page: 'Variables', scope: 'global' },
      { id: 'cy-B',  name: 'B',  value: '2',   type: 'double', comment: '磁場強度（T），方向向外', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'cy-ode', name: '洛倫茲力方程', method: 'RungeKutta', increment: '0.01', comment: '',
      rates: [
        { state: 'x',  expression: 'vx' },
        { state: 'y',  expression: 'vy' },
        { state: 'vx', expression: 'q * B * vy / m' },
        { state: 'vy', expression: '-q * B * vx / m' },
      ],
    }],
    constraintPages: [],
    initPages: [],
    viewElements: [
      {
        id: 'cy-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '380', Height: '380', MinimumX: '-2.5', MaximumX: '2.5', MinimumY: '-2.5', MaximumY: '2.5', Background: '"#020617"', SquareAspect: 'true' },
      },
      {
        id: 'cy-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', LineColor: '"#22d3ee"', MaximumPoints: '1500' },
      },
      {
        id: 'cy-vel', type: 'Elements.Arrow2D', name: '速度向量', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: 'vx * 0.25', SizeY: 'vy * 0.25', FillColor: '"#fbbf24"' },
      },
      {
        id: 'cy-particle', type: 'Elements.Shape2D', name: '粒子', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.14', SizeY: '0.14', ShapeType: 'ELLIPSE', FillColor: '"#f87171"', LineColor: '"#ef4444"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. 折射與全反射（Snell's Law）
  // 黃色光線：空氣→玻璃（折射），青色光線：玻璃→空氣（全反射）
  // ─────────────────────────────────────────────
  {
    id: 'snell',
    description: '兩條光線同時演示折射定律：黃線從空氣進入玻璃（折射，角度變小）；青線在玻璃內以超臨界角撞擊界面（全反射，無法逸出）。嘗試調整 n2 觀察臨界角的變化。',
    difficulty: '基礎',
    info: { title: '折射與全反射', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'sn-x1',  name: 'x1',    value: '-2',   type: 'double', comment: '光線1 X 位置（空氣中）', page: 'Variables', scope: 'global' },
      { id: 'sn-y1',  name: 'y1',    value: '1.2',  type: 'double', comment: '光線1 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'sn-vx1', name: 'vx1',   value: '1.5',  type: 'double', comment: '光線1 X 速度', page: 'Variables', scope: 'global' },
      { id: 'sn-vy1', name: 'vy1',   value: '-2.0', type: 'double', comment: '光線1 Y 速度（向下）', page: 'Variables', scope: 'global' },
      { id: 'sn-pY1', name: 'prevY1',value: '1.2',  type: 'double', comment: '光線1 上一步 Y（用於偵測界面穿越）', page: 'Variables', scope: 'global' },
      { id: 'sn-x2',  name: 'x2',    value: '2',    type: 'double', comment: '光線2 X 位置（玻璃中）', page: 'Variables', scope: 'global' },
      { id: 'sn-y2',  name: 'y2',    value: '-0.8', type: 'double', comment: '光線2 Y 位置', page: 'Variables', scope: 'global' },
      { id: 'sn-vx2', name: 'vx2',   value: '-2.0', type: 'double', comment: '光線2 X 速度', page: 'Variables', scope: 'global' },
      { id: 'sn-vy2', name: 'vy2',   value: '1.5',  type: 'double', comment: '光線2 Y 速度（向上）', page: 'Variables', scope: 'global' },
      { id: 'sn-pY2', name: 'prevY2',value: '-0.8', type: 'double', comment: '光線2 上一步 Y（用於偵測界面穿越）', page: 'Variables', scope: 'global' },
      { id: 'sn-n1',  name: 'n1',    value: '1.0',  type: 'double', comment: '上方介質折射率（空氣≈1）', page: 'Variables', scope: 'global' },
      { id: 'sn-n2',  name: 'n2',    value: '1.5',  type: 'double', comment: '下方介質折射率（玻璃≈1.5），調大可觀察更強折射', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'sn-ode', name: '光線運動', method: 'RungeKutta', increment: '0.01', comment: '',
      rates: [
        { state: 'x1', expression: 'vx1' },
        { state: 'y1', expression: 'vy1' },
        { state: 'x2', expression: 'vx2' },
        { state: 'y2', expression: 'vy2' },
      ],
    }],
    constraintPages: [{
      id: 'sn-con', name: 'Snell 定律 + 邊界', comment: '',
      code: 'if(prevY1>=0&&y1<0){var sp1=Math.sqrt(vx1*vx1+vy1*vy1);var si1=Math.abs(vx1)/sp1;var st1=n1*si1/n2;if(st1>=1){vy1=Math.abs(vy1);y1=0.001;}else{var s1=vx1>=0?1:-1;vx1=s1*st1*sp1;vy1=-Math.sqrt(1-st1*st1)*sp1;y1=-0.001;}}\nelse if(prevY1<0&&y1>=0){var sp1b=Math.sqrt(vx1*vx1+vy1*vy1);var si1b=Math.abs(vx1)/sp1b;var st1b=n2*si1b/n1;if(st1b>=1){vy1=-Math.abs(vy1);y1=-0.001;}else{var s1b=vx1>=0?1:-1;vx1=s1b*st1b*sp1b;vy1=Math.sqrt(1-st1b*st1b)*sp1b;y1=0.001;}}\nprevY1=y1;\nif(x1>3.8){x1=7.6-x1;vx1=-Math.abs(vx1);}if(x1<-3.8){x1=-7.6-x1;vx1=Math.abs(vx1);}\nif(y1>2.8){y1=5.6-y1;vy1=-Math.abs(vy1);}if(y1<-2.8){y1=-5.6-y1;vy1=Math.abs(vy1);}\nif(prevY2<0&&y2>=0){var sp2=Math.sqrt(vx2*vx2+vy2*vy2);var si2=Math.abs(vx2)/sp2;var st2=n2*si2/n1;if(st2>=1){vy2=-Math.abs(vy2);y2=-0.001;}else{var s2=vx2>=0?1:-1;vx2=s2*st2*sp2;vy2=Math.sqrt(1-st2*st2)*sp2;y2=0.001;}}\nelse if(prevY2>=0&&y2<0){var sp2b=Math.sqrt(vx2*vx2+vy2*vy2);var si2b=Math.abs(vx2)/sp2b;var st2b=n1*si2b/n2;if(st2b>=1){vy2=Math.abs(vy2);y2=0.001;}else{var s2b=vx2>=0?1:-1;vx2=s2b*st2b*sp2b;vy2=-Math.sqrt(1-st2b*st2b)*sp2b;y2=-0.001;}}\nprevY2=y2;\nif(x2>3.8){x2=7.6-x2;vx2=-Math.abs(vx2);}if(x2<-3.8){x2=-7.6-x2;vx2=Math.abs(vx2);}\nif(y2>2.8){y2=5.6-y2;vy2=-Math.abs(vy2);}if(y2<-2.8){y2=-5.6-y2;vy2=Math.abs(vy2);}',
    }],
    initPages: [],
    viewElements: [
      {
        id: 'sn-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '420', Height: '300', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"#f8fafc"', SquareAspect: 'false' },
      },
      {
        id: 'sn-iface', type: 'Elements.Shape2D', name: '界面', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '8', SizeY: '0.06', ShapeType: 'RECTANGLE', FillColor: '"#94a3b8"', LineColor: '"#94a3b8"', Visible: 'true' },
      },
      {
        id: 'sn-trail1', type: 'Elements.Trail2D', name: '光線1軌跡（折射）', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', LineColor: '"#fbbf24"', MaximumPoints: '1000' },
      },
      {
        id: 'sn-trail2', type: 'Elements.Trail2D', name: '光線2軌跡（全反射）', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', LineColor: '"#22d3ee"', MaximumPoints: '1000' },
      },
      {
        id: 'sn-p1', type: 'Elements.Shape2D', name: '光子1', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', SizeX: '0.15', SizeY: '0.15', ShapeType: 'ELLIPSE', FillColor: '"#fde047"', LineColor: '"#ca8a04"', Visible: 'true' },
      },
      {
        id: 'sn-p2', type: 'Elements.Shape2D', name: '光子2', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', SizeX: '0.15', SizeY: '0.15', ShapeType: 'ELLIPSE', FillColor: '"#67e8f9"', LineColor: '"#0891b2"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. 理想氣體（3 個硬球粒子）
  // 等質量硬球彈性碰撞，模擬氣體動力論
  // ─────────────────────────────────────────────
  {
    id: 'idealgas',
    description: '三個等質量硬球在密閉容器中做彈性碰撞，模擬氣體動力論的微觀圖像。碰撞過程動能守恆，E 為系統總動能。',
    difficulty: '基礎',
    info: { title: '理想氣體（硬球模型）', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'ig-x1',  name: 'x1',  value: '-2',   type: 'double', comment: '粒子1 X', page: 'Variables', scope: 'global' },
      { id: 'ig-y1',  name: 'y1',  value: '1',    type: 'double', comment: '粒子1 Y', page: 'Variables', scope: 'global' },
      { id: 'ig-vx1', name: 'vx1', value: '1.5',  type: 'double', comment: '粒子1 X 速度', page: 'Variables', scope: 'global' },
      { id: 'ig-vy1', name: 'vy1', value: '0.8',  type: 'double', comment: '粒子1 Y 速度', page: 'Variables', scope: 'global' },
      { id: 'ig-x2',  name: 'x2',  value: '2',    type: 'double', comment: '粒子2 X', page: 'Variables', scope: 'global' },
      { id: 'ig-y2',  name: 'y2',  value: '-1',   type: 'double', comment: '粒子2 Y', page: 'Variables', scope: 'global' },
      { id: 'ig-vx2', name: 'vx2', value: '-1.2', type: 'double', comment: '粒子2 X 速度', page: 'Variables', scope: 'global' },
      { id: 'ig-vy2', name: 'vy2', value: '1.5',  type: 'double', comment: '粒子2 Y 速度', page: 'Variables', scope: 'global' },
      { id: 'ig-x3',  name: 'x3',  value: '0.5',  type: 'double', comment: '粒子3 X', page: 'Variables', scope: 'global' },
      { id: 'ig-y3',  name: 'y3',  value: '0',    type: 'double', comment: '粒子3 Y', page: 'Variables', scope: 'global' },
      { id: 'ig-vx3', name: 'vx3', value: '-0.3', type: 'double', comment: '粒子3 X 速度', page: 'Variables', scope: 'global' },
      { id: 'ig-vy3', name: 'vy3', value: '-2.0', type: 'double', comment: '粒子3 Y 速度', page: 'Variables', scope: 'global' },
      { id: 'ig-r',   name: 'r',   value: '0.3',  type: 'double', comment: '粒子半徑', page: 'Variables', scope: 'global' },
      { id: 'ig-E',   name: 'E',   value: '0',    type: 'double', comment: '系統總動能', page: 'Variables', scope: 'global' },
    ],
    odePages: [{
      id: 'ig-ode', name: '粒子運動（無外力）', method: 'RungeKutta', increment: '0.01', comment: '',
      rates: [
        { state: 'x1', expression: 'vx1' },
        { state: 'y1', expression: 'vy1' },
        { state: 'x2', expression: 'vx2' },
        { state: 'y2', expression: 'vy2' },
        { state: 'x3', expression: 'vx3' },
        { state: 'y3', expression: 'vy3' },
      ],
    }],
    constraintPages: [{
      id: 'ig-con', name: '壁面反彈 + 彈性碰撞', comment: '',
      code: 'var L=3.5;\nif(x1>L-r){x1=2*(L-r)-x1;vx1=-Math.abs(vx1);}if(x1<-(L-r)){x1=-2*(L-r)-x1;vx1=Math.abs(vx1);}\nif(y1>L-r){y1=2*(L-r)-y1;vy1=-Math.abs(vy1);}if(y1<-(L-r)){y1=-2*(L-r)-y1;vy1=Math.abs(vy1);}\nif(x2>L-r){x2=2*(L-r)-x2;vx2=-Math.abs(vx2);}if(x2<-(L-r)){x2=-2*(L-r)-x2;vx2=Math.abs(vx2);}\nif(y2>L-r){y2=2*(L-r)-y2;vy2=-Math.abs(vy2);}if(y2<-(L-r)){y2=-2*(L-r)-y2;vy2=Math.abs(vy2);}\nif(x3>L-r){x3=2*(L-r)-x3;vx3=-Math.abs(vx3);}if(x3<-(L-r)){x3=-2*(L-r)-x3;vx3=Math.abs(vx3);}\nif(y3>L-r){y3=2*(L-r)-y3;vy3=-Math.abs(vy3);}if(y3<-(L-r)){y3=-2*(L-r)-y3;vy3=Math.abs(vy3);}\nvar d2r=2*r;\nvar dx12=x2-x1,dy12=y2-y1,d12=Math.hypot(dx12,dy12);\nif(d12<d2r&&d12>0){var n12x=dx12/d12,n12y=dy12/d12;var dv12=(vx2-vx1)*n12x+(vy2-vy1)*n12y;if(dv12<0){vx1+=dv12*n12x;vy1+=dv12*n12y;vx2-=dv12*n12x;vy2-=dv12*n12y;var sep12=(d2r-d12)/2;x1-=n12x*sep12;y1-=n12y*sep12;x2+=n12x*sep12;y2+=n12y*sep12;}}\nvar dx13=x3-x1,dy13=y3-y1,d13=Math.hypot(dx13,dy13);\nif(d13<d2r&&d13>0){var n13x=dx13/d13,n13y=dy13/d13;var dv13=(vx3-vx1)*n13x+(vy3-vy1)*n13y;if(dv13<0){vx1+=dv13*n13x;vy1+=dv13*n13y;vx3-=dv13*n13x;vy3-=dv13*n13y;var sep13=(d2r-d13)/2;x1-=n13x*sep13;y1-=n13y*sep13;x3+=n13x*sep13;y3+=n13y*sep13;}}\nvar dx23=x3-x2,dy23=y3-y2,d23=Math.hypot(dx23,dy23);\nif(d23<d2r&&d23>0){var n23x=dx23/d23,n23y=dy23/d23;var dv23=(vx3-vx2)*n23x+(vy3-vy2)*n23y;if(dv23<0){vx2+=dv23*n23x;vy2+=dv23*n23y;vx3-=dv23*n23x;vy3-=dv23*n23y;var sep23=(d2r-d23)/2;x2-=n23x*sep23;y2-=n23y*sep23;x3+=n23x*sep23;y3+=n23y*sep23;}}\nE=0.5*(vx1*vx1+vy1*vy1+vx2*vx2+vy2*vy2+vx3*vx3+vy3*vy3);',
    }],
    initPages: [],
    viewElements: [
      {
        id: 'ig-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '380', Height: '380', MinimumX: '-3.8', MaximumX: '3.8', MinimumY: '-3.8', MaximumY: '3.8', Background: '"#1e293b"', SquareAspect: 'true' },
      },
      {
        id: 'ig-p1', type: 'Elements.Shape2D', name: '粒子1', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', SizeX: 'r', SizeY: 'r', ShapeType: 'ELLIPSE', FillColor: '"#f87171"', LineColor: '"#ef4444"', Visible: 'true' },
      },
      {
        id: 'ig-p2', type: 'Elements.Shape2D', name: '粒子2', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', SizeX: 'r', SizeY: 'r', ShapeType: 'ELLIPSE', FillColor: '"#4ade80"', LineColor: '"#22c55e"', Visible: 'true' },
      },
      {
        id: 'ig-p3', type: 'Elements.Shape2D', name: '粒子3', parent: 'DrawingPanel1',
        properties: { X: 'x3', Y: 'y3', SizeX: 'r', SizeY: 'r', ShapeType: 'ELLIPSE', FillColor: '"#60a5fa"', LineColor: '"#3b82f6"', Visible: 'true' },
      },
    ],
  },
];

export default EXAMPLES;
