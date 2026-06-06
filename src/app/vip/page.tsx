import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ProductCard } from '@/components/ui/ProductCard'
import { Badge } from '@/components/ui/Badge'
import { Crown, Check } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60

const PERKS = [
  '解锁全站 1000+ 精选资源',
  '每月持续新增 60+ 资源',
  'AI实战 / 自媒体 / 电商课程',
  '短视频 / 创业项目全部内容',
  'VIP专属内容优先获取',
  '专属推广返佣资格（80%）',
]

export default async function VipPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // Fetch VIP + franchise products
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('*')
    .in('type', ['vip', 'franchise'])
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <Badge variant="gold" className="mb-4"><Crown size={10} className="mr-1" />VIP会员</Badge>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">开通 VIP 会员</h1>
        <p className="text-slate-400 max-w-lg mx-auto">一次付费，永久有效，解锁全站所有资源，持续更新不落后</p>
      </div>

      {/* Product cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {products?.map(p => (
          <ProductCard key={p.id} product={p as any} />
        ))}
      </div>

      {/* Perks list */}
      <div className="bg-qpanel border border-qblue/15 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Crown size={18} className="text-amber-400" /> VIP会员权益
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PERKS.map(p => (
            <div key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
              <span className="w-5 h-5 rounded-full bg-qblue/15 border border-qblue/30 flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-qblue2" />
              </span>
              {p}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-6 pt-5 border-t border-qblue/10">
          支付完成后请上传凭证，审核通过后（1-12小时）权益自动发放。
          如有问题请联系微信客服：<span className="text-qblue3">qcyhub</span>
          &nbsp;·&nbsp;
          <Link href="/refund-policy" className="text-qblue3 hover:underline">退款政策</Link>
        </p>
      </div>
    </div>
  )
}
