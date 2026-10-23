import React, { useState, useRef } from 'react';
import {
  Youtube,
  Sparkles,
  RotateCcw,
  Image,
  Check,
  CheckCircle2,
  Upload,
  KeyRound,
  Crown,
  Shield,
  CreditCard,
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasData: boolean;
  avatarUrl: string;
  onUpdateAvatarUrl: (url: string) => void;
  hasCustomApiKey: boolean;
  onOpenApiModal: () => void;
  hasActivePlan: boolean;
  planName?: string;
  daysLeft?: number;
  onOpenPaymentModal: () => void;
  onOpenAdminModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  hasData,
  avatarUrl,
  onUpdateAvatarUrl,
  hasCustomApiKey,
  onOpenApiModal,
  hasActivePlan,
  planName,
  daysLeft,
  onOpenPaymentModal,
  onOpenAdminModal,
}) => {
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [tempUrl, setTempUrl] = useState(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAvatarUrl(tempUrl.trim());
    setShowAvatarInput(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateAvatarUrl(reader.result);
          setTempUrl(reader.result);
          setShowAvatarInput(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="border-b border-blue-900/40 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 shadow-xl shadow-blue-950/20">
      <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 xl:px-12 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Avatar */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Avatar Thương Hiệu Cá Nhân Hoàng Văn Đạt */}
          <div className="relative group shrink-0">
            <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/60 transition duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
                {avatarUrl && !avatarUrl.includes('drive.google.com') ? (
                  <img
                    src={avatarUrl}
                    alt="Hoàng Văn Đạt"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-700 flex flex-col items-center justify-center text-white font-black text-sm select-none">
                    <span className="tracking-tighter font-extrabold text-base">HVD</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verified Pro Badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-slate-950 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white" />
            </div>

            {/* Nút thay đổi ảnh nhanh */}
            <button
              onClick={() => setShowAvatarInput(!showAvatarInput)}
              title="Đổi ảnh đại diện thương hiệu"
              className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 bg-slate-900/90 text-cyan-400 p-1.5 rounded-full border border-blue-500/50 transition cursor-pointer shadow-lg hover:scale-110"
            >
              <Image className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  Hoàng Văn Đạt
                </span>
                <span className="text-blue-500 font-extrabold">SEO Youtube Pro</span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/30 shadow-sm shadow-blue-500/10">
                <Sparkles className="w-3 h-3 text-cyan-400" /> PRO VIP
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-cyan-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Tiện ích đưa video lên top 1 Youtube
            </p>
          </div>
        </div>

        {/* Action Controls in Top Right */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-center shrink-0 flex-wrap">
          {hasData && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition shadow-sm cursor-pointer"
              title="Làm mới để bắt đầu video khác"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Bắt đầu đề tài mới</span>
            </button>
          )}

          {/* 1. NÚT MUA GÓI / NÂNG CẤP (SEPAY AUTOMATION) Ở GÓC PHẢI PHÍA TRÊN */}
          {hasActivePlan ? (
            <button
              type="button"
              onClick={onOpenPaymentModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer border bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-emerald-500/10 group"
              title="Xem thông tin gói bản quyền hoặc gia hạn"
            >
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {planName || 'Gói Pro'} • Còn {daysLeft ?? 30} ngày
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded font-semibold group-hover:bg-emerald-500/30">
                Gia hạn
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPaymentModal}
              className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition shadow-lg shadow-blue-600/30 cursor-pointer border border-cyan-400/50 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 active:scale-95"
              title="Mua gói bản quyền để sử dụng toàn bộ công cụ"
            >
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
              </span>
              <CreditCard className="w-3.5 h-3.5 text-cyan-200" />
              <span>Mua Gói / Nâng Cấp</span>
            </button>
          )}

          {/* 2. Nút API ở góc phải phía trên */}
          <button
            type="button"
            onClick={onOpenApiModal}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer border ${
              hasCustomApiKey
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 shadow-emerald-500/10'
                : 'bg-blue-950/70 border-blue-500/40 text-cyan-300 hover:bg-blue-900/60 hover:text-white shadow-blue-500/10'
            }`}
            title="Quản lý Gemini API Key"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>{hasCustomApiKey ? 'Đã kết nối API riêng' : 'API'}</span>
            {hasCustomApiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="text-[10px] bg-blue-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                Key
              </span>
            )}
          </button>

          {/* 3. Nút Quản Trị Hệ Thống (Admin & Cấu hình SePay) */}
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition cursor-pointer"
            title="Quản trị Gói & Cấu hình SePay"
          >
            <Shield className="w-4 h-4 text-slate-300 hover:text-cyan-400" />
          </button>

          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-950/60 border border-blue-500/30 text-blue-300">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span className="font-bold text-white">Top 1 SEO</span>
          </div>
        </div>
      </div>

      {/* Popover cập nhật Avatar */}
      {showAvatarInput && (
        <div className="w-full max-w-[1850px] mx-auto px-4 sm:px-8 py-3 bg-blue-950/70 border-t border-blue-900/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-3xl">
            <form onSubmit={handleSaveAvatar} className="flex-1 flex items-center gap-2 w-full">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="Dán link ảnh đại diện (URL)..."
                className="flex-1 bg-slate-900 border border-blue-500/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" /> Lưu link
              </button>
            </form>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5" /> Tải ảnh từ máy tính
              </button>

              <button
                type="button"
                onClick={() => setShowAvatarInput(false)}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
