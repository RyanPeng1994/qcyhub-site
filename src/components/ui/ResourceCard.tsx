'use client'
import Link from 'next/link'
import { Lock, ExternalLink, Crown } from 'lucide-react'
import { Badge } from './Badge'
import { Card } from './Card'
import { Button } from './Button'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils'
import type { Resource } from '@/types'

interface ResourceCardProps {
  resource: Resource
  isVip: boolean
  isLoggedIn: boolean
}

export function ResourceCard({ resource, isVip, isLoggedIn }: ResourceCardProps) {
  const canAccess = isVip || !resource.is_vip

  return (
    <Card hover className="flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-qbluedark to-qblue" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="blue">
            {CATEGORY_ICONS[resource.category]} {CATEGORY_LABELS[resource.category] ?? resource.category}
          </Badge>
          {resource.is_vip && <Badge variant="gold"><Crown size={9} className="mr-0.5" />VIP专属</Badge>}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{resource.title}</h3>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">{resource.description}</p>
        )}

        {/* Action */}
        <div className="pt-2 border-t border-qblue/10">
          {canAccess && resource.pan_url ? (
            <a href={resource.pan_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="w-full gap-1.5">
                <ExternalLink size={12} /> 获取网盘链接
              </Button>
            </a>
          ) : !isLoggedIn ? (
            <Link href="/auth/login">
              <Button size="sm" variant="secondary" className="w-full gap-1.5">
                <Lock size={12} /> 登录后查看
              </Button>
            </Link>
          ) : (
            <Link href="/vip">
              <Button size="sm" variant="secondary" className="w-full gap-1.5 border-amber-500/30 text-amber-400 hover:border-amber-400">
                <Crown size={12} /> 开通VIP解锁
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
