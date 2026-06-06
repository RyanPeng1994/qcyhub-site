'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

interface AdminDeleteBtnProps {
  id: string
  type: 'resource' | 'product'
}

export function AdminDeleteBtn({ id, type }: AdminDeleteBtnProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(type === 'resource' ? '确认删除此资源？' : '确认下架此商品？')) return
    setLoading(true)
    const url = type === 'resource' ? `/api/resources/${id}` : `/api/admin/products/${id}`
    const method = type === 'resource' ? 'DELETE' : 'DELETE'
    await fetch(url, { method })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}
