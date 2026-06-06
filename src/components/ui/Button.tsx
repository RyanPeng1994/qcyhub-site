import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-gradient-to-r from-qbluedark to-qblue text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-qblue/30',
      secondary: 'border border-qblue/25 text-slate-300 hover:border-qblue/50 hover:text-qblue2',
      ghost: 'text-slate-400 hover:text-slate-200',
      danger: 'bg-red-600/80 text-white hover:bg-red-600',
    }
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-8 py-3.5 text-base' }
    return (
      <button ref={ref} disabled={disabled || loading} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
