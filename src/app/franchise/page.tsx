import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ProductCard } from '@/components/ui/ProductCard'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export const revalidate = 60

export default async function FranchisePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }
  const { data: products } = await supabaseAdmin
    .from('products').select('*').eq('type', 'franchise').eq('is_active', true).order('sort_order')

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <Badge variant="blue" className="mb-4">站长加盟</Badge>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">获得<span className="text-qblue2">同款网站</span></h1>
        <p className="text-slate-400 max-w-xl mx-auto">复制QCY轻创业资源库模式，快速搭建属于你自己的知识付费平台</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {products?.map(p => (
          <ProductCard key={p.id} product={p as any} profile={profile as any} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {[
          { icon: '🌐', title: '网站模板 · 即开即用', desc: '与本站完全相同的网站模板，包含前台展示、会员系统、后台管理，零代码部署' },
          { icon: '🚀', title: '部署教程 · 零门槛上线', desc: '手把手视频教程，从购买域名到网站上线，1天内完成全部部署' },
          { icon: '🤖', title: 'AI运营提示词包', desc: '500+ 专为知识付费站长设计的运营提示词，涵盖内容创作、引流推广、用户运营' },
          { icon: '📦', title: '资源同步 · 始终领先', desc: '加盟后资源自动同步更新，无需手动维护内容，保持网站持续活跃' },
        ].map(item => (
          <Card key={item.title} className="p-5 flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-qblue/10 border border-qblue/20 flex items-center justify-center text-2xl flex-shrink-0">{item.icon}</div>
            <div>
              <p className="font-semibold text-white mb-1 text-sm">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
