import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin, CATEGORY_LABELS, ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { AdminResourceForm } from './AdminResourceForm'
import { AdminDeleteBtn } from './AdminDeleteBtn'
import { AdminOrderActions } from './AdminOrderActions'
import { AdminProductForm } from './AdminProductForm'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) redirect('/')

  const [
    { data: resources },
    { data: rawOrders },
    { data: members },
    { data: referrals },
    { data: products },
  ] = await Promise.all([
    supabaseAdmin.from('resources').select('*').order('category').order('sort_order'),
    supabaseAdmin
      .from('orders')
      .select('*, profiles(email, nickname)')
      .order('created_at', { ascending: false })
      .limit(100),
    supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
    supabaseAdmin
      .from('referrals')
      .select('*, referrer:referrer_id(email), referred:referred_user_id(email)')
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin.from('products').select('*').order('sort_order'),
  ])

  const orders = (rawOrders ?? []) as any[]
  const pendingOrders = orders.filter(o => o.status === 'pending_review')
  const otherOrders = orders.filter(o => o.status !== 'pending_review')

  const stats = [
    ['待审订单', pendingOrders.length],
    ['VIP会员', (members ?? []).filter((m: any) => m.is_vip).length],
    ['总订单', orders.length],
    ['资源数量', resources?.length ?? 0],
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Badge variant="blue" className="mb-2">管理后台</Badge>
          <h1 className="text-2xl font-bold text-white">后台管理</h1>
        </div>
        <p className="text-xs text-slate-500">管理员：{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(([l, n]) => (
          <div key={l} className="bg-qpanel border border-qblue/10 rounded-xl p-4 text-center">
            <p className={`text-3xl font-black font-mono ${l === '待审订单' && Number(n) > 0 ? 'text-amber-400' : 'text-white'}`}>{n}</p>
            <p className="text-xs text-slate-500 mt-1">{l}</p>
          </div>
        ))}
      </div>

      {/* ─── PENDING ORDERS (审核中心) ─────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-white">🔔 待审核订单</h2>
          {pendingOrders.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs rounded-full font-medium">
              {pendingOrders.length} 条待处理
            </span>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-qpanel border border-qblue/10 rounded-xl p-8 text-center text-slate-500 text-sm">
            暂无待审核订单
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((o: any) => (
              <div key={o.id} className="bg-qpanel border border-amber-500/20 rounded-xl overflow-hidden">
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-qblue/10 bg-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Badge variant="gold">待审核</Badge>
                    <span className="text-xs font-mono text-slate-400">{o.id.slice(0, 8)}...</span>
                    <span className="text-xs text-slate-500">{formatDate(o.created_at)}</span>
                  </div>
                  <AdminOrderActions orderId={o.id} />
                </div>

                {/* Order body */}
                <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-qblue/10">
                  {/* Left: order info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">商品</p>
                      <p className="text-sm font-semibold text-white">{o.product_name || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">用户邮箱</p>
                        <p className="text-xs text-slate-300">{o.profiles?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">订单金额</p>
                        <p className="text-sm font-mono font-bold text-qblue2">¥{o.amount}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">微信昵称</p>
                        <p className="text-xs text-slate-300">{o.wechat_nickname || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">付款金额</p>
                        <p className="text-xs text-slate-300 font-mono">¥{o.paid_amount}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">付款时间（用户填写）</p>
                      <p className="text-xs text-slate-300">{o.paid_at_claimed || '-'}</p>
                    </div>
                  </div>

                  {/* Right: screenshot */}
                  <div className="p-5">
                    <p className="text-xs text-slate-500 mb-2">付款截图</p>
                    {o.screenshot_url ? (
                      <a href={o.screenshot_url} target="_blank" rel="noopener noreferrer"
                        className="block group">
                        <img
                          src={o.screenshot_url}
                          alt="付款截图"
                          className="max-h-52 w-auto rounded-lg border border-qblue/20 object-contain group-hover:border-qblue/50 transition-all cursor-zoom-in"
                        />
                        <p className="text-xs text-slate-600 mt-1.5 group-hover:text-qblue2 transition-colors">点击查看原图 ↗</p>
                      </a>
                    ) : (
                      <div className="h-32 flex items-center justify-center bg-qdark2 rounded-lg border border-qblue/10 text-slate-600 text-xs">
                        未上传截图
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── ALL ORDERS ─────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">📋 全部订单</h2>
        <div className="overflow-x-auto rounded-xl border border-qblue/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
                {['订单号','商品','用户','金额','状态','提交时间','审核人'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-b border-qblue/5 hover:bg-qpanel/50">
                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">{o.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-[160px] truncate">{o.product_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{o.profiles?.email}</td>
                  <td className="px-4 py-3 text-qblue2 font-mono text-xs">¥{o.amount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ORDER_STATUS_VARIANT[o.status as keyof typeof ORDER_STATUS_VARIANT] ?? 'gray'}>
                      {ORDER_STATUS_LABEL[o.status as keyof typeof ORDER_STATUS_LABEL] ?? o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{o.reviewed_by || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── PRODUCTS ───────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">🛍️ 商品管理</h2>
        <AdminProductForm />
        <div className="overflow-x-auto rounded-xl border border-qblue/10 mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
                {['商品名','类型','价格','状态','操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products?.map((p: any) => (
                <tr key={p.id} className="border-b border-qblue/5 hover:bg-qpanel/50">
                  <td className="px-4 py-3 text-slate-300 text-sm">{p.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.type === 'vip' ? 'gold' : p.type === 'franchise' ? 'blue' : 'green'}>
                      {p.type === 'vip' ? 'VIP' : p.type === 'franchise' ? '加盟' : '课程'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-qblue2 font-mono text-sm">¥{p.price}</td>
                  <td className="px-4 py-3">
                    {p.is_active ? <Badge variant="green">上架</Badge> : <Badge variant="gray">下架</Badge>}
                  </td>
                  <td className="px-4 py-3"><AdminDeleteBtn id={p.id} type="product" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── RESOURCES ──────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">📦 资源管理</h2>
        <AdminResourceForm />
        <div className="overflow-x-auto rounded-xl border border-qblue/10 mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
                {['标题','分类','VIP','操作'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {resources?.map(r => (
                <tr key={r.id} className="border-b border-qblue/5 hover:bg-qpanel/50">
                  <td className="px-4 py-3 text-slate-300 max-w-[260px] truncate text-xs">{r.title}</td>
                  <td className="px-4 py-3"><Badge variant="blue">{CATEGORY_LABELS[r.category] ?? r.category}</Badge></td>
                  <td className="px-4 py-3">{r.is_vip ? <Badge variant="gold">VIP</Badge> : <Badge variant="gray">免费</Badge>}</td>
                  <td className="px-4 py-3"><AdminDeleteBtn id={r.id} type="resource" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── MEMBERS ────────────────────────────────────────────── */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">👥 会员列表</h2>
        <div className="overflow-x-auto rounded-xl border border-qblue/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
                {['邮箱','昵称','VIP','站长','推广码','注册时间'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members?.map((m: any) => (
                <tr key={m.id} className="border-b border-qblue/5 hover:bg-qpanel/50">
                  <td className="px-4 py-3 text-slate-400 text-xs">{m.email}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{m.nickname || '-'}</td>
                  <td className="px-4 py-3">{m.is_vip ? <Badge variant="gold">VIP</Badge> : <Badge variant="gray">普通</Badge>}</td>
                  <td className="px-4 py-3">{m.is_franchise ? <Badge variant="blue">站长</Badge> : <span className="text-slate-600 text-xs">-</span>}</td>
                  <td className="px-4 py-3 font-mono text-qblue3 text-xs">{m.ref_code}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── REFERRALS ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">💰 推广佣金</h2>
        <div className="overflow-x-auto rounded-xl border border-qblue/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
                {['推广人','成交用户','佣金','状态','时间'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(referrals ?? []).map((r: any) => (
                <tr key={r.id} className="border-b border-qblue/5 hover:bg-qpanel/50">
                  <td className="px-4 py-3 text-slate-400 text-xs">{r.referrer?.email}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{r.referred?.email}</td>
                  <td className="px-4 py-3 text-qblue2 font-mono text-xs">¥{r.commission_amount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === 'settled' ? 'green' : r.status === 'pending' ? 'gold' : 'gray'}>
                      {r.status === 'settled' ? '已结算' : r.status === 'pending' ? '待结算' : '已取消'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
