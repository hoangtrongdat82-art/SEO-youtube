import React, { useState } from 'react';
import { Eye, Smartphone, Monitor, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';

interface YouTubePreviewProps {
  title: string;
  channelName: string;
  description: string;
  focusKeyword: string;
  threeHashtags: string[];
}

export const YouTubePreview: React.FC<YouTubePreviewProps> = ({
  title,
  channelName,
  description,
  focusKeyword,
  threeHashtags,
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!title && !description) return null;

  const displayTitle = title || 'Tiêu đề video YouTube của bạn sẽ hiển thị ở đây...';
  const displayChannel = channelName || 'Tên Kênh Của Bạn';

  // Lấy 2 dòng đầu tiên của mô tả (phần hiển thị trước khi bấm Xem thêm)
  const descriptionLines = description.split('\n').filter((l) => l.trim().length > 0);
  const snippet = descriptionLines.slice(0, 2).join(' ') || 'Đoạn mô tả ngắn gọn thu hút người xem sẽ xuất hiện ở đây...';

  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Xem trước hiển thị YouTube thực tế
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live Preview
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Kiểm tra trực quan tiêu đề và 2 dòng mở đầu mô tả trên kết quả tìm kiếm YouTube
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              device === 'desktop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Máy tính</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              device === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Điện thoại</span>
          </button>
        </div>
      </div>

      {/* Preview Container simulating YouTube Dark Mode UI */}
      <div className="bg-[#0f0f0f] border border-slate-800 rounded-2xl p-4 sm:p-5 text-left font-sans">
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Giao diện mô phỏng YouTube ({device === 'desktop' ? 'Desktop Search' : 'Mobile Feed'}):</span>
          <span className="text-cyan-400 font-mono text-[11px] font-semibold">{displayTitle.length} ký tự</span>
        </div>

        {device === 'desktop' ? (
          /* Desktop Search Result Card */
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Thumbnail Mockup */}
            <div className="relative w-full sm:w-64 aspect-video rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950/80 border border-blue-900/40 flex flex-col items-center justify-center p-3 text-center shrink-0 overflow-hidden shadow-inner">
              <div className="w-9 h-9 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg mb-2">
                <span className="w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-white ml-0.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-200 line-clamp-2 px-2">
                {focusKeyword || 'YouTube Video'}
              </span>
              <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">
                12:45
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h3 className="text-base font-medium text-slate-100 hover:text-white line-clamp-2 leading-snug cursor-pointer">
                {displayTitle}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  {displayChannel}
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-900/60 inline" />
                </span>
                <span>•</span>
                <span>124K lượt xem</span>
                <span>•</span>
                <span>3 ngày trước</span>
              </div>

              {/* Snippet (2 lines) */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                {snippet}
              </p>

              {/* 3 Hashtags badge */}
              {threeHashtags && threeHashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-blue-400 font-medium">
                  {threeHashtags.map((ht, idx) => (
                    <span key={idx} className="hover:underline cursor-pointer">
                      {ht}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mobile Feed Card */
          <div className="max-w-sm mx-auto space-y-3">
            {/* Mobile Thumbnail */}
            <div className="relative aspect-video rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950/80 border border-blue-900/40 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg mb-2">
                <span className="w-0 h-0 border-y-4 border-y-transparent border-l-8 border-l-white ml-0.5" />
              </div>
              <span className="text-xs font-bold text-slate-200 line-clamp-2 px-2">
                {focusKeyword || 'YouTube Video'}
              </span>
              <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold">
                12:45
              </div>
            </div>

            {/* Mobile Info */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase">
                {displayChannel.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug">
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <span>{displayChannel}</span>
                  <span>•</span>
                  <span>124K lượt xem</span>
                  <span>•</span>
                  <span>3 ngày trước</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Full Description Viewer */}
        {description && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-xs font-semibold text-slate-400 hover:text-white transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showFullDesc ? 'Thu gọn phần xem toàn bộ mô tả' : 'Xem toàn bộ định dạng mô tả mở rộng'}</span>
            </button>

            {showFullDesc && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
