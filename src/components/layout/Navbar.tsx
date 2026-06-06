'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { useUser } from '@/hooks/useUser'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/resources', label: '课程资源' },
  { href: '/vip', label: 'VIP会员' },
  { href: '/promote', label: '推广赚钱' },
  { href: '/franchise', label: '站长加盟' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useUser()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-qblack/90 backdrop-blur-xl border-b border-qblue/10 flex items-center px-4 md:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mr-8 flex-shrink-0">
        <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-qblue to-qaccent flex items-center justify-center font-mono font-black text-sm text-white">QC</span>
        <span className="font-bold text-white text-[15px] tracking-wide hidden sm:block">
          轻创业<span className="text-qblue2">资源库</span>
        </span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1 flex-1">
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href}
            className={cn('px-3 py-1.5 text-[13.5px] rounded transition-colors',
              pathname === l.href ? 'text-qblue2' : 'text-slate-400 hover:text-slate-200')}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="hidden md:flex items-center gap-2 ml-auto">
        {loading ? null : profile ? (
          <>
            {profile.is_vip && (
              <span className="flex items-center gap-1 text-xs text-amber-400 border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 rounded-full">
                <Crown size={11} /> VIP
              </span>
            )}
            <Link href="/admin" className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1">
              {profile.nickname || profile.email}
            </Link>
            <button onClick={handleLogout}
              className="text-xs border border-qblue/20 text-slate-400 hover:text-slate-200 hover:border-qblue/40 px-3 py-1.5 rounded transition-all">
              退出
            </button>
          </>
        ) : (
          <>
            <Link href="/login"
              className="text-sm border border-qblue/20 text-slate-400 hover:border-qblue/50 hover:text-qblue2 px-4 py-1.5 rounded transition-all">
              登录
            </Link>
            <Link href="/vip"
              className="text-sm bg-gradient-to-r from-qbluedark to-qblue text-white font-medium px-4 py-1.5 rounded hover:-translate-y-0.5 hover:shadow-lg hover:shadow-qblue/30 transition-all">
              开通VIP · ¥99
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden ml-auto p-1" onClick={() => setOpen(!open)}>
        {open ? <X size={22} className="text-slate-400" /> : <Menu size={22} className="text-slate-400" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-qblack/98 border-b border-qblue/10 flex flex-col py-2 md:hidden">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="px-6 py-3.5 text-sm text-slate-400 hover:text-qblue2 border-b border-qblue/5 last:border-0">
              {l.label}
            </Link>
          ))}
          {profile ? (
            <button onClick={handleLogout} className="px-6 py-3.5 text-sm text-slate-400 text-left">退出登录</button>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="px-6 py-3.5 text-sm text-slate-400">登录</Link>
              <Link href="/vip" onClick={() => setOpen(false)} className="px-6 py-3.5 text-sm text-qblue2 font-medium">开通VIP · ¥99</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
