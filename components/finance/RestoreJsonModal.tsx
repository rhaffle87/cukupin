'use client'

import React, { useState, useRef } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Modal } from '@/components/ui/Modal'
import { Archive, CheckCircle2, FileUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import type { Transaction, SavingGoal, WishlistItem, RecurringBill, CategoryBudget } from '@/lib/database.types'

interface RestoreJsonModalProps {
  supabase: SupabaseClient | null
  userId?: string
  onClose: () => void
  onRestored: () => void
}

interface BackupPayload {
  app?: string
  version?: string
  exported_at?: string
  transactions?: Transaction[]
  goals?: SavingGoal[]
  wishlist?: WishlistItem[]
  bills?: RecurringBill[]
  budgets?: CategoryBudget[]
}

export function RestoreJsonModal({
  supabase,
  userId,
  onClose,
  onRestored,
}: RestoreJsonModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsedData, setParsedData] = useState<BackupPayload | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setErrorMsg(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const json = JSON.parse(text)

        if (!json.transactions && !json.goals && !json.wishlist && !json.bills && !json.budgets) {
          setErrorMsg('File JSON tidak valid. Pastikan ini adalah file cadangan resmi dari Cukupin.')
          setParsedData(null)
          return
        }

        setParsedData({
          app: json.app || 'cukupin',
          version: json.version || '1.0',
          exported_at: json.exported_at,
          transactions: Array.isArray(json.transactions) ? json.transactions : [],
          goals: Array.isArray(json.goals) ? json.goals : [],
          wishlist: Array.isArray(json.wishlist) ? json.wishlist : [],
          bills: Array.isArray(json.bills) ? json.bills : [],
          budgets: Array.isArray(json.budgets) ? json.budgets : [],
        })
      } catch (err) {
        setErrorMsg('Gagal membaca file JSON. Format file rusak atau tidak didukung.')
        setParsedData(null)
      }
    }
    reader.readAsText(file)
  }

  const handleRestore = async () => {
    if (!parsedData) return
    setLoading(true)

    try {
      const txs = parsedData.transactions || []
      const goals = parsedData.goals || []
      const wish = parsedData.wishlist || []
      const bills = parsedData.bills || []
      const budgets = parsedData.budgets || []

      if (userId === 'local-dev-user' || !supabase) {
        // Local mode handling
        if (restoreMode === 'replace') {
          localStorage.setItem('cukupin_local_transactions', JSON.stringify(txs))
          localStorage.setItem('cukupin_local_goals', JSON.stringify(goals))
          localStorage.setItem('cukupin_local_wishlist', JSON.stringify(wish))
          localStorage.setItem('cukupin_local_bills', JSON.stringify(bills))
          localStorage.setItem('cukupin_local_budgets', JSON.stringify(budgets))
        } else {
          // Merge mode
          const curTx: Transaction[] = JSON.parse(localStorage.getItem('cukupin_local_transactions') || '[]')
          const curGoals: SavingGoal[] = JSON.parse(localStorage.getItem('cukupin_local_goals') || '[]')
          const curWish: WishlistItem[] = JSON.parse(localStorage.getItem('cukupin_local_wishlist') || '[]')
          const curBills: RecurringBill[] = JSON.parse(localStorage.getItem('cukupin_local_bills') || '[]')
          const curBudgets: CategoryBudget[] = JSON.parse(localStorage.getItem('cukupin_local_budgets') || '[]')

          const existingTxIds = new Set(curTx.map(t => t.id))
          const existingGoalIds = new Set(curGoals.map(g => g.id))
          const existingWishIds = new Set(curWish.map(w => w.id))
          const existingBillIds = new Set(curBills.map(b => b.id))
          const existingBudgetCats = new Set(curBudgets.map(b => b.category))

          const mergedTx = [...curTx, ...txs.filter(t => !existingTxIds.has(t.id))]
          const mergedGoals = [...curGoals, ...goals.filter(g => !existingGoalIds.has(g.id))]
          const mergedWish = [...curWish, ...wish.filter(w => !existingWishIds.has(w.id))]
          const mergedBills = [...curBills, ...bills.filter(b => !existingBillIds.has(b.id))]
          const mergedBudgets = [...curBudgets, ...budgets.filter(b => !existingBudgetCats.has(b.category))]

          localStorage.setItem('cukupin_local_transactions', JSON.stringify(mergedTx))
          localStorage.setItem('cukupin_local_goals', JSON.stringify(mergedGoals))
          localStorage.setItem('cukupin_local_wishlist', JSON.stringify(mergedWish))
          localStorage.setItem('cukupin_local_bills', JSON.stringify(mergedBills))
          localStorage.setItem('cukupin_local_budgets', JSON.stringify(mergedBudgets))
        }
      } else if (userId && supabase) {
        // Supabase cloud restore
        if (restoreMode === 'replace') {
          await supabase.from('transactions').delete().eq('user_id', userId)
          await supabase.from('saving_goals').delete().eq('user_id', userId)
          await supabase.from('wishlist').delete().eq('user_id', userId)
          await supabase.from('recurring_bills').delete().eq('user_id', userId)
          await supabase.from('category_budgets').delete().eq('user_id', userId)
        }

        // Insert new records mapped with current user_id
        if (txs.length > 0) {
          const mappedTxs = txs.map(t => ({
            ...t,
            user_id: userId,
            id: undefined, // let database generate or upsert
          }))
          await supabase.from('transactions').insert(mappedTxs)
        }
        if (goals.length > 0) {
          const mappedGoals = goals.map(g => ({
            ...g,
            user_id: userId,
            id: undefined,
          }))
          await supabase.from('saving_goals').insert(mappedGoals)
        }
        if (wish.length > 0) {
          const mappedWish = wish.map(w => ({
            ...w,
            user_id: userId,
            id: undefined,
          }))
          await supabase.from('wishlist').insert(mappedWish)
        }
        if (bills.length > 0) {
          const mappedBills = bills.map(b => ({
            ...b,
            user_id: userId,
            id: undefined,
          }))
          await supabase.from('recurring_bills').insert(mappedBills)
        }
        if (budgets.length > 0) {
          const mappedBudgets = budgets.map(b => ({
            ...b,
            user_id: userId,
            id: undefined,
          }))
          await supabase.from('category_budgets').insert(mappedBudgets)
        }
      }

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3E8F68', '#315DCB', '#BEE6CF'],
        })
      } catch {
        // ignore in non-browser env
      }

      toast.success('Data Cukupin berhasil dipulihkan!')
      onRestored()
      onClose()
    } catch (err: any) {
      toast.error('Gagal memulihkan data: ' + (err?.message || 'Terjadi kesalahan sistem.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Pulihkan Data Backup (JSON)" onClose={onClose}>
      <div className="flex flex-col gap-4 text-xs text-ink">
        <p className="text-muted leading-relaxed">
          Unggah file cadangan <code>cukupin-backup-*.json</code> untuk mengembalikan catatan transaksi, target tabungan, dan daftar wishlist kamu.
        </p>

        {/* Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-paper/60 p-6 text-center cursor-pointer hover:border-green hover:bg-green-soft/10 transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-soft text-green">
            <FileUp size={20} />
          </div>
          <div>
            <strong className="block text-ink text-xs font-bold">
              {fileName || 'Pilih file backup .json'}
            </strong>
            <span className="text-[11px] text-muted">
              Klik atau seret file JSON backup kamu ke sini
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-coral-soft p-3 text-[11px] text-coral font-medium">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview of Backup Contents */}
        {parsedData && (
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-center justify-between border-b border-line/60 pb-2.5 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Ringkasan File Cadangan</span>
              {parsedData.exported_at && (
                <span className="text-[10px] text-muted">
                  Diekspor: {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(parsedData.exported_at))}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-paper p-2.5">
                <strong className="block text-base font-display font-bold text-ink">
                  {parsedData.transactions?.length || 0}
                </strong>
                <span className="text-[10px] text-muted font-medium">Transaksi</span>
              </div>
              <div className="rounded-xl bg-paper p-2.5">
                <strong className="block text-base font-display font-bold text-green">
                  {parsedData.goals?.length || 0}
                </strong>
                <span className="text-[10px] text-muted font-medium">Target Tabungan</span>
              </div>
              <div className="rounded-xl bg-paper p-2.5">
                <strong className="block text-base font-display font-bold text-blue">
                  {parsedData.wishlist?.length || 0}
                </strong>
                <span className="text-[10px] text-muted font-medium">Wishlist</span>
              </div>
              <div className="rounded-xl bg-paper p-2.5">
                <strong className="block text-base font-display font-bold text-amber-700">
                  {parsedData.bills?.length || 0}
                </strong>
                <span className="text-[10px] text-muted font-medium">Tagihan Rutin</span>
              </div>
              <div className="rounded-xl bg-paper p-2.5 col-span-2 sm:col-span-1">
                <strong className="block text-base font-display font-bold text-ink">
                  {parsedData.budgets?.length || 0}
                </strong>
                <span className="text-[10px] text-muted font-medium">Limit Anggaran</span>
              </div>
            </div>

            {/* Restore Mode Choice */}
            <div className="mt-4 pt-3 border-t border-line/60">
              <span className="block text-[11px] font-bold text-ink mb-2">Metode Pemulihan:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRestoreMode('merge')}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                    restoreMode === 'merge'
                      ? 'border-green bg-green-soft/20 text-ink ring-1 ring-green'
                      : 'border-line bg-paper text-muted hover:bg-black/5'
                  }`}
                >
                  <strong className="text-xs font-bold">Gabungkan (Merge)</strong>
                  <span className="text-[10px] text-muted leading-tight mt-0.5">
                    Hanya tambahkan data yang belum ada di catatan saat ini.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreMode('replace')}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                    restoreMode === 'replace'
                      ? 'border-coral bg-coral-soft/20 text-ink ring-1 ring-coral'
                      : 'border-line bg-paper text-muted hover:bg-black/5'
                  }`}
                >
                  <strong className="text-xs font-bold text-coral">Ganti Semua (Replace)</strong>
                  <span className="text-[10px] text-muted leading-tight mt-0.5">
                    Ganti catatan saat ini dengan isi lengkap file backup.
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-black/5 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!parsedData || loading}
            onClick={handleRestore}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Memulihkan...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-mint" /> Pulihkan Data
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
