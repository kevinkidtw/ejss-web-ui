# Kinetix | 動態物理模擬實驗室

> **註**：Kinetix 前身為 **EjsS Web UI**，持續完全向下相容經典 `.ejss` 檔案格式。

**Kinetix** 是一款以「實驗室筆記本」（Lab Notebook）美學為基礎設計的現代化動態物理數值模擬平台。告別傳統 Java 執行環境與複雜的編譯設定，教師與學生只需打開任何現代瀏覽器，即可透過直覺的積木編輯面板、高效編譯引擎與高精度數值積分器，親手打造從經典力學、電磁場、非線性震盪到統計熱力學的物理模型。

專為中學物理教學、科學探究與實作、資優競賽培訓及大專普物數值模擬課程打造，全介面與文件均提供繁體中文完整引導。

---

## 核心特色與技術亮點

### 1. 七種專用數值積分求解器（Numerical Solvers）
根據系統物理特性與保守性需求自由切換，涵蓋從基礎教學到精密天體力學：
- **Euler（顯式歐拉法）**：一階顯式，計算極為快速，適合作為數值誤差與發散教學之概念對照。
- **Euler-Cromer（半隱式歐拉 / 辛歐拉）**：一階辛算法（Symplectic），在簡諧振動等保守系統中能保持相空間面積，長期運算不發散。
- **Velocity Verlet（速度韋爾萊）**：二階辛算法，專為二階受力運動設計，具備極優異的機械能守恆特性，特別適用於分子動力學與彈簧振子。
- **RK4（經典四階 Runge-Kutta）**：四階經典定步長算法，精確度高且通用性極佳，是大多數流體阻尼與受驅力學系統的首選。
- **RK45（Dormand-Prince 自適應步長）**：嵌入式 4(5) 階 Runge-Kutta，即時評估局部截斷誤差並動態伸縮時間步長 $\Delta t$，在保證精度的同時大幅節省計算量。
- **Fehlberg78（RKF78 高階自適應步長）**：7(8) 階高階自適應步長積分器，專門處理高動態範圍、強烈剛性或近距離相遇的極端軌道模擬。
- **Yoshida4（吉田四階辛算法）**：四階辛幾何積分器，專為天體力學、長時軌道演化與保守哈密頓系統設計，長期維持角動量與總能量守恆，極度抑制數值能量漂移。

### 2. Runtime v2 獨立編譯引擎
全新一代直譯/JIT 編譯管線：
- **拒絕熱迴圈反射**：徹底揚棄在 `requestAnimationFrame` 熱迴圈中使用 `new Function` 或 `with` 語句的效能瓶頸。
- **10~50 倍效能飛躍**：將微分方程、約束條件與初始化程式碼預先編譯為靜態純量變數函式，並對內建常數與物理函式庫進行呼叫內聯優化，支援大量粒子同時流暢運算。

### 3. Web Worker 多執行緒背景運算
物理模擬與 UI 呈現完全解耦：
- **雙核心架構**：密集的高頻率物理步進運算移至 Web Worker 獨立執行緒，主執行緒專注於 60/120 FPS 畫布繪製與使用者互動。
- **無縫降級機制**：在沙盒受限或不支援 Worker 的特殊容器環境下，自動平滑降級為高效主執行緒異步步進機制，確保跨平台運行的 100% 可用性。

### 4. 內建物理工具庫（Physics API）
在模型約束與初始化腳本中，可直接呼叫強大的 `Physics` 函式庫：
- `Physics.Vector` / `Physics.Forces`：提供二維向量運算與萬有引力、庫侖靜電力、勞侖茲力 $\mathbf{F} = q(\mathbf{E} + \mathbf{v}\times\mathbf{B})$、彈簧阻尼力等現成受力模型。
- `Physics.Collision`：精確的二維雙球彈性碰撞解算，並配備 **Spatial Hash Grid（空間雜湊網格）**，將多粒子碰撞檢測複雜度由 $O(N^2)$ 降至接近 $O(N)$。
- `Physics.Thermo`：支援馬克士威-波茲曼速率取樣（Maxwell-Boltzmann sampling）、微觀溫度與動量壓強統計，以及 Berendsen 恆溫槽（Thermostat）溫度耦合。
- `Physics.Fields`：二維電場與磁場線流線（Streamlines）數值追蹤與視覺化演算法。
- `Physics.ParticleSystem`：採用高效 Structure-of-Arrays（SoA）記憶體架構的粒子系統，支援數千顆粒子的同屏物理計算。

