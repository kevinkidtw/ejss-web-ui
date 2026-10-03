import { useRef, useState, useEffect } from 'react';
import { FolderOpen, Save, Download, RefreshCw, MonitorPlay, BookOpen, Calculator, LayoutTemplate, Lock, Unlock, Share2, Copy, Check, X } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { readEjssFile } from '../../utils/ejssParser';
import { downloadEjssFile, exportStandaloneHTML } from '../../utils/simulationRunner';
import { BACKDROP_TEMPLATES } from '../../constants/backdropTemplates';
import ExamplesModal from './ExamplesModal';

interface Props {
  showRightStage: boolean;
  onToggleRightStage: () => void;
  onOpenMath: () => void;
}

function ShareModal({ state, onClose }: { state: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    try {
      const stateToShare = {
        info: state.info,
        description: state.description,
        isLocked: state.isLocked,
        lockPassword: state.lockPassword,
        variables: state.variables,
        odePages: state.odePages,
        constraintPages: state.constraintPages,
        initPages: state.initPages,
        viewElements: state.viewElements,
      };
      const jsonStr = JSON.stringify(stateToShare);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      const url = `${window.location.origin}${window.location.pathname}?import=${base64}`;
      setShareUrl(url);
    } catch (e) {
      console.error('Failed to generate share URL:', e);
    }
  }, [state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl transition-all">
        {/* Decorative ambient background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative">
          <div className="flex items-center gap-2 text-indigo-650">
            <Share2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-800">雲端物理實驗分享</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5 relative">
          <div className="w-[190px] h-[190px] bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
            <img src={qrUrl} alt="Share QR Code" className="w-[180px] h-[180px] object-contain" />
          </div>
          <span className="text-[10px] text-slate-500 mt-2">掃描二維條碼即可在手機或平板上開啟本模擬實驗</span>
        </div>

        {/* Share Link input */}
        <div className="flex flex-col gap-1.5 mb-4 relative">
          <label className="text-xs text-slate-655 font-medium">實驗分享連結</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-50 text-slate-800 text-xs px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/10'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10 hover:scale-[1.02]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> 已複製
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> 複製
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-450 leading-normal">
          提示：這是一個無伺服器分享連結，您的所有物理公式、動畫設定及實驗說明均已安全地以壓縮編碼儲存在連結中。
        </div>
      </div>
    </div>
  );
}

