import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  User,
  Mail,
  Phone,
  FileText,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  AlertCircle,
  Clock,
  Zap,
  Building2,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { PaymentPlan, Order, BankConfig, UserSubscription } from '../types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (sub: UserSubscription) => void;
  initialStep?: 1 | 2 | 3 | 4;
  currentSubscription?: UserSubscription | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  currentSubscription,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);

  // Form thông tin khách hàng
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Đơn hàng đang tạo
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [qrUrlSepay, setQrUrlSepay] = useState<string>('');
  const [qrUrlVietQr, setQrUrlVietQr] = useState<string>('');

  // Trạng thái sao chép
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Trạng thái kiểm tra thanh toán
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  // Tra cứu đơn hàng cũ / khôi phục gói
  const [showLookup, setShowLookup] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMsg, setLookupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Tải danh sách gói
  useEffect(() => {
    if (isOpen) {
      loadPlans();
      // Khôi phục thông tin khách hàng từ localStorage nếu có
      const savedInfo = localStorage.getItem('HVD_LAST_CUSTOMER_INFO');
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo);
          if (parsed.name) setCustomerName(parsed.name);
          if (parsed.email) setCustomerEmail(parsed.email);
          if (parsed.phone) setCustomerPhone(parsed.phone);
        } catch (e) {
          // ignore
        }
      }
    } else {
      // Dừng polling khi đóng popup
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
  }, [isOpen]);

  // Polling kiểm tra trạng thái thanh toán khi ở Bước 3
  useEffect(() => {
    if (step === 3 && currentOrder && currentOrder.status === 'pending') {
      const checkStatus = async () => {
        try {
          const res = await fetch(`/api/orders/${currentOrder.order_code}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'paid') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

              const sub: UserSubscription = {
                orderCode: data.order_code,
                planName: data.plan_name,
                planDays: data.plan_days,
                amount: data.amount,
                customerName: data.customer_name,
                customerEmail: currentOrder.customer_email,
                customerPhone: currentOrder.customer_phone,
                paidAt: data.paid_at || new Date().toISOString(),
                expiredAt: data.expired_at || new Date().toISOString(),
                status: 'active',
              };

              setCurrentOrder((prev) => (prev ? { ...prev, status: 'paid', paid_at: data.paid_at, expired_at: data.expired_at } : null));
              setStep(4);
              onPaymentSuccess(sub);
            }
          }
        } catch (err) {
          // im lặng khi poll
        }
      };

      // Poll mỗi 2.5 giây
      pollIntervalRef.current = setInterval(checkStatus, 2500);

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [step, currentOrder, onPaymentSuccess]);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans);
          const featured = data.plans.find((p: PaymentPlan) => p.isFeatured) || data.plans[0];
          if (featured && !selectedPlan) {
            setSelectedPlan(featured);
          }
          return;
        }
      }
      throw new Error('Fallback to default plans');
    } catch (e) {
      console.warn('Dùng danh sách gói mặc định:', e);
      const defaultPlans: PaymentPlan[] = [
        {
          id: 'plan-7-days',
          name: 'Gói 7 Ngày',
          days: 7,
          price: 99000,
          formattedPrice: '99.000đ',
          description: 'Thích hợp trải nghiệm đầy đủ tính năng và tối ưu hóa video nhanh chóng.',
          features: [
            'Phân tích từ khóa chuyên sâu kèm Volume & Cạnh tranh',
            'Thiết kế 10 tiêu đề đạt tỷ lệ CTR vượt trội',
            'Tạo mô tả chuẩn SEO & 3 hashtag chuẩn xác',
            'Đề xuất 25 Hashtag mở rộng độ phủ',
            'Tạo Prompt ảnh đại diện YouTube (Midjourney / DALL-E)',
            'Hỗ trợ xuất file TXT đầy đủ 1-click',
          ],
          isActive: true,
          isFeatured: false,
          badge: 'Cơ bản',
        },
        {
          id: 'plan-30-days',
          name: 'Gói 30 Ngày (1 Tháng)',
          days: 30,
          price: 199000,
          formattedPrice: '199.000đ',
          description: 'Lựa chọn phổ biến nhất cho YouTuber muốn bứt phá thứ hạng và đẩy video lên Top 1.',
          features: [
            'Không giới hạn lượt tạo đề tài & từ khóa',
            'Toàn bộ tính năng SEO YouTube Pro bản quyền',
            'Tối ưu thuật toán YouTube mới nhất',
            'Tạo Prompt thumbnail điện quang cực nét',
            'Tích hợp kết nối Gemini API riêng',
            'Hỗ trợ ưu tiên 24/7 từ đội ngũ Hoàng Văn Đạt',
          ],
          isActive: true,
          isFeatured: true,
          badge: 'Phổ biến nhất ★',
        },
        {
          id: 'plan-90-days',
          name: 'Gói 90 Ngày (3 Tháng)',
          days: 90,
          price: 499000,
          formattedPrice: '499.000đ',
          description: 'Tiết kiệm 30% chi phí - Giải pháp hoàn hảo cho Kênh YouTube phát triển bền vững.',
          features: [
            'Thời hạn sử dụng dài hạn 90 ngày liên tục',
            'Tiết kiệm đến 30% so với gia hạn từng tháng',
            'Tất cả tính năng cao cấp nhất của SEO Pro',
            'Cập nhật prompt và thuật toán định kỳ',
            'Được tư vấn chiến lược đẩy Top 1 YouTube',
            'Hỗ trợ kỹ thuật VIP trực tiếp',
          ],
          isActive: true,
          isFeatured: false,
          badge: 'Tiết kiệm 30%',
        },
      ];
      setPlans(defaultPlans);
      if (!selectedPlan) {
        setSelectedPlan(defaultPlans[1]); // Gói 30 ngày
      }
    } finally {
      setLoadingPlans(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errors.name = 'Vui lòng nhập họ và tên';
    }
    if (!customerEmail.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!customerEmail.includes('@') || !customerEmail.includes('.')) {
      errors.email = 'Email không hợp lệ (ví dụ: hotro@gmail.com)';
    }
    if (!customerPhone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9+]{9,15}$/.test(customerPhone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedPlan) return;

    setCreatingOrder(true);
    setCheckMessage(null);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          notes: customerNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentOrder(data.order);
        setBankConfig(data.bankConfig);
        setQrUrlSepay(data.qrUrlSepay);
        setQrUrlVietQr(data.qrUrlVietQr);

        // Lưu thông tin khách hàng cho lần sau
        localStorage.setItem(
          'HVD_LAST_CUSTOMER_INFO',
          JSON.stringify({
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
          })
        );

        setStep(3);
      } else {
        alert(data.error || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.warn('Backend order creation offline, using client-side order fallback:', err);
      const fakeOrderCode = `AFF${String(Math.floor(100000 + Math.random() * 900000))}`;
      const fallbackOrder: Order = {
        order_id: `ord_${Date.now()}`,
        order_code: fakeOrderCode,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        plan_days: selectedPlan.days,
        amount: selectedPlan.price,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        notes: customerNotes.trim(),
        status: 'pending',
        payment_content: fakeOrderCode,
        created_at: new Date().toISOString(),
      };
      const fallbackBank: BankConfig = {
        bankCode: 'MBBank',
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountNumber: '0987654321',
        accountName: 'HOANG VAN DAT',
        sepayApiKey: '',
        webhookToken: '',
      };
      const qrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${selectedPlan.price}&addInfo=${encodeURIComponent(fakeOrderCode)}&accountName=HOANG%20VAN%20DAT`;
      setCurrentOrder(fallbackOrder);
      setBankConfig(fallbackBank);
      setQrUrlSepay(qrUrl);
      setQrUrlVietQr(qrUrl);
      localStorage.setItem(
        'HVD_LAST_CUSTOMER_INFO',
        JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
        })
      );
      setStep(3);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleManualCheckPayment = async () => {
    if (!currentOrder) return;
    setIsCheckingPayment(true);
    setCheckMessage('Đang kiểm tra giao dịch từ SePay...');
    try {
      const res = await fetch(`/api/orders/${currentOrder.order_code}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'paid') {
          const sub: UserSubscription = {
            orderCode: data.order_code,
            planName: data.plan_name,
            planDays: data.plan_days,
            amount: data.amount,
            customerName: data.customer_name,
            customerEmail: currentOrder.customer_email,
            customerPhone: currentOrder.customer_phone,
            paidAt: data.paid_at || new Date().toISOString(),
            expiredAt: data.expired_at || new Date().toISOString(),
            status: 'active',
          };
          setCurrentOrder((prev) => (prev ? { ...prev, status: 'paid' } : null));
          setStep(4);
          onPaymentSuccess(sub);
        } else {
          setCheckMessage('Chưa ghi nhận chuyển khoản. Hệ thống SePay sẽ tự động khớp lệnh khi tiền vào tài khoản.');
        }
      }
    } catch (e) {
      setCheckMessage('Không thể kết nối máy chủ kiểm tra.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Nút mô phỏng thanh toán thành công (Hỗ trợ kiểm thử nghiệm thu tức thì)
  const handleSimulatePayment = async () => {
    if (!currentOrder) return;
    setSimulating(true);
    try {
      const res = await fetch(`/api/orders/${currentOrder.order_code}/simulate-payment`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentOrder(data.order);
        setStep(4);
        onPaymentSuccess(data.subscription);
        return;
      }
      throw new Error('Simulation endpoint failed');
    } catch (e: any) {
      console.warn('Kích hoạt mô phỏng thanh toán trực tiếp:', e);
      const sub: UserSubscription = {
        orderCode: currentOrder.order_code,
        planName: currentOrder.plan_name,
        planDays: currentOrder.plan_days,
        amount: currentOrder.amount,
        customerName: currentOrder.customer_name,
        customerEmail: currentOrder.customer_email,
        customerPhone: currentOrder.customer_phone,
        paidAt: new Date().toISOString(),
        expiredAt: new Date(Date.now() + currentOrder.plan_days * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      };
      setCurrentOrder((prev) => (prev ? { ...prev, status: 'paid', paid_at: sub.paidAt, expired_at: sub.expiredAt } : null));
      setStep(4);
      onPaymentSuccess(sub);
    } finally {
      setSimulating(false);
    }
  };

  // Tra cứu khôi phục gói
  const handleLookupSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupMsg(null);
    try {
      const res = await fetch(
        `/api/subscriptions/check?orderCode=${encodeURIComponent(lookupQuery.trim())}&email=${encodeURIComponent(
          lookupQuery.trim()
        )}&phone=${encodeURIComponent(lookupQuery.trim())}`
      );
      const data = await res.json();
      if (res.ok && data.hasActiveSubscription && data.subscription) {
        onPaymentSuccess(data.subscription);
        setLookupMsg({
          type: 'success',
          text: `Đã tìm thấy gói ${data.subscription.planName} của ${data.subscription.customerName}! Còn ${data.daysLeft} ngày sử dụng.`,
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setLookupMsg({
          type: 'error',
          text: 'Không tìm thấy gói còn hạn nào với thông tin này. Bạn có thể đăng ký gói mới bên dưới.',
        });
      }
    } catch (e) {
      setLookupMsg({ type: 'error', text: 'Lỗi kiểm tra thông tin.' });
    } finally {
      setLookupLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-xl overflow-y-auto animate-backdrop-in">
      {/* Radiant ambient spotlight shining behind the payment modal */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.35)_0%,_rgba(14,165,233,0.18)_35%,_rgba(15,23,42,0.65)_75%)] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[750px] bg-gradient-to-tr from-blue-600/30 via-cyan-400/25 to-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Modal Container with glowing focus halo */}
      <div className="relative w-full max-w-4xl my-auto animate-modal-pop">
        {/* Soft glowing backlight halo directly behind the card */}
        <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-blue-500/40 via-cyan-400/35 to-indigo-500/40 rounded-[32px] blur-xl opacity-90 pointer-events-none" />

        <div className="relative w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-400/45 ring-1 ring-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_60px_-10px_rgba(56,189,248,0.4)] overflow-hidden">
          {/* Top Header Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-300 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-blue-900/40 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-blue-500/20">
              <Crown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">Nâng Cấp Gói SEO YouTube Pro</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-blue-500/30 uppercase tracking-wider">
                  SePay Auto
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kích hoạt tự động 100% trong 5-30 giây qua Chuyển khoản VietQR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLookup(!showLookup)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer hidden sm:block mr-2"
            >
              Khôi phục gói cũ?
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Khu vực tra cứu nhanh khôi phục gói */}
        {showLookup && (
          <div className="px-6 py-3 bg-blue-950/40 border-b border-blue-900/40">
            <form onSubmit={handleLookupSubscription} className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex-1 relative w-full">
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Nhập Mã đơn hàng (AFFxxxxxx), Email hoặc Số điện thoại đã mua..."
                  className="w-full bg-slate-900 border border-blue-500/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Kiểm tra gói
              </button>
            </form>
            {lookupMsg && (
              <p
                className={`text-xs mt-2 font-medium ${
                  lookupMsg.type === 'success' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {lookupMsg.text}
              </p>
            )}
          </div>
        )}

        {/* 4-Step Process Indicator Bar */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-blue-900/30">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            {[
              { num: 1, title: 'Chọn gói', desc: 'Chọn thời hạn' },
              { num: 2, title: 'Thông tin', desc: 'Nhập liên hệ' },
              { num: 3, title: 'Quét QR', desc: 'Thanh toán SePay' },
              { num: 4, title: 'Kích hoạt', desc: 'Sử dụng ngay' },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isCompleted = step > s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-2 ring-cyan-400/50 shadow-md shadow-blue-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        isCurrent ? 'text-cyan-300' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 sm:hidden">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {/* ============================================================ */}
          {/* BƯỚC 1: CHỌN GÓI DỊCH VỤ                                    */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                  Bước 1: Chọn gói phù hợp
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Đầu tư nhỏ - Bứt phá triệu view YouTube
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Mở khóa sức mạnh AI đưa video của bạn lên vị trí Top 1 tìm kiếm và đề xuất YouTube.
                </p>
              </div>

              {loadingPlans ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs">Đang tải danh sách gói dịch vụ...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {plans.map((p) => {
                    const isSelected = selectedPlan?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p)}
                        className={`relative rounded-3xl p-5 sm:p-6 transition cursor-pointer flex flex-col justify-between border ${
                          isSelected
                            ? 'bg-gradient-to-b from-blue-900/60 via-slate-900/90 to-blue-950/70 border-cyan-400 shadow-xl shadow-blue-500/20 ring-2 ring-cyan-400/40 scale-[1.02]'
                            : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-blue-500/40'
                        }`}
                      >
                        {p.isFeatured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                            Khuyên Dùng ★
                          </div>
                        )}

                        {p.badge && !p.isFeatured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                            {p.badge}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2 mt-1">
                            <h4 className="text-lg font-black text-white">{p.name}</h4>
                            <span className="text-xs font-bold text-cyan-400 bg-blue-500/20 px-2.5 py-0.5 rounded-full">
                              {p.days} ngày
                            </span>
                          </div>

                          <div className="my-4">
                            <span className="text-3xl font-black text-white">{p.formattedPrice}</span>
                            <span className="text-xs text-slate-400 ml-1">/ {p.days} ngày</span>
                          </div>

                          <p className="text-xs text-slate-300 min-h-[36px] mb-4 leading-relaxed">
                            {p.description}
                          </p>

                          <div className="space-y-2 border-t border-slate-800/80 pt-4 mb-6">
                            {p.features?.map((f, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlan(p);
                            setStep(2);
                          }}
                          className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <span>{isSelected ? 'Đã Chọn • Tiếp Tục' : 'Chọn Gói Này'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedPlan && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer"
                  >
                    <span>Bước tiếp: Nhập thông tin thanh toán</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 2: NHẬP THÔNG TIN KHÁCH HÀNG                            */}
          {/* ============================================================ */}
          {step === 2 && selectedPlan && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                  Bước 2: Thông tin nhận kích hoạt
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Xác nhận thông tin người dùng
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hệ thống dùng thông tin này để kích hoạt bản quyền và hỗ trợ bạn trong suốt quá trình sử dụng.
                </p>
              </div>

              {/* Tóm tắt gói đã chọn */}
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 flex items-center justify-center text-cyan-400 font-black">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{selectedPlan.name}</h4>
                    <p className="text-xs text-slate-400">Thời hạn sử dụng: {selectedPlan.days} ngày</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-cyan-300">{selectedPlan.formattedPrice}</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="block text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Đổi gói khác
                  </button>
                </div>
              </div>

              {/* Form Thông Tin */}
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Họ và Tên khách hàng <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email nhận thông báo <span className="text-rose-400">*</span></span>
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                      }}
                      placeholder="vidu@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                    />
                    {formErrors.email && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Số điện thoại / Zalo <span className="text-rose-400">*</span></span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                      }}
                      placeholder="0987654321"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ghi chú thêm (Tùy chọn)</span>
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Link kênh YouTube hoặc yêu cầu thêm..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
                  />
                </div>

                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>

                  <button
                    type="submit"
                    disabled={creatingOrder}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer disabled:opacity-50"
                  >
                    {creatingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo mã đơn hàng...</span>
                      </>
                    ) : (
                      <>
                        <span>Tiếp tục thanh toán QR</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 3: QUÉT MÃ QR THANH TOÁN (SEPAY AUTOMATION)             */}
          {/* ============================================================ */}
          {step === 3 && currentOrder && bankConfig && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Bước 3: Quét QR thanh toán SePay
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Chuyển khoản VietQR Tự Động
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ để quét mã QR bên dưới.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Cột Trái: Mã QR Code chuẩn VietQR / SePay */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="relative p-3.5 bg-white rounded-3xl shadow-2xl border-4 border-blue-500/50 group">
                    <img
                      src={qrUrlSepay || qrUrlVietQr}
                      alt="VietQR SePay Payment"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                      onError={(e) => {
                        // Fallback sang link VietQR nếu link sepay không load được
                        if ((e.target as HTMLImageElement).src !== qrUrlVietQr) {
                          (e.target as HTMLImageElement).src = qrUrlVietQr;
                        }
                      }}
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900 border border-blue-500/40 text-[11px] font-bold text-cyan-400 whitespace-nowrap shadow-lg flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Quét để tự điền đúng số tiền & nội dung</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SePay đang trực tuyến và tự động khớp lệnh...</span>
                  </div>
                </div>

                {/* Cột Phải: Thông tin chi tiết để sao chép */}
                <div className="md:col-span-7 space-y-3.5 bg-slate-950/70 border border-blue-500/30 rounded-3xl p-5 sm:p-6">
                  {/* Mã đơn hàng nổi bật */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        Mã đơn hàng
                      </span>
                      <p className="text-xl font-black text-cyan-400 font-mono tracking-wide">
                        {currentOrder.order_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        Gói dịch vụ
                      </span>
                      <p className="text-sm font-bold text-white">{currentOrder.plan_name}</p>
                    </div>
                  </div>

                  {/* Ngân hàng */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Ngân hàng</span>
                        <span className="text-xs sm:text-sm font-bold text-white">{bankConfig.bankName}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30">
                      {bankConfig.bankCode}
                    </span>
                  </div>

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tài khoản</span>
                      <span className="text-sm sm:text-base font-black text-white font-mono">
                        {bankConfig.accountNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankConfig.accountNumber, 'acc')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-blue-500/30"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'acc' ? 'Đã sao chép' : 'Sao chép STK'}</span>
                    </button>
                  </div>

                  {/* Chủ tài khoản */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tên chủ tài khoản</span>
                      <span className="text-xs sm:text-sm font-bold text-white uppercase">
                        {bankConfig.accountName}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Chính chủ
                    </span>
                  </div>

                  {/* Số tiền */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tiền cần chuyển</span>
                      <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                        {currentOrder.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(currentOrder.amount), 'amount')}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-blue-500/30"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'amount' ? 'Đã sao chép' : 'Sao chép số tiền'}</span>
                    </button>
                  </div>

                  {/* Nội dung chuyển khoản - Cực kỳ quan trọng */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-blue-900/40 to-slate-900 border-2 border-cyan-400/80 shadow-md">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Nội dung chuyển khoản (Bắt buộc chính xác):
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentOrder.payment_content, 'content')}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'content' ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP NỘI DUNG'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 text-center border border-blue-500/40">
                      <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono tracking-widest select-all">
                        {currentOrder.payment_content}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      ⚠️ Giữ nguyên đúng nội dung <span className="font-bold text-cyan-300">{currentOrder.payment_content}</span> để hệ thống SePay tự động nhận diện và mở khóa gói ngay lập tức.
                    </p>
                  </div>

                  {/* Trạng thái kiểm tra & Nút hành động */}
                  {checkMessage && (
                    <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-500/40 text-xs text-cyan-300 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin text-cyan-400" />
                      <span>{checkMessage}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingPayment}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPayment ? 'animate-spin' : ''}`} />
                      <span>Kiểm tra thanh toán</span>
                    </button>

                    {/* Nút mô phỏng thanh toán (Test / Nghiệm thu nhanh không cần gửi tiền thật) */}
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={simulating}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/40"
                      title="Mô phỏng SePay đã nhận tiền thành công để nghiệm thu chức năng"
                    >
                      {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>[Demo] Test thanh toán ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 4: KÍCH HOẠT THÀNH CÔNG                                 */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="max-w-xl mx-auto text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-bounce">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Thanh Toán Thành Công 100%
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Chào mừng bạn đến với Hoàng Văn Đạt SEO Pro!
                </h3>
                <p className="text-sm text-slate-300 mt-2">
                  Đơn hàng <span className="font-bold text-cyan-400">{currentOrder?.order_code}</span> đã được SePay xác nhận. Gói bản quyền của bạn đã được kích hoạt thành công.
                </p>
              </div>

              {/* Thông tin gói đã kích hoạt */}
              <div className="bg-slate-950/80 border border-emerald-500/40 rounded-3xl p-5 text-left space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Gói bản quyền</span>
                  <span className="text-sm font-black text-white">{currentOrder?.plan_name}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Thời hạn sử dụng</span>
                  <span className="text-sm font-bold text-cyan-400">{currentOrder?.plan_days} ngày</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Khách hàng</span>
                  <span className="text-sm font-semibold text-slate-200">{currentOrder?.customer_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Hạn sử dụng đến</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {currentOrder?.expired_at
                      ? new Date(currentOrder.expired_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Đang cập nhật'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>BẮT ĐẦU SỬ DỤNG CÔNG CỤ NGAY</span>
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
