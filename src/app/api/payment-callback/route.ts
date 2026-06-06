import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/payment-callback
 *
 * RESERVED for future API-based payment integration.
 * Current mode: wechat_qr (manual screenshot review)
 *
 * When integrating Stripe / WeChat Pay API / Alipay:
 * 1. Verify provider signature
 * 2. Extract order_id from metadata
 * 3. Call supabaseAdmin.rpc('fulfill_order_v2', { p_order_id, p_admin_email: 'system' })
 *
 * The database schema (payment_provider, payment_id, payment_status) is
 * already compatible — no migration needed when upgrading.
 */
export async function POST(req: Request) {
  const provider = req.headers.get('x-payment-provider') || 'unknown'

  // TODO: implement per-provider verification and call fulfill_order_v2
  // switch (provider) {
  //   case 'stripe': { ... }
  //   case 'wechat_api': { ... }
  //   case 'alipay': { ... }
  //   case 'lemonsqueezy': { ... }
  // }

  return NextResponse.json({ error: 'API payment not yet configured' }, { status: 501 })
}
