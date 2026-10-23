import React from 'react';
import { Download, FileText, CheckCircle2, Copy } from 'lucide-react';
import { AppState } from '../types/seo';
import { exportToTxtFile, getFormattedExportText } from '../utils/textExport';

interface Step7Props {
  state: AppState;
  onShowToast: (msg: string) => void;
  onCopy: (text: string) => void;
}

export const Step7Export: React.FC<Step7Props> = ({ state, onShowToast, onCopy }) => {
  const hasTopic = Boolean(state.topic && state.topic.trim().length >= 5);
  const hasKeywords = Boolean(state.keywords && (state.selectedFocusKeyword || state.keywords.focusKeyword));
  const hasChannel = Boolean(state.channelName && state.channelName.trim());
  const hasTitle = Boolean(state.selectedTitle);
  const hasDescription = Boolean(state.descriptionData?.description);
  const hasHashtags = Boolean(state.hashtagsData && state.hashtagsData.length > 0);
  const hasThumbnailPrompt = Boolean(state.thumbnailPromptData);

  const isReady =
    hasTopic &&
    hasKeywords &&
    hasChannel &&
    hasTitle &&
    hasDescription;

  const handleExport = () => {
    if (!isReady) {
      onShowToast('Chưa đủ dữ liệu để xuất file TXT. Vui lòng hoàn thành các bước trên.');
      return;
    }
    exportToTxtFile(state);
    onShowToast('Đã tải xuống file TXT thành công!');
  };

  const handleCopyAll = () => {
    if (!isReady) {
      onShowToast('Chưa đủ dữ liệu để sao chép. Vui lòng hoàn thành các bước trên.');
      return;
    }
    const text = getFormattedExportText(state);
    onCopy(text);
  };

  const checklistItems = [
    { label: 'Đề tài video & phân tích từ khóa (Volume & Cạnh tranh)', done: hasKeywords },
    { label: 'Tên kênh YouTube', done: hasChannel },
    { label: 'Tiêu đề video YouTube đã chọn', done: hasTitle },
    { label: 'Mô tả video chuẩn SEO (3 hashtag cuối)', done: hasDescription },
    { label: 'Bộ 25 Hashtag YouTube gợi ý', done: hasHashtags },
    { label: 'Prompt tạo ảnh đại diện YouTube (Thumbnail)', done: hasThumbnailPrompt },
  ];

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return (
    <section className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
          7
        </span>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Bước 7: Xuất toàn bộ nội dung ra file TXT
          </h2>
          <p className="text-xs text-slate-400">
            Tải về trọn bộ metadata video đầy đủ để lưu trữ hoặc giao cho editor / YouTube manager
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Tiến độ hoàn thiện nội dung SEO:
          </span>
          {checklistItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className={item.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
              <FileText className="w-4 h-4" />
              <span>Định dạng file xuất chuẩn</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tên file: <strong className="text-white font-mono text-cyan-200">Hoang-Van-Dat-Official-SEO-Youtube-Pro-{day}-{month}-{year}.txt</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Bao gồm thông tin kênh, đề tài, từ khóa trọng tâm, 10 từ khóa chính, 10 từ khóa phụ, 10 tiêu đề, tiêu đề chọn, mô tả chuẩn 3 hashtag, 25 hashtag và Prompt tạo ảnh đại diện YouTube (Thumbnail 16:9).
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={!isReady}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] transition shadow-xl shadow-blue-600/30 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Download className="w-4 h-4" />
              <span>Xuất toàn bộ nội dung TXT</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              disabled={!isReady}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy toàn bộ nội dung vào bộ nhớ tạm</span>
            </button>

            {!isReady && (
              <p className="text-[11px] text-amber-400/90 text-center mt-1">
                * Vui lòng hoàn thành các bước từ 1 đến 4 để mở khóa nút xuất file.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
