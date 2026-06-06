import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // 从请求头获取 Authorization token
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  // 用 token 验证用户
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
  }

  const { product_id, wechat_nickname, paid_amount, paid_at_claimed, screenshot_url } = await req.json()

  if (!product_id) return NextResponse.json({ error: '缺少商品信息' }, { status: 400 })
  if (!wechat_nickname?.trim()) return NextResponse.json({ error: '请填写微信昵称' }, { status: 400 })
  if (!screenshot_url) return NextResponse.json({ error: '请上传付款截图' }, { status: 400 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: product, error: prodErr } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', product_id)
    .eq('is_active', true)
    .single()

  if (prodErr || !product) return NextResponse.json({ error: '商品不存在' }, { status: 404 })

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_type: product.type,
      amount: product.price,
      status: 'pending_review',
      payment_provider: 'wechat_qr',
      wechat_nickname: wechat_nickname.trim(),
      paid_amount: paid_amount ?? product.price,
      paid_at_claimed: paid_at_claimed,
      screenshot_url: screenshot_url,
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 })
  }

  return NextResponse.json({ order_id: order.id, status: 'pending_review' })
}
