import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
  {
    variants: {
      variant: {
        default: 'border-slate-900/10 bg-slate-900/[0.06] text-slate-700',
        gold: 'border-amber-200 bg-amber-100/80 text-amber-800',
        success: 'border-emerald-200 bg-emerald-100/80 text-emerald-800',
        warning: 'border-orange-200 bg-orange-100/80 text-orange-800',
        danger: 'border-rose-200 bg-rose-100/80 text-rose-800',
        outline: 'border-slate-300 bg-transparent text-slate-700'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
))
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
