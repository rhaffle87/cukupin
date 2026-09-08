'use client'

import React, { useState } from 'react'
import type { CategoryBudget } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { formatRupiahInput, sanitizeNumericInput } from '@/lib/validations/finance'

interface BudgetSettingModalProps {
  onClose: () => void
  budgets: CategoryBudget[]
  setBudgets: React.Dispatch<React.SetStateAction<CategoryBudget[]>>
  supabase: SupabaseClient | null
  userId?: string
}

const AVAILABLE_CATEGORIES = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Health',
  'Other',
]

export function BudgetSettingModal({
  onClose,
  budgets,
  setBudgets,
  supabase,
  userId,
}: BudgetSettingModalProps) {
  // Map existing limits to form state
  const initialMap: Record<string, string> = {}
  AVAILABLE_CATEGORIES.forEach((cat) => {
    const existing = budgets.find((b) => b.category === cat)
    initialMap[cat] = existing && existing.monthly_limit > 0 ? existing.monthly_limit.toLocaleString('id-ID') : ''
  })

  const [limits, setLimits] = useState<Record<string, string>>(initialMap)
  const [saving, setSaving] = useState(false)

  const handleInputChange = (category: string, value: string) => {
    setLimits((prev) => ({
      ...prev,
      [category]: formatRupiahInput(value),
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const newBudgets: CategoryBudget[] = []

    AVAILABLE_CATEGORIES.forEach((cat) => {
      const num = sanitizeNumericInput(limits[cat] || '0')
      if (num > 0) {
        const existing = budgets.find((b) => b.category === cat)
        newBudgets.push({
          id: existing?.id || 'bud-' + Date.now() + '-' + cat,
          user_id: userId || 'local-dev-user',
          category: cat,
          monthly_limit: num,
          created_at: existing?.created_at || new Date().toISOString(),
        })
      }
    })

    if (userId === 'local-dev-user' || !supabase) {
      localStorage.setItem('cukupin_local_budgets', JSON.stringify(newBudgets))
      setBudgets(newBudgets)
      setSaving(false)
      toast.success('Batas budget kategori berhasil disimpan.')
      onClose()
      return
    }

    try {
      // First delete current user budgets, then re-insert active ones
      await supabase.from('category_budgets').delete().eq('user_id', userId)

      if (newBudgets.length > 0) {
        const { error } = await supabase.from('category_budgets').insert(
          newBudgets.map((b) => ({
            user_id: userId,
            category: b.category,
            monthly_limit: b.monthly_limit,
          }))
        )
        if (error) throw error
      }

      setBudgets(newBudgets)
      toast.success('Batas budget kategori berhasil disimpan.')
      onClose()
    } catch (err: any) {
      // Fallback if table doesn't exist yet on remote
      localStorage.setItem('cukupin_local_budgets', JSON.stringify(newBudgets))
      setBudgets(newBudgets)
      toast.success('Batas budget tersimpan di perangkat lokal.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Atur Batas Budget Bulanan" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <p className="text-xs text-muted leading-relaxed">
          Tentukan batas maksimal pengeluaran bulanan per kategori. Cukupin akan memberi tanda jika pengeluaranmu mendekati atau melebihi limit.
        </p>

        <div className="space-y-3 pt-2">
          {AVAILABLE_CATEGORIES.map((cat) => (
            <div
              key={cat}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper/60 p-3"
            >
              <div className="min-w-0">
                <span className="block font-semibold text-xs text-ink">{cat}</span>
                <span className="block text-[10px] text-muted">Batas maksimal per bulan</span>
              </div>

              <div className="relative w-44 shrink-0">
                <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-mono text-muted select-none">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0 (Tanpa batas)"
                  value={limits[cat] || ''}
                  onChange={(e) => handleInputChange(cat, e.target.value)}
                  className="w-full rounded-lg border border-line bg-card !pl-8 pr-2.5 py-1.5 text-xs font-numeric tabular-nums text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-paper hover:text-ink transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-xs hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Batas Budget'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