### 5. PBKDF2-SHA256 密碼安全防護
保護教師的教學設計與考題情境：
- 採用 Web Crypto API 進行密碼雜湊，搭配 **150,000 次反覆雜湊運算** 與 16-byte 加密等級隨機鹽值（Salt），徹底杜絕純文字密碼存儲。
- 提供直覺的「安全鎖定 / 解鎖」對話框；鎖定狀態下可正常播放與觀察模擬，但防止學生誤改或偷看底層公式與答案，密碼雜湊值安全封裝於 `.ejss` 檔案中。

### 6. 實驗室筆記本（Lab Notebook）教學美學
專為課堂與長時間研究設計的護眼介面：
- **紙本質感色調**：採用柔和米白暖紙色底（`#FAF8F3`）搭配清晰深墨字（`#2B2D31`），告別刺眼白光。
- **柔和分色積木**：延續 Scratch 直覺積木理念，不同性質的模型變數、微分方程、計算約束與初始化分區分色，搭配 Noto Sans TC 與 JetBrains Mono 專業等寬字體。

### 7. 彈性部署支援（GitHub Pages / NAS / 私有雲）
- 支援 GitHub Pages 靜態站點自動部署（預設子路徑 `/kinetix/`）。
- 支援 Synology / QNAP NAS、Docker 容器或內網自架私有伺服器（設定環境變數 `VITE_BASE=/` 即可編譯為根目錄執行）。

---

## 目錄

