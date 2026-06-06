'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export function AdminProductForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    name: '', slug: '', type: 'vip', price: 99,
    description: '', cover_url: '',
    grants_vip: false, grants_franchise: false,
    is_active: true, sort_order: 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        grants_vip: form.type === 'vip',
        grants_franchise: form.type === 'franchise',
      }),
    })
    const data = await res.json()
    if (!res.ok) { setMsg('错误：' + data.error); setLoading(false); return }
    setMsg('✅ 商品已添加')
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  if (!open) return (
    <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>+ 添加商品</Button>
  )

  return (
    <Card className="p-5 mb-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="商品名称" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Input label="slug（唯一标识）" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="vip / franchise / course_xxx" required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">商品类型</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="px-3 py-2.5 bg-qdark2 border border-qblue/20 rounded-lg text-slate-200 text-sm outline-none focus:border-qblue/50">
            <option value="vip">VIP会员</option>
            <option value="franchise">站长加盟</option>
            <option value="course">单独课程</option>
          </select>
        </div>
        <Input label="价格（元）" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} required />
        <div className="md:col-span-2">
          <Input label="商品简介" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <Input label="封面图 URL（可选）" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} />
        <Input label="排序" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        <div className="md:col-span-2 flex items-center gap-4">
          <Button type="submit" loading={loading} size="sm">添加商品</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>取消</Button>
          {msg && <span className="text-xs text-emerald-400">{msg}</span>}
        </div>
      </form>
    </Card>
  )
}
