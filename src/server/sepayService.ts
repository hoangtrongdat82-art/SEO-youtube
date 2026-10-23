import fs from 'fs';
import path from 'path';
import { PaymentPlan, BankConfig, Order, WebhookLog, UserSubscription } from '../types/payment';

interface StoreData {
  bankConfig: BankConfig;
  plans: PaymentPlan[];
  orders: Order[];
  webhookLogs: WebhookLog[];
  subscriptions: UserSubscription[];
  orderCounter: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sepay_store.json');

const DEFAULT_PLANS: PaymentPlan[] = [
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

const DEFAULT_BANK_CONFIG: BankConfig = {
  bankCode: 'MBBank',
  bankName: 'Ngân hàng Quân Đội (MB Bank)',
  accountNumber: '0987654321',
  accountName: 'HOANG VAN DAT',
  sepayApiKey: '',
  webhookToken: '',
};

class SePayStore {
  private data: StoreData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          bankConfig: { ...DEFAULT_BANK_CONFIG, ...(parsed.bankConfig || {}) },
          plans: parsed.plans && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS,
          orders: parsed.orders || [],
          webhookLogs: parsed.webhookLogs || [],
          subscriptions: parsed.subscriptions || [],
          orderCounter: parsed.orderCounter || 1,
        };
      }
    } catch (e) {
      console.error('Lỗi khi đọc file data SePay:', e);
    }

    const initial: StoreData = {
      bankConfig: DEFAULT_BANK_CONFIG,
      plans: DEFAULT_PLANS,
      orders: [],
      webhookLogs: [],
      subscriptions: [],
      orderCounter: 1,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: StoreData): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu SePay:', e);
    }
  }

  public getBankConfig(): BankConfig {
    return this.data.bankConfig;
  }

  public updateBankConfig(config: Partial<BankConfig>): BankConfig {
    this.data.bankConfig = { ...this.data.bankConfig, ...config };
    this.saveData();
    return this.data.bankConfig;
  }

  public getPlans(includeInactive = false): PaymentPlan[] {
    if (includeInactive) return this.data.plans;
    return this.data.plans.filter((p) => p.isActive);
  }

  public updatePlans(plans: PaymentPlan[]): PaymentPlan[] {
    this.data.plans = plans;
    this.saveData();
    return this.data.plans;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrder(orderCode: string): Order | undefined {
    return this.data.orders.find(
      (o) => o.order_code.toUpperCase() === orderCode.toUpperCase()
    );
  }

  public getWebhookLogs(): WebhookLog[] {
    return this.data.webhookLogs;
  }

  public getSubscriptions(): UserSubscription[] {
    return this.data.subscriptions;
  }

  public createOrder(params: {
    planId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
  }): { order: Order; qrUrlSepay: string; qrUrlVietQr: string; bankConfig: BankConfig } {
    const plan = this.data.plans.find((p) => p.id === params.planId && p.isActive);
    if (!plan) {
      throw new Error('Gói dịch vụ không tồn tại hoặc đã tạm dừng.');
    }

    const orderNum = this.data.orderCounter++;
    // Định dạng mã đơn hàng AFF + 6 chữ số: ví dụ AFF000001
    const orderCode = `AFF${String(orderNum).slice(-6).padStart(6, '0')}`;
    const now = new Date();

    const order: Order = {
      order_id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      order_code: orderCode,
      plan_id: plan.id,
      plan_name: plan.name,
      plan_days: plan.days,
      amount: plan.price,
      customer_name: params.customerName.trim(),
      customer_email: params.customerEmail.trim().toLowerCase(),
      customer_phone: params.customerPhone.trim(),
      notes: params.notes?.trim() || '',
      status: 'pending',
      created_at: now.toISOString(),
      payment_content: orderCode, // Nội dung chuyển khoản bắt buộc là mã đơn hàng
    };

    this.data.orders.unshift(order);
    this.saveData();

    const qrUrlSepay = `https://qr.sepay.vn/img?acc=${this.data.bankConfig.accountNumber}&bank=${this.data.bankConfig.bankCode}&amount=${order.amount}&des=${order.order_code}`;
    const qrUrlVietQr = `https://img.vietqr.io/image/${this.data.bankConfig.bankCode}-${this.data.bankConfig.accountNumber}-compact2.png?amount=${order.amount}&addInfo=${order.order_code}&accountName=${encodeURIComponent(this.data.bankConfig.accountName)}`;

    return {
      order,
      qrUrlSepay,
      qrUrlVietQr,
      bankConfig: this.data.bankConfig,
    };
  }

  public activateOrder(orderCode: string, meta?: { gateway?: string; transactionRef?: string }): { order: Order; subscription: UserSubscription } {
    const order = this.getOrder(orderCode);
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng mã ${orderCode}`);
    }

    const now = new Date();
    const paidAt = now.toISOString();
    const expiredAt = new Date(now.getTime() + order.plan_days * 24 * 60 * 60 * 1000).toISOString();

    order.status = 'paid';
    order.paid_at = paidAt;
    order.expired_at = expiredAt;
    if (meta?.gateway) order.gateway = meta.gateway;
    if (meta?.transactionRef) order.transaction_ref = meta.transactionRef;

    // Kích hoạt hoặc gia hạn subscription cho khách hàng
    const existingSubIndex = this.data.subscriptions.findIndex(
      (s) =>
        s.customerEmail.toLowerCase() === order.customer_email.toLowerCase() ||
        s.customerPhone === order.customer_phone
    );

    let finalExpiredAt = expiredAt;
    if (existingSubIndex >= 0) {
      const currentSub = this.data.subscriptions[existingSubIndex];
      const curExpTime = new Date(currentSub.expiredAt).getTime();
      // Nếu gói cũ vẫn còn hạn, cộng dồn thêm ngày
      if (curExpTime > now.getTime()) {
        finalExpiredAt = new Date(curExpTime + order.plan_days * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const subscription: UserSubscription = {
      orderCode: order.order_code,
      planName: order.plan_name,
      planDays: order.plan_days,
      amount: order.amount,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      paidAt,
      expiredAt: finalExpiredAt,
      status: 'active',
    };

    if (existingSubIndex >= 0) {
      this.data.subscriptions[existingSubIndex] = subscription;
    } else {
      this.data.subscriptions.unshift(subscription);
    }

    this.saveData();
    return { order, subscription };
  }

  public processWebhook(payload: any, authHeader?: string): { success: boolean; message: string; order?: Order } {
    const logId = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const receivedAt = new Date().toISOString();

    // 1. Kiểm tra Token SePay nếu admin cấu hình
    if (this.data.bankConfig.webhookToken) {
      const token = this.data.bankConfig.webhookToken.trim();
      const clientToken = (authHeader || '').replace(/^Apikey\s+/i, '').replace(/^Bearer\s+/i, '').trim();
      if (token && clientToken !== token) {
        this.data.webhookLogs.unshift({
          id: logId,
          received_at: receivedAt,
          status: 'failed',
          message: 'Xác thực SePay Webhook Token không khớp.',
          raw_payload: payload,
        });
        this.saveData();
        return { success: false, message: 'Sai Webhook Token' };
      }
    }

    // 2. Tìm mã đơn hàng AFF trong content hoặc description của giao dịch
    const rawContent = `${payload.content || ''} ${payload.description || ''} ${payload.code || ''}`;
    const codeMatch = rawContent.match(/AFF\d{6}/i);
    const orderCode = codeMatch ? codeMatch[0].toUpperCase() : null;

    const transferAmount = Number(payload.transferAmount || payload.amount || 0);

    if (!orderCode) {
      this.data.webhookLogs.unshift({
        id: logId,
        received_at: receivedAt,
        amount: transferAmount,
        content: rawContent,
        status: 'ignored',
        message: 'Không tìm thấy mã đơn hàng dạng AFFxxxxxx trong nội dung chuyển khoản.',
        raw_payload: payload,
      });
      this.saveData();
      return { success: false, message: 'Không phát hiện mã đơn hàng trong nội dung' };
    }

    // 3. Tìm đơn hàng
    const order = this.getOrder(orderCode);
    if (!order) {
      this.data.webhookLogs.unshift({
        id: logId,
        received_at: receivedAt,
        order_code: orderCode,
        amount: transferAmount,
        content: rawContent,
        status: 'failed',
        message: `Mã đơn hàng ${orderCode} không tồn tại trong hệ thống.`,
        raw_payload: payload,
      });
      this.saveData();
      return { success: false, message: `Không tìm thấy đơn hàng ${orderCode}` };
    }

    // 4. Nếu đơn hàng đã thanh toán trước đó
    if (order.status === 'paid') {
      this.data.webhookLogs.unshift({
        id: logId,
        received_at: receivedAt,
        order_code: orderCode,
        amount: transferAmount,
        content: rawContent,
        status: 'success',
        message: `Đơn hàng ${orderCode} đã được kích hoạt trước đó. Ghi nhận giao dịch lặp.`,
        raw_payload: payload,
      });
      this.saveData();
      return { success: true, message: `Đơn hàng ${orderCode} đã kích hoạt trước đó`, order };
    }

    // 5. Kiểm tra số tiền chuyển
    if (transferAmount < order.amount) {
      this.data.webhookLogs.unshift({
        id: logId,
        received_at: receivedAt,
        order_code: orderCode,
        amount: transferAmount,
        content: rawContent,
        status: 'failed',
        message: `Số tiền chuyển (${transferAmount.toLocaleString('vi-VN')}đ) ít hơn giá trị gói (${order.amount.toLocaleString('vi-VN')}đ).`,
        raw_payload: payload,
      });
      this.saveData();
      return {
        success: false,
        message: `Số tiền chuyển ${transferAmount}đ không đủ cho đơn hàng ${order.amount}đ`,
      };
    }

    // 6. Kích hoạt đơn hàng tự động
    const { subscription } = this.activateOrder(orderCode, {
      gateway: payload.gateway || payload.bank_brand_name || 'SePay',
      transactionRef: payload.referenceCode || payload.id || '',
    });

    this.data.webhookLogs.unshift({
      id: logId,
      received_at: receivedAt,
      order_code: orderCode,
      amount: transferAmount,
      content: rawContent,
      status: 'success',
      message: `Đã kích hoạt thành công gói ${order.plan_name} cho khách hàng ${order.customer_name}. Hết hạn vào ${subscription.expiredAt}.`,
      raw_payload: payload,
    });
    this.saveData();

    return { success: true, message: 'Kích hoạt gói dịch vụ thành công.', order };
  }

  public checkUserSubscription(query: { email?: string; phone?: string; orderCode?: string }): {
    hasActiveSubscription: boolean;
    subscription?: UserSubscription;
    daysLeft?: number;
  } {
    const now = Date.now();
    const subs = this.data.subscriptions;

    const matched = subs.find((s) => {
      if (query.orderCode && s.orderCode.toUpperCase() === query.orderCode.toUpperCase()) return true;
      if (query.email && s.customerEmail.toLowerCase() === query.email.toLowerCase().trim()) return true;
      if (query.phone && s.customerPhone.trim() === query.phone.trim()) return true;
      return false;
    });

    if (!matched) {
      return { hasActiveSubscription: false };
    }

    const expTime = new Date(matched.expiredAt).getTime();
    if (expTime > now) {
      const daysLeft = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
      return {
        hasActiveSubscription: true,
        subscription: matched,
        daysLeft,
      };
    } else {
      matched.status = 'expired';
      this.saveData();
      return {
        hasActiveSubscription: false,
        subscription: matched,
        daysLeft: 0,
      };
    }
  }
}

export const sePayStore = new SePayStore();
