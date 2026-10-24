import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  Loader2,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Hash,
} from 'lucide-react';
import { DescriptionData } from '../types/seo';

interface Step4Props {
  selectedTitle: string;
  focusKeyword: string;
  channelName: string;
  descriptionData: DescriptionData | null;
  loading: boolean;
  onGenerateDescription: () => void;
  onDescriptionChange: (val: string) => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  hasActivePlan?: boolean;
  onRequirePlan?: () => void;
}

export const Step4Description: React.FC<Step4Props> = ({
  selectedTitle,
  focusKeyword,
  channelName,
  descriptionData,
  loading,
  onGenerateDescription,
  onDescriptionChange,
  onCopy,
  onRegenerate,
  hasActivePlan = true,
  onRequirePlan,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!hasActivePlan) {
      setErrorMsg('Bạn cần mua gói để sử dụng công cụ này.');
      onRequirePlan?.();
      return;
    }
    if (!selectedTitle) {
      setErrorMsg('Vui lòng chọn 1 tiêu đề ở Bước 3 trước.');
      return;
    }
    setErrorMsg(null);
    onGenerateDescription();
  };

  // Tính lại số lần xuất hiện từ khóa theo thời gian thực nếu người dùng chỉnh sửa
  const currentKeywordCount = React.useMemo(() => {
    if (!descriptionData?.description || !focusKeyword) return 0;
    const text = descriptionData.description.toLowerCase();
    const phrase = focusKeyword.toLowerCase().trim();
    if (!phrase) return 0;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=\\b|\\s|^)${escaped}(?=\\b|\\s|[.,!?;:]|$)`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }, [descriptionData?.description, focusKeyword]);

  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
            4
          </span>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Bước 4: Viết mô tả YouTube chuẩn SEO
            </h2>
            <p className="text-xs text-slate-400">
              Chứa đúng 3 lần từ khóa trọng tâm, mở bài thu hút, CTA tăng sub, và kết thúc bằng 3 hashtag độc quyền
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {descriptionData && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Viết lại</span>
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
                <span>{descriptionData ? 'Viết lại mô tả' : 'Viết mô tả YouTube'}</span>
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

      {/* Hiển thị tiêu đề đã chọn */}
      <div className="bg-slate-950/70 border border-blue-900/30 rounded-2xl p-4 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Tiêu đề video đang chọn:
        </span>
        {selectedTitle ? (
          <p className="text-sm sm:text-base font-bold text-cyan-400 leading-snug">
            {selectedTitle}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Chưa chọn tiêu đề. Vui lòng bấm &ldquo;Chọn tiêu đề này&rdquo; ở Bước 3.
          </p>
        )}
      </div>

      {/* Kết quả mô tả */}
      {descriptionData && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  currentKeywordCount === 3
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {currentKeywordCount === 3 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>
                  Từ khóa trọng tâm &ldquo;{focusKeyword}&rdquo;: {currentKeywordCount}/3 lần {currentKeywordCount === 3 ? '(Chuẩn SEO)' : ''}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>3 Hashtag kết thúc chuẩn quy định</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCopy(descriptionData.description)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy toàn bộ mô tả</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={14}
              value={descriptionData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-2xl p-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition font-sans leading-relaxed"
              placeholder="Nội dung mô tả YouTube..."
            />
          </div>

          <p className="text-[11px] text-slate-400">
            ℹ️ Bạn có thể chỉnh sửa trực tiếp đoạn mô tả ở trên. Cuối mô tả đã được cố định đúng 3 hashtag theo chuẩn thuật toán.
          </p>
        </div>
      )}
    </section>
  );
};
