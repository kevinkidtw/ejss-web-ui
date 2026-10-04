import { useRef, useState, useEffect } from 'react';
import { FolderOpen, Save, Download, RefreshCw, MonitorPlay, BookOpen, Calculator, LayoutTemplate, Lock, Unlock, Share2, Copy, Check, X } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { readEjssFile } from '../../utils/ejssParser';
import { downloadEjssFile, exportStandaloneHTML } from '../../utils/simulationRunner';
import { BACKDROP_TEMPLATES } from '../../constants/backdropTemplates';
import type { SimulationState } from '../../types/simulation';
import ExamplesModal from './ExamplesModal';
import LockDialog from './LockDialog';

interface Props {
  showRightStage: boolean;
  onToggleRightStage: () => void;
  onOpenMath: () => void;
}

function ShareModal({ state, onClose }: { state: SimulationState; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl] = useState(() => {
    try {
      const stateToShare = {
        info: state.info,
        description: state.description,
        isLocked: state.isLocked,
        lockHash: state.lockHash,
        lockSalt: state.lockSalt,
        variables: state.variables,
        odePages: state.odePages,
        constraintPages: state.constraintPages,
        initPages: state.initPages,
        viewElements: state.viewElements,
      };
      const jsonStr = JSON.stringify(stateToShare);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      return `${window.location.origin}${window.location.pathname}?import=${base64}`;
    } catch (e) {
      console.error('Failed to generate share URL:', e);
      return '';
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-card bg-card border border-line p-6 shadow-lg transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-primary">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-ink">雲端物理實驗分享</h3>
          </div>
          <button onClick={onClose} className="rounded-control p-1 text-ink-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-paper rounded-control border border-line mb-4">
          <div className="w-[190px] h-[190px] bg-card p-2 rounded-control border border-line shadow-xs flex items-center justify-center overflow-hidden">
            <img src={qrUrl} alt="Share QR Code" className="w-[180px] h-[180px] object-contain" />
          </div>
          <span className="text-[11px] text-ink-muted mt-2">掃描 QR Code 即可在手機或平板上開啟本模擬實驗</span>
        </div>

        {/* Share Link input */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs text-ink font-medium">實驗分享連結</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-paper text-ink text-xs px-3 py-2 rounded-control border border-line outline-none focus:border-primary min-h-[36px]"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-control transition-all cursor-pointer min-h-[36px] ${
                copied
                  ? 'bg-teal text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
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

        <div className="text-[11px] text-ink-muted leading-relaxed">
          提示：這是一個無伺服器分享連結，物理公式、動畫設定及實驗說明皆以壓縮編碼儲存於連結中。
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
      className="absolute z-50 top-11 left-0 bg-card border border-line rounded-card shadow-lg p-3.5 min-w-[280px]"
    >
      <div className="text-[10px] text-ink-muted uppercase tracking-wider font-bold mb-2.5">選擇版型模板</div>
      <div className="flex flex-wrap gap-2 max-w-[380px]">
        {BACKDROP_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSelect(t.id)}
            title={t.description}
            className="flex flex-col items-center rounded-control border border-line hover:border-primary overflow-hidden transition-all w-[82px] bg-paper hover:bg-card cursor-pointer"
          >
            <div className="w-full h-14 flex items-center justify-center overflow-hidden bg-paper">
              <img
                src={import.meta.env.BASE_URL.replace(/\/$/, '') + t.preview}
                alt={t.label}
                className="max-h-12 max-w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <span className="text-[10px] text-ink px-1 py-1 text-center leading-tight w-full truncate font-medium">
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
  const { isLocked } = store;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [lockDialogMode, setLockDialogMode] = useState<'lock' | 'unlock' | null>(null);

  const getState = () => ({
    info: store.info,
    variables: store.variables,
    odePages: store.odePages,
    constraintPages: store.constraintPages,
    initPages: store.initPages,
    viewElements: store.viewElements,
    description: store.description,
    isLocked: store.isLocked,
    lockHash: store.lockHash,
    lockSalt: store.lockSalt,
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

  const buttonClass =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium bg-card hover:bg-paper border border-line text-ink transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0 cursor-pointer min-h-[36px]";

  return (
    <>
    <header className="h-12 bg-card flex items-center px-4 gap-2 flex-shrink-0 border-b border-line select-none overflow-x-auto scrollbar-none z-20">
      <div className="flex items-center gap-2 mr-2 font-bold text-ink whitespace-nowrap flex-shrink-0 text-sm">
        <span>🧪</span> EjsS 物理模擬編輯器
      </div>

      <button disabled={isLocked} onClick={() => store.resetState()} className={buttonClass}>
        <RefreshCw className="w-3.5 h-3.5 text-primary" /> 新增
      </button>

      <div className="relative flex-shrink-0">
        <button disabled={isLocked} onClick={() => setShowTemplates((v) => !v)} className={buttonClass}>
          <LayoutTemplate className="w-3.5 h-3.5 text-teal" /> 模板
        </button>
        {showTemplates && <BackdropPopover onClose={() => setShowTemplates(false)} />}
      </div>

      <button disabled={isLocked} onClick={() => setShowExamples(true)} className={buttonClass}>
        <BookOpen className="w-3.5 h-3.5 text-amber" /> 範例庫
      </button>

      <button disabled={isLocked} onClick={onOpenMath} className={buttonClass}>
        <Calculator className="w-3.5 h-3.5 text-primary" /> 數學速查
      </button>

      <button disabled={isLocked} onClick={() => fileInputRef.current?.click()} className={buttonClass}>
        <FolderOpen className="w-3.5 h-3.5 text-ink-muted" /> 開啟
      </button>
      <input ref={fileInputRef} type="file" accept=".ejss" className="hidden" onChange={handleOpen} />

      <button onClick={() => downloadEjssFile(getState())} className={buttonClass}>
        <Save className="w-3.5 h-3.5 text-ink-muted" /> 儲存
      </button>

      <button
        onClick={() => exportStandaloneHTML(getState())}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors shadow-xs whitespace-nowrap flex-shrink-0 cursor-pointer min-h-[36px]"
      >
        <Download className="w-3.5 h-3.5" /> 匯出 HTML
      </button>

      <button onClick={() => setShowShare(true)} className={buttonClass}>
        <Share2 className="w-3.5 h-3.5 text-primary" /> 分享
      </button>

      {isLocked ? (
        <button
          onClick={() => setLockDialogMode('unlock')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-semibold bg-teal hover:bg-teal-soft hover:text-teal text-white transition-colors shadow-xs whitespace-nowrap flex-shrink-0 cursor-pointer min-h-[36px]"
        >
          <Unlock className="w-3.5 h-3.5" /> 解鎖
        </button>
      ) : (
        <button onClick={() => setLockDialogMode('lock')} className={buttonClass}>
          <Lock className="w-3.5 h-3.5 text-ink-muted" /> 鎖定
        </button>
      )}

      <div className="flex-1 min-w-[12px]" />

      <input
        disabled={isLocked}
        className={`bg-paper text-ink text-xs px-3 py-1.5 rounded-control border border-line w-40 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-colors whitespace-nowrap flex-shrink-0 min-h-[36px]
          ${isLocked ? 'cursor-not-allowed opacity-50 bg-paper/50' : ''}`}
        value={store.info.title}
        placeholder="模擬名稱"
        onChange={(e) => store.loadState({ ...getState(), info: { ...store.info, title: e.target.value } })}
      />

      <button
        onClick={onToggleRightStage}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium transition-colors border whitespace-nowrap flex-shrink-0 cursor-pointer min-h-[36px] ${
          showRightStage
            ? 'bg-primary-soft border-primary text-primary font-semibold'
            : 'bg-card border-line text-ink hover:bg-paper'
        }`}
      >
        <MonitorPlay className="w-3.5 h-3.5" />
        {showRightStage ? '隱藏模擬' : '顯示模擬'}
      </button>
    </header>

    {showExamples && <ExamplesModal onClose={() => setShowExamples(false)} />}
    {showShare && <ShareModal state={getState()} onClose={() => setShowShare(false)} />}
    {lockDialogMode && (
      <LockDialog mode={lockDialogMode} onClose={() => setLockDialogMode(null)} />
    )}
    </>
  );
}
