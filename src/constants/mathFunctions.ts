export interface MathFn {
  syntax: string;
  label: string;
  desc: string;
  example?: string;   // 具體數值範例
  physics?: string;   // 物理模擬應用場景
}

export interface MathFnGroup {
  category: string;
  fns: MathFn[];
}

const MATH_FUNCTIONS: MathFnGroup[] = [
  {
    category: '三角函數',
    fns: [
      {
        syntax: 'Math.sin(x)',
        label: 'sin 正弦',
        desc: '輸入角度（弧度），回傳 -1 到 1 之間的值。角度轉弧度：deg × Math.PI / 180',
        example: 'Math.sin(Math.PI/6) → 0.5\nMath.sin(Math.PI/2) → 1',
        physics: '單擺水平位移：x = L * Math.sin(theta)\n電磁波振盪：y = A * Math.sin(omega * t)',
      },
      {
        syntax: 'Math.cos(x)',
        label: 'cos 餘弦',
        desc: '輸入角度（弧度），回傳 -1 到 1 之間的值',
        example: 'Math.cos(0) → 1\nMath.cos(Math.PI/3) → 0.5',
        physics: '單擺垂直分量：y = -L * Math.cos(theta)\n斜拋水平速度：vx = v0 * Math.cos(angle)',
      },
      {
        syntax: 'Math.tan(x)',
        label: 'tan 正切',
        desc: '輸入角度（弧度）；在 π/2 + nπ 處無定義，數值趨近無限大',
        example: 'Math.tan(Math.PI/4) → 1\nMath.tan(0) → 0',
        physics: '斜面高度：h = d * Math.tan(alpha)\n折射偏折量估算',
      },
      {
        syntax: 'Math.asin(x)',
        label: 'asin 反正弦',
        desc: '輸入 -1 到 1，回傳弧度 -π/2 到 π/2（即 -90° 到 90°）',
        example: 'Math.asin(0.5) → 0.5236（≈ π/6，即 30°）\nMath.asin(1) → 1.5708（= π/2）',
        physics: 'Snell 折射定律：theta2 = Math.asin(n1/n2 * Math.sin(theta1))',
      },
      {
        syntax: 'Math.acos(x)',
        label: 'acos 反餘弦',
        desc: '輸入 -1 到 1，回傳弧度 0 到 π（即 0° 到 180°）',
        example: 'Math.acos(0.5) → 1.0472（≈ π/3，即 60°）\nMath.acos(1) → 0',
        physics: '由兩向量內積計算夾角：angle = Math.acos(dot / (|a| * |b|))',
      },
      {
        syntax: 'Math.atan(x)',
        label: 'atan 反正切',
        desc: '輸入任意數，回傳弧度 -π/2 到 π/2。只能判斷角度在第一或第四象限，建議用 atan2',
        example: 'Math.atan(1) → 0.7854（≈ π/4，即 45°）\nMath.atan(0) → 0',
        physics: '斜率反算角度（但無法區分象限，建議改用 atan2）',
      },
      {
        syntax: 'Math.atan2(y, x)',
        label: 'atan2 四象限反正切',
        desc: '計算向量 (x, y) 與正 x 軸的夾角，回傳 -π 到 π。注意參數順序是 y 在前、x 在後',
        example: 'Math.atan2(1, 1) → 0.7854（第一象限 45°）\nMath.atan2(1, -1) → 2.3562（第二象限 135°）',
        physics: '計算速度方向角：angle = Math.atan2(vy, vx)\n計算粒子相對中心的角度：theta = Math.atan2(y - cy, x - cx)',
      },
      {
        syntax: 'Math.sinh(x)',
        label: 'sinh 雙曲正弦',
        desc: '(e^x − e^(−x)) / 2，不同於普通 sin，值域是全部實數',
        example: 'Math.sinh(0) → 0\nMath.sinh(1) → 1.1752',
        physics: '懸鏈線方程：y = a * Math.cosh(x/a)（與 sinh 同族）',
      },
      {
        syntax: 'Math.cosh(x)',
        label: 'cosh 雙曲餘弦',
        desc: '(e^x + e^(−x)) / 2，最小值為 1（在 x=0 時）',
        example: 'Math.cosh(0) → 1\nMath.cosh(1) → 1.5431',
        physics: '懸鏈線形狀：y = a * Math.cosh(x/a)，描述繩子在重力下的自然垂曲形狀',
      },
      {
        syntax: 'Math.tanh(x)',
        label: 'tanh 雙曲正切',
        desc: 'sinh(x)/cosh(x)，值域 -1 到 1，在 0 附近近似線性',
        example: 'Math.tanh(0) → 0\nMath.tanh(1) → 0.7616',
        physics: '某些阻力模型使用雙曲正切描述速度飽和現象',
      },
    ],
  },
  {
    category: '指數與對數',
    fns: [
      {
        syntax: 'Math.exp(x)',
        label: 'exp 自然指數',
        desc: 'e 的 x 次方（e ≈ 2.71828）。x 很大時迅速增長，x 為負時衰減趨近於 0',
        example: 'Math.exp(0) → 1\nMath.exp(1) → 2.7183\nMath.exp(-1) → 0.3679',
        physics: '阻尼衰減：x = A * Math.exp(-b * t)\n放射性衰變：N = N0 * Math.exp(-lambda * t)',
      },
      {
        syntax: 'Math.log(x)',
        label: 'log 自然對數',
        desc: 'ln(x)，即 e 為底的對數。x 必須大於 0，x=1 時回傳 0',
        example: 'Math.log(1) → 0\nMath.log(Math.E) → 1\nMath.log(10) → 2.3026',
        physics: '半衰期計算：t_half = Math.log(2) / lambda\n聲音分貝計算需要對數',
      },
      {
        syntax: 'Math.log2(x)',
        label: 'log2 以 2 為底的對數',
        desc: 'x 必須大於 0',
        example: 'Math.log2(1) → 0\nMath.log2(8) → 3\nMath.log2(1024) → 10',
      },
      {
        syntax: 'Math.log10(x)',
        label: 'log10 以 10 為底的對數',
        desc: 'x 必須大於 0',
        example: 'Math.log10(1) → 0\nMath.log10(100) → 2\nMath.log10(1000) → 3',
        physics: '分貝（dB）：dB = 10 * Math.log10(I / I0)',
      },
      {
        syntax: 'Math.pow(x, n)',
        label: 'pow 次方',
        desc: 'x 的 n 次方。也可以用 ** 運算子寫成 x**n，兩者等價',
        example: 'Math.pow(2, 3) → 8\nMath.pow(9, 0.5) → 3（即開根號）\nMath.pow(2, -1) → 0.5',
        physics: '萬有引力：F = G * m1 * m2 / Math.pow(r, 2)\n庫倫定律同形式',
      },
      {
        syntax: 'Math.sqrt(x)',
        label: 'sqrt 平方根',
        desc: '√x，x 必須大於等於 0（若 x 為負數回傳 NaN）',
        example: 'Math.sqrt(4) → 2\nMath.sqrt(2) → 1.4142',
        physics: '兩點距離：d = Math.sqrt((x2-x1)**2 + (y2-y1)**2)\n速率：v = Math.sqrt(vx*vx + vy*vy)',
      },
      {
        syntax: 'Math.cbrt(x)',
        label: 'cbrt 立方根',
        desc: '∛x，與 sqrt 不同，x 可以是負數',
        example: 'Math.cbrt(27) → 3\nMath.cbrt(-8) → -2\nMath.cbrt(2) → 1.2599',
        physics: '球體半徑由體積反推：r = Math.cbrt(3*V / (4*Math.PI))',
      },
      {
        syntax: 'Math.hypot(a, b)',
        label: 'hypot 斜邊長',
        desc: '√(a²+b²)，計算兩點之間的距離。比手動計算 sqrt(a*a+b*b) 更安全（避免溢位）',
        example: 'Math.hypot(3, 4) → 5\nMath.hypot(1, 1) → 1.4142',
        physics: '粒子到原點距離：r = Math.hypot(x, y)\n替代 Math.sqrt(dx*dx + dy*dy)',
      },
    ],
  },
  {
    category: '取值與比較',
    fns: [
      {
        syntax: 'Math.abs(x)',
        label: 'abs 絕對值',
        desc: '|x|，去掉負號，回傳非負數',
        example: 'Math.abs(-3.5) → 3.5\nMath.abs(0) → 0\nMath.abs(7) → 7',
        physics: '判斷是否碰壁：if (Math.abs(x) > L - r)\n彈性力大小：F = k * Math.abs(x - x0)',
      },
      {
        syntax: 'Math.sign(x)',
        label: 'sign 符號函數',
        desc: 'x > 0 回傳 1，x < 0 回傳 -1，x = 0 回傳 0',
        example: 'Math.sign(5) → 1\nMath.sign(-3) → -1\nMath.sign(0) → 0',
        physics: '碰壁反彈方向：vx = Math.abs(vx) * (-Math.sign(x))\n判斷力的方向',
      },
      {
        syntax: 'Math.floor(x)',
        label: 'floor 向下取整',
        desc: '不超過 x 的最大整數。注意負數行為：floor(-2.1) = -3（往更小的方向）',
        example: 'Math.floor(2.9) → 2\nMath.floor(2.0) → 2\nMath.floor(-2.1) → -3',
        physics: '計算動畫幀索引：idx = Math.floor(t * fps) % frameCount',
      },
      {
        syntax: 'Math.ceil(x)',
        label: 'ceil 向上取整',
        desc: '不小於 x 的最小整數。ceil(-2.1) = -2（往更大的方向）',
        example: 'Math.ceil(2.1) → 3\nMath.ceil(2.0) → 2\nMath.ceil(-2.1) → -2',
      },
      {
        syntax: 'Math.round(x)',
        label: 'round 四捨五入',
        desc: '最接近的整數；.5 時往正無限大方向取整（如 round(-2.5) = -2）',
        example: 'Math.round(2.4) → 2\nMath.round(2.5) → 3\nMath.round(-2.5) → -2',
      },
      {
        syntax: 'Math.trunc(x)',
        label: 'trunc 截去小數',
        desc: '直接去掉小數部分，等同往 0 的方向取整。與 floor 的差別在負數：trunc(-2.9) = -2，floor(-2.9) = -3',
        example: 'Math.trunc(2.9) → 2\nMath.trunc(-2.9) → -2',
      },
      {
        syntax: 'Math.max(a, b)',
        label: 'max 最大值',
        desc: '回傳所有參數中最大的值，可傳入多個參數',
        example: 'Math.max(3, 7, 2) → 7\nMath.max(-1, -5) → -1',
        physics: '限制速度下限：vx = Math.max(vx, vMin)\n確保正壓力：P = Math.max(pressure, 0)',
      },
      {
        syntax: 'Math.min(a, b)',
        label: 'min 最小值',
        desc: '回傳所有參數中最小的值，可傳入多個參數',
        example: 'Math.min(3, 7, 2) → 2\nMath.min(1, 0.5) → 0.5',
        physics: '限制速度上限：vx = Math.min(vx, vMax)\nSnell 全反射保護：Math.min(ratio, 1)',
      },
      {
        syntax: 'Math.random()',
        label: 'random 亂數',
        desc: '回傳 0（含）到 1（不含）的隨機小數，每次呼叫結果不同',
        example: 'Math.random() → 0.4729...（每次不同）\nMath.random() * 10 → 0 到 10 的亂數',
        physics: '隨機初始位置：x = (Math.random()*2 - 1) * L\n隨機初速方向：angle = Math.random() * 2 * Math.PI',
      },
      {
        syntax: 'Math.min(Math.max(x, lo), hi)',
        label: 'clamp 限制範圍',
        desc: '讓數值 x 保持在 lo 到 hi 之間，低於 lo 取 lo，高於 hi 取 hi',
        example: 'Math.min(Math.max(15, 0), 10) → 10（超出上界）\nMath.min(Math.max(-3, 0), 10) → 0（低於下界）',
        physics: '限制粒子在盒子內：x = Math.min(Math.max(x, xMin), xMax)\n限制溫度範圍、角度範圍',
      },
    ],
  },
  {
    category: '常數',
    fns: [
      {
        syntax: 'Math.PI',
        label: 'π 圓周率',
        desc: '圓的周長與直徑之比，是許多物理公式的基礎',
        example: 'Math.PI → 3.14159265358979\n2 * Math.PI → 6.28318...（一整圈弧度）',
        physics: '角頻率：omega = 2 * Math.PI * f\n完整轉一圈：theta += 2 * Math.PI',
      },
      {
        syntax: 'Math.E',
        label: 'e 自然常數',
        desc: '自然對數的底數，是指數增長與衰減公式的基礎',
        example: 'Math.E → 2.71828182845905\nMath.log(Math.E) → 1',
        physics: '阻尼振盪：x = A * Math.E**(-b*t) * Math.cos(omega*t)',
      },
      {
        syntax: 'Math.SQRT2',
        label: '√2',
        desc: '2 的平方根，等邊直角三角形的斜邊長',
        example: 'Math.SQRT2 → 1.41421356237310\nMath.SQRT2 * Math.SQRT2 → 2',
        physics: '45° 拋射時水平與垂直速度分量之比',
      },
      {
        syntax: 'Math.SQRT1_2',
        label: '1/√2',
        desc: '1 除以 √2，等於 cos(45°) = sin(45°)',
        example: 'Math.SQRT1_2 → 0.70710678118655',
        physics: '45° 方向的單位向量分量',
      },
      {
        syntax: 'Math.LN2',
        label: 'ln(2)',
        desc: '2 的自然對數',
        example: 'Math.LN2 → 0.69314718055995\nMath.exp(Math.LN2) → 2',
        physics: '放射性半衰期：t_half = Math.LN2 / lambda（λ 為衰變常數）',
      },
      {
        syntax: 'Math.LN10',
        label: 'ln(10)',
        desc: '10 的自然對數',
        example: 'Math.LN10 → 2.30258509299405',
      },
      {
        syntax: 'Math.LOG2E',
        label: 'log₂(e)',
        desc: 'e 的以 2 為底對數，即 1/ln(2)',
        example: 'Math.LOG2E → 1.44269504088896',
      },
      {
        syntax: 'Math.LOG10E',
        label: 'log₁₀(e)',
        desc: 'e 的以 10 為底對數，即 1/ln(10)',
        example: 'Math.LOG10E → 0.43429448190325',
      },
    ],
  },
  {
    category: '位元與整數',
    fns: [
      {
        syntax: 'x % n',
        label: '% 餘數（模）',
        desc: 'x 除以 n 的餘數。注意 JavaScript 中負數取模結果可能為負，如 -7 % 3 = -1',
        example: '7 % 3 → 1\n10 % 2 → 0（偶數）\n-7 % 3 → -1（注意負數）',
        physics: '週期性動畫：idx = Math.floor(t * fps) % totalFrames\n粒子循環編號：i % N',
      },
      {
        syntax: 'Math.floor(x / n)',
        label: '整數除法',
        desc: 'x 除以 n 的商，去掉小數部分',
        example: 'Math.floor(7 / 2) → 3\nMath.floor(10 / 3) → 3',
        physics: '計算格子座標：col = Math.floor(x / cellSize)',
      },
      {
        syntax: 'Number.isInteger(x)',
        label: '是否為整數',
        desc: '回傳 true（是整數）或 false（有小數）',
        example: 'Number.isInteger(3) → true\nNumber.isInteger(3.0) → true\nNumber.isInteger(3.1) → false',
      },
      {
        syntax: 'isFinite(x)',
        label: '是否為有限數',
        desc: '排除 Infinity（除以零）和 NaN（無效運算）的情況，回傳 true 或 false',
        example: 'isFinite(1/0) → false（Infinity）\nisFinite(NaN) → false\nisFinite(3.14) → true',
        physics: '防止除以零導致模擬崩潰：if (isFinite(result)) { ... }',
      },
    ],
  },
];

export default MATH_FUNCTIONS;
