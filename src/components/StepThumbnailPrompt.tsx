import React from 'react';
import {
  Image,
  Copy,
  Sparkles,
  Loader2,
  RotateCcw,
  Palette,
  Type,
  Lightbulb,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { ThumbnailPromptData } from '../types/seo';

interface StepThumbnailPromptProps {
  thumbnailData: ThumbnailPromptData | null;
  selectedTitle: string;
  focusKeyword: string;
  loading: boolean;
  canGenerate: boolean;
  onGeneratePrompt: () => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  hasActivePlan?: boolean;
  onRequirePlan?: () => void;
}

export const StepThumbnailPrompt: React.FC<StepThumbnailPromptProps> = ({
  thumbnailData,
  selectedTitle,
  focusKeyword,
  loading,
  canGenerate,
  onGeneratePrompt,
  onCopy,
  onRegenerate,
  hasActivePlan = true,
  onRequirePlan,
}) => {
  const handleGenerate = () => {
    if (!hasActivePlan) {
      onRequirePlan?.();
      return;
    }
    onGeneratePrompt();
  };
  const fullPromptCopy = thumbnailData
    ? `[YOUTUBE THUMBNAIL PROMPT - HOÀNG VĂN ĐẠT OFFICIAL]
Chủ đề: ${selectedTitle || focusKeyword}
Ý tưởng chính: ${thumbnailData.visualConcept}
Chữ giật tít đề xuất trên ảnh: ${thumbnailData.recommendedText}
Bảng màu gợi ý: ${thumbnailData.colorPalette}

Prompt tiếng Anh (Midjourney / DALL-E 3 / Leonardo AI):
${thumbnailData.promptEnglish}

Mô tả chi tiết bằng tiếng Việt:
${thumbnailData.promptVietnamese}`
    : '';

  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
            6
          </span>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Bước 6: Xuất Prompt Tạo Ảnh Đại Diện YouTube
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                High CTR
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              AI tự động phân tích chủ đề video để tạo Prompt ảnh đại diện (Thumbnail 16:9) hút mắt và giữ chân người xem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {thumbnailData && (
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
            disabled={loading || !canGenerate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98] transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang xử lý dữ liệu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{thumbnailData ? 'Tạo lại Prompt Ảnh' : 'Xuất Prompt Tạo Ảnh Đại Diện'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!canGenerate && !thumbnailData && (
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-blue-900/30 text-xs text-slate-400">
          ⚠️ Bạn cần hoàn thành phân tích từ khóa và chọn tiêu đề ở các bước trên trước khi xuất Prompt ảnh đại diện.
        </div>
      )}

      {thumbnailData && (
        <div className="space-y-4">
          {/* Concept Banner & Top Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">
                  Ý tưởng thị giác cốt lõi:
                </span>
                <p className="text-xs text-slate-200 leading-snug">{thumbnailData.visualConcept}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Type className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  Chữ giật tít chèn trên Thumbnail:
                </span>
                <p className="text-xs font-black tracking-wide text-white bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block">
                  {thumbnailData.recommendedText}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Palette className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-0.5">
                  Tông màu chủ đạo tương phản:
                </span>
                <p className="text-xs text-slate-200">{thumbnailData.colorPalette}</p>
              </div>
            </div>
          </div>

          {/* Prompt Tiếng Anh chuẩn AI Generators */}
          <div className="bg-slate-950/90 border border-blue-900/40 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Prompt tiếng Anh chuẩn cho AI (Midjourney, DALL-E 3, Leonardo AI, Bing Creator):
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onCopy(thumbnailData.promptEnglish)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition cursor-pointer self-start sm:self-center"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Prompt tiếng Anh</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={thumbnailData.promptEnglish}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-cyan-100 font-mono focus:outline-none resize-none cursor-pointer leading-relaxed"
              title="Bấm để chọn toàn bộ prompt"
            />
          </div>

          {/* Prompt Tiếng Việt chi tiết */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Bản mô tả chi tiết bằng tiếng Việt (Hướng dẫn bố cục & ánh sáng):
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onCopy(thumbnailData.promptVietnamese)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer self-start sm:self-center"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy bản tiếng Việt</span>
              </button>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {thumbnailData.promptVietnamese}
            </div>
          </div>

          {/* Nút Copy toàn bộ */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => onCopy(fullPromptCopy)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy toàn bộ Prompt & Hướng dẫn</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
