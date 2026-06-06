import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/orders/submit
 * Body: { product_id, wechat_nickname, paid_amount, paid_at_claimed, screenshot_url }
 *
 * Creates an order with status=pending_review.
 * Screenshot already uploaded to Storage by client before calling this.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 })

  const { product_id, wechat_nickname, paid_amount, paid_at_claimed, screenshot_url } = await req.json()

  if (!product_id) return NextResponse.json({ error: '缺少商品信息' }, { status: 400 })
  if (!wechat_nickname?.trim()) return NextResponse.json({ error: '请填写微信昵称' }, { status: 400 })
  if (!screenshot_url) return NextResponse.json({ error: '请上传付款截图' }, { status: 400 })

  // Get product info
  const { data: product, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('is_active', true)
    .single()

  if (prodErr || !product) return NextResponse.json({ error: '商品不存在' }, { status: 404 })

  // Check not already owned
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('is_vip, is_franchise').eq('id', user.id).single()

  if (product.grants_vip && profile?.is_vip) {
    return NextResponse.json({ error: '您已是VIP会员' }, { status: 400 })
  }
  if (product.grants_franchise && profile?.is_franchise) {
    return NextResponse.json({ error: '您已是站长会员' }, { status: 400 })
  }

  // Create order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id:          user.id,
      product_id:       product.id,
      product_name:     product.name,
      product_type:     product.type,
      amount:           product.price,
      status:           'pending_review',
      payment_provider: 'wechat_qr',
      wechat_nickname:  wechat_nickname.trim(),
      paid_amount:      paid_amount ?? product.price,
      paid_at_claimed:  paid_at_claimed,
      screenshot_url:   screenshot_url,
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    console.error(orderErr)
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }

  return NextResponse.json({ order_id: order.id, status: 'pending_review' })
}
