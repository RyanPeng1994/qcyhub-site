import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase-server'

export default async function PromotePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }
  const refLink = profile?.ref_code
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://yoursite.com'}/?ref=${profile.ref_code}`
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <Badge variant="blue" className="mb-4">推广赚钱</Badge>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">推广VIP，赚取<span className="text-qblue2">高额奖励</span></h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          加入QCY轻创业资源库VIP，不仅可以学习全站AI实战、自媒体、电商、网赚项目课程，还可以推广会员赚取佣金，实现边学习边变现。
        </p>
      </div>

      {/* 我的推广链接 */}
      {profile?.is_vip && refLink && (
        <Card className="p-6 mb-10 border-qblue/25">
          <p className="text-sm font-semibold text-white mb-3">🔗 我的专属推广链接</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs text-qblue3 bg-qdark2 border border-qblue/20 rounded-lg px-3 py-2.5 break-all">{refLink}</code>
            <button onClick={() => navigator.clipboard.writeText(refLink)}
              className="text-xs bg-qblue/10 border border-qblue/25 text-qblue2 px-4 py-2 rounded-lg hover:bg-qblue/20 transition-all whitespace-nowrap">
              复制
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">通过此链接注册并购买VIP的用户，将自动关联到您的推广记录</p>
        </Card>
      )}

      {!profile && (
        <Card className="p-5 mb-8 border-amber-500/20 bg-amber-500/5 text-center">
          <p className="text-amber-400 text-sm font-semibold mb-2">开通VIP后即可申请推广资格，获取专属推广链接</p>
          <Link href="/vip"><Button size="sm">立即开通VIP</Button></Link>
        </Card>
      )}

      {/* 核心卖点 */}
      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {[
          { icon: '💰', title: 'VIP会员推广奖励', desc: '推广一位用户开通99元VIP会员，最高可获得80%推广奖励，每笔成交均有记录可查。' },
          { icon: '🔄', title: '课程资源持续更新', desc: 'AI实战、自媒体运营、电商运营、短视频、引流推广、网赚项目持续更新，推广内容永不过时。' },
          { icon: '🌱', title: '新手也能推广', desc: '提供推广文案、海报素材、朋友圈话术、短视频脚本，适合零基础操作，开箱即用。' },
          { icon: '📊', title: '结算清晰透明', desc: '每笔推广记录均可登记查询，达到结算条件后通过微信或支付宝结算，流程简洁明了。' },
        ].map(item => (
          <Card key={item.title} hover className="p-6 flex gap-4">
            <span className="text-3xl flex-shrink-0">{item.icon}</span>
            <div>
              <p className="font-bold text-white mb-2">{item.title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* 推广流程 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          推广流程 <span className="flex-1 h-px bg-qblue/10" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[['01','👑','开通VIP会员'],['02','💬','联系客服申请推广'],['03','🎨','获取推广素材'],['04','📢','分享给潜在用户'],['05','🎁','成交后获得奖励']].map(([n,ico,txt]) => (
            <Card key={n} className="p-5 text-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-qbluedark to-qblue flex items-center justify-center text-xs font-black text-white font-mono mx-auto mb-3">{n}</div>
              <div className="text-2xl mb-2">{ico}</div>
              <p className="text-xs text-slate-400 leading-snug">{txt}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 收益示例 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          推广收益示例 <span className="flex-1 h-px bg-qblue/10" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[['推广 10 单', '792'], ['推广 50 单', '3,960'], ['推广 100 单', '7,920']].map(([label, amt]) => (
            <Card key={label} className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-qbluedark to-qblue" />
              <p className="text-xs text-slate-500 mb-2">{label} VIP</p>
              <p className="text-4xl font-black text-white font-mono">{amt}<span className="text-2xl text-qblue2">元</span></p>
              <p className="text-xs text-slate-600 mt-2">预计奖励参考</p>
            </Card>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-4 p-4 bg-qblue/5 border border-qblue/10 rounded-lg">
          ℹ️ 以上数据仅为示例，基于 99元 × 80% 比例计算，实际奖励以平台审核结果和最终规则为准，不代表任何收益承诺。
        </p>
      </section>

      <div className="text-center">
        <Link href="/contact" aria-label="申请推广">
          <Button size="lg">立即申请推广资格 →</Button>
        </Link>
        <p className="text-xs text-slate-600 mt-4 max-w-xl mx-auto">
          ⚠️ 风险提示：推广奖励以实际成交和平台审核为准，禁止虚假宣传、诱导交易、违法违规推广。
        </p>
      </div>
    </div>
  )
}
