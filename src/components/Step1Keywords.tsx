import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Target,
  KeyRound,
  ListPlus,
  RotateCcw,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Gauge,
  HelpCircle,
  Lock,
  Crown,
} from 'lucide-react';
import { KeywordAnalysisData } from '../types/seo';

const LANGUAGES = [
  'Tiếng Việt',
  'English',
  'Tiếng Trung',
  'Tiếng Nhật',
  'Tiếng Hàn',
  'Tiếng Thái',
  'Tiếng Indonesia',
  'Tiếng Tây Ban Nha',
];

interface Step1Props {
  topic: string;
  language: string;
  keywords: KeywordAnalysisData | null;
  selectedFocusKeyword: string;
  loading: boolean;
  onTopicChange: (val: string) => void;
  onLanguageChange: (val: string) => void;
  onAnalyze: () => void;
  onSelectFocusKeyword: (kw: string) => void;
  onCopy: (text: string) => void;
  onReanalyze: () => void;
  hasActivePlan: boolean;
  onRequirePlan: () => void;
}

export const Step1Keywords: React.FC<Step1Props> = ({
  topic,
  language,
  keywords,
  selectedFocusKeyword,
  loading,
  onTopicChange,
  onLanguageChange,
  onAnalyze,
  onSelectFocusKeyword,
  onCopy,
  onReanalyze,
  hasActivePlan,
  onRequirePlan,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasActivePlan) {
      setErrorMsg('Bạn cần mua gói để sử dụng công cụ này.');
      onRequirePlan();
      return;
    }
    if (!topic || !topic.trim()) {
      setErrorMsg('Vui lòng nhập đề tài hoặc mô tả video.');
      return;
    }
    if (topic.trim().length < 5) {
      setErrorMsg('Nội dung quá ngắn, vui lòng nhập rõ hơn.');
      return;
    }
    setErrorMsg(null);
    onAnalyze();
  };

  const getCompetitionBadge = (level: string = 'Trung bình') => {
    if (level === 'Thấp') {
      return {
        text: 'Cạnh tranh: Thấp',
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        barColor: 'bg-emerald-500',
      };
    }
    if (level === 'Cao') {
      return {
        text: 'Cạnh tranh: Cao',
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        barColor: 'bg-rose-500',
      };
    }
    return {
      text: 'Cạnh tranh: Trung bình',
      bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      barColor: 'bg-amber-500',
    };
  };

  return (
    <section className="bg-slate-900/70 border border-blue-900/40 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
            1
          </span>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Bước 1: Nhập đề tài & Phân tích từ khóa SEO
            </h2>
            <p className="text-xs text-slate-400">
              AI tự động phân tích và trích xuất từ khóa trọng tâm, 10 từ khóa chính và 10 từ khóa phụ mở rộng
            </p>
          </div>
        </div>

        {keywords && (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={loading}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Phân tích lại</span>
          </button>
        )}
      </div>

      <form onSubmit={handleStartAnalysis} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nhập đề tài hoặc mô tả video <span className="text-blue-400">*</span>
          </label>
          <textarea
            rows={3}
            value={topic}
            onChange={(e) => {
              onTopicChange(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Ví dụ: Cách kiếm tiền với AI cho người mới bắt đầu"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ngôn ngữ đầu ra
            </label>
            <select
              value={language || 'Tiếng Việt'}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-2xl px-4 py-3 text-sm text-slate-100 outline-none transition cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-slate-100">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                !hasActivePlan
                  ? 'bg-gradient-to-r from-amber-600 via-blue-600 to-indigo-600 hover:from-amber-500 hover:to-blue-500 shadow-amber-600/20'
                  : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI đang xử lý dữ liệu...</span>
                </>
              ) : !hasActivePlan ? (
                <>
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Mở khóa & Phân tích từ khóa</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{keywords ? 'Phân tích lại từ khóa' : 'Phân tích từ khóa'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!hasActivePlan && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  Bạn cần mua gói để sử dụng công cụ này.
                </span>
                <span className="text-[11px] text-slate-400">
                  Kích hoạt tự động qua SePay trong 10 giây để mở khóa toàn bộ 7 bước SEO Pro.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRequirePlan}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-500 text-slate-950 font-black text-xs transition shadow-md hover:scale-105 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-slate-950" />
              <span>Mua gói ngay</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Hiển thị kết quả từ khóa */}
      {keywords && (
        <div className="mt-8 pt-7 border-t border-blue-900/30 space-y-6">
          {/* Card Phân Tích Dữ Liệu Từ Khóa Chuyên Sâu (Volume & Cạnh tranh) */}
          {keywords.metrics && (
            <div className="bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-blue-900/30 border border-blue-500/40 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-blue-900/50">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                    Dữ Liệu Phân Tích Từ Khóa Trọng Tâm
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Xu hướng: <strong className="text-emerald-400">{keywords.metrics.trendStatus}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* 1. Volume ước tính */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Lưu lượng tìm kiếm (Search Volume):
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {keywords.metrics.estimatedVolume}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 mt-1">Lượt tìm kiếm ước tính / tháng</span>
                </div>

                {/* 2. Mức độ cạnh tranh */}
                {(() => {
                  const comp = getCompetitionBadge(keywords.metrics.competitionLevel);
                  return (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Mức độ cạnh tranh dự kiến:
                      </span>
                      <div className="flex items-center gap-2 my-0.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${comp.bg}`}>
                          {comp.text}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {keywords.metrics.competitionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full ${comp.barColor} transition-all duration-500`}
                          style={{ width: `${keywords.metrics.competitionPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Điểm tiềm năng SEO */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Điểm cơ hội leo Top 1:
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                      {keywords.metrics.seoOpportunityScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 100 điểm</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 mt-1 font-medium">
                    {keywords.metrics.seoOpportunityScore >= 70 ? '★ Tiềm năng bứt phá Top 1 rất cao' : 'Khả quan, cần tối ưu tiêu đề chuẩn'}
                  </span>
                </div>
              </div>

              {/* Lời khuyên chiến lược */}
              <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300 font-semibold">Khuyến nghị chiến lược: </strong>
                  <span>{keywords.metrics.strategicAdvice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Nhóm 1: Từ khóa trọng tâm */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-900/40 border border-blue-500/30 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Từ khóa trọng tâm (Primary Keyword)
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Khối lượng tìm kiếm cao
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {keywords.focusKeyword}
                </span>
                {selectedFocusKeyword === keywords.focusKeyword && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Check className="w-3 h-3" /> Đang chọn
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onCopy(keywords.focusKeyword)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  title="Sao chép từ khóa trọng tâm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFocusKeyword(keywords.focusKeyword)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFocusKeyword === keywords.focusKeyword
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {selectedFocusKeyword === keywords.focusKeyword ? 'Đã chọn' : 'Chọn tiếp tục'}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              💡 Mẹo: Bạn có thể chọn từ khóa này hoặc bấm chọn bất kỳ từ khóa chính nào bên dưới làm từ khóa trọng tâm để tạo tiêu đề và viết mô tả.
            </p>
          </div>

          {/* Nhóm 2: 10 Từ khóa chính liên quan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  10 Từ khóa chính liên quan ({keywords.mainKeywords?.length || 0})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onCopy(keywords.mainKeywords.join(', '))}
                className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy tất cả</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {keywords.mainKeywords.map((kw, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition ${
                    selectedFocusKeyword === kw
                      ? 'bg-blue-950/40 border-blue-500/50 text-white'
                      : 'bg-slate-950/50 hover:bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-medium truncate flex-1">
                    <span className="text-blue-400 font-mono mr-1.5">{i + 1}.</span> {kw}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onCopy(kw)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Copy từ khóa"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectFocusKeyword(kw)}
                      className={`text-[11px] px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                        selectedFocusKeyword === kw
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {selectedFocusKeyword === kw ? 'Đang chọn' : 'Chọn làm chính'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nhóm 3: 10 Từ khóa phụ mở rộng */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  10 Từ khóa phụ mở rộng (Long-tail keywords)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onCopy(keywords.secondaryKeywords.join(', '))}
                className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1 transition cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy tất cả</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {keywords.secondaryKeywords.map((kw, i) => (
                <div
                  key={i}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 hover:text-white transition"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => onCopy(kw)}
                    className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
                    title="Copy từ khóa phụ"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
