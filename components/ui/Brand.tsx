import React from 'react'

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <div className="brand-mark">
        <span />
      </div>
      {!compact && (
        <div>
          <strong>cukupin</strong>
          <small>uang, lebih jernih</small>
        </div>
      )}
    </div>
  )
}
