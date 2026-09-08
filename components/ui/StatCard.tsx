import React from 'react'

interface StatCardProps {
  label: string
  value: string
  tone: 'green' | 'coral' | 'blue'
  icon: React.ElementType
  note: string
  featured?: boolean
}

export function StatCard({ label, value, tone, icon: Icon, note, featured }: StatCardProps) {
  return (
    <div className={`stat-card ${tone}${featured ? ' featured' : ''} flex flex-col justify-between overflow-hidden !p-3 sm:!p-4 lg:!p-5 shadow-2xs`}>
      <div className="stat-top flex items-center justify-between gap-1.5 text-xs sm:text-[13px] lg:text-sm font-semibold text-ink/85">
        <span className="font-semibold sm:font-bold truncate tracking-normal">{label}</span>
        <div className="stat-icon shrink-0">
          <Icon size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
      <strong className="my-1 sm:my-2 block truncate !font-numeric font-bold tabular-nums !text-sm sm:!text-[15px] md:!text-base lg:!text-xl xl:!text-2xl tracking-tight sm:tracking-tighter lg:tracking-tight text-ink" title={value}>
        {value}
      </strong>
      <small className="block truncate text-[10px] sm:text-xs text-muted font-medium" title={note}>
        {note}
      </small>
    </div>
  )
}
