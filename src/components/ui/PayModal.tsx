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

    setSubmitting(true); setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('请先登录')

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
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
        headers: { 'Content-Type': 'application/json' },
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

        {/* STEP 1: QR Code */}
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
        )}

        {/* STEP 2: Upload */}
        {step === 'upload' && (
          <div className="p-6">
            <h2 className="text-base font-bold text-white mb-4">📤 上传付款凭证</h2>

            <div className="space-y-4">
              <Input
                label="微信昵称"
                placeholder="请填写付款时的微信昵称"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />

              <div>
                <p className="text-sm text-slate-400 mb-2">付款截图</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-qblue/20">
                    <img src={previewUrl} alt="截图预览" className="w-full max-h-48 object-contain bg-qdark2" />
                    <button
                      onClick={() => { setFile(null); setPreviewUrl(null) }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      'w-full h-32 border-2 border-dashed border-qblue/25 rounded-xl',
                      'flex flex-col items-center justify-center gap-2',
                      'text-slate-500 hover:border-qblue/50 hover:text-slate-300 transition-all'
                    )}
                  >
                    <Upload size={22} />
                    <span className="text-xs">点击上传付款截图</span>
                    <span className="text-xs text-slate-600">支持 JPG / PNG，最大 5MB</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                <AlertCircle size={13} className="flex-shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Button variant="secondary" onClick={() => setStep('qr')} className="flex-1" size="md" disabled={submitting}>
                返回
              </Button>
              <Button onClick={handleSubmit} loading={submitting} className="flex-1" size="md">
                提交审核
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === 'done' && (
          <div className="p-8 text-center">
            <CheckCircle size={52} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">凭证已提交！</h2>
            <p className="text-slate-400 text-sm mb-2">
              我们将在 <strong className="text-white">1-12小时</strong> 内审核您的付款凭证
            </p>
            {orderId && (
              <p className="text-xs text-slate-500 mb-6">
                订单号：<span className="font-mono text-qblue3">{orderId.slice(0, 8)}...</span>
              </p>
            )}
            <p className="text-xs text-slate-600 mb-6">审核通过后权益将自动发放，如有疑问请联系微信客服：qcyhub</p>
            <Button onClick={() => { onClose(); router.refresh() }} className="w-full" size="md">
              知道了
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
