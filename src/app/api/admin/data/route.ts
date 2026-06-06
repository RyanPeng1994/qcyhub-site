import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/utils'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: '未授权' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: '无权限' }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const table = new URL(req.url).searchParams.get('table')

  switch (table) {
    case 'orders':
      const { data: orders } = await admin.from('orders').select('*, profiles(email, nickname)').order('created_at', { ascending: false }).limit(100)
      return NextResponse.json(orders ?? [])
    case 'resources':
      const { data: resources } = await admin.from('resources').select('*').order('category').order('sort_order')
      return NextResponse.json(resources ?? [])
    case 'members':
      const { data: members } = await admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
      return NextResponse.json(members ?? [])
    case 'referrals':
      const { data: referrals } = await admin.from('referrals').select('*, referrer:referrer_id(email), referred:referred_user_id(email)').order('created_at', { ascending: false }).limit(50)
      return NextResponse.json(referrals ?? [])
    case 'products':
      const { data: products } = await admin.from('products').select('*').order('sort_order')
      return NextResponse.json(products ?? [])
    default:
      return NextResponse.json({ error: '未知表' }, { status: 400 })
  }
}
