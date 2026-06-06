import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { OrderStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  return adminEmails.includes(email)
}

export const CATEGORY_LABELS: Record<string, string> = {
  ai:        'AI课程',
  media:     '自媒体课程',
  ecommerce: '电商课程',
  video:     '短视频课程',
  project:   '创业项目',
  promote:   '推广资源',
}

export const CATEGORY_ICONS: Record<string, string> = {
  ai:        '🤖',
  media:     '📱',
  ecommerce: '🛒',
  video:     '🎬',
  project:   '💡',
  promote:   '📢',
}

export const VIP_PRICE = 99
export const COMMISSION_RATE = 0.8

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending:        '待提交凭证',
  pending_review: '待审核',
  paid:           '已通过',
  rejected:       '已拒绝',
  refunded:       '已退款',
  cancelled:      '已取消',
}

export const ORDER_STATUS_VARIANT: Record<OrderStatus, 'blue' | 'gold' | 'green' | 'gray' | 'red'> = {
  pending:        'gray',
  pending_review: 'gold',
  paid:           'green',
  rejected:       'red',
  refunded:       'gray',
  cancelled:      'gray',
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}
