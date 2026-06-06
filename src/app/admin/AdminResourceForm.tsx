'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CATEGORY_LABELS } from '@/lib/utils'

export function AdminResourceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'ai', description: '', pan_url: '', is_vip: true, sort_order: 0 })
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg('')
    const res = await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error); setLoading(false); return }
    setMsg('✅ 资源已添加')
    setForm({ title: '', category: 'ai', description: '', pan_url: '', is_vip: true, sort_order: 0 })
    router.refresh()
    setLoading(false)
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="课程标题" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">分类</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="px-3.5 py-2.5 bg-qdark2 border border-qblue/20 rounded-lg text-slate-200 text-sm outline-none focus:border-qblue/50">
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <Input label="简介" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <Input label="网盘链接" value={form.pan_url} onChange={e => setForm(f => ({ ...f, pan_url: e.target.value }))} />
        <Input label="排序（数字越小越前）" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
        <div className="flex items-center gap-2 mt-6">
          <input type="checkbox" id="is_vip" checked={form.is_vip} onChange={e => setForm(f => ({ ...f, is_vip: e.target.checked }))} className="accent-qblue" />
          <label htmlFor="is_vip" className="text-sm text-slate-400">VIP专属资源</label>
        </div>
        <div className="md:col-span-2 flex items-center gap-4">
          <Button type="submit" loading={loading}>添加资源</Button>
          {msg && <span className="text-sm text-emerald-400">{msg}</span>}
        </div>
      </form>
    </Card>
  )
}
