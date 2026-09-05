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
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">
          <Icon size={16} />
        </div>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  )
}
