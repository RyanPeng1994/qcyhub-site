import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'blue' | 'gold' | 'green' | 'gray' | 'red'
  className?: string
}

export function Badge({ children, variant = 'blue', className }: BadgeProps) {
  const variants = {
    blue:  'bg-qblue/10 text-qblue3 border-qblue/25',
    gold:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    gray:  'bg-slate-500/10 text-slate-400 border-slate-500/25',
    red:   'bg-red-500/10 text-red-400 border-red-500/25',
  }
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border tracking-wide',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}
