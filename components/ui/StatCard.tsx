import React from 'react'

interface StatCardProps {
  label: string
  value: string
  tone: 'green' | 'coral' | 'blue'
  icon: React.ElementType
  note: string
}

export function StatCard({ label, value, tone, icon: Icon, note }: StatCardProps) {
  return (
    <div className={`stat-card ${tone} flex flex-col justify-between overflow-hidden !p-3 sm:!p-5 shadow-2xs`}>
      <div className="stat-top flex items-center justify-between gap-1 text-[10px] sm:text-xs text-muted">
        <span className="font-semibold truncate">{label}</span>
        <div className="stat-icon shrink-0">
          <Icon size={14} className="sm:w-4 sm:h-4" />
        </div>
      </div>
      <strong className="my-1 sm:my-2 block truncate font-display text-sm sm:text-lg md:text-2xl font-bold tracking-tight text-ink" title={value}>
        {value}
      </strong>
      <small className="block truncate text-[9px] sm:text-[11px] text-muted" title={note}>
        {note}
      </small>
    </div>
  )
}
