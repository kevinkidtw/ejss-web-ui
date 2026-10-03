import { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Eye, Edit3, FileText, Info } from 'lucide-react';

export default function DescriptionEditor() {
  const { description, updateDescription } = useSimulationStore();
  const [activeSubTab, setActiveSubTab] = useState<'edit' | 'preview'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Set default description if empty
  useEffect(() => {
    if (!description) {
      updateDescription(
        '# 模擬實驗講義\n\n請在此輸入本模擬的物理原理、步驟與引導思考題。\n\n### 🔬 實驗步驟\n1. 調整下方的參數滑桿。\n2. 點擊 **▶ 播放** 按鈕觀察動畫。\n3. 觀察右側圖表中變數的隨時間演化關係。'
      );
    }
  }, [description, updateDescription]);

  const getPreviewHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans TC", sans-serif;
      font-size: 14.5px;
      line-height: 1.8;
      color: #334155; /* slate-700 for high readability */
      background-color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    p, li, td {
      color: #334155;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 28px;
      margin-bottom: 14px;
      font-weight: 700;
    }
    h1 { font-size: 1.8em; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; color: #1e3a8a; } /* Deep Indigo */
    h2 { font-size: 1.45em; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; color: #0f766e; } /* Teal Green */
    h3 { font-size: 1.25em; color: #c2410c; } /* Deep Orange */
    code {
      font-family: "Fira Code", Monaco, Consolas, monospace;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
      color: #b91c1c; /* VS Code light red literal */
      font-size: 0.9em;
    }
    pre {
      background: #f8fafc;
      padding: 14px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
    }
    pre code {
      background: none;
      padding: 0;
      color: #334155;
      font-size: 0.95em;
    }
    a { color: #4f46e5; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0; }
    blockquote {
      border-left: 4px solid #4f46e5;
      padding-left: 16px;
      margin: 16px 0;
      color: #475569;
      background: #f5f3ff;
      border-radius: 0 8px 8px 0;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    ul, ol { padding-left: 20px; margin-bottom: 16px; }
    li { margin-bottom: 6px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    try {
      var raw = ${JSON.stringify(description)};
      document.getElementById('content').innerHTML = marked.parse(raw);
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\\\(', right: '\\\\)', display: false},
          {left: '\\\\[', right: '\\\\]', display: true}
        ],
        throwOnError: false
      });
    } catch(e) {
      document.getElementById('content').innerHTML = '<p style="color: #ef4444;">預覽解析出錯：' + e.message + '</p>';
    }
  </script>
</body>
</html>
    `;
  };

  useEffect(() => {
    if (activeSubTab === 'preview' && iframeRef.current) {
      iframeRef.current.srcdoc = getPreviewHTML();
    }
  }, [activeSubTab, description]);

  return (
    <div className="h-full bg-slate-50 text-slate-800 min-h-0 overflow-hidden flex flex-col">
      {/* Main editor area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header containing mode toggle button */}
        <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 border-b border-slate-200 bg-slate-100">
          <div className="flex items-center gap-2">
            {activeSubTab === 'preview' ? (
              <>
                <FileText className="w-4 h-4 text-indigo-650" />
                <span className="text-xs font-bold text-slate-700">模擬實驗講義 (預覽)</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 text-indigo-650 animate-pulse" />
                <span className="text-xs font-bold text-slate-750">編輯模擬實驗講義 (Markdown)</span>
              </>
            )}
          </div>
          
          <div>
            {activeSubTab === 'preview' ? (
              <button
                onClick={() => setActiveSubTab('edit')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-indigo-700 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                編輯講義
              </button>
            ) : (
              <button
                onClick={() => setActiveSubTab('preview')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-300 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-650" />
                儲存並預覽
              </button>
            )}
          </div>
        </div>

        {/* Terminology & Storage Info Banner */}
        {activeSubTab === 'edit' && (
          <div className="flex-shrink-0 bg-indigo-50 border-b border-indigo-100 px-4 py-2 text-xs text-indigo-900 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-800">💡 模擬實驗講義三位一體去向：</span>
              本編輯器所撰寫的講義會即時保存在記憶體中。當您
              <span className="text-indigo-800 font-bold mx-0.5">匯出 EJSS XML</span>時會相容儲存於 <code className="bg-indigo-100/50 px-1 rounded text-indigo-800 text-[10px]">&lt;Abstract&gt;</code> 標籤；
              當您點擊<span className="text-indigo-800 font-bold mx-0.5">導出獨立網頁 (Export HTML)</span>時，會編譯成網頁內置的可折疊
              <span className="text-indigo-800 font-bold mx-0.5">側邊模擬實驗講義面板</span>，方便學生隨時對照操作！
            </div>
          </div>
        )}

        {/* Dynamic content view */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeSubTab === 'edit' ? (
            <textarea
              value={description}
              onChange={(e) => updateDescription(e.target.value)}
              className="w-full h-full p-4 bg-white text-slate-800 font-mono text-sm leading-relaxed focus:outline-none resize-none border-none placeholder-slate-400"
              placeholder="# 模擬實驗講義&#10;&#10;可以使用 Markdown 與 LaTeX 數學公式：&#10;- 行內公式：$F = -k x$&#10;- 區塊公式：$$ E = \frac{1}{2}m v^2 + \dots $$"
            />
          ) : (
            <iframe
              ref={iframeRef}
              title="Description Preview"
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
