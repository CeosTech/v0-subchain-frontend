import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.18),transparent_55%)] after:opacity-0 after:transition-opacity after:duration-300 group-hover:after:opacity-100',
  {
    variants: {
      variant: {
        default:
          'bg-[radial-gradient(circle_at_10%_0%,rgba(148,163,255,0.6),transparent_55%),linear-gradient(135deg,#6366f1,#8b5cf6_55%,#0ea5e9)] text-primary-foreground shadow-[0_20px_40px_-24px_rgba(99,102,241,0.8)] hover:shadow-[0_26px_50px_-22px_rgba(99,102,241,0.95)]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[0_18px_38px_-22px_rgba(220,38,38,0.5)] hover:bg-destructive/90',
        outline:
          'border border-white/10 bg-transparent text-foreground hover:border-white/20 hover:text-foreground/90 hover:bg-white/5 backdrop-blur-sm',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[0_18px_38px_-22px_rgba(30,64,175,0.55)] hover:bg-secondary/80',
        ghost:
          'text-foreground hover:bg-white/10 hover:text-white/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
