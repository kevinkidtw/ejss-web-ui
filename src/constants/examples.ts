import type { SimulationState } from '../types/simulation';

const EXAMPLES: (SimulationState & { id: string; description: string; listDescription?: string; difficulty: '入門' | '基礎' | '進階' })[] = [
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
        properties: { Width: '400', Height: '300', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"#FFFDF8"', SquareAspect: 'false' },
      },
      {
        id: 'shm-trail', type: 'Elements.Trail2D', name: 'Trail1', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', LineColor: '"#6B6F76"', MaximumPoints: '300' },
      },
      {
        id: 'shm-arrow', type: 'Elements.Arrow2D', name: '彈力箭頭', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', SizeX: 'F * 0.15', SizeY: '0', FillColor: '"#D1495B"' },
      },
      {
        id: 'shm-ball', type: 'Elements.Shape2D', name: '質點', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', SizeX: '0.3', SizeY: '0.3', ShapeType: 'ELLIPSE', FillColor: '"#2F6FB0"', LineColor: '"#275D94"', Visible: 'true' },
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
        properties: { Width: '400', Height: '350', MinimumX: '-3', MaximumX: '3', MinimumY: '-3', MaximumY: '1.2', Background: '"#FFFDF8"', SquareAspect: 'true' },
      },
      {
        id: 'pen-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'L * Math.sin(theta)', Y: '-L * Math.cos(theta)', LineColor: '"#6B6F76"', MaximumPoints: '400' },
      },
      {
        id: 'pen-rod', type: 'Elements.Arrow2D', name: '擺桿', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: 'L * Math.sin(theta)', SizeY: '-L * Math.cos(theta)', FillColor: '"#6B6F76"' },
      },
      {
        id: 'pen-pivot', type: 'Elements.Shape2D', name: '支點', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '0.08', SizeY: '0.08', ShapeType: 'ELLIPSE', FillColor: '"#2B2D31"', LineColor: '"#2B2D31"', Visible: 'true' },
      },
      {
        id: 'pen-bob', type: 'Elements.Shape2D', name: '擺錘', parent: 'DrawingPanel1',
        properties: { X: 'L * Math.sin(theta)', Y: '-L * Math.cos(theta)', SizeX: '0.22', SizeY: '0.22', ShapeType: 'ELLIPSE', FillColor: '"#E9A23B"', LineColor: '"#D68C26"', Visible: 'true' },
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
        properties: { Width: '480', Height: '300', MinimumX: '-5', MaximumX: '5', MinimumY: '-4', MaximumY: '4', Background: '"#FFFDF8"', SquareAspect: 'false' },
      },
      {
        id: 'pro-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', LineColor: '"#2F6FB0"', MaximumPoints: '500' },
      },
      {
        id: 'pro-ball', type: 'Elements.Shape2D', name: '球', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.25', SizeY: '0.25', ShapeType: 'ELLIPSE', FillColor: '"#E9A23B"', LineColor: '"#D68C26"', Visible: 'true' },
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
        properties: { Width: '400', Height: '260', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"#FFFDF8"', SquareAspect: 'false' },
      },
      {
        id: 'dmp-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', LineColor: '"#2F6FB0"', MaximumPoints: '800' },
      },
      {
        id: 'dmp-spring', type: 'Elements.Spring2D', name: '彈簧', parent: 'DrawingPanel1',
        properties: { X: '-4', Y: '0', SizeX: 'x + 4', SizeY: '0', LineColor: '"#6B6F76"' },
      },
      {
        id: 'dmp-ball', type: 'Elements.Shape2D', name: '質點', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: '0', SizeX: '0.28', SizeY: '0.28', ShapeType: 'ELLIPSE', FillColor: '"#2F6FB0"', LineColor: '"#275D94"', Visible: 'true' },
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
      id: 'orb-ode', name: '重力方程', method: 'Yoshida4', increment: '0.005', comment: '',
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
        properties: { Width: '380', Height: '380', MinimumX: '-3', MaximumX: '3', MinimumY: '-3', MaximumY: '3', Background: '"#FFFDF8"', SquareAspect: 'true' },
      },
      {
        id: 'orb-trail', type: 'Elements.Trail2D', name: '軌道', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', LineColor: '"#2F6FB0"', MaximumPoints: '1500' },
      },
      {
        id: 'orb-sun', type: 'Elements.Shape2D', name: '太陽', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '0.35', SizeY: '0.35', ShapeType: 'ELLIPSE', FillColor: '"#E9A23B"', LineColor: '"#D68C26"', Visible: 'true' },
      },
      {
        id: 'orb-planet', type: 'Elements.Shape2D', name: '行星', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.18', SizeY: '0.18', ShapeType: 'ELLIPSE', FillColor: '"#2A9D8F"', LineColor: '"#1A5B52"', Visible: 'true' },
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
        properties: { Width: '400', Height: '300', MinimumX: '-1.6', MaximumX: '1.6', MinimumY: '-1.2', MaximumY: '1.2', Background: '"#FFFDF8"', SquareAspect: 'true' },
      },
      {
        id: 'tb-trail1', type: 'Elements.Trail2D', name: '軌跡1', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', LineColor: '"#D1495B"', MaximumPoints: '2000' },
      },
      {
        id: 'tb-trail2', type: 'Elements.Trail2D', name: '軌跡2', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', LineColor: '"#2A9D8F"', MaximumPoints: '2000' },
      },
      {
        id: 'tb-trail3', type: 'Elements.Trail2D', name: '軌跡3', parent: 'DrawingPanel1',
        properties: { X: 'x3', Y: 'y3', LineColor: '"#2F6FB0"', MaximumPoints: '2000' },
      },
      {
        id: 'tb-star1', type: 'Elements.Shape2D', name: '星體1', parent: 'DrawingPanel1',
        properties: { X: 'x1', Y: 'y1', SizeX: '0.1', SizeY: '0.1', ShapeType: 'ELLIPSE', FillColor: '"#F9E3E6"', LineColor: '"#D1495B"', Visible: 'true' },
      },
      {
        id: 'tb-star2', type: 'Elements.Shape2D', name: '星體2', parent: 'DrawingPanel1',
        properties: { X: 'x2', Y: 'y2', SizeX: '0.1', SizeY: '0.1', ShapeType: 'ELLIPSE', FillColor: '"#E3F2EF"', LineColor: '"#2A9D8F"', Visible: 'true' },
      },
      {
        id: 'tb-star3', type: 'Elements.Shape2D', name: '星體3', parent: 'DrawingPanel1',
        properties: { X: 'x3', Y: 'y3', SizeX: '0.1', SizeY: '0.1', ShapeType: 'ELLIPSE', FillColor: '"#E6EEF7"', LineColor: '"#2F6FB0"', Visible: 'true' },
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
        properties: { Width: '400', Height: '380', MinimumX: '-3', MaximumX: '3', MinimumY: '-3', MaximumY: '1.5', Background: '"#FFFDF8"', SquareAspect: 'true' },
      },
      {
        id: 'dpp-trail', type: 'Elements.Trail2D', name: '軌跡', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)+L2*Math.sin(theta2)', Y: '-(L1*Math.cos(theta1)+L2*Math.cos(theta2))', LineColor: '"#2F6FB0"', MaximumPoints: '2500' },
      },
      {
        id: 'dpp-rod1', type: 'Elements.Arrow2D', name: '擺桿1', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: 'L1*Math.sin(theta1)', SizeY: '-L1*Math.cos(theta1)', FillColor: '"#6B6F76"' },
      },
      {
        id: 'dpp-rod2', type: 'Elements.Arrow2D', name: '擺桿2', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)', Y: '-L1*Math.cos(theta1)', SizeX: 'L2*Math.sin(theta2)', SizeY: '-L2*Math.cos(theta2)', FillColor: '"#6B6F76"' },
      },
      {
        id: 'dpp-pivot', type: 'Elements.Shape2D', name: '支點', parent: 'DrawingPanel1',
        properties: { X: '0', Y: '0', SizeX: '0.09', SizeY: '0.09', ShapeType: 'ELLIPSE', FillColor: '"#2B2D31"', LineColor: '"#2B2D31"', Visible: 'true' },
      },
      {
        id: 'dpp-bob1', type: 'Elements.Shape2D', name: '擺錘1', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)', Y: '-L1*Math.cos(theta1)', SizeX: '0.2', SizeY: '0.2', ShapeType: 'ELLIPSE', FillColor: '"#E9A23B"', LineColor: '"#D68C26"', Visible: 'true' },
      },
      {
        id: 'dpp-bob2', type: 'Elements.Shape2D', name: '擺錘2', parent: 'DrawingPanel1',
        properties: { X: 'L1*Math.sin(theta1)+L2*Math.sin(theta2)', Y: '-(L1*Math.cos(theta1)+L2*Math.cos(theta2))', SizeX: '0.2', SizeY: '0.2', ShapeType: 'ELLIPSE', FillColor: '"#2A9D8F"', LineColor: '"#1A5B52"', Visible: 'true' },
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
        properties: { Width: '500', Height: '300', MinimumX: '-5', MaximumX: '5', MinimumY: '-3', MaximumY: '3', Background: '"#FFFDF8"', SquareAspect: 'false' },
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
            'ctx.fillStyle="#FFFDF8";ctx.fillRect(0,0,W,H);',
            // tube outline
            'ctx.strokeStyle="#CBD5E1";ctx.lineWidth=1.5;',
            'ctx.strokeRect(toPixX(-5),toPixY(2.8),toPixX(5)-toPixX(-5),toPixY(-2.8)-toPixY(2.8));',
            // screen
            'var sx=toPixX(4.2);',
            'ctx.strokeStyle="rgba(42,157,143,0.7)";ctx.lineWidth=4;',
            'ctx.beginPath();ctx.moveTo(sx,toPixY(2.8));ctx.lineTo(sx,toPixY(-2.8));ctx.stroke();',
            // electron gun
            'ctx.fillStyle="#E5E1D8";',
            'ctx.fillRect(toPixX(-5),toPixY(0.45),toPixX(-3.8)-toPixX(-5),toPixY(-0.45)-toPixY(0.45));',
            'ctx.strokeStyle="#6B6F76";ctx.lineWidth=1;',
            'ctx.strokeRect(toPixX(-5),toPixY(0.45),toPixX(-3.8)-toPixX(-5),toPixY(-0.45)-toPixY(0.45));',
            // B field
            'if(Math.abs(Bz)>0.01){',
            '  ctx.fillStyle="rgba(47,111,176,0.06)";ctx.fillRect(0,toPixY(2.8),W,toPixY(-2.8)-toPixY(2.8));',
            '  var bsym=Bz>0?"·":"×";',
            '  ctx.fillStyle="rgba(47,111,176,0.45)";ctx.font="11px monospace";ctx.textAlign="center";',
            '  for(var xi=-4;xi<=4;xi+=1.8)for(var yi=-2;yi<=2;yi+=1.2)ctx.fillText(bsym,toPixX(xi),toPixY(yi));',
            '}',
            // E field plates + arrows
            'if(Math.abs(Ey)>0.01){',
            '  ctx.fillStyle=Ey>0?"rgba(209,73,91,0.3)":"rgba(47,111,176,0.3)";',
            '  ctx.fillRect(toPixX(-3.8),toPixY(2.3),toPixX(3.8)-toPixX(-3.8),toPixY(1.9)-toPixY(2.3));',
            '  ctx.fillStyle=Ey>0?"rgba(47,111,176,0.3)":"rgba(209,73,91,0.3)";',
            '  ctx.fillRect(toPixX(-3.8),toPixY(-1.9),toPixX(3.8)-toPixX(-3.8),toPixY(-2.3)-toPixY(-1.9));',
            '  ctx.strokeStyle=Ey>0?"rgba(209,73,91,0.6)":"rgba(47,111,176,0.6)";ctx.lineWidth=1;',
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
            '  ctx.strokeStyle="rgba(233,162,59,0.55)";ctx.lineWidth=1.5;ctx.setLineDash([4,4]);',
            '  ctx.beginPath();ctx.moveTo(toPixX(-3.8),toPixY(0));',
            '  for(var k=0;k<plen;k++)ctx.lineTo(toPixX(path[k][0]),toPixY(path[k][1]));',
            '  ctx.stroke();ctx.setLineDash([]);',
            '  var hp=path[plen-1];',
            '  if(hp[0]>=4.1){',
            '    ctx.fillStyle="#2A9D8F";',
            '    ctx.beginPath();ctx.arc(sx,toPixY(hp[1]),6,0,2*Math.PI);ctx.fill();',
            '    ctx.fillStyle="#2B2D31";ctx.font="11px monospace";ctx.textAlign="left";',
            '    ctx.fillText("y="+hp[1].toFixed(2),sx+8,toPixY(hp[1])+4);',
            '  }',
            '}',
            // labels
            'ctx.font="12px monospace";ctx.textAlign="left";ctx.fillStyle="#2B2D31";',
            'ctx.fillText("Ey = "+Ey.toFixed(2),8,18);',
            'ctx.fillText("Bz = "+Bz.toFixed(2),8,34);',
            'ctx.fillText("v₀ = "+v0.toFixed(1),8,50);',
            'ctx.fillStyle="#6B6F76";ctx.textAlign="center";',
            'ctx.fillText("電子槍",toPixX(-4.5),toPixY(-2.5));',
            'ctx.fillText("螢光屏",toPixX(4.6),toPixY(-2.5));',
            'ctx.restore();',
          ].join('\n'),
        },
      },
      {
        id: 'crt-electron', type: 'Elements.Shape2D', name: '電子', parent: 'DrawingPanel1',
        properties: { X: 'x', Y: 'y', SizeX: '0.18', SizeY: '0.18', ShapeType: 'ELLIPSE', FillColor: '"#E9A23B"', LineColor: '"#D68C26"', Visible: 'true' },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 9. 折射（Snell's Law — 波前動畫）
  // 以平行波前填色動畫展示光進入玻璃後波長縮短、折射角變小
  // ─────────────────────────────────────────────
      {
    id: 'snell',
    listDescription: '以波前動畫展示折射與反射定律：光密射向光疏可展示全反射（TIR）。雙側發射海更斯次波，其包絡線完美疊加出反射與折射波前。',
    description: `# 💡 折射與反射定律：海更斯原理模擬實驗講義 (Huygens' Principle, Reflection & Refraction)

本實驗以**海更斯原理 (Huygens' Principle)** 爲基礎，展示光波（或任何波動）在通過兩種不同介質邊界時，如何同時產生**反射波 (Reflected Wave)** 與**折射波 (Refracted Wave)**。

### 📘 物理原理與幾何關係

當一束平行光（入射波，黃色）以入射角 $\\theta_1$ 自空氣（介質 1，折射率 $n_1$）入射至玻璃（介質 2，折射率 $n_2$）的交界面時：

1. **海更斯原理次波源**：
   根據海更斯原理，波前上的每一點都可以看作是發射球面次波（子波，Wavelets）的波源。這些次波在介質中傳播，其在新時刻的公切面（包絡線）即為新的波前。
   在本模擬中，當入射波前掃過交界面時，界面上均勻分佈的 **15 個橘色圓點**會被依序激發，成為向兩側擴散的半圓形球面次波源。

2. **反射定律 (Law of Reflection)**：
   * 這些向上膨脹的次波在空氣中疊加，其包絡線形成了向右上方傳播的**反射波前（琥珀色平行條紋）**。
   * 反射角 $\\theta'_1$ 永遠等於入射角 $\\theta_1$。

3. **折射定律 (Snell's Law)**：
   * 這些向下膨脹的次波在玻璃中疊加，其包絡線形成了向右下方傳播的**折射波前（青色平行條紋）**。
   * 折射角 $\\theta_2$ 滿足斯乃爾定律 (Snell's Law)：
     $$ n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2 $$
   * 由於 $n_2 > n_1$，在玻璃中的波速 $v_2 < v_1$，波長縮短（$\\lambda_2 = \\lambda_1 \\cdot \\frac{n_1}{n_2}$），使得折射波前間距變窄，且偏向法線（$\\theta_2 < \\theta_1$）。

4. **全反射現象 (Total Internal Reflection, TIR)**：
   * 當光密介質射入光疏介質（設定 $n_1 > n_2$，例如自玻璃射向空氣）且入射角大於臨界角 $\\theta_c$ 時：
     $$ \\theta_1 > \\theta_c = \\sin^{-1}\\left(\\frac{n_2}{n_1}\\right) $$
   * 此時，數學上 $\\sin\\theta_2 > 1$ 無實數解，折射波前與折射次波將**完全消失**，所有能量皆反射回原介質中。

### ✍️ 探究引導與操作任務

1. **觀察次波包絡線**：
   * 點擊 **▶ 播放**，觀察黃色入射平行波前掃過交界面時，橘色波源點如何被觸發。
   * 注意觀察每一點產生的**琥珀色半圓次波（向上）**與**青色半圓次波（向下）**。
   * 驗證這些次波的公切面是否與琥珀色反射波前、青色折射波前完美重合？

2. **調整入射角 $\\theta_1$**：
   * 拖曳「入射角 $\\theta_1$」的滑桿，觀察反射角與折射角如何隨之改變。
   * 驗證不論入射角為何，反射波前方向是否永遠對稱？

3. **探究全反射 (TIR)**：
   * 設定折射率為 $n_1 = 1.5, n_2 = 1.0$（即光密介質入射至光疏介質）。
   * 慢慢調大入射角 $\\theta_1$。當入射角超過臨界角 $\\theta_c \\approx 41.8^\\circ$ 時，觀察下方介質中的次波與折射波前有何變化？這是全反射現象 (Total Internal Reflection)。
`,
    difficulty: '基礎',
    info: { title: '折射與反射定律（波前動畫）', author: '', keywords: '', abstract: '' },
    variables: [
      { id: 'sn-t1',  name: 'theta1', value: '0.7854', type: 'double', comment: '入射角（rad），45° = π/4', page: 'Variables', scope: 'global' },
      { id: 'sn-t2',  name: 'theta2', value: '0.4824', type: 'double', comment: '折射角（rad），由 Snell 定律計算', page: 'Variables', scope: 'global' },
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
        properties: { Width: '420', Height: '300', MinimumX: '-4', MaximumX: '4', MinimumY: '-3', MaximumY: '3', Background: '"#FFFDF8"', SquareAspect: 'false' },
      },
      {
        id: 'sn-sT1', type: 'Elements.Slider', name: 'Slider_theta1', parent: '',
        properties: { Variable: 'theta1', Minimum: '0.0', Maximum: '1.57', Step: '0.01', Label: '入射角 θ₁' },
      },
      {
        id: 'sn-sN1', type: 'Elements.Slider', name: 'Slider_n1', parent: '',
        properties: { Variable: 'n1', Minimum: '1.0', Maximum: '2.5', Step: '0.1', Label: '介質 1 折射率 n₁' },
      },
      {
        id: 'sn-sN2', type: 'Elements.Slider', name: 'Slider_n2', parent: '',
        properties: { Variable: 'n2', Minimum: '1.0', Maximum: '2.5', Step: '0.1', Label: '介質 2 折射率 n₂' },
      },
      {
        id: 'sn-draw', type: 'Elements.CustomDraw', name: 'WavefrontDraw', parent: 'DrawingPanel1',
        properties: {
          Code: [
            'var t1=vars.theta1,t2=vars.theta2,n1=vars.n1,n2=vars.n2,ph=vars.phase,bHW=vars.beamHW;',
            'var lam1=1.0,lam2=n1/n2,iy=toPixY(0);',
            'var isTIR=(n1*Math.sin(t1)/n2)>0.9999;',
            'ctx.save();',
            'ctx.fillStyle="rgba(250, 248, 243, 0.6)";ctx.fillRect(0,0,W,iy);',
            'ctx.fillStyle="rgba(227, 242, 239, 0.6)";ctx.fillRect(0,iy,W,H-iy);',
            'ctx.setLineDash([8,4]);ctx.strokeStyle="#CBD5E1";ctx.lineWidth=1.5;',
            'ctx.beginPath();ctx.moveTo(0,iy);ctx.lineTo(W,iy);ctx.stroke();ctx.setLineDash([]);',
            'ctx.font="12px monospace";ctx.textAlign="left";',
            'ctx.fillStyle="#2B2D31";',
            'ctx.fillText("空氣  n₁="+n1.toFixed(1),10,18);',
            'ctx.fillText("玻璃  n₂="+n2.toFixed(1),10,iy+18);',
            'ctx.fillStyle="#E9A23B";ctx.textAlign="right";',
            'ctx.fillText("θ₁="+(t1*180/Math.PI).toFixed(1)+"°",W-10,18);',
            'if(isTIR){',
            '  ctx.fillStyle="#D1495B";',
            '  ctx.fillText("全反射 TIR",W-10,iy+18);',
            '} else {',
            '  ctx.fillStyle="#2A9D8F";',
            '  ctx.fillText("θ₂="+(t2*180/Math.PI).toFixed(1)+"°",W-10,iy+18);',
            '}',
            'ctx.strokeStyle="#CBD5E1";ctx.lineWidth=1;ctx.setLineDash([4,3]);',
            'ctx.beginPath();ctx.moveTo(toPixX(0),0);ctx.lineTo(toPixX(0),H);ctx.stroke();ctx.setLineDash([]);',
            'var s1=Math.sin(t1),c1=Math.cos(t1),s2=Math.sin(t2),c2=Math.cos(t2);',
            'var xLimit = Math.min(bHW / Math.max(0.01, c1), 4.5);',
            'var N = 15;',
            'ctx.save();',
            'ctx.beginPath();',
            'ctx.moveTo(toPixX(-xLimit - 3.5 * Math.tan(t1)), toPixY(3.5));',
            'ctx.lineTo(toPixX(xLimit - 3.5 * Math.tan(t1)), toPixY(3.5));',
            'ctx.lineTo(toPixX(xLimit), toPixY(0));',
            'ctx.lineTo(toPixX(-xLimit), toPixY(0));',
            'ctx.closePath();',
            'ctx.fillStyle = "rgba(233, 162, 59, 0.12)";',
            'ctx.fill();',
            'ctx.beginPath();',
            'ctx.moveTo(toPixX(-xLimit), toPixY(0));',
            'ctx.lineTo(toPixX(xLimit), toPixY(0));',
            'ctx.lineTo(toPixX(xLimit + 3.5 * Math.tan(t1)), toPixY(3.5));',
            'ctx.lineTo(toPixX(-xLimit + 3.5 * Math.tan(t1)), toPixY(3.5));',
            'ctx.closePath();',
            'ctx.fillStyle = isTIR ? "rgba(209, 73, 91, 0.15)" : "rgba(233, 162, 59, 0.08)";',
            'ctx.fill();',
            'if(!isTIR){',
            '  ctx.beginPath();',
            '  ctx.moveTo(toPixX(-xLimit), toPixY(0));',
            '  ctx.lineTo(toPixX(xLimit), toPixY(0));',
            '  ctx.lineTo(toPixX(xLimit + 3.5 * Math.tan(t2)), toPixY(-3.5));',
            '  ctx.lineTo(toPixX(-xLimit + 3.5 * Math.tan(t2)), toPixY(-3.5));',
            '  ctx.closePath();',
            '  ctx.fillStyle = "rgba(42, 157, 143, 0.12)";',
            '  ctx.fill();',
            '}',
            'ctx.restore();',
            'var airOff=ph%lam1;',
            'ctx.save();ctx.beginPath();ctx.rect(0,0,W,iy);ctx.clip();',
            'ctx.strokeStyle="rgba(233,162,59,0.85)";ctx.lineWidth=2.0;',
            'for(var ai=0;ai<20;ai++){',
            '  var fa=airOff-ai*lam1;',
            '  ctx.beginPath();',
            '  ctx.moveTo(toPixX(fa*s1-bHW*c1),toPixY(-fa*c1-bHW*s1));',
            '  ctx.lineTo(toPixX(fa*s1+bHW*c1),toPixY(-fa*c1+bHW*s1));',
            '  ctx.stroke();',
            '}',
            'ctx.strokeStyle=isTIR?"rgba(209,73,91,0.85)":"rgba(233,162,59,0.55)";',
            'for(var ri=0;ri<20;ri++){',
            '  var fr=airOff+ri*lam1;',
            '  ctx.beginPath();',
            '  ctx.moveTo(toPixX(fr*s1-bHW*c1),toPixY(fr*c1+bHW*s1));',
            '  ctx.lineTo(toPixX(fr*s1+bHW*c1),toPixY(fr*c1-bHW*s1));',
            '  ctx.stroke();',
            '}',
            'ctx.restore();',
            'if(!isTIR){',
            '  var glassBase=(ph*lam2)%lam2,gs=glassBase-lam2;',
            '  ctx.save();ctx.beginPath();ctx.rect(0,iy,W,H-iy);ctx.clip();',
            '  ctx.strokeStyle="rgba(42,157,143,0.85)";ctx.lineWidth=2.0;',
            '  var bHW2 = xLimit * c2;',
            '  for(var gi=0;gi<25;gi++){',
            '    var fg=gs+gi*lam2;',
            '    ctx.beginPath();',
            '    ctx.moveTo(toPixX(fg*s2-bHW2*c2),toPixY(-fg*c2-bHW2*s2));',
            '    ctx.lineTo(toPixX(fg*s2+bHW2*c2),toPixY(-fg*c2+bHW2*s2));',
            '    ctx.stroke();',
            '}',
            '  ctx.restore();',
            '}',
            'if(!isTIR){',
            '  ctx.save();ctx.beginPath();ctx.rect(0,iy,W,H-iy);ctx.clip();',
            '  for(var i=0; i<N; i++){',
            '    var xi = -xLimit + (2 * xLimit * i) / (N - 1);',
            '    var pixXi = toPixX(xi);',
            '    var phiLocal = ph - xi * s1 / lam1;',
            '    var f = (phiLocal % 1.0 + 1.0) % 1.0;',
            '    for(var k=0; k<8; k++){',
            '      var R = lam2 * (f + k);',
            '      var pixR = toPixLen(R);',
            '      var opacity = 0.35 * Math.max(0, 1.0 - R / 4.5);',
            '      if(opacity <= 0) continue;',
            '      ctx.strokeStyle = "rgba(42, 157, 143, " + opacity.toFixed(3) + ")";',
            '      ctx.lineWidth = 1.2;',
            '      ctx.beginPath();',
            '      ctx.arc(pixXi, iy, pixR, 0, Math.PI);',
            '      ctx.stroke();',
            '    }',
            '  }',
            '  ctx.restore();',
            '}',
            'ctx.save();ctx.beginPath();ctx.rect(0,0,W,iy);ctx.clip();',
            'for(var i=0; i<N; i++){',
            '  var xi = -xLimit + (2 * xLimit * i) / (N - 1);',
            '  var pixXi = toPixX(xi);',
            '  var phiLocal = ph - xi * s1 / lam1;',
            '  var f = (phiLocal % 1.0 + 1.0) % 1.0;',
            '  for(var k=0; k<8; k++){',
            '    var R = lam1 * (f + k);',
            '    var pixR = toPixLen(R);',
            '    var opacity = (isTIR ? 0.45 : 0.22) * Math.max(0, 1.0 - R / 4.5);',
            '    if(opacity <= 0) continue;',
            '    ctx.strokeStyle = "rgba(233, 162, 59, " + opacity.toFixed(3) + ")";',
            '    ctx.lineWidth = 1.2;',
            '    ctx.beginPath();',
            '    ctx.arc(pixXi, iy, pixR, Math.PI, 2 * Math.PI);',
            '    ctx.stroke();',
            '  }',
            '}',
            'ctx.restore();',
            'ctx.save();',
            'for(var i=0; i<N; i++){',
            '  var xi = -xLimit + (2 * xLimit * i) / (N - 1);',
            '  var pixXi = toPixX(xi);',
            '  ctx.fillStyle = "rgba(233,162,59,0.4)";',
            '  ctx.beginPath();',
            '  ctx.arc(pixXi, iy, 5, 0, 2*Math.PI);',
            '  ctx.fill();',
            '  ctx.fillStyle = "rgba(233,162,59,1.0)";',
            '  ctx.beginPath();',
            '  ctx.arc(pixXi, iy, 2.5, 0, 2*Math.PI);',
            '  ctx.fill();',
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
        'var N=Math.max(50,Math.min(300,Math.round(nParticles)));',
        'var L=3.5,r=0.07,dt=0.025;',
        'if(!_v._px||_v._px.length!==N){',
        '  _v._px=new Float64Array(N);_v._py=new Float64Array(N);',
        '  _v._vx=new Float64Array(N);_v._vy=new Float64Array(N);',
        '  for(var i=0;i<N;i++){',
        '    _v._px[i]=(Math.random()*2-1)*(L-r*3);',
        '    _v._py[i]=(Math.random()*2-1)*(L-r*3);',
        '    var mb=Physics.Thermo.sampleMaxwellBoltzmann2D(Math.max(0.1,temperature),1.0);',
        '    _v._vx[i]=mb.vx;_v._vy[i]=mb.vy;',
        '  }',
        '  _v._imp=0;_v._impN=0;',
        '}',
        'for(var i=0;i<N;i++){_v._px[i]+=_v._vx[i]*dt;_v._py[i]+=_v._vy[i]*dt;}',
        'var colRes=Physics.Collision.resolveParticleArrays(',
        '  _v._px,_v._py,_v._vx,_v._vy,N,r,1.0,',
        '  {minX:-L,maxX:L,minY:-L,maxY:L},1.0',
        ');',
        '_v._imp+=colRes.wallImpulse;_v._impN++;',
        'if(_v._impN>=20){',
        '  pressure=_v._imp/(20*dt*8*L);',
        '  _v._imp=0;_v._impN=0;',
        '}',
        'var curT=Physics.Thermo.temperature2D(_v._vx,_v._vy,N,1.0);',
        'Physics.Thermo.applyBerendsenThermostat(_v._vx,_v._vy,N,Math.max(0.1,temperature),curT,dt,0.5);',
      ].join('\n'),
    }],
    initPages: [],
    viewElements: [
      {
        id: 'ig-dp', type: 'Elements.DrawingPanel', name: 'DrawingPanel1', parent: '',
        properties: { Width: '420', Height: '420', MinimumX: '-4', MaximumX: '4', MinimumY: '-4', MaximumY: '4', Background: '"#FFFDF8"', SquareAspect: 'true' },
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
            'ctx.strokeStyle="#6B6F76";ctx.lineWidth=2;',
            'var bx0=toPixX(-L),by0=toPixY(L),bw=toPixX(L)-toPixX(-L),bh=toPixY(-L)-toPixY(L);',
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
            'ctx.fillStyle="rgba(255,255,255,0.9)";',
            'ctx.fillRect(W-140,6,134,90);',
            'ctx.strokeStyle="#E5E1D8";',
            'ctx.strokeRect(W-140,6,134,90);',
            'ctx.fillStyle="#2B2D31";ctx.font="bold 12px monospace";',
            'ctx.fillText("粒子數 N = "+N,W-132,24);',
            'ctx.fillText("溫度  T = "+T.toFixed(2),W-132,42);',
            'ctx.fillText("壓力  P = "+P.toFixed(2),W-132,60);',
            'ctx.fillStyle="#2A9D8F";',
            'ctx.fillText("PV/NkT = "+pv_nkt,W-132,82);',
          ].join('\n'),
        },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 10. 三體問題（3D立體投影）
  // ─────────────────────────────────────────────
  {
      id: 'threebody3d',
      listDescription: '在三維空間中模擬三個星體互相吸引的運動。包含滑動旋轉視角的 3D 透視投影與深度排序球體渲染。',
      description: `# 🌌 三體問題 3D 空間運動與透視投影模擬實驗講義
  # 🌌 三體問題 3D 空間運動與透視投影模擬實驗講義
      
  本實驗將經典的三體運動擴展到 **三維物理空間 $(x, y, z)$**，並利用數學投影公式在 2D 畫布上呈現具備立體深度感與相機旋轉互動的 3D 物理動畫。
  
  ### 📘 3D 物理原理與運動方程
  三個星體在三維空間中互相施加萬有引力，每個星體都有三個位置分量 $(x, y, z)$ 與三個速度分量 $(v_x, v_y, v_z)$。其二階常微分方程組在三個維度上是完全對稱且相互耦合的：
  $ \\frac{d v_{ix}}{dt} = \\sum_{j \\neq i} G m_j \\frac{x_j - x_i}{r_{ij}^3} $
  $ \\frac{d v_{iy}}{dt} = \\sum_{j \\neq i} G m_j \\frac{y_j - y_i}{r_{ij}^3} $
  $ \\frac{d v_{iz}}{dt} = \\sum_{j \\neq i} G m_j \\frac{z_j - z_i}{r_{ij}^3} $
  其中星體之間的距離為三維空間的歐幾里得距離：
  $ r_{ij} = \\sqrt{(x_j - x_i)^2 + (y_j - y_i)^2 + (z_j - z_i)^2} $
  
  ### 🎥 3D 透視投影與旋轉變換 (Camera Projection)
  為了在二維平面螢幕上繪製三維物件，我們需要定義相機偏航角（Yaw，繞 Y 軸旋轉 $\\theta$）與俯仰角（Pitch，繞 X 軸旋轉 $\\phi$），對三維物理坐標進行旋轉矩陣變換，再進行透視投影：
  
  1. **繞 Y 軸旋轉 (Yaw)**：
     $ x' = x \\cos\\theta - z \\sin\\theta, \\quad z' = x \\sin\\theta + z \\cos\\theta, \\quad y' = y $
  2. **繞 X 軸旋轉 (Pitch)**：
     $ x'' = x', \\quad y'' = y' \\cos\\phi - z' \\sin\\phi, \\quad z'' = y' \\sin\\phi + z' \\cos\\phi $
  3. **透視收縮 (Perspective Projection)**：
     設相機與原點距離為 $d$（例如 $6.0$），投影後的二維縮放比例因子為 $f = d / (d + z'')$。投影面坐標為：
     $ x_p = x'' \\cdot f, \\quad y_p = y'' \\cdot f $
     當 $z''$ 越大（代表星體離相機越遠）時，縮放因子 $f$ 越小，繪製的星體半徑與軌跡也會越小，從而產生「近大遠小」的立體視覺效果。
  
  ### 🌟 三維空間（3D）三體穩定解的存在
  雖然三體問題在大尺度下具有混沌本質，但科學家已證明 **3D 穩定週期解** 是確實存在的！
  - **廖世俊教授團隊與 2025 年最新發現**：藉由高精度數值模擬（CNS 乾淨數值模擬）與機器學習，科學家在 3D 空間中已經成功尋找到超過 **10,000 個全新的三維週期解軌道**。
  - **線性穩定性（Linear Stability）**：在這些 3D 週期軌道中，大約有 20%（約 2,000 個）是線性穩定的。這意味著若星體受到微小引力擾動，軌道不會立刻崩潰，星體能自動修正並維持在三維週期路徑附近。
  - **本範本的 3D 混沌運動**：本 3D 範例所採用的初始參數屬於一個**非共面的三維混沌運動**。這可以作為您觀察「非共面三維運動」的對照組，透過與 2D 的 8 字形穩定解進行對比，學習如何區分三維混沌軌道與穩定的週期軌道。
  
  ### ✍️ 探究引導思考
  1.  **滑鼠拖曳互動**：
      *   在左側繪圖面板上**按住滑鼠左鍵拖拉**（或在行動裝置上用手指單指滑動），可以即時改變相機的旋轉視角。
      *   試著旋轉到正上方俯視、或旋轉到側面觀察，這對理解三體運動在三維空間中的分佈有什麼幫助？
  2.  **3D 空間的混沌性質**：
      *   本範例配置了非共面的三維空間初始位置與速度（星體 1、2、3 的 Z 軸高度分別為 $0.0$、$0.5$、$-0.5$，且擁有非零的 Z 軸初速度，同時維持系統總動能與質心動量為 0）。
      *   點擊「播放」運行，觀察三顆星體是如何在 3D 立體線框中進行完全不共面、互相交錯的複雜混沌軌道繞行。
  `,
      difficulty: '進階',info: { title: '三體問題（3D立體投影）', author: '', keywords: '', abstract: '' },variables: [
        {  id: 'tb3-x1',name:'x1',value:'1.0',type:'double',comment:'星體1 X位置',page:'Variables',scope: 'global' },
        {id:'tb3-y1',name:'y1',value:'0.5',type:'double',comment:'星體1 Y位置',page:'Variables',scope: 'global' },
        {id:'tb3-z1',name:'z1',value:'0.0',type:'double',comment:'星體1 Z位置',page:'Variables',scope: 'global' },
        {id:'tb3-vx1',name:'vx1',value:'-0.3',type:'double',comment:'星體1 X速度',page:'Variables',scope: 'global' },
        {id:'tb3-vy1',name:'vy1',value:'0.4',type:'double',comment:'星體1 Y速度',page:'Variables',scope: 'global' },
        {id:'tb3-vz1',name:'vz1',value:'0.3',type:'double',comment:'星體1 Z速度',page:'Variables',scope: 'global' },
        {id:'tb3-x2',name:'x2',value:'-0.8',type:'double',comment:'星體2 X位置',page:'Variables',scope: 'global' },
        {id:'tb3-y2',name:'y2',value:'-0.4',type:'double',comment:'星體2 Y位置',page:'Variables',scope: 'global' },
        {id:'tb3-z2',name:'z2',value:'0.5',type:'double',comment:'星體2 Z位置',page:'Variables',scope: 'global' },
        {id:'tb3-vx2',name:'vx2',value:'0.4',type:'double',comment:'星體2 X速度',page:'Variables',scope: 'global' },
        {id:'tb3-vy2',name:'vy2',value:'-0.3',type:'double',comment:'星體2 Y速度',page:'Variables',scope: 'global' },
        {id:'tb3-vz2',name:'vz2',value:'-0.2',type:'double',comment:'星體2 Z速度',page:'Variables',scope: 'global' },
        {id:'tb3-x3',name:'x3',value:'-0.2',type:'double',comment:'星體3 X位置',page:'Variables',scope: 'global' },
        {id:'tb3-y3',name:'y3',value:'-0.1',type:'double',comment:'星體3 Y位置',page:'Variables',scope: 'global' },
        {id:'tb3-z3',name:'z3',value:'-0.5',type:'double',comment:'星體3 Z位置',page:'Variables',scope: 'global' },
        {id:'tb3-vx3',name:'vx3',value:'-0.1',type:'double',comment:'星體3 X速度',page:'Variables',scope: 'global' },
        {id:'tb3-vy3',name:'vy3',value:'-0.1',type:'double',comment:'星體3 Y速度',page:'Variables',scope: 'global' },
        {id:'tb3-vz3',name:'vz3',value:'-0.1',type:'double',comment:'星體3 Z速度',page:'Variables',scope: 'global' },
        {id:'tb3-m',name:'m',value:'1',type:'double',comment:'星體質量',page:'Variables',scope: 'global' },
        {id:'tb3-yaw',name:'camYaw',value:'0.5',type:'double',comment:'相機Yaw偏航角(弧度)',page:'Variables',scope: 'global' },
        {id:'tb3-pit',name:'camPitch',value:'0.4',type:'double',comment:'相機Pitch俯仰角(弧度)',page:'Variables',scope: 'global' }],odePages:[{id:'tb3-ode',name:'3D重力方程',method:'RungeKutta',increment:'0.001',comment:'',rates:[{state:'x1',expression:'vx1'},
        {state:'y1',expression:'vy1'},
        {state:'z1',expression:'vz1'},
        {state:'vx1',expression:'m*(x2-x1)/Math.pow((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1)+0.09,1.5) + m*(x3-x1)/Math.pow((x3-x1)*(x3-x1)+(y3-y1)*(y3-y1)+(z3-z1)*(z3-z1)+0.09,1.5)'},
        {state:'vy1',expression:'m*(y2-y1)/Math.pow((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1)+0.09,1.5) + m*(y3-y1)/Math.pow((x3-x1)*(x3-x1)+(y3-y1)*(y3-y1)+(z3-z1)*(z3-z1)+0.09,1.5)'},
        {state:'vz1',expression:'m*(z2-z1)/Math.pow((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1)+0.09,1.5) + m*(z3-z1)/Math.pow((x3-x1)*(x3-x1)+(y3-y1)*(y3-y1)+(z3-z1)*(z3-z1)+0.09,1.5)'},
        {state:'x2',expression:'vx2'},
        {state:'y2',expression:'vy2'},
        {state:'z2',expression:'vz2'},
        {state:'vx2',expression:'m*(x1-x2)/Math.pow((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)+(z1-z2)*(z1-z2)+0.09,1.5) + m*(x3-x2)/Math.pow((x3-x2)*(x3-x2)+(y3-y2)*(y3-y2)+(z3-z2)*(z3-z2)+0.09,1.5)'},
        {state:'vy2',expression:'m*(y1-y2)/Math.pow((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)+(z1-z2)*(z1-z2)+0.09,1.5) + m*(y3-y2)/Math.pow((x3-x2)*(x3-x2)+(y3-y2)*(y3-y2)+(z3-z2)*(z3-z2)+0.09,1.5)'},
        {state:'vz2',expression:'m*(z1-z2)/Math.pow((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)+(z1-z2)*(z1-z2)+0.09,1.5) + m*(z3-z2)/Math.pow((x3-x2)*(x3-x2)+(y3-y2)*(y3-y2)+(z3-z2)*(z3-z2)+0.09,1.5)'},
        {state:'x3',expression:'vx3'},
        {state:'y3',expression:'vy3'},
        {state:'z3',expression:'vz3'},
        {state:'vx3',expression:'m*(x1-x3)/Math.pow((x1-x3)*(x1-x3)+(y1-y3)*(y1-y3)+(z1-z3)*(z1-z3)+0.09,1.5) + m*(x2-x3)/Math.pow((x2-x3)*(x2-x3)+(y2-y3)*(y2-y3)+(z2-z3)*(z2-z3)+0.09,1.5)'},
        {state:'vy3',expression:'m*(y1-y3)/Math.pow((x1-x3)*(x1-x3)+(y1-y3)*(y1-y3)+(z1-z3)*(z1-z3)+0.09,1.5) + m*(y2-y3)/Math.pow((x2-x3)*(x2-x3)+(y2-y3)*(y2-y3)+(z2-z3)*(z2-z3)+0.09,1.5)'},
        {state:'vz3',expression:'m*(z1-z3)/Math.pow((x1-x3)*(x1-x3)+(y1-y3)*(y1-y3)+(z1-z3)*(z1-z3)+0.09,1.5) + m*(z2-z3)/Math.pow((x2-x3)*(x2-x3)+(y2-y3)*(y2-y3)+(z2-z3)*(z2-z3)+0.09,1.5)'}]}],constraintPages:[],initPages:[],viewElements:[{id:'tb3-dp',type:'Elements.DrawingPanel',name:'DrawingPanel1',parent:'',properties:{Width:'420',Height:'420',MinimumX:'-2',MaximumX:'2',MinimumY:'-2',MaximumY:'2',Background:'"#FFFDF8"',SquareAspect:'true'}},
        {id:'tb3-draw',type:'Elements.CustomDraw',name:'3D畫布渲染器',parent:'DrawingPanel1',properties:{
      Code: [
              'var canvas = ctx.canvas;',
              'if (!canvas._has3DListeners) {',
              '  canvas._has3DListeners = true;',
              '  var isDragging = false;',
              '  var lastX = 0, lastY = 0;',
              '  ',
              '  canvas.addEventListener("mousedown", function(e) {',
              '    if (e.button === 0) {',
              '      isDragging = true;',
              '      lastX = e.clientX;',
              '      lastY = e.clientY;',
              '    }',
              '  });',
              '  ',
              '  window.addEventListener("mousemove", function(e) {',
              '    if (isDragging) {',
              '      var dx = e.clientX - lastX;',
              '      var dy = e.clientY - lastY;',
              '      lastX = e.clientX;',
              '      lastY = e.clientY;',
              '      vars.camYaw = (vars.camYaw || 0.5) + dx * 0.007;',
              '      vars.camPitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, (vars.camPitch || 0.4) + dy * 0.007));',
              '      if (window._simRender) window._simRender();',
              '    }',
              '  });',
              '  ',
              '  window.addEventListener("mouseup", function() {',
              '    isDragging = false;',
              '  });',
              '  ',
              '  canvas.addEventListener("touchstart", function(e) {',
              '    if (e.touches.length === 1) {',
              '      isDragging = true;',
              '      lastX = e.touches[0].clientX;',
              '      lastY = e.touches[0].clientY;',
              '    }',
              '  }, { passive: true });',
              '  ',
              '  window.addEventListener("touchmove", function(e) {',
              '    if (isDragging && e.touches.length === 1) {',
              '      var dx = e.touches[0].clientX - lastX;',
              '      var dy = e.touches[0].clientY - lastY;',
              '      lastX = e.touches[0].clientX;',
              '      lastY = e.touches[0].clientY;',
              '      vars.camYaw = (vars.camYaw || 0.5) + dx * 0.007;',
              '      vars.camPitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, (vars.camPitch || 0.4) + dy * 0.007));',
              '      if (window._simRender) window._simRender();',
              '    }',
              '  }, { passive: true });',
              '  ',
              '  window.addEventListener("touchend", function() {',
              '    isDragging = false;',
              '  });',
              '}',
              '',
              'function project(x, y, z) {',
              '  var cy = Math.cos(vars.camYaw || 0.5), sy = Math.sin(vars.camYaw || 0.5);',
              '  var cp = Math.cos(vars.camPitch || 0.4), sp = Math.sin(vars.camPitch || 0.4);',
              '  var x1 = x * cy - z * sy;',
              '  var z1 = x * sy + z * cy;',
              '  var x2 = x1;',
              '  var y2 = y * cp - z1 * sp;',
              '  var z2 = y * sp + z1 * cp;',
              '  var dist = 6.0;',
              '  var f = dist / (dist + z2);',
              '  return { x: toPixX(x2 * f), y: toPixY(y2 * f), depth: z2, sizeScale: f };',
              '}',
              '',
              'ctx.fillStyle = "#FFFDF8";',
              'ctx.fillRect(0, 0, W, H);',
              '',
              'var vLimit = 1.4;',
              'var vertices = [',
              '  [-vLimit, -vLimit, -vLimit], [vLimit, -vLimit, -vLimit], [vLimit, vLimit, -vLimit], [-vLimit, vLimit, -vLimit],',
              '  [-vLimit, -vLimit, vLimit],  [vLimit, -vLimit, vLimit],  [vLimit, vLimit, vLimit],  [-vLimit, vLimit, vLimit]',
              '];',
              'var edges = [',
              '  [0, 1], [1, 2], [2, 3], [3, 0],',
              '  [4, 5], [5, 6], [6, 7], [7, 4],',
              '  [0, 4], [1, 5], [2, 6], [3, 7]',
              '];',
              'ctx.strokeStyle = "rgba(107, 111, 118, 0.25)";',
              'ctx.lineWidth = 1;',
              'edges.forEach(function(e) {',
              '  var p1 = project(vertices[e[0]][0], vertices[e[0]][1], vertices[e[0]][2]);',
              '  var p2 = project(vertices[e[1]][0], vertices[e[1]][1], vertices[e[1]][2]);',
              '  ctx.beginPath();ctx.moveTo(p1.x, p1.y);ctx.lineTo(p2.x, p2.y);ctx.stroke();',
              '});',
              '',
              'if (!vars._trails) {',
              '  vars._trails = [[], [], []];',
              '  vars._t_last = -1;',
              '}',
              'if (vars.t !== vars._t_last) {',
              '  vars._t_last = vars.t;',
              '  vars._trails[0].push([vars.x1, vars.y1, vars.z1]);',
              '  vars._trails[1].push([vars.x2, vars.y2, vars.z2]);',
              '  vars._trails[2].push([vars.x3, vars.y3, vars.z3]);',
              '  var maxPts = 500;',
              '  for (var i = 0; i < 3; i++) {',
              '    if (vars._trails[i].length > maxPts) vars._trails[i].shift();',
              '  }',
              '}',
              '',
              'var colors = ["rgba(209, 73, 91, ", "rgba(42, 157, 143, ", "rgba(47, 111, 176, "];',
              'for (var ti = 0; ti < 3; ti++) {',
              '  var tPoints = vars._trails[ti];',
              '  if (tPoints.length < 2) continue;',
              '  ctx.lineWidth = 2.0;',
              '  for (var k = 1; k < tPoints.length; k++) {',
              '    var pStart = project(tPoints[k-1][0], tPoints[k-1][1], tPoints[k-1][2]);',
              '    var pEnd = project(tPoints[k][0], tPoints[k][1], tPoints[k][2]);',
              '    var alpha = (k / tPoints.length) * 0.65;',
              '    ctx.strokeStyle = colors[ti] + alpha + ")";',
              '    ctx.beginPath();ctx.moveTo(pStart.x, pStart.y);ctx.lineTo(pEnd.x, pEnd.y);ctx.stroke();',
              '  }',
              '}',
              '',
              'var stars = [',
              '  { x: vars.x1, y: vars.y1, z: vars.z1, color: "#F9E3E6", lineColor: "#D1495B" },',
              '  { x: vars.x2, y: vars.y2, z: vars.z2, color: "#E3F2EF", lineColor: "#2A9D8F" },',
              '  { x: vars.x3, y: vars.y3, z: vars.z3, color: "#E6EEF7", lineColor: "#2F6FB0" }',
              '];',
              'stars.forEach(function(s) { s.proj = project(s.x, s.y, s.z); });',
              'stars.sort(function(a, b) { return b.proj.depth - a.proj.depth; });',
              'stars.forEach(function(s) {',
              '  var p = s.proj;',
              '  var baseRadius = 0.12;',
              '  var pxR = toPixLen(baseRadius * p.sizeScale);',
              '  var grad = ctx.createRadialGradient(p.x - pxR * 0.3, p.y - pxR * 0.3, pxR * 0.1, p.x, p.y, pxR);',
              '  grad.addColorStop(0, "#ffffff");',
              '  grad.addColorStop(0.3, s.color);',
              '  grad.addColorStop(1, s.lineColor);',
              '  ctx.beginPath();ctx.arc(p.x, p.y, Math.max(pxR, 3), 0, 2*Math.PI);',
              '  ctx.fillStyle = grad;ctx.fill();',
              '  ctx.strokeStyle = "rgba(255,255,255,0.3)";ctx.lineWidth = 0.5;ctx.stroke();',
              '});',
              '',
              'ctx.fillStyle = "#6B6F76";ctx.font = "12px monospace";ctx.textAlign = "left";',
              'ctx.fillText("按住滑鼠左鍵拖曳旋轉視角", 12, 22);',
              'ctx.fillText("Yaw: " + (vars.camYaw || 0.5).toFixed(2) + " rad", 12, 40);',
              'ctx.fillText("Pitch: " + (vars.camPitch || 0.4).toFixed(2) + " rad", 12, 58);',
            ].join('\n')
      }}]
    },
];

export default EXAMPLES;
