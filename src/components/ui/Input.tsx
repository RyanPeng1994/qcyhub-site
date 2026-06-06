import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm text-slate-400">{label}</label>}
    <input ref={ref}
      className={cn('w-full px-3.5 py-2.5 bg-qdark2 border border-qblue/20 rounded-lg text-slate-200 text-sm placeholder:text-slate-600 outline-none focus:border-qblue/50 transition-colors', error && 'border-red-500/50', className)}
      {...props} />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
))
Input.displayName = 'Input'
