import * as React from 'react'
import { cn } from '@/lib/utils'

export interface EyebrowProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
  variant?: 'slate' | 'mint' | 'muted'
}

export function Eyebrow({
  children,
  className,
  variant = 'slate',
  ...props
}: EyebrowProps) {
  const colorClass =
    variant === 'mint'
      ? 'text-mint'
      : variant === 'muted'
      ? 'text-muted'
      : 'text-slate'

  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green',
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
