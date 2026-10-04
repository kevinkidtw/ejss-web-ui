import { useState, useRef, useEffect, useCallback } from 'react';
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

  const getPreviewHTML = useCallback(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
  <style>
    body {
      font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14.5px;
      line-height: 1.8;
      color: #2B2D31;
      background-color: #FFFFFF;
      margin: 0;
      padding: 24px;
    }
    p, li, td {
      color: #2B2D31;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 28px;
      margin-bottom: 14px;
      font-weight: 700;
    }
    h1 { font-size: 1.8em; border-bottom: 2px solid #E5E1D8; padding-bottom: 8px; color: #2F6FB0; }
    h2 { font-size: 1.45em; border-bottom: 1px solid #E5E1D8; padding-bottom: 6px; color: #2A9D8F; }
    h3 { font-size: 1.25em; color: #E9A23B; }
    code {
      font-family: 'JetBrains Mono', monospace;
      background: #FAF8F3;
      padding: 2px 6px;
      border-radius: 6px;
      border: 1px solid #E5E1D8;
      color: #D1495B;
      font-size: 0.9em;
    }
    pre {
      background: #FAF8F3;
      padding: 14px;
      border-radius: 10px;
      overflow-x: auto;
      border: 1px solid #E5E1D8;
    }
    pre code {
      background: none;
      padding: 0;
      color: #2B2D31;
      border: none;
      font-size: 0.95em;
    }
    a { color: #2F6FB0; text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: 0; border-top: 1px solid #E5E1D8; margin: 28px 0; }
    blockquote {
      border-left: 4px solid #2F6FB0;
      padding-left: 16px;
      margin: 16px 0;
      color: #6B6F76;
      background: #E6EEF7;
      border-radius: 0 10px 10px 0;
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
      border: 1px solid #E5E1D8;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #FAF8F3;
      color: #2B2D31;
    }
    tr:nth-child(even) {
      background: #FAF8F3;
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
      document.getElementById('content').innerHTML = '<p style="color: #D1495B;">預覽解析出錯：' + e.message + '</p>';
    }
  </script>
</body>
</html>
    `;
  }, [description]);

  useEffect(() => {
    if (activeSubTab === 'preview' && iframeRef.current) {
      iframeRef.current.srcdoc = getPreviewHTML();
    }
  }, [activeSubTab, getPreviewHTML]);

  return (
    <div className="h-full bg-paper text-ink min-h-0 overflow-hidden flex flex-col">
      {/* Main editor area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header containing mode toggle button */}
        <div className="flex-shrink-0 flex justify-between items-center px-4 py-2.5 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            {activeSubTab === 'preview' ? (
              <>
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-ink">模擬實驗講義 (預覽)</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-bold text-ink">編輯模擬實驗講義 (Markdown)</span>
              </>
            )}
          </div>
          
          <div>
            {activeSubTab === 'preview' ? (
              <button
                onClick={() => setActiveSubTab('edit')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-xs transition-all cursor-pointer min-h-[32px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                編輯講義
              </button>
            ) : (
              <button
                onClick={() => setActiveSubTab('preview')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-bold bg-card hover:bg-paper text-ink shadow-xs border border-line transition-all cursor-pointer min-h-[32px]"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                儲存並預覽
              </button>
            )}
          </div>
        </div>

        {/* Terminology & Storage Info Banner */}
        {activeSubTab === 'edit' && (
          <div className="flex-shrink-0 bg-primary-soft/60 border-b border-line px-4 py-2.5 text-xs text-ink flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-primary">💡 模擬實驗講義三位一體去向：</span>
              本編輯器所撰寫的講義會即時保存在記憶體中。當您
              <span className="text-primary font-bold mx-0.5">匯出 EJSS XML</span>時會相容儲存於 <code className="bg-paper px-1.5 py-0.5 rounded-control text-primary text-[10px] border border-line">&lt;Abstract&gt;</code> 標籤；
              當您點擊<span className="text-primary font-bold mx-0.5">導出獨立網頁 (Export HTML)</span>時，會編譯成網頁內置的可折疊
              <span className="text-primary font-bold mx-0.5">側邊模擬實驗講義面板</span>，方便學生隨時對照操作！
            </div>
          </div>
        )}

        {/* Dynamic content view */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeSubTab === 'edit' ? (
            <textarea
              value={description}
              onChange={(e) => updateDescription(e.target.value)}
              className="w-full h-full p-4 bg-card text-ink font-mono text-sm leading-relaxed focus:outline-none resize-none border-none placeholder:text-ink-muted/50"
              placeholder="# 模擬實驗講義&#10;&#10;可以使用 Markdown 與 LaTeX 數學公式：&#10;- 行內公式：$F = -k x$&#10;- 區塊公式：$$ E = \frac{1}{2}m v^2 + \dots $$"
            />
          ) : (
            <iframe
              ref={iframeRef}
              title="Description Preview"
              className="w-full h-full border-none bg-card"
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
