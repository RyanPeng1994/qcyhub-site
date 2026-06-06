import Link from 'next/link'
import { Crown, ArrowRight, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const revalidate = 60

const FEATURES = [
  { icon: '🤖', title: 'AI实战课程', desc: 'ChatGPT、Midjourney、Claude等AI工具变现实战，紧跟最新趋势' },
  { icon: '📱', title: '自媒体运营', desc: '抖音、小红书、微信公众号从0到1运营实战方法论' },
  { icon: '🛒', title: '电商运营', desc: '拼多多、淘宝、抖店选品、投流、运营全套实操教程' },
  { icon: '🎬', title: '短视频课程', desc: '从拍摄剪辑到算法推流，打造爆款短视频完整体系' },
  { icon: '💡', title: '网赚项目', desc: '挖掘冷门赛道，利用信息差快速实现副业变现的实战案例' },
  { icon: '📢', title: '引流推广', desc: '私域流量运营、微信生态引流、社群裂变全套教程' },
]

export default async function HomePage() {
  const { data: vipProduct } = await supabaseAdmin
    .from('products').select('price').eq('slug', 'vip').single()
  const vipPrice = vipProduct?.price ?? 99

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="min-h-[calc(100vh-64px)] flex items-center py-20 px-4">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-qblue/8 border border-qblue/25 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-qblue rounded-full animate-pulse" />
              <span className="text-qblue3 text-xs tracking-wider">持续更新 · 1000+ 精选资源</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-white mb-5 tracking-tight">
              打破信息差<br />
              <span className="bg-gradient-to-r from-qblue2 to-qaccent bg-clip-text text-transparent">
                开启创业之路
              </span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              汇聚AI实战、自媒体运营、电商创业、网赚项目等优质教程。一次付费，终身受益，助你在信息浪潮中抢占先机。
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/vip">
                <Button size="lg">
                  <Crown size={16} /> ¥{vipPrice} 立即开通VIP
                </Button>
              </Link>
              <Link href="/resources">
                <Button size="lg" variant="secondary">
                  浏览课程资源 <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
            <div className="flex gap-8">
              {[['1000+', '精选资源'], [`¥${vipPrice}`, '终身VIP'], ['7×24', '持续更新']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-white font-mono">{n}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden md:block">
            <Card className="relative overflow-hidden p-6">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-qblue to-transparent" />
              <div className="flex items-center justify-between mb-5">
                <Badge variant="blue">VIP 专属资源</Badge>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">AI变现实战训练营</h3>
              <p className="text-xs text-slate-500 mb-5">已有 2,847 人学习 · 持续更新</p>
              {[['AI写作变现', 92], ['自媒体涨粉', 86], ['电商选品策略', 78]].map(([label, pct]) => (
                <div key={label} className="mb-3.5">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{label}</span><span>{pct}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-qbluedark to-qblue rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              {/* Payment method note */}
              <div className="mt-5 pt-4 border-t border-qblue/10">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>💳</span> 支持微信扫码支付 · 人工审核发放权益
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 px-4 border-t border-qblue/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="blue" className="mb-4">核心价值</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white">覆盖所有热门创业赛道</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <Card key={f.title} hover className="p-6">
                <div className="w-11 h-11 rounded-xl bg-qblue/10 border border-qblue/20 flex items-center justify-center text-xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-14 border-y border-qblue/10 bg-qpanel/50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-px bg-qblue/10">
          {[['1000+','精选资源'],['5200+','VIP会员'],['68+','月均更新'],[`¥${vipPrice}`,'终身VIP']].map(([n,l]) => (
            <div key={l} className="bg-qpanel/80 py-8 text-center">
              <p className="text-3xl md:text-4xl font-black text-white font-mono">{n}</p>
              <p className="text-xs text-slate-500 mt-2 tracking-wide">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW TO BUY ===== */}
      <section className="py-20 px-4 border-b border-qblue/10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="blue" className="mb-4">购买流程</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-12">简单3步，开通VIP</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '01', icon: '📱', title: '微信扫码', desc: '扫描收款二维码，完成微信支付' },
              { n: '02', icon: '📤', title: '上传截图', desc: '填写微信昵称、付款金额，上传付款截图' },
              { n: '03', icon: '✅', title: '权益发放', desc: '人工审核（1-12小时），通过后自动开通VIP' },
            ].map(s => (
              <Card key={s.n} className="p-6 text-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-qbluedark to-qblue flex items-center justify-center text-xs font-black text-white font-mono mx-auto mb-4">{s.n}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VIP CTA ===== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5 mb-6">
            <Crown size={13} className="text-amber-400" />
            <span className="text-amber-400 text-xs tracking-wider">VIP会员</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">¥{vipPrice} 终身解锁全部资源</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">一次付费，永久有效，解锁 1000+ 课程资源，持续更新不落后。</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['全站课程资源','全站项目资源','持续更新','VIP专属内容','推广赚佣金'].map(p => (
              <span key={p} className="flex items-center gap-1.5 text-sm text-slate-300">
                <Star size={12} className="text-qblue2 fill-qblue2" /> {p}
              </span>
            ))}
          </div>
          <Link href="/vip">
            <Button size="lg" className="text-base px-10">
              <Crown size={17} /> 立即开通 VIP · ¥{vipPrice}
            </Button>
          </Link>
          <p className="text-xs text-slate-600 mt-4">开通即同意《购买须知与退款政策》· 微信扫码支付</p>
        </div>
      </section>
    </>
  )
}
