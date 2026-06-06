import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/utils'

/**
 * POST /api/admin/orders/review
 * Body: { order_id, action: 'approve' | 'reject', note?: string }
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { order_id, action, note } = await req.json()
  if (!order_id || !action) return NextResponse.json({ error: '参数缺失' }, { status: 400 })

  if (action === 'approve') {
    const { data, error } = await supabaseAdmin.rpc('fulfill_order_v2', {
      p_order_id:   order_id,
      p_admin_email: user.email,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (data && !data.ok) return NextResponse.json({ error: data.error }, { status: 400 })
    return NextResponse.json({ ok: true, action: 'approved' })
  }

  if (action === 'reject') {
    const { data, error } = await supabaseAdmin.rpc('reject_order', {
      p_order_id:   order_id,
      p_admin_email: user.email,
      p_note:        note || '',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (data && !data.ok) return NextResponse.json({ error: data.error }, { status: 400 })
    return NextResponse.json({ ok: true, action: 'rejected' })
  }

  return NextResponse.json({ error: '无效操作' }, { status: 400 })
}
