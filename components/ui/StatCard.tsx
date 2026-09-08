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
      <div className="stat-top flex items-center justify-between gap-1.5 text-[13px] sm:text-sm lg:text-[15px] font-bold text-ink/90">
        <span className="font-bold truncate tracking-normal text-[13px] sm:text-sm lg:text-[15px]">{label}</span>
        <div className="stat-icon shrink-0">
          <Icon size={17} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
      </div>
      <strong
        className={`my-1 sm:my-2 block truncate !font-numeric font-extrabold tabular-nums tracking-tight sm:tracking-tighter lg:tracking-tight text-ink ${
          featured
            ? '!text-lg xs:!text-xl sm:!text-2xl md:!text-2xl lg:!text-[1.75rem]'
            : '!text-base xs:!text-[17px] sm:!text-lg md:!text-xl lg:!text-2xl'
        }`}
        title={value}
      >
        {value}
      </strong>
      <small className="block truncate text-xs text-muted font-medium" title={note}>
        {note}
      </small>
    </div>
  )
}
