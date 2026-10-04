import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, X, AlertCircle } from 'lucide-react';
import { hashPassword, verifyPassword } from '../../utils/lockCrypto';
import { useSimulationStore } from '../../store/simulationStore';

interface LockDialogProps {
  mode: 'lock' | 'unlock';
  onClose: () => void;
}

export default function LockDialog({ mode, onClose }: LockDialogProps) {
  const { lockHash, lockSalt, setLock, unlock } = useSimulationStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (mode === 'lock') {
      if (password.length < 4) {
        setError('密碼長度至少需 4 個字元');
        return;
      }
      if (password !== confirmPassword) {
        setError('兩次輸入的密碼不相符');
        return;
      }

      setLoading(true);
      try {
        const { hash, salt } = await hashPassword(password);
        setLock(hash, salt);
        onClose();
      } catch (err) {
        setError('密碼加密處理失敗');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      if (!password) {
        setError('請輸入解鎖密碼');
        return;
      }

      if (!lockHash || !lockSalt) {
        unlock();
        onClose();
        return;
      }

      setLoading(true);
      try {
        const isValid = await verifyPassword(password, lockHash, lockSalt);
        if (isValid) {
          unlock();
          onClose();
        } else {
          setError('密碼錯誤！無法解鎖編輯功能。');
        }
      } catch (err) {
        setError('密碼驗證出錯');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 select-none"
    >
      <div className="bg-card border border-line rounded-card shadow-lg p-6 w-full max-w-sm flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'lock' ? (
              <div className="w-8 h-8 rounded-control bg-primary-soft text-primary flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-control bg-teal-soft text-teal flex items-center justify-center">
                <Unlock className="w-4 h-4" />
              </div>
            )}
            <h3 id="lock-dialog-title" className="text-sm font-bold text-ink">
              {mode === 'lock' ? '鎖定編輯器' : '輸入教師密碼以解鎖'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded-control hover:bg-paper transition-colors cursor-pointer"
            aria-label="關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-ink-muted leading-relaxed">
          {mode === 'lock'
            ? '鎖定後將切換為學生探究作業單模式，隱藏所有物理公式、ODE 與廣域腳本。'
            : '請輸入先前設定的鎖定密碼，以還原所有腳本編輯與數學速查功能。'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink">
              {mode === 'lock' ? '設定密碼（至少 4 個字元）' : '密碼'}
            </label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder={mode === 'lock' ? '請輸入密碼' : '請輸入教師密碼'}
              className="bg-paper border border-line rounded-control text-ink text-xs px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[38px]"
              disabled={loading}
            />
          </div>

          {mode === 'lock' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink">確認密碼</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="請再次輸入密碼"
                className="bg-paper border border-line rounded-control text-ink text-xs px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[38px]"
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-danger text-xs bg-danger-soft px-2.5 py-1.5 rounded-control">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-ink bg-paper hover:bg-line border border-line rounded-control transition-colors cursor-pointer min-h-[36px]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-control transition-colors cursor-pointer shadow-xs min-h-[36px] flex items-center gap-1.5"
            >
              {loading ? (
                <span>處理中...</span>
              ) : mode === 'lock' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>確認鎖定</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>確認解鎖</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
