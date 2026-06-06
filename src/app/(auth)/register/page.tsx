'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { AlertCircle, CheckCircle } from 'lucide-react'

function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const params = useSearchParams()
  const ref = params.get('ref') // referral code
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { ref_code: ref } }
    })
    if (err) { setError(err.message); setLoading(false); return }
    // If ref code, record it via API
    if (ref) {
      await fetch('/api/user/record-ref', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref_code: ref }),
      })
    }
    setDone(true)
    setLoading(false)
  }

  if (done) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="p-8 max-w-sm w-full text-center">
        <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">注册成功！</h2>
        <p className="text-slate-400 text-sm mb-4">请检查邮箱完成验证，然后登录</p>
        <Link href="/auth/login"><Button className="w-full">前往登录</Button></Link>
      </Card>
    </div>
  )

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-qblue to-qaccent flex items-center justify-center font-mono font-black text-sm text-white">QC</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">创建账号</h1>
          <p className="text-slate-500 text-sm">免费注册，立即开始学习</p>
          {ref && <p className="text-xs text-qblue3 mt-2">🎉 通过推广链接注册</p>}
        </div>
        <Card className="p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input label="邮箱" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            <Input label="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少8位" minLength={8} required />
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="md">注册</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            已有账号？<Link href="/auth/login" className="text-qblue2 hover:underline">立即登录</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
