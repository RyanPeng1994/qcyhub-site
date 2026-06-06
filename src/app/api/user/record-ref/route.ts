import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { ref_code } = await req.json()
  if (!ref_code) return NextResponse.json({ error: 'Missing ref_code' }, { status: 400 })

  // Find referrer
  const { data: referrer } = await supabaseAdmin
    .from('profiles').select('id').eq('ref_code', ref_code).single()
  if (!referrer || referrer.id === user.id) return NextResponse.json({ ok: true })

  // Insert ref_registrations (ignore duplicate)
  await supabaseAdmin.from('ref_registrations').upsert({
    referrer_id: referrer.id,
    referred_user_id: user.id,
  }, { onConflict: 'referred_user_id', ignoreDuplicates: true })

  return NextResponse.json({ ok: true })
}
