'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Profile } from '@/types'

export function useUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) { setProfile(null); return }
      const { data } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { profile, loading, isVip: profile?.is_vip ?? false }
}
