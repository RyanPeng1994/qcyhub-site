import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <Badge variant="blue" className="mb-4">重要须知</Badge>
      <h1 className="text-3xl font-bold text-white mb-2">购买须知与退款政策</h1>
      <p className="text-slate-500 text-sm mb-10">最后更新：2024年</p>
      <Card className="p-8 space-y-8">
        {[
          { title: '一、服务性质', content: '本产品为虚拟数字资源服务，包含AI实战课程、自媒体运营课程、电商运营课程、短视频课程、创业项目及配套资源等数字内容。' },
          { title: '二、VIP权益说明', content: 'VIP开通后可立即查看全站会员资源。会员权益实时生效，无需等待审核。' },
          { title: '三、退款政策', content: '由于虚拟资源具有可复制、可查看、可下载的特性，会员权益开通后原则上不支持无理由退款。如遇以下特殊情况，可联系客服申请处理：\n· 重复付款（同一账号重复开通）\n· 技术故障导致无法正常访问\n· 资源链接大面积失效且未在合理时间内修复' },
          { title: '四、禁止行为', content: '· 禁止恶意退款、恶意投诉\n· 禁止倒卖、转售会员资源\n· 禁止传播、分享VIP资源链接给非会员\n· 禁止以任何方式破解、绕过会员验证系统\n违反上述规定，平台有权取消会员资格，不予退款，并保留追究法律责任的权利。' },
          { title: '五、联系方式', content: '如遇问题，请通过以下方式联系客服：\n· 微信：qcyhub\n· 邮箱：ricyuan1994@gmail.com\n· 公众号：QCY Hub' },
          { title: '六、最终解释权', content: '本政策最终解释权归 QCY轻创业资源库 所有。平台保留对本政策进行更新和修改的权利，修改后将在网站公告。' },
        ].map(item => (
          <div key={item.title}>
            <h2 className="text-base font-bold text-white mb-3">{item.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </Card>
    </div>
  )
}
