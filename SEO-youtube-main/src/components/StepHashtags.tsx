import React from 'react';
import {
  Hash,
  Copy,
  RotateCcw,
  Sparkles,
  Loader2,
  Info,
} from 'lucide-react';

interface StepHashtagsProps {
  hashtags: string[];
  focusKeyword: string;
  loading: boolean;
  canGenerate: boolean;
  onGenerateHashtags: () => void;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  hasActivePlan?: boolean;
  onRequirePlan?: () => void;
}

export const StepHashtags: React.FC<StepHashtagsProps> = ({
  hashtags,
  focusKeyword,
  loading,
  canGenerate,
  onGenerateHashtags,
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
    onGenerateHashtags();
  };
  const spaceSeparatedHashtags = hashtags.join(' ');

  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
            5
          </span>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Gợi ý 25 Hashtag YouTube chuẩn SEO
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Viral & Shorts
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Hashtag viết liền không dấu, có dấu #, phục vụ tối ưu hóa tìm kiếm, Shorts và bài viết cộng đồng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hashtags.length > 0 && (
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
                <span>{hashtags.length > 0 ? 'Tạo lại 25 Hashtag' : 'Tạo 25 Hashtag YouTube'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cảnh báo quan trọng theo quy chuẩn YouTube SEO */}
      <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-cyan-300 font-semibold">Lưu ý quan trọng:</strong> Phần mô tả video ở Bước 4 đã được tối ưu sẵn{' '}
          <strong className="text-white">đúng 3 hashtag quan trọng nhất</strong> theo thuật toán đề xuất của YouTube.
          Bộ 25 hashtag dưới đây được tạo thêm nhằm mục đích <strong className="text-cyan-200">tham khảo mở rộng</strong> hoặc sử dụng khi đăng{' '}
          <strong className="text-white">YouTube Shorts</strong> và các bài viết trên tab <strong className="text-white">Cộng đồng (Community)</strong>.
        </div>
      </div>

      {!canGenerate && hashtags.length === 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
          ⚠️ Bạn cần hoàn thành bước viết mô tả video ở Bước 4 trước khi tạo 25 Hashtag.
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="space-y-5">
          {/* Box 1 dòng các hashtag cách nhau bởi khoảng trắng */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Toàn bộ 25 Hashtag cách nhau bằng dấu cách (Copy 1-click):
              </span>
              <button
                type="button"
                onClick={() => onCopy(spaceSeparatedHashtags)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition cursor-pointer self-start sm:self-center"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy tất cả hashtag</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={3}
              value={spaceSeparatedHashtags}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-cyan-100 font-mono focus:outline-none resize-none cursor-pointer leading-relaxed"
              title="Bấm để chọn toàn bộ"
            />
          </div>

          {/* Danh sách badge từng hashtag */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Danh sách chi tiết 25 Hashtag ({hashtags.length}/25)
              </h3>
              <span className="text-[11px] text-slate-500">
                Bấm nút copy ở từng hashtag để dùng riêng
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {hashtags.map((ht, index) => {
                const isFocus = index === 0;
                return (
                  <div
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                      isFocus
                        ? 'bg-blue-950/50 border-blue-500/60 text-white ring-1 ring-blue-500/40'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-blue-500/40 hover:text-white'
                    }`}
                  >
                    <span className="text-blue-400 font-mono text-[10px]">#{index + 1}</span>
                    <span className="font-mono text-cyan-200">{ht}</span>
                    {isFocus && (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onCopy(ht)}
                      className="text-slate-500 hover:text-cyan-300 transition cursor-pointer p-0.5 ml-0.5"
                      title={`Copy hashtag: ${ht}`}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
