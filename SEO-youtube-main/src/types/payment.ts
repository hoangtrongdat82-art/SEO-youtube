export interface PaymentPlan {
  id: string;
  name: string;
  days: number;
  price: number;
  formattedPrice: string;
  description: string;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  badge?: string;
}

export interface BankConfig {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  sepayApiKey?: string;
  webhookToken?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'expired';

export interface Order {
  order_id: string;
  order_code: string;
  plan_id: string;
  plan_name: string;
  plan_days: number;
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
  status: OrderStatus;
  created_at: string;
  paid_at?: string;
  expired_at?: string;
  payment_content: string;
  gateway?: string;
  transaction_ref?: string;
}

export interface WebhookLog {
  id: string;
  received_at: string;
  order_code?: string;
  amount?: number;
  content?: string;
  status: 'success' | 'failed' | 'ignored';
  message: string;
  raw_payload: any;
}

export interface UserSubscription {
  orderCode: string;
  planName: string;
  planDays: number;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paidAt: string;
  expiredAt: string;
  status: 'active' | 'expired';
}
