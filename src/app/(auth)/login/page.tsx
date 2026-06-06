'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-qblue to-qaccent flex items-center justify-center font-mono font-black text-sm text-white">QC</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">欢迎回来</h1>
          <p className="text-slate-500 text-sm">登录您的账号</p>
        </div>
        <Card className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="邮箱" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            <Input label="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="md">登录</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            还没账号？<Link href="/register" className="text-qblue2 hover:underline">免费注册</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
