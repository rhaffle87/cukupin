import React from 'react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-ink">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-ink -rotate-9">
        <div className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-paper" />
        <span className="h-1 w-4 -rotate-45 translate-y-[3px] -translate-x-[1px] rounded bg-green" />
      </div>
      {!compact && (
        <div className="flex flex-col">
          <strong className="font-display text-[20px] leading-none tracking-tight">Cukupin™</strong>
          <small className="mt-[3px] text-[9px] font-medium tracking-widest text-muted uppercase">catat santai</small>
        </div>
      )}
    </div>
  )
}
