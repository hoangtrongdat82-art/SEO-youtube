import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Settings,
  CreditCard,
  Package,
  Layers,
  History,
  Users,
  Check,
  AlertCircle,
  Edit2,
  Save,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  Search,
} from 'lucide-react';
import { PaymentPlan, BankConfig, Order, WebhookLog, UserSubscription } from '../types/payment';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

const POPULAR_BANKS = [
  { code: 'MBBank', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'Vietcombank', name: 'Vietcombank (VCB)' },
  { code: 'Techcombank', name: 'Techcombank (TCB)' },
  { code: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
  { code: 'VPBank', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'TPBank', name: 'TPBank (Tiên Phong)' },
  { code: 'BIDV', name: 'BIDV (Đầu tư và Phát triển VN)' },
  { code: 'Agribank', name: 'Agribank (Nông nghiệp & PTNT)' },
  { code: 'Sacombank', name: 'Sacombank' },
  { code: 'HDBank', name: 'HDBank' },
  { code: 'MSB', name: 'MSB (Hàng Hải)' },
  { code: 'VIB', name: 'VIB (Quốc Tế)' },
];

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'plans' | 'orders' | 'webhooks' | 'subs'>('settings');

  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPlans, setSavingPlans] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dữ liệu tải từ server
  const [bankConfig, setBankConfig] = useState<BankConfig>({
    bankCode: 'MBBank',
    bankName: 'MB Bank',
    accountNumber: '',
    accountName: '',
    sepayApiKey: '',
    webhookToken: '',
  });

  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);

  // Search filter
  const [searchOrder, setSearchOrder] = useState('');

  // Sửa gói
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setBankConfig(data.bankConfig || {});
        setPlans(data.plans || []);
        setOrders(data.orders || []);
        setWebhookLogs(data.webhookLogs || []);
        setSubscriptions(data.subscriptions || []);
      }
    } catch (e) {
      console.error('Lỗi tải dữ liệu quản trị:', e);
      setStatusMsg({ type: 'error', text: 'Không thể kết nối máy chủ quản trị.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankConfig),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Đã lưu cấu hình tài khoản ngân hàng & SePay thành công!' });
        onRefreshData?.();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Lỗi khi lưu cấu hình.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Lỗi kết nối.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePlans = async () => {
    setSavingPlans(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: 'Đã cập nhật danh sách gói dịch vụ thành công!' });
        setEditingPlanId(null);
        onRefreshData?.();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Lỗi khi cập nhật gói.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Lỗi kết nối.' });
    } finally {
      setSavingPlans(false);
    }
  };

  const handleManualActivateOrder = async (orderCode: string) => {
    if (!confirm(`Bạn có chắc muốn kích hoạt thủ công cho đơn hàng ${orderCode}?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderCode}/activate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Đã kích hoạt thành công đơn hàng ${orderCode}!` });
        loadAdminData();
        onRefreshData?.();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Lỗi kích hoạt đơn hàng.' });
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Lỗi mạng.' });
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/sepay/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  if (!isOpen) return null;

  const webhookEndpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/sepay/webhook` : '/api/sepay/webhook';

  const filteredOrders = orders.filter((o) => {
    if (!searchOrder.trim()) return true;
    const q = searchOrder.toLowerCase();
    return (
      o.order_code.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-blue-900/40 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Quản Trị Hệ Thống Gói & SePay</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30 uppercase">
                  Admin Pro
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cấu hình ngân hàng, quản lý 3 gói sử dụng, kiểm tra đơn hàng và lịch sử Webhook
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Alert Notification */}
        {statusMsg && (
          <div
            className={`px-6 py-3 border-b flex items-center justify-between gap-3 text-xs font-semibold ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-blue-900/40 bg-slate-950/40 px-6 gap-2 sm:gap-4 overflow-x-auto">
          {[
            { id: 'settings', label: 'Cấu hình SePay & Ngân hàng', icon: CreditCard },
            { id: 'plans', label: 'Quản lý Gói dịch vụ', icon: Package, count: plans.length },
            { id: 'orders', label: 'Đơn hàng', icon: Layers, count: orders.length },
            { id: 'webhooks', label: 'Webhook Logs', icon: History, count: webhookLogs.length },
            { id: 'subs', label: 'Gói đang kích hoạt', icon: Users, count: subscriptions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: CẤU HÌNH SEPAY & NGÂN HÀNG */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveBankConfig} className="max-w-3xl space-y-5">
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30">
                <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Thông tin Tài khoản nhận tiền (Tạo mã VietQR tự động)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Khách hàng quét mã QR sẽ tự động chuyển tiền vào tài khoản này với nội dung chính là Mã đơn hàng.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Ngân hàng thụ hưởng
                  </label>
                  <select
                    value={bankConfig.bankCode}
                    onChange={(e) => {
                      const selected = POPULAR_BANKS.find((b) => b.code === e.target.value);
                      setBankConfig({
                        ...bankConfig,
                        bankCode: e.target.value,
                        bankName: selected ? selected.name : e.target.value,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.code} value={b.code} className="bg-slate-900 text-white">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Số tài khoản ngân hàng (STK)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.accountNumber}
                    onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                    placeholder="Ví dụ: 0987654321"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Tên chủ tài khoản (Viết hoa không dấu)
                  </label>
                  <input
                    type="text"
                    value={bankConfig.accountName}
                    onChange={(e) => setBankConfig({ ...bankConfig, accountName: e.target.value.toUpperCase() })}
                    placeholder="HOANG VAN DAT"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none uppercase font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    SePay Webhook Token / API Secret (Tùy chọn)
                  </label>
                  <input
                    type="password"
                    value={bankConfig.webhookToken || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, webhookToken: e.target.value })}
                    placeholder="Nhập secret token nếu bạn cấu hình trong SePay"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Hướng dẫn Webhook SePay */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">
                    Địa chỉ Webhook SePay của bạn:
                  </span>
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="text-xs font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhookUrl ? 'Đã sao chép link' : 'Sao chép Webhook URL'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                  {webhookEndpoint}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  📌 <strong className="text-slate-300">Cách kết nối:</strong> Đăng nhập dashboard SePay.vn &rarr; Tạo Webhook &rarr; Dán địa chỉ URL trên &rarr; Chọn kiểu xác thực (hoặc để trống) &rarr; Lưu lại. Khi khách hàng chuyển khoản khớp nội dung mã đơn (AFFxxxxxx), SePay sẽ gửi webhook đến link này và app tự động kích hoạt gói ngay lập tức!
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Lưu Cấu Hình Ngân Hàng</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: QUẢN LÝ GÓI DỊCH VỤ */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Danh sách 3 Gói Dịch Vụ Mẫu</h3>
                  <p className="text-xs text-slate-400">
                    Cho phép chỉnh sửa tên gói, số ngày, giá tiền, mô tả, bật/tắt hiển thị và gói nổi bật
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSavePlans}
                  disabled={savingPlans}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingPlans ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Lưu thay đổi tất cả gói</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                          {p.id}
                        </span>
                        <div className="flex items-center gap-1">
                          <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p.isActive}
                              onChange={(e) => {
                                const newPlans = [...plans];
                                newPlans[idx].isActive = e.target.checked;
                                setPlans(newPlans);
                              }}
                              className="rounded text-blue-500 cursor-pointer"
                            />
                            <span>Bật</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          Tên gói
                        </label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const newPlans = [...plans];
                            newPlans[idx].name = e.target.value;
                            setPlans(newPlans);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Số ngày
                          </label>
                          <input
                            type="number"
                            value={p.days}
                            onChange={(e) => {
                              const newPlans = [...plans];
                              newPlans[idx].days = Number(e.target.value);
                              setPlans(newPlans);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">
                            Giá tiền (VNĐ)
                          </label>
                          <input
                            type="number"
                            step="1000"
                            value={p.price}
                            onChange={(e) => {
                              const newPlans = [...plans];
                              const val = Number(e.target.value);
                              newPlans[idx].price = val;
                              newPlans[idx].formattedPrice = `${val.toLocaleString('vi-VN')}đ`;
                              setPlans(newPlans);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">
                          Mô tả ngắn
                        </label>
                        <textarea
                          rows={2}
                          value={p.description}
                          onChange={(e) => {
                            const newPlans = [...plans];
                            newPlans[idx].description = e.target.value;
                            setPlans(newPlans);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.isFeatured}
                            onChange={(e) => {
                              const newPlans = plans.map((item, i) => ({
                                ...item,
                                isFeatured: i === idx ? e.target.checked : false,
                              }));
                              setPlans(newPlans);
                            }}
                            className="rounded text-cyan-400 cursor-pointer"
                          />
                          <span>Gói nổi bật (Hot)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DANH SÁCH ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    placeholder="Tìm theo mã AFF, tên, email, sđt..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-xs text-slate-400 self-center">
                  Tổng cộng: <strong className="text-white">{orders.length}</strong> đơn hàng
                </span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                  Không tìm thấy đơn hàng nào.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Mã Đơn</th>
                          <th className="py-3 px-4">Khách Hàng</th>
                          <th className="py-3 px-4">Gói & Số Tiền</th>
                          <th className="py-3 px-4">Trạng Thái</th>
                          <th className="py-3 px-4">Thời Gian</th>
                          <th className="py-3 px-4 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.order_id} className="hover:bg-slate-900/40">
                            <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                              {ord.order_code}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{ord.customer_name}</div>
                              <div className="text-[11px] text-slate-400">
                                {ord.customer_email} • {ord.customer_phone}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-200">{ord.plan_name}</div>
                              <div className="font-mono text-emerald-400 font-bold">
                                {ord.amount.toLocaleString('vi-VN')}đ
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {ord.status === 'paid' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                  <Check className="w-3 h-3" /> Đã thanh toán
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                                  Chờ thanh toán
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              <div>Tạo: {new Date(ord.created_at).toLocaleString('vi-VN')}</div>
                              {ord.paid_at && (
                                <div className="text-emerald-400">
                                  Trả: {new Date(ord.paid_at).toLocaleString('vi-VN')}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {ord.status !== 'paid' ? (
                                <button
                                  type="button"
                                  onClick={() => handleManualActivateOrder(ord.order_code)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
                                >
                                  Kích hoạt tay
                                </button>
                              ) : (
                                <span className="text-emerald-400 text-[11px]">Đã duyệt</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LỊCH SỬ WEBHOOK SEPAY */}
          {activeTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Lịch Sử Webhook Nhận Từ SePay</h3>
                  <p className="text-xs text-slate-400">
                    Ghi lại từng request SePay gửi đến để kiểm tra đối soát và phát hiện lỗi
                  </p>
                </div>
              </div>

              {webhookLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                  Chưa có webhook nào được gửi tới. Khi có giao dịch SePay chuyển khoản, log sẽ hiển thị tại đây.
                </div>
              ) : (
                <div className="space-y-3">
                  {webhookLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'success'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : log.status === 'failed'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="font-mono text-slate-400">
                            {new Date(log.received_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {log.order_code && (
                          <span className="font-mono font-bold text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                            {log.order_code}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-300 font-medium">{log.message}</p>

                      {log.content && (
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                          Nội dung: {log.content} {log.amount ? `| Số tiền: ${log.amount.toLocaleString('vi-VN')}đ` : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DANH SÁCH GÓI ĐANG KÍCH HOẠT */}
          {activeTab === 'subs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white">Khách Hàng Đang Có Gói Bản Quyền</h3>
              {subscriptions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800">
                  Chưa có khách hàng nào được kích hoạt.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Khách Hàng</th>
                          <th className="py-3 px-4">Gói Bản Quyền</th>
                          <th className="py-3 px-4">Ngày Hết Hạn</th>
                          <th className="py-3 px-4">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {subscriptions.map((sub, i) => {
                          const isAlive = new Date(sub.expiredAt).getTime() > Date.now();
                          return (
                            <tr key={i} className="hover:bg-slate-900/40">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white">{sub.customerName}</div>
                                <div className="text-[11px] text-slate-400">
                                  {sub.customerEmail} • {sub.customerPhone}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-cyan-300">{sub.planName}</span>
                                <div className="text-[10px] text-slate-400 font-mono">Đơn: {sub.orderCode}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-mono text-slate-200">
                                  {new Date(sub.expiredAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {isAlive ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                    Đang hoạt động
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                    Hết hạn
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
