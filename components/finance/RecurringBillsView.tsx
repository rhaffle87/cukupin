'use client'

import React, { useState } from 'react'
import type { RecurringBill } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit2,
  Plus,
  Receipt,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { currency } from '@/lib/finance'
import { formatRupiahInput, sanitizeNumericInput } from '@/lib/validations/finance'
import { Modal } from '@/components/ui/Modal'

interface RecurringBillsViewProps {
  supabase: SupabaseClient | null
  userId?: string
  bills: RecurringBill[]
  setBills: React.Dispatch<React.SetStateAction<RecurringBill[]>>
  logRecurringBillAsTransaction: (bill: RecurringBill) => Promise<boolean>
}

const categories = ['Bills', 'Food', 'Transport', 'Shopping', 'Health', 'Other']
const paymentMethods = ['Transfer Bank', 'QRIS', 'E-Wallet', 'Kartu Kredit', 'Cash']

export function RecurringBillsView({
  supabase,
  userId,
  bills,
  setBills,
  logRecurringBillAsTransaction,
}: RecurringBillsViewProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null)
  const [loggingId, setLoggingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState('Bills')
  const [dueDay, setDueDay] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank')

  const currentMonthStr = new Date().toISOString().slice(0, 7) // '2026-09'
  const currentDay = new Date().getDate()

  // Metrics
  const totalMonthlyCommitment = bills
    .filter((b) => b.is_active)
    .reduce((sum, b) => sum + b.amount, 0)

  const loggedBills = bills.filter(
    (b) => b.is_active && b.last_logged_month === currentMonthStr
  )
  const pendingBills = bills.filter(
    (b) => b.is_active && b.last_logged_month !== currentMonthStr
  )
  const pendingAmount = pendingBills.reduce((sum, b) => sum + b.amount, 0)

  const handleOpenAdd = () => {
    setEditingBill(null)
    setName('')
    setAmountStr('')
    setCategory('Bills')
    setDueDay(15)
    setPaymentMethod('Transfer Bank')
    setShowModal(true)
  }

  const handleOpenEdit = (bill: RecurringBill) => {
    setEditingBill(bill)
    setName(bill.name)
    setAmountStr(bill.amount.toLocaleString('id-ID'))
    setCategory(bill.category)
    setDueDay(bill.due_day)
    setPaymentMethod(bill.payment_method || 'Transfer Bank')
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = sanitizeNumericInput(amountStr)

    if (!name.trim()) {
      toast.error('Nama tagihan wajib diisi.')
      return
    }
    if (numericAmount <= 0) {
      toast.error('Jumlah tagihan harus lebih dari 0.')
      return
    }

    const billPayload = {
      name: name.trim(),
      amount: numericAmount,
      category,
      due_day: Number(dueDay),
      frequency: 'monthly' as const,
      payment_method: paymentMethod,
      is_active: true,
      user_id: userId || 'local-dev-user',
    }

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_bills')
      const currentList: RecurringBill[] = stored ? JSON.parse(stored) : bills

      let updatedList: RecurringBill[]
      if (editingBill) {
        updatedList = currentList.map((b) =>
          b.id === editingBill.id ? { ...b, ...billPayload } : b
        )
      } else {
        const newBill: RecurringBill = {
          id: 'bill-' + Date.now(),
          created_at: new Date().toISOString(),
          last_logged_month: null,
          ...billPayload,
        }
        updatedList = [...currentList, newBill]
      }

      localStorage.setItem('cukupin_local_bills', JSON.stringify(updatedList))
      setBills(updatedList)
      toast.success(editingBill ? 'Tagihan berhasil diperbarui.' : 'Tagihan rutin ditambahkan.')
      setShowModal(false)
      return
    }

    try {
      if (editingBill) {
        const { error } = await supabase
          .from('recurring_bills')
          .update(billPayload)
          .eq('id', editingBill.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('recurring_bills').insert(billPayload)
        if (error) throw error
      }

      toast.success(editingBill ? 'Tagihan berhasil diperbarui.' : 'Tagihan rutin ditambahkan.')
      setShowModal(false)
    } catch (err: any) {
      toast.error(`Gagal menyimpan tagihan: ${err?.message || 'Terjadi kesalahan'}`)
    }
  }

  const handleDelete = async (billId: string, billName: string) => {
    if (!window.confirm(`Hapus tagihan rutin "${billName}"?`)) return

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_bills')
      const currentList: RecurringBill[] = stored ? JSON.parse(stored) : bills
      const filtered = currentList.filter((b) => b.id !== billId)
      localStorage.setItem('cukupin_local_bills', JSON.stringify(filtered))
      setBills(filtered)
      toast.success('Tagihan dihapus.')
      return
    }

    try {
      const { error } = await supabase.from('recurring_bills').delete().eq('id', billId)
      if (error) throw error
      toast.success('Tagihan dihapus.')
    } catch (err: any) {
      toast.error(`Gagal menghapus tagihan: ${err?.message || 'Terjadi kesalahan'}`)
    }
  }

  const handleLogBill = async (bill: RecurringBill) => {
    setLoggingId(bill.id)
    try {
      await logRecurringBillAsTransaction(bill)
    } finally {
      setLoggingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
            Total Komitmen Rutin
          </div>
          <div className="mt-1 font-numeric tabular-nums text-2xl font-bold text-ink">
            {currency(totalMonthlyCommitment)}
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {bills.filter((b) => b.is_active).length} tagihan aktif setiap bulan
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
            Sudah Dicatat Bulan Ini
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-green">
            {loggedBills.length} Tagihan
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {currency(loggedBills.reduce((s, b) => s + b.amount, 0))} sudah masuk buku kas
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
            Belum Dicatat Bulan Ini
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-coral">
            {pendingBills.length} Tagihan
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {currency(pendingAmount)} menunggu pencatatan
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink">Daftar Tagihan Rutin</h3>
          <p className="text-xs text-muted">
            Catat sekali klik saat kamu membayar tagihan bulanan tanpa perlu input ulang.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> Tambah Tagihan
        </button>
      </div>

      {/* Bill List */}
      {bills.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-card p-10 text-center">
          <Receipt size={36} className="mx-auto text-muted/60" />
          <h4 className="mt-3 font-serif text-base font-bold text-ink">Belum Ada Tagihan Rutin</h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
            Tambahkan pengeluaran rutinmu seperti sewa kos, WiFi, listrik, atau langganan agar tidak lupa dicatat.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            <Plus size={14} /> Tambah Tagihan Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bills.map((bill) => {
            const isLoggedThisMonth = bill.last_logged_month === currentMonthStr
            const isOverdue = !isLoggedThisMonth && currentDay > bill.due_day
            const daysLeft = bill.due_day - currentDay

            return (
              <div
                key={bill.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-2xs transition-all hover:border-ink/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper border border-line text-ink shrink-0">
                        <Receipt size={18} className="text-green" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-ink leading-tight">{bill.name}</h4>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                          <span className="font-mono">{bill.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CreditCard size={12} /> {bill.payment_method || 'Transfer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-numeric tabular-nums font-bold text-base text-ink">
                        {currency(bill.amount)}
                      </div>
                      <div className="text-[10px] text-muted">per bulan</div>
                    </div>
                  </div>

                  {/* Due Date & Status Banner */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-muted" />
                      <span>Jatuh tempo: Tanggal {bill.due_day}</span>
                    </div>

                    {isLoggedThisMonth ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-1 text-[11px] font-semibold text-green">
                        <CheckCircle2 size={12} /> Lunas {currentMonthStr}
                      </span>
                    ) : isOverdue ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-coral/15 px-2.5 py-1 text-[11px] font-semibold text-coral-dark">
                        <Clock size={12} /> Lewat jatuh tempo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2.5 py-1 text-[11px] font-semibold text-blue">
                        <Clock size={12} /> {daysLeft === 0 ? 'Hari ini' : `${daysLeft} hari lagi`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-line/40 pt-3">
                  <div className="flex items-center gap-1 text-muted">
                    <button
                      onClick={() => handleOpenEdit(bill)}
                      className="p-1.5 rounded-lg hover:bg-paper hover:text-ink transition-colors"
                      title="Ubah Tagihan"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id, bill.name)}
                      className="p-1.5 rounded-lg hover:bg-coral/10 hover:text-coral transition-colors"
                      title="Hapus Tagihan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleLogBill(bill)}
                    disabled={loggingId === bill.id || isLoggedThisMonth}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                      isLoggedThisMonth
                        ? 'bg-paper text-muted cursor-not-allowed border border-line'
                        : 'bg-ink hover:bg-ink/90 !text-white shadow-xs active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isLoggedThisMonth ? (
                      <>
                        <CheckCircle2 size={13} className="text-green" /> Sudah Dicatat
                      </>
                    ) : (
                      <>
                        <Plus size={13} /> Catat Sekarang
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editingBill ? 'Ubah Tagihan Rutin' : 'Tambah Tagihan Rutin'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Nama Tagihan
              </label>
              <input
                type="text"
                placeholder="Contoh: WiFi Rumah, Listrik PLN, Kosan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Jumlah (Rp)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-mono text-muted select-none">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={amountStr}
                    onChange={(e) => setAmountStr(formatRupiahInput(e.target.value))}
                    className="w-full rounded-xl border border-line bg-paper !pl-9 pr-3.5 py-2.5 text-sm font-numeric tabular-nums text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Tanggal Jatuh Tempo (1 - 31)
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDay}
                  onChange={(e) => setDueDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-numeric tabular-nums text-ink outline-none focus:border-ink focus:ring-1 focus:ring-ink"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
                >
                  {paymentMethods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-paper hover:text-ink transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-xs hover:bg-ink/90 transition-colors"
              >
                Simpan Tagihan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
