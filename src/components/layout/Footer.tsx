import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-qblue/10 bg-qdark mt-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-qblue to-qaccent flex items-center justify-center font-mono font-black text-xs text-white">QC</span>
              <span className="font-bold text-white">轻创业<span className="text-qblue2">资源库</span></span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">专注打破信息差，分享AI实战、自媒体、电商创业等优质资源。</p>
          </div>
          <div>
            <p className="text-slate-300 text-xs font-semibold mb-3 tracking-wider uppercase">快速导航</p>
            {[['/', '首页'], ['/resources', '课程资源'], ['/vip', '开通VIP'], ['/promote', '推广赚钱']].map(([h, l]) => (
              <Link key={h} href={h} className="block text-slate-500 text-xs py-1 hover:text-qblue2 transition-colors">{l}</Link>
            ))}
          </div>
          <div>
            <p className="text-slate-300 text-xs font-semibold mb-3 tracking-wider uppercase">会员服务</p>
            {[['/vip', 'VIP会员'], ['/franchise', '站长加盟'], ['/refund-policy', '退款政策']].map(([h, l]) => (
              <Link key={h} href={h} className="block text-slate-500 text-xs py-1 hover:text-qblue2 transition-colors">{l}</Link>
            ))}
          </div>
          <div>
            <p className="text-slate-300 text-xs font-semibold mb-3 tracking-wider uppercase">联系我们</p>
            <p className="text-slate-500 text-xs py-1">微信：qcyhub</p>
            <p className="text-slate-500 text-xs py-1">邮箱：ricyuan1994@gmail.com</p>
            <p className="text-slate-500 text-xs py-1">公众号：QCY Hub</p>
          </div>
        </div>
        <div className="border-t border-qblue/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-slate-600 text-xs">© 2024 QCY轻创业资源库 · 保留所有权利</p>
          <p className="text-slate-600 text-xs">ICP备XXXXXXXX号</p>
        </div>
      </div>
    </footer>
  )
}
