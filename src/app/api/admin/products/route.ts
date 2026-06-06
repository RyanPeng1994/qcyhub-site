import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/utils'

export async function GET() {
  const { data } = await supabaseAdmin.from('products').select('*').order('sort_order')
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return NextResponse.json({ error: '无权限' }, { status: 403 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('products').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
