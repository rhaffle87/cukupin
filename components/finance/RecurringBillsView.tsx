'use client'

import React, { useState } from 'react'
import type { RecurringBill, SavingGoal } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Edit2,
  ExternalLink,
  PiggyBank,
  Plus,
  Receipt,
  Target,
  Trash2,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { currency } from '@/lib/finance'
import { formatRupiahInput, sanitizeNumericInput } from '@/lib/validations/finance'
import { Modal } from '@/components/ui/Modal'
import {
  isAutoRecurringLoggingEnabled,
  setAutoRecurringLoggingEnabled,
  getDueBillsToAutoLog,
  executeBatchAutoLog,
} from '@/lib/recurringBillsWorker'

interface RecurringBillsViewProps {
  supabase: SupabaseClient | null
  userId?: string
  bills: RecurringBill[]
  setBills: React.Dispatch<React.SetStateAction<RecurringBill[]>>
  logRecurringBillAsTransaction: (bill: RecurringBill) => Promise<boolean>
  goals?: SavingGoal[]
}

const categories = ['Bills', 'Food', 'Transport', 'Shopping', 'Health', 'Tabungan', 'Investasi', 'Other']
const paymentMethods = ['Transfer Bank', 'QRIS', 'E-Wallet', 'Kartu Kredit', 'Cash']

const RECURRING_BILLS_SQL = `-- Jalankan SQL ini di Supabase Dashboard -> SQL Editor:
create table if not exists public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  amount numeric(12,2) not null check (amount > 0),
  category text not null check (char_length(category) between 1 and 40),
  due_day integer not null check (due_day between 1 and 31),
  frequency text not null default 'monthly' check (frequency in ('monthly', 'yearly')),
  payment_method text default 'Transfer Bank',
  is_active boolean not null default true,
  last_logged_month text,
  created_at timestamptz not null default now()
);

alter table public.recurring_bills enable row level security;

do $$ begin
  create policy "Users can manage their own recurring bills" 
    on public.recurring_bills for all to authenticated 
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;`

