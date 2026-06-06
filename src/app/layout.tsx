import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'QCY轻创业资源库 - 打破信息差 · 开启创业之路',
  description: '汇聚AI实战、自媒体运营、电商创业、网赚项目等优质资源。1000+资源，99元开通VIP终身会员。',
  keywords: 'AI课程,自媒体运营,电商课程,网赚项目,轻创业,副业,信息差',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-qblack text-slate-200 antialiased">
        <div className="fixed inset-0 grid-bg pointer-events-none z-0" />
        <Navbar />
        <main className="relative z-10 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
