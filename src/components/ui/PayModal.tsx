'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useUser } from '@/hooks/useUser'
import { Button } from './Button'
import { Input } from './Input'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface PayModalProps {
  product: Product
  onClose: () => void
}

type Step = 'qr' | 'upload' | 'done'

export function PayModal({ product, onClose }: PayModalProps) {
  const [step, setStep] = useState<Step>('qr')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { profile } = useUser()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('截图文件不能超过 5MB'); return }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setError('')
  }

const handleSubmit = async () => {
  if (!nickname.trim()) { setError('请填写微信昵称'); return }
  if (!file) { setError('请上传付款截图'); return }

  setSubmitting(true); setError('')

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('请先登录后再提交')

    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('payment-screenshots')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadErr) throw new Error('截图上传失败：' + uploadErr.message)

    const { data: urlData } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(path)
    const screenshotUrl = urlData?.publicUrl ?? path

    const res = await fetch('/api/orders/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        product_id: product.id,
        wechat_nickname: nickname.trim(),
        paid_amount: product.price,
        paid_at_claimed: new Date().toLocaleString('zh-CN'),
        screenshot_url: screenshotUrl,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '提交失败')

    setOrderId(data.order_id)
    setStep('done')
  } catch (e: any) {
    setError(e.message)
  } finally {
    setSubmitting(false)
  }
}
