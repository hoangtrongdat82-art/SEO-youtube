import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Type,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { YouTubeTitleItem } from '../types/seo';

interface Step3Props {
  titles: YouTubeTitleItem[];
  selectedTitle: string;
  focusKeyword: string;
  channelName: string;
  loading: boolean;
  onGenerateTitles: () => void;
  onSelectTitle: (title: string) => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  hasActivePlan?: boolean;
  onRequirePlan?: () => void;
}

export const Step3Titles: React.FC<Step3Props> = ({
  titles,
  selectedTitle,
  focusKeyword,
  channelName,
  loading,
  onGenerateTitles,
  onSelectTitle,
  onCopy,
  onRegenerate,
  hasActivePlan = true,
  onRequirePlan,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleGenerate = () => {
    if (!hasActivePlan) {
      setErrorMsg('Bạn cần mua gói để sử dụng công cụ này.');
      onRequirePlan?.();
      return;
    }
    if (!focusKeyword) {
      setErrorMsg('Vui lòng chọn từ khóa trọng tâm trước.');
      return;
    }
    if (!channelName || !channelName.trim()) {
      setErrorMsg('Vui lòng nhập tên kênh YouTube của bạn.');
      return;
    }
    setErrorMsg(null);
    onGenerateTitles();
  };

  const getStyleBadgeColor = (style: string) => {
    const s = (style || '').toLowerCase();
    if (s.includes('hướng dẫn')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s.includes('bí quyết') || s.includes('secret')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (s.includes('danh sách') || s.includes('top')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s.includes('sai lầm') || s.includes('mistake')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (s.includes('xu hướng') || s.includes('trend')) return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s.includes('người mới') || s.includes('beginner')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    if (s.includes('so sánh') || s.includes('vs')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (s.includes('thực tế') || s.includes('kết quả')) return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    if (s.includes('chuyên gia') || s.includes('expert')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (s.includes('viral')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
            3
          </span>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Bước 3: Tạo 10 tiêu đề YouTube chuẩn SEO
            </h2>
            <p className="text-xs text-slate-400">
              Đa dạng 10 trường phái tiêu đề: Hướng dẫn, Bí quyết, Sai lầm, Viral, Người mới...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {titles.length > 0 && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tạo lại</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang xử lý dữ liệu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{titles.length > 0 ? 'Tạo lại 10 tiêu đề' : 'Tạo 10 tiêu đề YouTube'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Box hiển thị và tinh chỉnh tiêu đề đã chọn */}
      {selectedTitle && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-950 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Tiêu đề đã chọn cho các bước tiếp theo:
            </span>
            <button
              type="button"
              onClick={() => setIsEditingTitle(!isEditingTitle)}
              className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingTitle ? 'Xong' : 'Chỉnh sửa tiêu đề'}</span>
            </button>
          </div>

          {isEditingTitle ? (
            <input
              type="text"
              value={selectedTitle}
              onChange={(e) => onSelectTitle(e.target.value)}
              className="w-full bg-slate-900 border border-blue-500/50 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
              {selectedTitle}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
            <span>Độ dài: {selectedTitle.length} ký tự</span>
            <span>•</span>
            <span className={selectedTitle.length >= 45 && selectedTitle.length <= 75 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {selectedTitle.length >= 45 && selectedTitle.length <= 75 ? '✓ Chuẩn độ dài YouTube CTR (45-75)' : 'Gợi ý: 45 - 75 ký tự'}
            </span>
          </div>
        </div>
      )}

      {titles.length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
            <span>Danh sách 10 tiêu đề theo kênh: <strong className="text-slate-200">{channelName}</strong></span>
            <span>Bấm &ldquo;Chọn tiêu đề này&rdquo; để dùng</span>
          </div>

          {titles.map((item, index) => {
            const isSelected = selectedTitle === item.title;
            const length = item.title.length;
            const isGoodLength = length >= 45 && length <= 75;

            return (
              <div
                key={item.id || index}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border transition ${
                  isSelected
                    ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getStyleBadgeColor(
                          item.style
                        )}`}
                      >
                        {item.style}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {length} ký tự {isGoodLength ? '• Chuẩn CTR' : ''}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Tiêu đề đang chọn
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug break-words">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 leading-tight">
                        💡 {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onCopy(item.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
                    title="Sao chép tiêu đề"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTitle(item.title)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chọn</span>
                      </>
                    ) : (
                      <span>Chọn tiêu đề này</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
