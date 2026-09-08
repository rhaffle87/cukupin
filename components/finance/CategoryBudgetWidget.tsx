'use client'

import React, { useState } from 'react'
import type { CategoryBudget, Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { AlertCircle, CheckCircle2, Sliders, Target, TrendingUp } from 'lucide-react'
import { currency } from '@/lib/finance'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { BudgetSettingModal } from './BudgetSettingModal'

interface CategoryBudgetWidgetProps {
  budgets: CategoryBudget[]
  setBudgets: React.Dispatch<React.SetStateAction<CategoryBudget[]>>
  transactions: Transaction[]
  supabase: SupabaseClient | null
  userId?: string
}

export function CategoryBudgetWidget({
  budgets,
  setBudgets,
  transactions,
  supabase,
  userId,
}: CategoryBudgetWidgetProps) {
  const [showModal, setShowModal] = useState(false)

  // Calculate total spent per category in the current month's transactions
  const spentByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const activeBudgets = budgets.filter((b) => b.monthly_limit > 0)

  return (
    <section className="mb-4 rounded-[20px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-150">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <Eyebrow>PAGU ANGGARAN</Eyebrow>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">
            Batas Belanja Kategori
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-black/5 active:scale-95 cursor-pointer"
        >
          <Sliders size={13} className="text-muted" />
          <span>Atur Budget</span>
        </button>
      </div>

      {activeBudgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/50 p-6 text-center">
          <Target size={28} className="mx-auto text-muted/60" />
          <h4 className="mt-2 font-serif text-sm font-bold text-ink">
            Belum Ada Batas Budget Kategori
          </h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
            Pasang target batas pengeluaran untuk Makanan, Transportasi, atau Belanja agar pengeluaranmu tidak kebablasan.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-ink/90 transition-transform active:scale-95 cursor-pointer"
          >
            <Sliders size={13} /> Atur Budget Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeBudgets.map((b) => {
            const spent = spentByCategory[b.category] || 0
            const limit = b.monthly_limit
            const percentage = Math.round((spent / limit) * 100)
            const remaining = limit - spent

            // Dynamic color grading based on spending ratio
            let progressColor = 'bg-green'
            let textColor = 'text-green'
            let statusBadge = (
              <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-[10px] font-semibold text-green">
                <CheckCircle2 size={10} /> Aman ({percentage}%)
              </span>
            )

            if (percentage > 100) {
              progressColor = 'bg-red-500'
              textColor = 'text-red-600'
              statusBadge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  <AlertCircle size={10} /> Melebihi (+{currency(spent - limit)})
                </span>
              )
            } else if (percentage >= 90) {
              progressColor = 'bg-coral'
              textColor = 'text-coral-dark'
              statusBadge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral-dark">
                  <AlertCircle size={10} /> Hampir Habis ({percentage}%)
                </span>
              )
            } else if (percentage >= 75) {
              progressColor = 'bg-blue'
              textColor = 'text-blue'
              statusBadge = (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-semibold text-blue">
                  <TrendingUp size={10} /> Waspada ({percentage}%)
                </span>
              )
            }

            return (
              <div
                key={b.id || b.category}
                className="flex flex-col justify-between rounded-2xl border border-line bg-paper/50 p-4 transition-all hover:border-ink/20"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm sm:text-base text-ink">{b.category}</span>
                    {statusBadge}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider">Terpakai</span>
                      <div className={`font-numeric tabular-nums font-bold text-base ${textColor}`}>
                        {currency(spent)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider">Batas Maksimal</span>
                      <div className="font-numeric tabular-nums text-xs font-semibold text-ink">
                        {currency(limit)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Gauge */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-line/50 pt-2 text-[11px]">
                  <span className="text-muted">
                    {remaining >= 0 ? 'Sisa budget bulan ini' : 'Defisit kategori'}
                  </span>
                  <strong className={remaining >= 0 ? 'text-ink font-semibold' : 'text-red-600 font-bold'}>
                    {remaining >= 0 ? currency(remaining) : `-${currency(Math.abs(remaining))}`}
                  </strong>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <BudgetSettingModal
          onClose={() => setShowModal(false)}
          budgets={budgets}
          setBudgets={setBudgets}
          supabase={supabase}
          userId={userId}
        />
      )}
    </section>
  )
}
