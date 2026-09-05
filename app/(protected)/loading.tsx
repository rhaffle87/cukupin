import React from 'react'

export default function ProtectedLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-label="Memuat data">
      <div className="h-48 w-full rounded-[24px] bg-ink/5 border border-line" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-28 rounded-2xl bg-card border border-line" />
        <div className="h-28 rounded-2xl bg-card border border-line" />
        <div className="h-28 rounded-2xl bg-card border border-line" />
      </div>
      <div className="h-64 rounded-2xl bg-card border border-line" />
    </div>
  )
}