function BackdropPopover({ onClose }: { onClose: () => void }) {
  const { info, variables, odePages, constraintPages, initPages, addViewElement } = useSimulationStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSelect = (templateId: string) => {
    const template = BACKDROP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    useSimulationStore.setState({
      info, variables, odePages, constraintPages, initPages,
      viewElements: [],
      activeBackdrop: templateId,
      selectedElementId: null,
    });
    template.elements.forEach((el) => addViewElement(el));
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute z-50 top-9 left-0 bg-white border border-slate-350 rounded-lg shadow-2xl p-3 min-w-[280px]"
    >
      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">選擇版型模板</div>
      <div className="flex flex-wrap gap-2 max-w-[380px]">
        {BACKDROP_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            title={t.description}
            className="flex flex-col items-center rounded-lg border border-slate-200 hover:border-indigo-500 overflow-hidden transition-all w-[80px] bg-slate-50 hover:bg-white cursor-pointer"
          >
            <div className="w-full h-14 flex items-center justify-center overflow-hidden bg-slate-100">
              <img
                src={import.meta.env.BASE_URL.replace(/\/$/, '') + t.preview}
                alt={t.label}
                className="max-h-12 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <span className="text-[9px] text-slate-700 px-1 py-1 text-center leading-tight w-full truncate font-medium">
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Toolbar({ showRightStage, onToggleRightStage, onOpenMath }: Props) {
  const store = useSimulationStore();
  const { isLocked, lockPassword, toggleLock, updateLockPassword } = store;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const getState = () => ({
    info: store.info,
    variables: store.variables,
    odePages: store.odePages,
    constraintPages: store.constraintPages,
    initPages: store.initPages,
    viewElements: store.viewElements,
    description: store.description,
    isLocked: store.isLocked,
    lockPassword: store.lockPassword,
  });

  const handleOpen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const state = await readEjssFile(file);
      store.loadState(state);
    } catch (err) {
      alert('無法讀取檔案：' + err);
    }
    e.target.value = '';
  };

  const handleUnlock = () => {
    const pw = prompt('請輸入教師密碼以解鎖編輯：');
    if (pw === lockPassword) {
      toggleLock(false);
      alert('解鎖成功！已還原所有腳本編輯與數學速查功能。');
    } else if (pw !== null) {
      alert('密碼錯誤！無法解鎖編輯功能。');
    }
  };

  const handleLock = () => {
    const pw = prompt('請設定鎖定密碼（直接按確定以使用預設密碼 "admin2026"）：', lockPassword || 'admin2026');
    if (pw !== null) {
      const finalPw = pw.trim() || 'admin2026';
      updateLockPassword(finalPw);
      toggleLock(true);
      alert('已鎖定！已切換為「學生探究作業單」模式，所有物理公式與腳本已被隱藏保護。');
    }
  };

  const buttonClass = "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0 cursor-pointer";

  return (
    <>
    <header className="h-11 bg-slate-50 flex items-center px-4 gap-2 flex-shrink-0 border-b border-slate-300 select-none overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2 mr-2 font-bold text-slate-800 whitespace-nowrap flex-shrink-0">
        <span className="text-sm">🧪</span> EjsS Lab
      </div>

      <button disabled={isLocked} onClick={() => store.resetState()} className={buttonClass}>
        <RefreshCw className="w-3.5 h-3.5" /> 新增
      </button>

      <div className="relative flex-shrink-0">
        <button disabled={isLocked} onClick={() => setShowTemplates((v) => !v)} className={buttonClass}>
          <LayoutTemplate className="w-3.5 h-3.5" /> 模板
        </button>
        {showTemplates && <BackdropPopover onClose={() => setShowTemplates(false)} />}
      </div>

      <button disabled={isLocked} onClick={() => setShowExamples(true)} className={buttonClass}>
        <BookOpen className="w-3.5 h-3.5" /> 範例
      </button>

      <button disabled={isLocked} onClick={onOpenMath} className={buttonClass}>
        <Calculator className="w-3.5 h-3.5" /> 數學速查
      </button>

      <button disabled={isLocked} onClick={() => fileInputRef.current?.click()} className={buttonClass}>
        <FolderOpen className="w-3.5 h-3.5" /> 開啟
      </button>
      <input ref={fileInputRef} type="file" accept=".ejss" className="hidden" onChange={handleOpen} />

      <button onClick={() => downloadEjssFile(getState())} className={buttonClass}>
        <Save className="w-3.5 h-3.5" /> 儲存
      </button>

      <button onClick={() => exportStandaloneHTML(getState())} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 transition-colors shadow-sm whitespace-nowrap flex-shrink-0 cursor-pointer">
        <Download className="w-3.5 h-3.5" /> 匯出
      </button>

      <button onClick={() => setShowShare(true)} className={buttonClass}>
        <Share2 className="w-3.5 h-3.5" /> 分享
      </button>

      {isLocked ? (
        <button onClick={handleUnlock} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 transition-colors shadow-sm whitespace-nowrap flex-shrink-0 cursor-pointer">
          <Unlock className="w-3.5 h-3.5" /> 解鎖
        </button>
      ) : (
        <button onClick={handleLock} className={buttonClass}>
          <Lock className="w-3.5 h-3.5" /> 鎖定
        </button>
      )}

      <div className="flex-1 min-w-[12px]" />

      <input
        disabled={isLocked}
        className={`bg-white text-slate-800 text-xs px-2.5 py-1 rounded border border-slate-300 w-36 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 outline-none transition-colors whitespace-nowrap flex-shrink-0
          ${isLocked ? 'cursor-not-allowed opacity-50 bg-slate-50 border-transparent' : ''}`}
        value={store.info.title}
        placeholder="模擬名稱"
        onChange={(e) => store.loadState({ ...getState(), info: { ...store.info, title: e.target.value } })}
      />

      <button
        onClick={onToggleRightStage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border shadow-sm whitespace-nowrap flex-shrink-0 cursor-pointer ${showRightStage ? 'bg-slate-200 border-slate-400 text-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'}`}
      >
        <MonitorPlay className="w-3.5 h-3.5" />
        {showRightStage ? '隱藏模擬' : '顯示模擬'}
      </button>
    </header>
    {showExamples && <ExamplesModal onClose={() => setShowExamples(false)} />}
    {showShare && <ShareModal state={getState()} onClose={() => setShowShare(false)} />}
    </>
  );
}
