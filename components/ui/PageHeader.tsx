import React from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
