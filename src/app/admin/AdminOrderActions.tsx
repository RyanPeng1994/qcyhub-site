'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function AdminOrderActions({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const call = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectNote.trim()) {
      setShowRejectInput(true)
      return
    }
    if (!confirm(action === 'approve' ? '确认通过审核并发放权益？' : '确认拒绝此订单？')) return

    setLoading(action)
    setMsg('')
    try {
      const res = await fetch('/api/admin/orders/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, action, note: rejectNote }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg(action === 'approve' ? '✅ 已通过，权益已发放' : '❌ 已拒绝')
      setTimeout(() => router.refresh(), 800)
    } catch (e: any) {
      setMsg('错误：' + e.message)
    } finally {
      setLoading(null)
    }
  }

  if (msg) return <span className="text-xs text-slate-400">{msg}</span>

  return (
    <div className="flex items-center gap-2">
      {showRejectInput && (
        <input
          autoFocus
          value={rejectNote}
          onChange={e => setRejectNote(e.target.value)}
          placeholder="拒绝原因（必填）"
          className="text-xs px-2 py-1 bg-qdark2 border border-red-500/30 rounded text-slate-300 outline-none w-40"
          onKeyDown={e => e.key === 'Enter' && call('reject')}
        />
      )}
      <button
        onClick={() => call('approve')}
        disabled={!!loading}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 rounded-lg transition-all disabled:opacity-50"
      >
        {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
        通过审核
      </button>
      <button
        onClick={() => showRejectInput ? call('reject') : setShowRejectInput(true)}
        disabled={!!loading}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 rounded-lg transition-all disabled:opacity-50"
      >
        {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
        拒绝
      </button>
    </div>
  )
}
