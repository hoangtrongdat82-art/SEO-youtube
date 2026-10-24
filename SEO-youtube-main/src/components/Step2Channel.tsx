import React from 'react';
import { Tv, Target, AlertCircle } from 'lucide-react';

interface Step2Props {
  channelName: string;
  selectedFocusKeyword: string;
  onChannelNameChange: (val: string) => void;
  error?: string | null;
}

export const Step2Channel: React.FC<Step2Props> = ({
  channelName,
  selectedFocusKeyword,
  onChannelNameChange,
  error,
}) => {
  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
          2
        </span>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Bước 2: Nhập tên kênh YouTube
          </h2>
          <p className="text-xs text-slate-400">
            Dùng để lồng ghép tên kênh tự nhiên vào tiêu đề, mô tả và hashtag #tenkenh chuẩn nhận diện thương hiệu
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {selectedFocusKeyword && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-blue-900/40 text-xs text-slate-300">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Từ khóa trọng tâm đã chọn:</span>
            <span className="font-bold text-white text-cyan-200">{selectedFocusKeyword}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Tên kênh YouTube của bạn <span className="text-blue-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Tv className="w-4 h-4 text-blue-400" />
            </div>
            <input
              type="text"
              value={channelName}
              onChange={(e) => onChannelNameChange(e.target.value)}
              placeholder="Ví dụ: Hoàng Văn Đạt Official hoặc Kênh Của Bạn"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
};
