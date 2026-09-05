import React from 'react'

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  body: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={20} />
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  )
}
