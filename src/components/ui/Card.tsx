import { cn } from '@/lib/utils'

interface CardProps { children: React.ReactNode; className?: string; hover?: boolean }

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn(
      'bg-qpanel border border-qblue/10 rounded-xl',
      hover && 'transition-all hover:border-qblue/25 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40',
      className
    )}>
      {children}
    </div>
  )
}
