export interface Profile {
  id: string
  email: string
  nickname: string | null
  is_vip: boolean
  is_franchise: boolean
  vip_expire_at: string | null
  ref_code: string | null
  created_at: string
}

export interface Resource {
  id: string
  title: string
  category: string
  description: string | null
  cover_url: string | null
  pan_url: string | null
  is_vip: boolean
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  type: 'vip' | 'course' | 'franchise'
  price: number
  cover_url: string | null
  description: string | null
  resource_id: string | null
  grants_vip: boolean
  grants_franchise: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export type OrderStatus =
  | 'pending'           // 创建未提交凭证
  | 'pending_review'    // 已提交截图，待审核
  | 'paid'              // 审核通过
  | 'rejected'          // 审核拒绝
  | 'refunded'
  | 'cancelled'

export interface Order {
  id: string
  user_id: string
  product_id: string | null
  product_name: string | null
  product_type: 'vip' | 'course' | 'franchise' | null
  amount: number
  status: OrderStatus
  // 微信收款码模式
  wechat_nickname: string | null
  paid_amount: number | null
  paid_at_claimed: string | null
  screenshot_url: string | null
  // 审核
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  // 保留供未来 API 支付升级
  payment_provider: string | null   // 'wechat_qr' | 'wechat_api' | 'stripe' ...
  payment_id: string | null
  paid_at: string | null
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_user_id: string
  order_id: string | null
  commission_amount: number | null
  status: 'pending' | 'settled' | 'cancelled'
  created_at: string
}

export interface UserGrant {
  id: string
  user_id: string
  resource_id: string
  order_id: string | null
  granted_at: string
}
