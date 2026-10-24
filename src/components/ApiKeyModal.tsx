import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Save,
  Eye,
  EyeOff,
  X,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onDeleteApiKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  onDeleteApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
    setTestResult(null);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    const keyToTest = inputKey.trim();
    if (!keyToTest) {
      setTestResult({
        type: 'error',
        message: 'API Key không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/seo/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': keyToTest,
        },
        body: JSON.stringify({ apiKey: keyToTest }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTestResult({
            type: 'success',
            message: 'API đã kết nối thành công.',
          });
          return;
        }
      }
      throw new Error('Test server-side unreached or failed, testing via client SDK');
    } catch {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: keyToTest });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Hi',
        });
        if (response && response.text) {
          setTestResult({
            type: 'success',
            message: 'API đã kết nối thành công.',
          });
          return;
        }
      } catch (err) {
        console.error('Test API Key client error:', err);
      }

      setTestResult({
        type: 'error',
        message: 'API Key không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyToSave = inputKey.trim();
    if (!keyToSave) {
      setTestResult({
        type: 'error',
        message: 'API Key không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại.',
      });
      return;
    }
    onSaveApiKey(keyToSave);
    setTestResult({
      type: 'success',
      message: 'Đã lưu API Key riêng thành công! Trạng thái: Đã kết nối API riêng.',
    });
  };

  const handleDelete = () => {
    onDeleteApiKey();
    setInputKey('');
    setTestResult({
      type: 'success',
      message: 'Đã xóa API Key riêng. Hệ thống đang sử dụng API mặc định trên server.',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xl animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Radiant ambient spotlight shining behind the popup */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.35)_0%,_rgba(56,189,248,0.18)_30%,_rgba(15,23,42,0.65)_75%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-500/30 via-cyan-400/25 to-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Modal Container with glowing focus halo */}
      <div className="relative w-full max-w-lg animate-modal-pop">
        {/* Soft glowing backlight halo directly behind the card */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/40 via-cyan-400/40 to-blue-600/40 rounded-[28px] blur-xl opacity-90 pointer-events-none" />

        <div className="relative w-full bg-slate-900/95 border border-cyan-400/40 ring-1 ring-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_60px_-10px_rgba(56,189,248,0.45)] text-left overflow-hidden">
          {/* Subtle top edge specular highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-300 to-indigo-500" />

          {/* Decorative ambient blue glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-blue-900/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Cấu Hình Gemini API Key
              </h3>
              <p className="text-xs text-slate-400">
                Ưu tiên dùng API Key riêng trong localStorage cho ứng dụng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer border border-slate-700/60"
            title="Đóng popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status notification: Đã kết nối API riêng */}
        {apiKey ? (
          <div className="mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Trạng thái: Đã kết nối API riêng</span>
            </div>
            <span className="text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-300 font-mono">
              Ưu tiên bật
            </span>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-blue-950/50 border border-blue-800/40 text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Chưa nhập key riêng: Đang dùng GEMINI_API_KEY mặc định trên server.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>Nhập Gemini API Key của bạn:</span>
              </label>

              {/* Nút Lấy API Key */}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-blue-950/70 hover:bg-blue-900/80 px-2.5 py-1 rounded-lg border border-blue-500/30 transition cursor-pointer"
                title="Mở Google AI Studio để tạo API Key miễn phí"
              >
                <span>Lấy API Key</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  if (testResult) setTestResult(null);
                }}
                placeholder="Dán Gemini API Key (ví dụ: AIzaSy...)"
                className="w-full bg-slate-950 border border-blue-900/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-2xl pl-4 pr-12 py-3 text-sm text-cyan-100 placeholder-slate-500 outline-none font-mono transition"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showKey ? 'Ẩn API Key' : 'Hiện API Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                API Key được lưu trữ an toàn trong localStorage trên máy của bạn và không bị lộ ra ngoài.
              </span>
            </p>
          </div>

          {/* Test Result Feedback Box */}
          {testResult && (
            <div
              className={`flex items-start gap-2.5 p-3.5 rounded-2xl text-xs font-semibold transition ${
                testResult.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-400 animate-shake'
              }`}
            >
              {testResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span className="leading-snug">{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Left side actions: Xóa API & Test thử API */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !inputKey.trim()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer disabled:opacity-40"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Đang test...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test thử API</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={!apiKey && !inputKey.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition cursor-pointer disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400"
                title="Xóa API Key riêng và quay lại dùng key mặc định"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa API</span>
              </button>
            </div>

            {/* Right side actions: Lấy API Key & Lưu API */}
            <div className="flex items-center gap-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 transition cursor-pointer"
              >
                <span>Lấy API Key</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>

              <button
                type="submit"
                disabled={!inputKey.trim()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98] transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu API</span>
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
