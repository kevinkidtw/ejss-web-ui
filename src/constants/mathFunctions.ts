export interface MathFn {
  syntax: string;
  label: string;
  desc: string;
}

export interface MathFnGroup {
  category: string;
  fns: MathFn[];
}

const MATH_FUNCTIONS: MathFnGroup[] = [
  {
    category: '三角函數',
    fns: [
      { syntax: 'Math.sin(x)',      label: 'sin 正弦',        desc: '輸入角度（弧度），回傳 -1 到 1。角度轉弧度：angle*Math.PI/180' },
      { syntax: 'Math.cos(x)',      label: 'cos 餘弦',        desc: '輸入角度（弧度），回傳 -1 到 1' },
      { syntax: 'Math.tan(x)',      label: 'tan 正切',        desc: '輸入角度（弧度）；注意 π/2 處無定義' },
      { syntax: 'Math.asin(x)',     label: 'asin 反正弦',     desc: '輸入 -1 到 1，回傳弧度（-π/2 到 π/2）' },
      { syntax: 'Math.acos(x)',     label: 'acos 反餘弦',     desc: '輸入 -1 到 1，回傳弧度（0 到 π）' },
      { syntax: 'Math.atan(x)',     label: 'atan 反正切',     desc: '回傳弧度（-π/2 到 π/2）' },
      { syntax: 'Math.atan2(y, x)', label: 'atan2 四象限反正切', desc: '計算向量 (x,y) 的角度，回傳 -π 到 π，可正確處理所有象限' },
      { syntax: 'Math.sinh(x)',     label: 'sinh 雙曲正弦',   desc: '(e^x - e^(-x)) / 2' },
      { syntax: 'Math.cosh(x)',     label: 'cosh 雙曲餘弦',   desc: '(e^x + e^(-x)) / 2' },
      { syntax: 'Math.tanh(x)',     label: 'tanh 雙曲正切',   desc: '回傳 -1 到 1' },
    ],
  },
  {
    category: '指數與對數',
    fns: [
      { syntax: 'Math.exp(x)',    label: 'exp 自然指數',   desc: 'e 的 x 次方（e ≈ 2.71828）' },
      { syntax: 'Math.log(x)',    label: 'log 自然對數',   desc: 'ln(x)，x 必須大於 0' },
      { syntax: 'Math.log2(x)',   label: 'log2 以 2 為底', desc: 'x 必須大於 0' },
      { syntax: 'Math.log10(x)',  label: 'log10 以 10 為底', desc: 'x 必須大於 0' },
      { syntax: 'Math.pow(x, n)', label: 'pow 次方',       desc: 'x 的 n 次方；也可寫成 x**n' },
      { syntax: 'Math.sqrt(x)',   label: 'sqrt 平方根',    desc: '√x，x 必須大於等於 0' },
      { syntax: 'Math.cbrt(x)',   label: 'cbrt 立方根',    desc: '∛x，可以是負數' },
      { syntax: 'Math.hypot(a, b)', label: 'hypot 斜邊長', desc: '√(a²+b²)，計算兩點距離很方便' },
    ],
  },
  {
    category: '取值與比較',
    fns: [
      { syntax: 'Math.abs(x)',        label: 'abs 絕對值',    desc: '|x|，去掉負號' },
      { syntax: 'Math.sign(x)',       label: 'sign 符號',     desc: 'x > 0 回傳 1，x < 0 回傳 -1，x = 0 回傳 0' },
      { syntax: 'Math.floor(x)',      label: 'floor 向下取整', desc: '不超過 x 的最大整數，如 floor(2.9)=2，floor(-2.1)=-3' },
      { syntax: 'Math.ceil(x)',       label: 'ceil 向上取整', desc: '不小於 x 的最小整數，如 ceil(2.1)=3' },
      { syntax: 'Math.round(x)',      label: 'round 四捨五入', desc: '最接近的整數' },
      { syntax: 'Math.trunc(x)',      label: 'trunc 截去小數', desc: '直接去掉小數部分，如 trunc(-2.9)=-2' },
      { syntax: 'Math.max(a, b)',     label: 'max 最大值',    desc: '回傳 a、b 中較大的值，可傳多個參數' },
      { syntax: 'Math.min(a, b)',     label: 'min 最小值',    desc: '回傳 a、b 中較小的值，可傳多個參數' },
      { syntax: 'Math.random()',      label: 'random 亂數',   desc: '回傳 0（含）到 1（不含）的隨機小數' },
      { syntax: 'Math.min(Math.max(x, lo), hi)', label: 'clamp 限制範圍', desc: '讓 x 保持在 lo ~ hi 之間' },
    ],
  },
  {
    category: '常數',
    fns: [
      { syntax: 'Math.PI',    label: 'π 圓周率',   desc: '≈ 3.14159265358979' },
      { syntax: 'Math.E',     label: 'e 自然常數', desc: '≈ 2.71828182845905' },
      { syntax: 'Math.SQRT2', label: '√2',         desc: '≈ 1.41421356237310' },
      { syntax: 'Math.SQRT1_2', label: '1/√2',     desc: '≈ 0.70710678118655' },
      { syntax: 'Math.LN2',   label: 'ln(2)',       desc: '≈ 0.69314718055995' },
      { syntax: 'Math.LN10',  label: 'ln(10)',      desc: '≈ 2.30258509299405' },
      { syntax: 'Math.LOG2E', label: 'log₂(e)',     desc: '≈ 1.44269504088896' },
      { syntax: 'Math.LOG10E', label: 'log₁₀(e)',  desc: '≈ 0.43429448190325' },
    ],
  },
  {
    category: '位元與整數',
    fns: [
      { syntax: 'x % n',              label: '% 餘數（模）',   desc: 'x 除以 n 的餘數，如 7%3=1' },
      { syntax: 'Math.floor(x / n)',   label: '整數除法',       desc: 'x 除以 n 的商（無小數）' },
      { syntax: 'Number.isInteger(x)', label: '是否為整數',     desc: '回傳 true 或 false' },
      { syntax: 'isFinite(x)',         label: '是否為有限數',   desc: '排除 Infinity 和 NaN 的情況' },
    ],
  },
];

export default MATH_FUNCTIONS;
