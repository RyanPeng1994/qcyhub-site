'use client'
import { useState } from 'react'
import { Crown, Building2, BookOpen } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Card } from './Card'
import { PayModal } from './PayModal'
import { cn } from '@/lib/utils'
import type { Product, Profile } from '@/types'

interface ProductCardProps {
  product: Product
  profile: Profile | null
}

const TYPE_ICON = {
  vip:      <Crown size={20} className="text-amber-400" />,
  franchise:<Building2 size={20} className="text-qblue2" />,
  course:   <BookOpen size={20} className="text-emerald-400" />,
}

const TYPE_BADGE = {
  vip:      <Badge variant="gold">VIP会员</Badge>,
  franchise:<Badge variant="blue">站长加盟</Badge>,
  course:   <Badge variant="green">单独课程</Badge>,
}

export function ProductCard({ product, profile }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)

  const alreadyOwned =
    (product.grants_vip && profile?.is_vip) ||
    (product.grants_franchise && profile?.is_franchise)

  return (
    <>
      <Card hover className="flex flex-col overflow-hidden relative">
        {/* gradient top bar */}
        <div className={cn(
          'h-0.5 w-full',
          product.type === 'vip' ? 'bg-gradient-to-r from-amber-500 to-amber-300' :
          product.type === 'franchise' ? 'bg-gradient-to-r from-qbluedark to-qaccent' :
          'bg-gradient-to-r from-emerald-600 to-emerald-400'
        )} />

        {/* Cover image */}
        {product.cover_url && (
          <div className="h-36 overflow-hidden bg-qdark2">
            <img src={product.cover_url} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {TYPE_ICON[product.type]}
              {TYPE_BADGE[product.type]}
            </div>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">{product.name}</h3>

          {product.description && (
            <p className="text-xs text-slate-500 leading-relaxed flex-1 line-clamp-4">{product.description}</p>
          )}

          <div className="pt-3 border-t border-qblue/10 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-qblue2 font-bold text-sm">¥</span>
              <span className="text-3xl font-black text-white font-mono leading-none">{product.price}</span>
            </div>
            {alreadyOwned ? (
              <span className="text-xs text-emerald-400 border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                ✅ 已拥有
              </span>
            ) : !profile ? (
              <a href="/auth/login">
                <Button size="sm">登录后购买</Button>
              </a>
            ) : (
              <Button size="sm" onClick={() => setShowModal(true)}>
                立即购买
              </Button>
            )}
          </div>
        </div>
      </Card>

      {showModal && <PayModal product={product} onClose={() => setShowModal(false)} />}
    </>
  )
}