1. [環境需求與啟動](#環境需求與啟動)
2. [介面總覽](#介面總覽)
3. [快速上手：建立第一個模擬](#快速上手建立第一個模擬)
4. [積木面板詳解](#積木面板詳解)
5. [內建物理工具庫（Physics API）指南](#內建物理工具庫physics-api指南)
6. [元件列表與屬性](#元件列表與屬性)
7. [數學函數速查](#數學函數速查)
8. [模擬舞台操作](#模擬舞台操作)
9. [檔案管理與安全保護](#檔案管理與安全保護)
10. [內建範例庫](#內建範例庫)
11. [注意事項與已知限制](#注意事項與已知限制)
12. [技術架構（供開發者參考）](#技術架構供開發者參考)

---

## 環境需求與啟動

### 系統需求

- Node.js 18.0 或更高版本
- 現代瀏覽器（Google Chrome、Microsoft Edge、Mozilla Firefox、Safari）

### 本機安裝與啟動

```bash
# 1. 複製專案庫並切換目錄
cd kinetix

# 2. 安裝相依套件
npm install

# 3. 啟動開發伺服器（會自動先編譯獨立 Runtime）
npm run dev
```

啟動後請以瀏覽器開啟終端機所示網址（預設為 `http://localhost:5173/kinetix/`）。

### 部署至自架 NAS / 私有雲伺服器

若要將專案部署在 NAS Web Station、Nginx 根目錄或本機 Docker：

```bash
# 以根目錄 base 建置
VITE_BASE=/ npm run build
```

建置完成後，將 `dist/` 資料夾中的所有檔案複製至網頁伺服器根目錄即可。

### 部署至 GitHub Pages

專案預設以 `/kinetix/` 為 Base 路徑，直接執行：

```bash
npm run build
```

將產出的 `dist/` 推送至 GitHub Pages 分支（例如 `gh-pages`）即可上線。

---

## 介面總覽

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  工具列：Kinetix | 新增 | 模板 | 範例庫 | 數學速查 | 開啟 | 儲存 | 匯出HTML | 分享 | 🔒鎖定 │
├──────────────┬──────────────────────────────────┬────────────────────────────────┤
│              │                                  │                                │
│  積木面板    │  中央編輯區（多分頁視窗）         │  模擬舞台                      │
│  (上半部)    │  · 廣域腳本（預設開啟）          │  (StagePanel)                  │
│              │  · 元件屬性分頁（點選元件開啟）  │  · ▶ 播放 / ⏸ 暫停 / ⏭ 步進    │
│  ──────────  │  · 數學速查分頁                  │  · ↺ 重置 / 🎮 全螢幕展開      │
│  元件列表    │  · 教學描述分頁                  │  · 即時變數初值監控            │
│  (下半部)    │                                  │                                │
│  · 視覺元件  │                                  │                                │
│  · 背景模板  │                                  │                                │
└──────────────┴──────────────────────────────────┴────────────────────────────────┘
```

### 工具列核心功能

| 按鈕 / 欄位 | 說明 |
|-------------|------|
| **Kinetix** | 品牌標誌與實驗室首頁識別 |
| **新增** | 清空當前畫布，開闢全新物理模擬專案 |
| **模板** | 選擇預設畫布版型（單一繪圖區、多繪圖區、帶控制面板等） |
| **範例庫** | 瀏覽與載入 9 大經典與進階物理模擬實例 |
| **數學速查** | 在中央區域開啟完整的數學函數卡片與物理應用對照表 |
| **開啟 / 儲存** | 讀取或儲存標準 `.ejss` XML 定義檔 |
| **匯出 HTML** | 匯出為完全單一獨立、不依賴網路伺服器的 HTML 檔案（內建控制按鈕，可直接分享給學生） |
| **分享** | 複製專案連結或分享資訊 |
| **🔒 鎖定 / 🔓 解鎖** | 使用 PBKDF2 加密保護程式碼，防止課堂展示時被意外修改 |
| **🎮 模擬舞台** | 一鍵切換全螢幕劇院模式，適合投影展示；再按可無縫返回編輯 |

---

## 快速上手：建立第一個模擬

以經典力學的**簡諧運動（Simple Harmonic Motion）**為例，4 個步驟完成建構：

### 步驟一：設定物理變數
在左側積木面板點擊「**+ 新增模型變數**」，加入以下四個純量：
- `x`：初始值 `2.0`（質點初始位移，公尺）
- `vx`：初始值 `0.0`（質點初始速度，公尺/秒）
- `k`：初始值 `8.0`（彈簧彈力常數，N/m）
- `m`：初始值 `1.0`（質點質量，kg）

### 步驟二：建立一階微分方程組
點擊「**+ 新增方程組**」，輸入：
```
d[x]/dt  = vx
d[vx]/dt = -k * x / m
```
- 時間步長 `dt` 設為 `0.02`
- 數值積分求解器選擇 `RK4（經典四階法）` 或 `Verlet（速度韋爾萊法）`

### 步驟三：配置視覺與幾何元件
在左側下方的「元件列表」點擊「**新增元件**」：
1. **DrawingPanel（繪圖面板）**：世界座標 X 範圍設為 `[-4, 4]`，Y 範圍設為 `[-3, 3]`。
2. **Shape2D（質點球）**：X 座標填入變數 `x`，Y 座標填 `0`，半徑填 `0.3`。
3. **Spring2D（彈簧）**：起點固定於 `(-3, 0)`，端點座標填 `(x, 0)`。
4. **Trail2D（軌跡線）**：X 填入 `x`，Y 填入 `0`，記錄質點運動軌跡。

### 步驟四：即時啟動模擬
點擊右側舞台的 **▶ 播放** 按鈕，即可看到彈簧帶動質點進行平滑的簡諧振盪！

---

## 積木面板詳解

### 📦 模型變數（Variables）
定義系統中的物理狀態與常數。支援四種型別：
- **實數（Real/Double）**：連續物理量（如位置、速度、質量、電荷）。
- **整數（Integer）**：計數器、粒子數或狀態標籤。
- **布林值（Boolean）**：開關控制（如重力開關、碰撞邊界開關）。
- **文字（String）**：狀態字串或顯示標籤。

### 🔵 微分方程組（ODEs）
以一階常微分方程形式描述系統隨時間演變的規律：
$$\frac{d[\text{變數}]}{dt} = f(t, \dots)$$

#### 求解器一覽與選用指引

| 求解器名稱 | 精度階數 | 算法特點 | 推薦適用場合 |
|------------|----------|----------|--------------|
| **Euler** | 1 階 | 簡單顯式計算，步長大時容易能量發散 | 數值分析入門教學、定性展示 |
| **Euler-Cromer** | 1 階 | 半隱式辛幾何算法，相空間保面積 | 簡諧振動、單擺等一階保守力學 |
| **Velocity Verlet** | 2 階 | 二階辛算法，絕佳的機械能守恆性 | 分子運動、彈簧系統、質點彈性碰撞 |
| **RK4** | 4 階 | 經典 Runge-Kutta，高精度、廣泛適應性 | 大多數力學模擬、阻尼振動、電磁運動 |
| **RK45** | 4(5) 階 | Dormand-Prince 自適應步長，自動誤差控制 | 非線性擺、受迫共振、剛性過渡系統 |
| **Fehlberg78** | 7(8) 階 | 高階自適應步長，極低局部截斷誤差 | 高精度要求、多體碰撞瞬間 |
| **Yoshida4** | 4 階 | 四階辛幾何積分，無人能及的長時能量穩定度 | 行星軌道、克卜勒運動、三體系統 |

### 🔴 計算 / 約束條件（Evolution & Constraints）
每個時間步前進時都會呼叫的計算邏輯，可用於：
- 計算能量與守恆量：
  ```js
  E_kin = 0.5 * m * vx * vx;
  E_pot = 0.5 * k * x * x;
  E_total = E_kin + E_pot;
  ```
- 邊界條件與反彈約束：
  ```js
  if (y < -2.5) {
    y = -2.5;
    vy = -0.9 * vy; // 具能量損耗的地表反彈
  }
  ```

### 🟢 初始化腳本（Initialization）
當載入模擬或點擊 **↺ 重置** 時執行一次，可用於設定初始分佈或利用三角幾何推導初值：
```js
x = A * Math.cos(phi);
vx = -A * omega * Math.sin(phi);
```

---

## 內建物理工具庫（Physics API）指南

在約束條件或自訂繪圖（CustomDraw）中，可直接存取全域 `Physics` 物件：

### 1. 向量運算（`Physics.Vector`）
```js
const v1 = { x: 3, y: 4 };
const len = Physics.Vector.mag(v1); // 5
const norm = Physics.Vector.normalize(v1); // { x: 0.6, y: 0.8 }
const dot = Physics.Vector.dot(v1, { x: 1, y: 0 }); // 3
const dist = Physics.Vector.dist({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
```

### 2. 受力模型（`Physics.Forces`）
```js
// 萬有引力 F = -G * m1 * m2 / r^2
const fGrav = Physics.Forces.gravity(p1, p2, G);

// 庫侖靜電力 F = k_e * q1 * q2 / r^2
const fCoulomb = Physics.Forces.coulomb(q1Pos, q2Pos, q1, q2);

// 勞侖茲力 F = q * (E + v x B)
const fLorentz = Physics.Forces.lorentz(charge, velocity, E_field, B_z);

// 彈簧阻尼力 F = -k*(x - x0) - c*v
const fSpring = Physics.Forces.spring(posA, posB, restLength, k, damping, velA, velB);
```

### 3. 碰撞與空間雜湊（`Physics.Collision`）
```js
// 雙球精確彈性碰撞解算（包含速度交換與重疊位移解算）
Physics.Collision.resolveElastic2D(p1, p2, restitution);

// 空間雜湊網格（大量粒子加速碰撞偵測）
const grid = new Physics.Collision.SpatialHashGrid(cellSize);
grid.clear();
particles.forEach((p, idx) => grid.insert(idx, p.x, p.y, p.radius));
// 高效找出可能碰撞的候選對 (候選複雜度 O(N))
const candidatePairs = grid.getCandidates();
```

### 4. 統計熱力學（`Physics.Thermo`）
```js
// 依據溫度 T 與質量 m 取樣馬克士威-波茲曼速度分佈
const speed = Physics.Thermo.sampleMaxwellSpeed(T, m);

// 計算粒子群微觀動能所對應之宏觀溫度與壁面壓強
const currentT = Physics.Thermo.computeTemperature(particles);
const currentP = Physics.Thermo.computePressure(wallCollisions, dt, boundaryArea);

// Berendsen 恆溫槽速度縮放（耦合系統至目標溫度 targetT）
Physics.Thermo.applyBerendsenThermostat(particles, currentT, targetT, dt, tau);
```

### 5. 場線流線追蹤（`Physics.Fields`）
```js
// 依據點電荷分佈數值追蹤電場流線
const linePoints = Physics.Fields.traceElectricFieldLine(charges, startX, startY, stepSize, maxSteps);
```

### 6. 高效粒子系統（`Physics.ParticleSystem`）
```js
const ps = Physics.createParticleSystem({
  capacity: 2000,
  gravity: { x: 0, y: -9.8 }
});
ps.step(dt);
```

---

## 元件列表與屬性

### 畫布容器
- **Elements.DrawingPanel**：所有 2D 圖形的繪圖舞台，支援定義世界座標邊界（$X_{\min}, X_{\max}, Y_{\min}, Y_{\max}$）、背景色與寬高比鎖定。

### 幾何與物理元件
- **Elements.Shape2D**：質點、球形、方形、輪子；支援位置、半徑、填充顏色、邊框與旋轉弧度動態綁定。
- **Elements.Trail2D**：運動軌跡線，可指定最大留存點數與線條顏色，自動繪製連續路徑。
- **Elements.Arrow2D**：向量箭頭，常用於受力 $\mathbf{F}$、速度 $\mathbf{v}$、電場 $\mathbf{E}$ 之即時長度與方向視覺化。
- **Elements.Spring2D**：螺旋彈簧元件，可動態連接固定端與震盪質點。

### 控制與互動元件
- **Elements.Slider**：數值調整滑桿，使用者可在模擬進行中動態變更物理係數（如阻尼、質量）。
- **Elements.Button**：觸發按鈕，點擊時執行自訂程式碼（例如重設特定速度）。
- **Elements.CheckBox**：布林核取方塊，控制場景輔助線或作用力顯隱。
- **Elements.Label**：文字標籤，支援即時動態字串插值（如 `"t = " + t.toFixed(2)`）。
- **Elements.ParsedField**：格式化數值輸入方塊，供精確設定與讀取參數。

### 自訂繪圖（Elements.CustomDraw）
直接操作 Canvas 2D API 繪製複雜背景、向量場或分佈曲線：
```js
// 繪製格線與向量場
ctx.save();
ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
ctx.lineWidth = 1;
// 世界座標轉畫布像素工具函式：toPixX(wx), toPixY(wy), toPixLen(len)
ctx.beginPath();
ctx.arc(toPixX(0), toPixY(0), toPixLen(1), 0, Math.PI * 2);
ctx.stroke();
ctx.restore();
```

---

## 數學函數速查

點擊工具列「**數學速查**」按鈕，可隨時在中央編輯區調出完整的數學卡片。在各輸入方塊點擊 **$f_x$** 按鈕即可插入對應函式：

- **三角函數**：`sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `sinh`, `cosh`, `tanh`
- **指數與對數**：`exp`, `log`, `log2`, `log10`, `pow`, `sqrt`, `cbrt`, `hypot`
- **取值與比較**：`abs`, `sign`, `floor`, `ceil`, `round`, `trunc`, `max`, `min`, `clamp`, `random`
- **物理常數**：`PI` ($\pi$), `E` ($e$), `SQRT2`, `LN2`, `LN10`

> ⚠️ 所有三角函數之角度單位皆為**弧度（Radians）**：$180^\circ = \pi$ 弧度。

---

## 模擬舞台操作

- **▶ 播放 / ⏸ 暫停**：控制物理引擎的時間推進與暫停。
- **⏭ 步進**：單步前進一個 $\Delta t$，便於觀察瞬時碰撞與細部極值。
- **↺ 重置**：系統狀態重置，重新執行「初始化」腳本並清空軌跡。
- **自動動態預覽**：當在編輯器中修改變數初值、方程或幾何外觀時，舞台會在 300 毫秒內智慧重新熱編譯預覽，免去手動重複重載。
- **🎮 全螢幕模式**：將模擬舞台放大至全視窗，適合投影幕大畫面課堂演示。

---

## 檔案管理與安全保護

### 1. `.ejss` 檔案相容性
- **儲存 .ejss**：將完整的模型變數、微分方程組、約束演化、初始化與元件樹序列化為 XML 格式下載。
- **開啟 .ejss**：100% 相容傳統 Easy Java/JavaScript Simulations 檔案格式，一鍵轉換為現代化網頁架構。

### 2. 獨立 HTML 匯出
點擊工具列「**匯出 HTML**」，將產生一個完全自包含（Single-file Standalone）的 HTML 檔案。內建專屬物理 Runtime、Canvas 渲染器與控制面板，學生雙擊即可在任何離線瀏覽器中操作。

### 3. PBKDF2 教師密碼鎖定保護
為了在實驗課或測驗情境中保護物理模型不被任意篡改：
- 點擊工具列的「**🔒 鎖定**」按鈕，設定管理員密碼。
- 系統透過 Web Crypto API 計算 PBKDF2-SHA256（150,000 次反覆雜湊與高熵隨機鹽值）。
- 鎖定後，編輯面板進入保護狀態，僅可進行模擬觀察與滑桿互動；點擊「**🔓 解鎖**」輸入原始密碼後方可恢復編輯。

---

## 內建範例庫

點擊工具列「**📚 範例庫**」即可探索 9 大精選物理情境：

| 範例名稱 | 物理範疇 | 核心觀念與求解特點 |
|----------|----------|-------------------|
| **簡諧運動** | 經典力學 | 動能與彈性位能互換、簡諧相圖、Verlet 能量守恆 |
| **單擺** | 非線性力學 | 非線性微分方程 $d^2\theta/dt^2 = -(g/L)\sin\theta$、大角度週期效應 |
| **拋體運動** | 運動學 | 二維重力運動、彈性邊界反彈約束 |
| **阻尼振盪** | 振動力學 | 黏滯阻力項 $-b v$、欠阻尼/臨界阻尼/過阻尼狀態 |
| **折射（Snell 定律）** | 光學與波動 | 介質界面折射、自訂繪圖背景與動態滑桿折射率調控 |
| **理想氣體動力論** | 統計熱力學 | 多粒子彈性碰撞、Maxwell 速率分佈、溫度與壓強統計 |
| **陰極射線管（CRT）** | 電磁學 | 勞侖茲力偏轉 $\mathbf{F} = q(\mathbf{E} + \mathbf{v}\times\mathbf{B})$、二維電子軌跡 |
| **行星軌道** | 天體力學 | 平方反比萬有引力、克卜勒軌道、角動量守恆、Yoshida4 求解器 |
| **三體問題（8字形）** | 混沌力學 | 著名陳秀雄-蒙哥馬利 8 字形三體週期特解、數值敏感度與 RKF78 高階積分 |

---

## 注意事項與已知限制

1. **坐標系約定**：Kinetix 採用標準物理與數學直角坐標系（**X 軸向右為正，Y 軸向上為正**），與一般電腦螢幕由上往下的像素座標不同，系統內部會自動完成轉換。
2. **時間步長選擇**：
   - 一般振動（單擺、彈簧）：建議 `dt = 0.01 ~ 0.02`。
   - 保守軌道（行星、三體）：建議 `dt = 0.001 ~ 0.005`，並推薦使用 `Yoshida4` 或 `RK4`。
   - 步長 $\Delta t$ 決定單步積分精度；系統會智慧維持每秒 60 幀的即時物理速度。
3. **混沌系統之必然發散**：如三體問題等混沌系統對初始精度極端敏感，長期演化下數值誤差積累為非線性動力學必然現象，非程式錯誤。
4. **DrawingPanel 為視覺基礎**：所有二維形狀（Shape2D、Spring2D、Trail2D 等）皆需置於 `DrawingPanel` 繪圖畫布之內方能正確呈像。

---

## 技術架構（供開發者參考）

### 核心技術棧

| 模組 | 選用技術 | 版本 | 說明 |
|------|----------|------|------|
| **UI 核心** | React | 19.x | 現代化虛擬 DOM 與組件渲染 |
| **型別系統** | TypeScript | 5.x / 6.x | 嚴格靜態型別保證 |
| **狀態管理** | Zustand | 5.x | 單一狀態樹，支援歷程、鎖定與序列化 |
| **樣式系統** | Tailwind CSS | 4.x | 實驗室筆記本暖紙色調主題架構 |
| **建置工具** | Vite | 6.x / 8.x | 雙重建置管線（主應用與獨立 Runtime bundle） |
| **XML 解析** | fast-xml-parser | 5.x | 高效解析與產生 `.ejss` XML |
| **密碼安全** | Web Crypto API | 原生 | PBKDF2-SHA256、150,000 次雜湊保護 |
| **多執行緒** | Web Worker | 原生 | 物理計算與介面渲染管線解耦 |

### 完整專案目錄結構

```
kinetix/
├── src/
│   ├── components/                 # UI 視窗與積木組件
│   │   ├── backdrop/              # 背景模板選擇器
│   │   ├── blocks/                # 積木編輯區（ODE/變數/約束/初始化/畫布）
│   │   ├── common/                # 共用幾何圖示與基礎元件 (ElementIcon)
│   │   ├── description/           # 教材與實驗描述說明編輯器
│   │   ├── layout/                # 版面與屬性編輯面板
│   │   ├── math/                  # 數學函數速查表 (MathReference)
│   │   ├── sprites/               # 元件清單、屬性抽屜與新增元件對話框
│   │   ├── stage/                 # 模擬舞台 (StagePanel, 控制按鈕與監控)
│   │   ├── toolbar/               # 主工具列、範例庫 Modal、加密鎖定對話框 (LockDialog)
│   │   └── ui/                    # 輔助提示 (HelpTooltip) 與函數插入器 (MathFunctionPicker)
│   ├── constants/                 # 常數與結構規格
│   │   ├── backdropTemplates.ts  # 預設畫布底圖模板
│   │   ├── elementSchemas.ts     # 視覺元件屬性規格定義
│   │   ├── examples.ts           # 9 大內建物理範例資料
│   │   └── mathFunctions.ts      # 數學函數清單與範例描述
│   ├── hooks/                     # 自訂 React Hooks (useFxInsert 等)
│   ├── runtime/                   # Kinetix Runtime v2 獨立物理核心
│   │   ├── core/                  # 物理核心與數值運算
│   │   │   ├── compiler.ts       # 程式碼編譯管線 (移除 new Function / with)
│   │   │   ├── engine.ts         # 模擬引擎排程狀態機
│   │   │   ├── events.ts         # 物理不連續事件 (Zero-crossing) 偵測
│   │   │   ├── odeSystem.ts      # 微分方程系統整合
│   │   │   ├── ringbuffer.ts     # 環形緩衝區高吞吐傳輸
│   │   │   ├── physics/          # 物理工具庫 (Vector, Forces, Collision, Thermo, Fields, Particles)
│   │   │   └── solvers/          # 7 大數值積分器 (Euler, EulerCromer, Verlet, RK4, RK45, RKF78, Yoshida4)
│   │   ├── host/                  # 主執行緒宿主與渲染
│   │   │   ├── controls.ts       # 互動元件 (Slider, Button, CheckBox) 控制
│   │   │   ├── drag.ts           # 質點滑鼠拖曳互動
│   │   │   ├── engineProxy.ts    # 運算引擎代理端 (Worker / Local 通訊)
│   │   │   ├── host.ts           # Host 主管理器與執行緒調度
│   │   │   ├── layout.ts         # 世界座標與畫布佈局計算
│   │   │   ├── render/           # Canvas 2D / 軌跡線繪製管道
│   │   │   └── theme.ts          # 實驗室筆記本風格渲染配色
│   │   ├── worker/                # Web Worker 背景執行緒
│   │   │   └── worker.ts         # 背景物理計算 Worker
│   │   └── entry.ts              # 獨立 IIFE Runtime bundle 導出進入點
│   ├── runtime-dist/              # 預編譯 Runtime bundle (ejss-runtime.js)
│   ├── store/                     # Zustand 狀態管理
│   │   └── simulationStore.ts    # 專案狀態樹、歷史復原與安全密碼控制
│   ├── types/                     # TypeScript 型別定義
│   │   └── simulation.ts         # 模型、元件與專案結構型別
│   └── utils/                     # 工具模組
│       ├── ejssParser.ts         # .ejss XML 序列化與解析
│       ├── lockCrypto.ts         # PBKDF2-SHA256 安全雜湊與驗證
│       └── simulationRunner.ts   # 沙盒執行器與 HTML 產生器
├── vite.config.ts                 # 主應用 Vite 設定檔 (支援 VITE_BASE 覆寫)
├── vite.runtime.config.ts         # 獨立 Runtime bundle 建置設定檔
└── package.json                   # 專案設定 (名稱: kinetix)
```

### 運算與渲染架構原理

1. **JIT 預編譯**：當使用者編輯方程或腳本後，`compiler.ts` 會預先將程式碼解析為原生純量計算函式，封裝在閉包環境中。完全杜絕了在 `requestAnimationFrame` 每秒 60 次以上的迴圈中使用昂貴的字串反射。
2. **多執行緒與狀態同步**：在支援的環境中，`host.ts` 透過 `engineProxy.ts` 與 `worker.ts` 以非阻塞訊息或共享緩衝區通訊。Worker 負責以高頻率進行 ODE 積分計算，並定時將粒子世界座標推送回 Host 進行畫布繪製。若環境不支援 Worker，系統自動切換至無縫主執行緒異步迴圈，保證行為完全一致。
3. **密碼驗證流程**：專案鎖定時，密碼透過 Web Crypto API 生成隨機 Salt 並衍生出 PBKDF2-SHA256 金鑰，將其 Base64 字串儲存於模型中；驗證時以恆定時間比較（Timing-safe comparison）驗證密碼，防止時序側通道攻擊。
