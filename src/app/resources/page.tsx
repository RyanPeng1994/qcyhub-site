import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ResourceCard } from '@/components/ui/ResourceCard'
import { Badge } from '@/components/ui/Badge'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils'

export const revalidate = 60

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isVip = false
  if (user) {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('is_vip')
      .eq('id', user.id)
      .single()
    isVip = data?.is_vip ?? false
  }

  const { data: rawResources } = await supabaseAdmin
    .from('resources')
    .select('id, title, category, description, cover_url, is_vip, sort_order, pan_url')
    .order('category')
    .order('sort_order')

  const resources = (rawResources ?? []) as Array<{
    id: string
    title: string
    category: string
    description: string | null
    cover_url: string | null
    pan_url: string | null
    is_vip: boolean
    sort_order: number
  }>

  const grouped: Record<string, typeof resources> = {}
  for (const r of resources) {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  }

  const categories = Object.keys(CATEGORY_LABELS)

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="mb-10">
        <Badge variant="blue" className="mb-3">课程资源</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">精选实战资源库</h1>
        <p className="text-slate-400">覆盖AI、自媒体、电商、短视频等热门赛道，全部来自一线实战经验</p>
      </div>

      {!isVip && (
        <div className="mb-8 p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">开通VIP · 解锁全部网盘链接</p>
            <p className="text-slate-500 text-xs mt-0.5">仅需 ¥99，即可查看所有资源的完整获取链接</p>
          </div>
          <a href="/vip" className="ml-auto text-xs bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/25 transition-all whitespace-nowrap">
            立即开通 →
          </a>
        </div>
      )}

      {categories.map(cat => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        return (
          <section key={cat} className="mb-14">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-9 rounded-lg bg-qblue/10 border border-qblue/20 flex items-center justify-center text-lg">
                {CATEGORY_ICONS[cat]}
              </span>
              <h2 className="text-lg font-bold text-white">{CATEGORY_LABELS[cat]}</h2>
              <div className="flex-1 h-px bg-qblue/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(r => (
                <ResourceCard
                  key={r.id}
                  resource={{ ...r, created_at: '' }}
                  isVip={isVip}
                  isLoggedIn={!!user}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
