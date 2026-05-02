export interface PropSchema {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'color' | 'select' | 'code';
  defaultValue: string;
  tab: 'init' | 'behavior' | 'visual';
  options?: string[];
  description?: string; // 高中生說明文字
}

export interface ElementMeta {
  type: string;
  label: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  schema: PropSchema[];
}

const ELEMENT_SCHEMAS: Record<string, ElementMeta> = {
  'Elements.DrawingPanel': {
    type: 'Elements.DrawingPanel',
    label: '繪圖面板',
    icon: '🖼',
    defaultWidth: 400,
    defaultHeight: 400,
    schema: [
      { name: 'Width',        label: '寬度（像素）', type: 'number',  defaultValue: '400',     tab: 'init', description: '畫布在螢幕上顯示的寬度，單位為像素（px）' },
      { name: 'Height',       label: '高度（像素）', type: 'number',  defaultValue: '400',     tab: 'init', description: '畫布在螢幕上顯示的高度，單位為像素（px）' },
      { name: 'MinimumX',     label: 'X 軸最小值',  type: 'number',  defaultValue: '-5',      tab: 'init', description: '畫布 X 軸左端對應的物理世界座標，例如 -5 代表左邊到 x=-5' },
      { name: 'MaximumX',     label: 'X 軸最大值',  type: 'number',  defaultValue: '5',       tab: 'init', description: '畫布 X 軸右端對應的物理世界座標，例如 5 代表右邊到 x=5' },
      { name: 'MinimumY',     label: 'Y 軸最小值',  type: 'number',  defaultValue: '-5',      tab: 'init', description: '畫布 Y 軸下端對應的物理世界座標（注意：Y 軸向上為正）' },
      { name: 'MaximumY',     label: 'Y 軸最大值',  type: 'number',  defaultValue: '5',       tab: 'init', description: '畫布 Y 軸上端對應的物理世界座標' },
      { name: 'Background',   label: '背景色',       type: 'color',   defaultValue: '"white"', tab: 'visual', description: '畫布背景顏色，可用英文顏色名稱如 "white"、"black"，或 "#rrggbb" 格式' },
      { name: 'SquareAspect', label: '鎖定等比例',   type: 'boolean', defaultValue: 'false',   tab: 'visual', description: '開啟後 X/Y 軸的單位長度相同，避免圓形被拉成橢圓' },
      { name: 'Enabled',      label: '允許滑鼠互動', type: 'boolean', defaultValue: 'true',    tab: 'behavior', description: '是否允許使用者在畫布上用滑鼠拖曳元素' },
    ],
  },
  'Elements.PlottingPanel': {
    type: 'Elements.PlottingPanel',
    label: '圖表面板',
    icon: '📊',
    defaultWidth: 400,
    defaultHeight: 300,
    schema: [
      { name: 'Width',      label: '寬度',     type: 'number',  defaultValue: '400',   tab: 'init',   description: '圖表顯示的寬度（像素）' },
      { name: 'Height',     label: '高度',     type: 'number',  defaultValue: '300',   tab: 'init',   description: '圖表顯示的高度（像素）' },
      { name: 'Title',      label: '標題',     type: 'text',    defaultValue: '"圖表"', tab: 'init',   description: '顯示在圖表頂端的標題文字' },
      { name: 'AutoScaleX', label: '自動縮放X', type: 'boolean', defaultValue: 'true',  tab: 'visual', description: '開啟後 X 軸範圍會自動依資料調整；關閉後可手動設定範圍' },
      { name: 'AutoScaleY', label: '自動縮放Y', type: 'boolean', defaultValue: 'true',  tab: 'visual', description: '開啟後 Y 軸範圍會自動依資料調整；關閉後可手動設定範圍' },
      { name: 'Background', label: '背景色',   type: 'color',   defaultValue: '"white"', tab: 'visual', description: '圖表背景顏色' },
    ],
  },
  'Elements.Slider': {
    type: 'Elements.Slider',
    label: '滑桿',
    icon: '⬜',
    defaultWidth: 200,
    defaultHeight: 40,
    schema: [
      { name: 'Minimum', label: '最小值', type: 'text', defaultValue: '0',  tab: 'init',   description: '滑桿最左端對應的數值' },
      { name: 'Maximum', label: '最大值', type: 'text', defaultValue: '10', tab: 'init',   description: '滑桿最右端對應的數值' },
      { name: 'Value',   label: '初始值', type: 'text', defaultValue: '1',  tab: 'init',   description: '模擬開始時滑桿的預設位置，必須介於最小值與最大值之間' },
      { name: 'Tooltip', label: '提示',   type: 'text', defaultValue: '""', tab: 'visual', description: '滑鼠懸停在滑桿上時顯示的說明文字' },
    ],
  },
  'Elements.Button': {
    type: 'Elements.Button',
    label: '按鈕',
    icon: '▣',
    defaultWidth: 100,
    defaultHeight: 40,
    schema: [
      { name: 'Text',    label: '文字',    type: 'text', defaultValue: '"按鈕"', tab: 'init',     description: '顯示在按鈕上的文字' },
      { name: 'OnClick', label: '點擊事件', type: 'code', defaultValue: '',     tab: 'behavior', description: '使用者按下按鈕時執行的程式碼，例如重設變數：x=0; vx=0;' },
      { name: 'Tooltip', label: '提示',    type: 'text', defaultValue: '""',   tab: 'visual',   description: '滑鼠懸停在按鈕上時顯示的說明文字' },
    ],
  },
  'Elements.TwoStateButton': {
    type: 'Elements.TwoStateButton',
    label: '播放/暫停按鈕',
    icon: '▶⏸',
    defaultWidth: 80,
    defaultHeight: 40,
    schema: [
      { name: 'State',    label: '狀態變數', type: 'text', defaultValue: '_isPaused', tab: 'init',     description: '控制播放/暫停的布林變數名稱；true 代表暫停，false 代表播放中' },
      { name: 'OnClick',  label: '啟動事件', type: 'code', defaultValue: '%_play%',  tab: 'behavior', description: '點擊後進入「播放」狀態時執行的程式碼' },
      { name: 'OffClick', label: '暫停事件', type: 'code', defaultValue: '%_pause%', tab: 'behavior', description: '點擊後進入「暫停」狀態時執行的程式碼' },
    ],
  },
  'Elements.CheckBox': {
    type: 'Elements.CheckBox',
    label: '核取方框',
    icon: '✓',
    defaultWidth: 120,
    defaultHeight: 30,
    schema: [
      { name: 'Text',     label: '文字',    type: 'text',    defaultValue: '"選項"', tab: 'init',     description: '顯示在核取方框旁的說明文字' },
      { name: 'Checked',  label: '初始勾選', type: 'boolean', defaultValue: 'false', tab: 'init',     description: '模擬開始時是否預設為勾選狀態' },
      { name: 'OnChange', label: '變更事件', type: 'code',    defaultValue: '',      tab: 'behavior', description: '使用者勾選或取消勾選時執行的程式碼' },
    ],
  },
  'Elements.Label': {
    type: 'Elements.Label',
    label: '標籤',
    icon: '🏷',
    defaultWidth: 120,
    defaultHeight: 30,
    schema: [
      { name: 'Text',      label: '文字',   type: 'text',   defaultValue: '"文字"',  tab: 'init',   description: '標籤顯示的文字內容，可填入變數名稱動態顯示數值，例如：「速度：」+vx' },
      { name: 'Font',      label: '字型',   type: 'text',   defaultValue: '""',      tab: 'visual', description: '字型名稱，例如 "Arial"、"標楷體"；留空使用預設字型' },
      { name: 'FontSize',  label: '字號',   type: 'number', defaultValue: '14',      tab: 'visual', description: '文字大小（像素），建議 12～24' },
      { name: 'ForeColor', label: '文字色', type: 'color',  defaultValue: '"black"', tab: 'visual', description: '文字顏色' },
    ],
  },
  'Elements.ParsedField': {
    type: 'Elements.ParsedField',
    label: '數值輸入',
    icon: '🔢',
    defaultWidth: 100,
    defaultHeight: 30,
    schema: [
      { name: 'Value',    label: '數值',    type: 'text',    defaultValue: '0',       tab: 'init',     description: '欄位目前的數值，可填入變數名讓它顯示模擬數值，例如 x' },
      { name: 'Format',   label: '格式',    type: 'text',    defaultValue: '"0.000"', tab: 'init',     description: '數字顯示格式，"0.000" 代表小數點後三位；"0" 代表整數' },
      { name: 'Editable', label: '可編輯',  type: 'boolean', defaultValue: 'true',    tab: 'behavior', description: '開啟後使用者可直接在欄位輸入數值，修改模型變數' },
      { name: 'OnChange', label: '變更事件', type: 'code',   defaultValue: '',        tab: 'behavior', description: '使用者輸入新數值後執行的程式碼' },
    ],
  },
  'Elements.Shape2D': {
    type: 'Elements.Shape2D',
    label: '質點/形狀',
    icon: '⚪',
    defaultWidth: 60,
    defaultHeight: 60,
    schema: [
      { name: 'X',             label: 'X 位置', type: 'text',   defaultValue: '0',       tab: 'init',     description: '質點中心的 X 座標（世界座標），填入變數名如 x 可讓它動起來' },
      { name: 'Y',             label: 'Y 位置', type: 'text',   defaultValue: '0',       tab: 'init',     description: '質點中心的 Y 座標（世界座標），填入變數名如 y 可讓它動起來' },
      { name: 'SizeX',         label: 'X 半徑', type: 'text',   defaultValue: '0.5',     tab: 'init',     description: '形狀在 X 方向的半徑，單位為世界座標（非像素）' },
      { name: 'SizeY',         label: 'Y 半徑', type: 'text',   defaultValue: '0.5',     tab: 'init',     description: '形狀在 Y 方向的半徑，單位為世界座標（非像素）' },
      { name: 'ShapeType',     label: '形狀類型', type: 'select', defaultValue: 'ELLIPSE', tab: 'visual',
        options: ['ELLIPSE', 'RECTANGLE', 'WHEEL', 'ROUND_RECTANGLE'],
        description: 'ELLIPSE=橢圓/圓形，RECTANGLE=矩形，WHEEL=輪子（有輻射線的圓），ROUND_RECTANGLE=圓角矩形' },
      { name: 'FillColor',     label: '填充色', type: 'color',  defaultValue: '"blue"',  tab: 'visual',   description: '形狀內部的填充顏色' },
      { name: 'LineColor',     label: '邊框色', type: 'color',  defaultValue: '"black"', tab: 'visual',   description: '形狀邊框的顏色' },
      { name: 'Transformation',label: '旋轉角度', type: 'text', defaultValue: '0',       tab: 'behavior', description: '旋轉角度，單位為弧度（非角度）；可填入變數名讓它隨時間旋轉' },
      { name: 'Visible',       label: '是否顯示', type: 'boolean', defaultValue: 'true', tab: 'behavior', description: '控制形狀是否顯示，可填入布林變數' },
    ],
  },
  'Elements.Spring2D': {
    type: 'Elements.Spring2D',
    label: '彈簧',
    icon: '〰',
    defaultWidth: 120,
    defaultHeight: 40,
    schema: [
      { name: 'X',         label: 'X 起點', type: 'text',  defaultValue: '0',        tab: 'init',   description: '彈簧一端的 X 座標（世界座標），通常固定在牆壁或原點' },
      { name: 'Y',         label: 'Y 起點', type: 'text',  defaultValue: '0',        tab: 'init',   description: '彈簧一端的 Y 座標（世界座標）' },
      { name: 'SizeX',     label: '端點X',  type: 'text',  defaultValue: '2',        tab: 'init',   description: '彈簧另一端的 X 座標，填入質點位置變數（如 x）讓彈簧跟著伸縮' },
      { name: 'SizeY',     label: '端點Y',  type: 'text',  defaultValue: '0',        tab: 'init',   description: '彈簧另一端的 Y 座標，填入質點位置變數（如 y）讓彈簧跟著移動' },
      { name: 'LineColor', label: '顏色',   type: 'color', defaultValue: '"black"',  tab: 'visual', description: '彈簧的顯示顏色' },
    ],
  },
  'Elements.Arrow2D': {
    type: 'Elements.Arrow2D',
    label: '向量箭頭',
    icon: '➡',
    defaultWidth: 80,
    defaultHeight: 40,
    schema: [
      { name: 'X',         label: 'X 起點', type: 'text',  defaultValue: '0',     tab: 'init',   description: '箭頭起點的 X 座標，通常填入質點位置變數（如 x）' },
      { name: 'Y',         label: 'Y 起點', type: 'text',  defaultValue: '0',     tab: 'init',   description: '箭頭起點的 Y 座標，通常填入質點位置變數（如 y）' },
      { name: 'SizeX',     label: '向量X',  type: 'text',  defaultValue: '1',     tab: 'init',   description: '箭頭向量的 X 分量，填入速度或力的變數（如 vx）讓箭頭代表向量大小' },
      { name: 'SizeY',     label: '向量Y',  type: 'text',  defaultValue: '0',     tab: 'init',   description: '箭頭向量的 Y 分量，填入速度或力的 Y 分量（如 vy）' },
      { name: 'FillColor', label: '顏色',   type: 'color', defaultValue: '"red"', tab: 'visual', description: '箭頭的顯示顏色' },
    ],
  },
  'Elements.Trail2D': {
    type: 'Elements.Trail2D',
    label: '軌跡線',
    icon: '〜',
    defaultWidth: 60,
    defaultHeight: 40,
    schema: [
      { name: 'X',             label: 'X 位置',  type: 'text',   defaultValue: '0',      tab: 'init',   description: '軌跡記錄點的 X 座標，填入質點位置變數（如 x），模擬時自動畫出運動路徑' },
      { name: 'Y',             label: 'Y 位置',  type: 'text',   defaultValue: '0',      tab: 'init',   description: '軌跡記錄點的 Y 座標，填入質點位置變數（如 y）' },
      { name: 'LineColor',     label: '顏色',    type: 'color',  defaultValue: '"blue"', tab: 'visual', description: '軌跡線的顏色' },
      { name: 'MaximumPoints', label: '最大點數', type: 'number', defaultValue: '1000',  tab: 'visual', description: '軌跡最多保留的記錄點數，超過後舊點會被刪除；建議 500～2000' },
    ],
  },
};

export default ELEMENT_SCHEMAS;

export const ELEMENT_TYPE_LIST = Object.values(ELEMENT_SCHEMAS);
