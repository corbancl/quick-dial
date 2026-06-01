/**
 * Quick Dial 支付 SDK
 * 与 sync.ruseo.cn/api/pay.php 通信
 */

const PAY_API = 'https://sync.ruseo.cn/api/pay.php';

function getToken(): string | null {
  return localStorage.getItem('quick-dial-token');
}

export interface PlanInfo {
  id: string;
  name: string;
  amount: number;
  days: number | null;
}

export const PLANS: PlanInfo[] = [
  { id: 'monthly', name: '月度', amount: 9.90, days: 30 },
  { id: 'yearly', name: '年度', amount: 68.00, days: 365 },
  { id: 'lifetime', name: '终身', amount: 198.00, days: null },
];

export interface OrderResult {
  ok: boolean;
  msg: string;
  qrCode?: string;     // 微信扫码链接
  payUrl?: string;     // 支付宝跳转链接
  orderNo?: string;
  plan?: string;
  amount?: number;
  method?: string;
}

export interface SubStatus {
  isPro: boolean;
  plan: string;
  expireAt: string | null;
}

/**
 * 创建支付订单
 */
export async function createOrder(
  plan: string,
  method: 'wechat' | 'alipay'
): Promise<OrderResult> {
  const token = getToken();
  if (!token) return { ok: false, msg: '请先登录云同步账号' };

  try {
    const res = await fetch(`${PAY_API}?action=create_order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ plan, method }),
    });
    const result = await res.json();

    if (result.code === 200) {
      return {
        ok: true,
        msg: '订单已创建',
        qrCode: result.data.qr_code || undefined,
        payUrl: result.data.pay_url || undefined,
        orderNo: result.data.order_no,
        plan: result.data.plan,
        amount: result.data.amount,
        method: result.data.method,
      };
    }
    return { ok: false, msg: result.msg || '创建订单失败' };
  } catch {
    return { ok: false, msg: '网络错误' };
  }
}

/**
 * 查询订阅状态
 */
export async function checkSubscription(): Promise<SubStatus> {
  const token = getToken();
  if (!token) return { isPro: false, plan: 'free', expireAt: null };

  try {
    const res = await fetch(`${PAY_API}?action=status`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await res.json();

    if (result.code === 200) {
      return {
        isPro: result.data.is_pro,
        plan: result.data.plan,
        expireAt: result.data.expire_at,
      };
    }
    return { isPro: false, plan: 'free', expireAt: null };
  } catch {
    return { isPro: false, plan: 'free', expireAt: null };
  }
}

/**
 * 生成支付二维码 SVG（用于展示）
 */
export function generateQRCodeSVG(text: string, size: number = 200): string {
  // 使用在线 API 生成二维码
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}
