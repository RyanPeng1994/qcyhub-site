'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Badge } from '@/components/ui/Badge'
import { AdminOrderActions } from './AdminOrderActions'
import { AdminResourceForm } from './AdminResourceForm'
import { AdminDeleteBtn } from './AdminDeleteBtn'
import { AdminProductForm } from './AdminProductForm'
import { CATEGORY_LABELS, ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT, formatDate } from '@/lib/utils'

const ADMIN_EMAIL = '171214342@qq.com'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [data, setData] = useState<any>({
    orders: [], resources: [], members: [], referrals: [], products: []
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      setSession(session)

      const token = session.access_token
      const h = { 'Authorization': `Bearer ${token}` }

      const [orders, resources, members, products] = await Promise.all([
        fetch('/api/admin/data?table=orders', { headers: h }).then(r => r.json()),
        fetch('/api/admin/data?table=resources', { headers: h }).then(r => r.json()),
        fetch('/api/admin/data?table=members', { headers: h }).then(r => r.json()),
        fetch('/api/admin/data?table=products', { headers: h }).then(r => r.json()),
      ])

      setData({ orders, resources, members, products })
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-qblue/30 border-t-qblue rounded-full animate-spin" />
    </div>
  )

  const orders = Array.isArray(data.orders) ? data.orders : []
  const pendingOrders = orders.filter((o: any) => o.status === 'pending_review')

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Badge variant="blue" className="mb-2">管理后台</Badge>
          <h1 className="text-2xl font-bold text-white">后台管理</h1>
        </div>
        <p className="text-xs text-slate-500">管理员：{session?.user?.email}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          ['待审订单', pendingOrders.length],
          ['VIP会员', (data.members ?? []).filter((m: any) => m.is_vip).length],
          ['总订单', orders.length],
          ['资源数量', data.resources?.length ?? 0],
        ].map(([l, n]) => (
          <div key={l} className="bg-qpanel border border-qblue/10 rounded-xl p-4 text-center">
            <p className={`text-3xl font-black font-mono ${l === '待审订单' && Number(n) > 0 ? 'text-amber-400' : 'text-white'}`}>{n}</p>
            <p className="text-xs text-slate-500 mt-1">{l}</p>
          </div>
        ))}
      </div>

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
          <div className="bg-qpanel border border-qblue/10 rounded-xl p-8 text-center text-slate-500 text-sm">暂无待审核订单</div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((o: any) => (
              <div key={o.id} className="bg-qpanel border border-amber-500/20 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-qblue/10 bg-amber-500/5">
                  <div className="flex items-center gap-3">
                    <Badge variant="gold">待审核</Badge>
                    <span className="text-xs font-mono text-slate-400">{o.id.slice(0, 8)}...</span>
                    <span className="text-xs text-slate-500">{formatDate(o.created_at)}</span>
                  </div>
                  <AdminOrderActions orderId={o.id} />
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-qblue/10">
                  <div className="p-5 space-y-3">
                    <div><p className="text-xs text-slate-500 mb-1">商品</p><p className="text-sm font-semibold text-white">{o.product_name || '-'}</p></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><p className="text-xs text-slate-500 mb-1">用户邮箱</p><p className="text-xs text-slate-300">{o.profiles?.email}</p></div>
                      <div><p className="text-xs text-slate-500 mb-1">订单金额</p><p className="text-sm font-mono font-bold text-qblue2">¥{o.amount}</p></div>
                    </div>
                    <div><p className="text-xs text-slate-500 mb-1">微信昵称</p><p className="text-xs text-slate-300">{o.wechat_nickname || '-'}</p></div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-slate-500 mb-2">付款截图</p>
                    {o.screenshot_url ? (
                      <a href={o.screenshot_url} target="_blank" rel="noopener noreferrer" className="block group">
                        <img src={o.screenshot_url} alt="付款截图" className="max-h-52 w-auto rounded-lg border border-qblue/20 object-contain cursor-zoom-in" />
                        <p className="text-xs text-slate-600 mt-1.5 group-hover:text-qblue2">点击查看原图 ↗</p>
                      </a>
                    ) : (
                      <div className="h-32 flex items-center justify-center bg-qdark2 rounded-lg border border-qblue/10 text-slate-600 text-xs">未上传截图</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">📋 全部订单</h2>
        <div className="overflow-x-auto rounded-xl border border-qblue/10">
          <table className="w-full text-sm">
            <thead><tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
              {['订单号','商品','用户','金额','状态','提交时间'].map(h => <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>)}
            </tr></thead>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">🛍️ 商品管理</h2>
        <AdminProductForm />
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4">📦 资源管理</h2>
        <AdminResourceForm />
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-4">👥 会员列表</h2>
        <div className="overflow-x-auto rounded-xl border border-qblue/10">
          <table className="w-full text-sm">
            <thead><tr className="bg-qpanel border-b border-qblue/10 text-slate-500 text-xs">
              {['邮箱','昵称','VIP','推广码','注册时间'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {(data.members ?? []).map((m: any) => (
                <tr key={m.id} className="border-b border-qblue/5 hover:bg-qpanel/50">
                  <td className="px-4 py-3 text-slate-400 text-xs">{m.email}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{m.nickname || '-'}</td>
                  <td className="px-4 py-3">{m.is_vip ? <Badge variant="gold">VIP</Badge> : <Badge variant="gray">普通</Badge>}</td>
                  <td className="px-4 py-3 font-mono text-qblue3 text-xs">{m.ref_code}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
