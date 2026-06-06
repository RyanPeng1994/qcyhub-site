'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
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

    setSubmitting(true)
    setError('')

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-qpanel border border-qblue/30 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-qbluedark via-qblue to-qaccent" />

        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <X size={18} />
        </button>

        {step === 'qr' && (
          <div className="p-6">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold text-white mb-1">{product.name}</h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-qblue2 text-lg font-bold">¥</span>
                <span className="text-5xl font-black text-white font-mono">{product.price}</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">微信扫码付款</p>
            </div>

            {product.description && (
              <div className="mb-4 p-3 bg-qdark2 border border-qblue/10 rounded-xl text-xs text-slate-400 leading-relaxed">
                {product.description}
              </div>
            )}

            <div className="bg-white rounded-xl p-4 flex items-center justify-center mb-4 mx-auto w-52 h-52">
              <img
                src="/images/pay-qr.jpg"
                alt="微信收款码"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const t = e.currentTarget
                  t.style.display = 'none'
                  const next = t.nextElementSibling as HTMLElement
                  if (next) next.style.display = 'flex'
                }}
              />
              <div style={{display:'none'}} className="flex-col items-center gap-2 text-slate-400 w-full h-full justify-center">
                <div className="w-16 h-16 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-2xl">📱</div>
                <p className="text-xs text-center">请将二维码图片<br/>放到 /public/images/pay-qr.jpg</p>
              </div>
            </div>

            <p className="text-center text-sm text-slate-300 mb-1">
              请使用微信扫码支付 <strong className="text-white font-mono">¥{product.price}</strong>
            </p>
            <p className="text-center text-xs text-slate-500 mb-6">付款成功后点击下方按钮上传凭证</p>

            <Button onClick={() => setStep('upload')} className="w-full" size="md">
              我已付款，上传凭证 →
            </Button>
          </div>