export function RecurringBillsView({
  supabase,
  userId,
  bills,
  setBills,
  logRecurringBillAsTransaction,
  goals = [],
}: RecurringBillsViewProps) {
  const [showModal, setShowModal] = useState(false)
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null)
  const [loggingId, setLoggingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState('Bills')
  const [dueDay, setDueDay] = useState(15)
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank')

  const [autoEnabled, setAutoEnabled] = useState(() => isAutoRecurringLoggingEnabled())
  const [isAutoProcessing, setIsAutoProcessing] = useState(false)

  const currentMonthStr = new Date().toISOString().slice(0, 7) // '2026-09'
  const currentDay = new Date().getDate()

  // Automated recurring bills filtering
  const dueBillsToAutoLog = getDueBillsToAutoLog(bills, currentDay, currentMonthStr)

  const handleProcessDueNow = async () => {
    if (dueBillsToAutoLog.length === 0 || isAutoProcessing) return
    setIsAutoProcessing(true)
    try {
      const result = await executeBatchAutoLog(
        dueBillsToAutoLog,
        logRecurringBillAsTransaction
      )
      if (result.loggedCount > 0) {
        toast.success(
          `${result.loggedCount} tagihan jatuh tempo berhasil dicatat ke transaksi!`
        )
      }
    } finally {
      setIsAutoProcessing(false)
    }
  }

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

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(RECURRING_BILLS_SQL)
      setCopiedSql(true)
      toast.success('SQL migration berhasil disalin!')
      setTimeout(() => setCopiedSql(false), 3000)
    } catch {
      toast.error('Gagal menyalin teks secara otomatis.')
    }
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
      const errMsg = err?.message || ''
      const isMissingTable =
        errMsg.includes('schema cache') ||
        errMsg.includes('Could not find the table') ||
        errMsg.includes('does not exist') ||
        err?.code === 'PGRST204'

      if (isMissingTable) {
        // Resilient fallback to local storage so user flow is never blocked
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
        setShowModal(false)
        setShowMigrationModal(true)
        toast.info('Tabel Supabase belum dibuat di server. Tagihan disimpan lokal.')
        return
      }

      toast.error(`Gagal menyimpan tagihan: ${errMsg || 'Terjadi kesalahan'}`)
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
      const errMsg = err?.message || ''
      if (errMsg.includes('schema cache') || errMsg.includes('Could not find the table') || err?.code === 'PGRST204') {
        const stored = localStorage.getItem('cukupin_local_bills')
        const currentList: RecurringBill[] = stored ? JSON.parse(stored) : bills
        const filtered = currentList.filter((b) => b.id !== billId)
        localStorage.setItem('cukupin_local_bills', JSON.stringify(filtered))
        setBills(filtered)
        toast.success('Tagihan dihapus (penyimpanan lokal).')
        return
      }
      toast.error(`Gagal menghapus tagihan: ${errMsg || 'Terjadi kesalahan'}`)
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
          <div className="text-xs sm:text-[13px] font-semibold text-ink/80 tracking-normal">
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
          <div className="text-xs sm:text-[13px] font-semibold text-ink/80 tracking-normal">
            Sudah Dicatat Bulan Ini
          </div>
          <div className="mt-1 font-numeric tabular-nums text-2xl font-bold text-green">
            {loggedBills.length} Tagihan
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {currency(loggedBills.reduce((s, b) => s + b.amount, 0))} sudah masuk buku kas
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs">
          <div className="text-xs sm:text-[13px] font-semibold text-ink/80 tracking-normal">
            Belum Dicatat Bulan Ini
          </div>
          <div className="mt-1 font-numeric tabular-nums text-2xl font-bold text-coral">
            {pendingBills.length} Tagihan
          </div>
          <div className="mt-0.5 text-xs text-muted">
            {currency(pendingAmount)} menunggu pencatatan
          </div>
        </div>
      </div>

      {/* Automated Recurring Bill Logging Control Card */}
      <div className="rounded-2xl border border-line bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-ink">
                Otomatisasi Tagihan Jatuh Tempo
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  autoEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-muted border-gray-200'
                }`}
              >
                {autoEnabled ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5 max-w-xl">
              {autoEnabled
                ? 'Tagihan aktif otomatis dicatat ke transaksi dan dialokasikan ke target tabungan saat tanggal jatuh tempo tiba di latar belakang.'
                : 'Pencatatan otomatis dinonaktifkan. Tagihan harus dicatat secara manual.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {dueBillsToAutoLog.length > 0 && (
            <button
              type="button"
              disabled={isAutoProcessing}
              onClick={handleProcessDueNow}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              {isAutoProcessing ? 'Memproses...' : `Catat ${dueBillsToAutoLog.length} Jatuh Tempo`}
            </button>
          )}

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoEnabled}
              onChange={(e) => {
                const nextVal = e.target.checked
                setAutoEnabled(nextVal)
                setAutoRecurringLoggingEnabled(nextVal)
                toast.success(
                  nextVal
                    ? 'Pencatatan tagihan otomatis diaktifkan.'
                    : 'Pencatatan tagihan otomatis dinonaktifkan.'
                )
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
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
            const isSavings = bill.category === 'Tabungan' || bill.category === 'Investasi'

            return (
              <div
                key={bill.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-card p-4 shadow-2xs transition-all hover:border-ink/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper border border-line text-ink shrink-0">
                        {isSavings ? (
                          <PiggyBank size={18} className="text-green" />
                        ) : (
                          <Receipt size={18} className="text-green" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-ink leading-tight">{bill.name}</h4>
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
                Nama Tagihan / Komitmen
              </label>
              <input
                type="text"
                placeholder="Contoh: WiFi Rumah, Listrik PLN, Tabungan Dana Darurat"
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

            {/* Target Tabungan Linker (Opsional) */}
            {category === 'Tabungan' && goals && goals.length > 0 && (
              <div className="rounded-xl border border-green/30 bg-green-soft/40 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green mb-1.5">
                  <Target size={14} /> Hubungkan ke Target Tabungan
                </div>
                <select
                  onChange={(e) => {
                    const selectedGoal = goals.find((g) => g.id === e.target.value)
                    if (selectedGoal) {
                      setName(`Tabungan: ${selectedGoal.name}`)
                      const diff = Math.max(0, Number(selectedGoal.target_amount) - Number(selectedGoal.current_amount))
                      const suggested = diff > 0 ? Math.ceil(diff / 3) : 0
                      if (suggested > 0 && !amountStr) {
                        setAmountStr(formatRupiahInput(suggested.toString()))
                      }
                    }
                  }}
                  defaultValue=""
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink outline-none focus:border-green"
                >
                  <option value="" disabled>Pilih target tabungan aktif...</option>
                  {goals
                    .filter((g) => Number(g.current_amount) < Number(g.target_amount))
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (Terkumpul {currency(Number(g.current_amount))} / {currency(Number(g.target_amount))})
                      </option>
                    ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
                  Saat tagihan rutin ini dicatat setiap bulan, nominalnya akan langsung mengalir otomatis menambah saldo target tabunganmu.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-xs hover:bg-ink/90 transition-colors cursor-pointer"
              >
                Simpan Tagihan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* SQL Migration Guide Modal */}
      {showMigrationModal && (
        <Modal
          title="Panduan Migrasi Database Tagihan Rutin"
          onClose={() => setShowMigrationModal(false)}
        >
          <div className="space-y-4 text-xs text-ink">
            <div className="rounded-xl border border-coral/30 bg-coral-soft/50 p-3.5 flex items-start gap-3">
              <AlertTriangle size={18} className="text-coral shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-ink">Tabel Supabase Belum Dibuat</strong>
                <p className="mt-0.5 text-muted leading-relaxed">
                  Tagihanmu sudah <strong>aman tersimpan di perangkat lokal</strong> sehingga fitur tetap berfungsi normal. Untuk mengaktifkan sinkronisasi multi-perangkat via Supabase, jalankan SQL migration berikut sekali saja.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-muted">SQL Skrip untuk Supabase Dashboard:</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1 font-semibold text-ink hover:bg-card transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check size={12} className="text-green" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Salin SQL
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-48 overflow-x-auto rounded-xl border border-line bg-paper p-3 font-mono text-[11px] text-ink leading-relaxed">
                {RECURRING_BILLS_SQL}
              </pre>
            </div>

            <div className="rounded-xl border border-line bg-paper/60 p-3 text-[11px] text-muted space-y-1">
              <strong className="block text-ink font-semibold">Langkah 1 menit:</strong>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Buka Supabase Dashboard proyekmu</li>
                <li>Klik menu <strong>SQL Editor</strong> di bilah kiri</li>
                <li>Tempel (paste) skrip di atas, lalu klik <strong>Run</strong></li>
              </ol>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMigrationModal(false)}
                className="rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-xs hover:bg-ink/90 transition-colors cursor-pointer"
              >
                Saya Mengerti, Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
