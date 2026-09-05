import React, { useState } from 'react'
import type { Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { isoDate } from '@/lib/finance'
import { toast } from 'sonner'
import { sanitizeNumericInput, transactionSchema } from '@/lib/validations/finance'

interface TransactionFormProps {
  supabase: SupabaseClient | null
  userId?: string
  initial?: Transaction
  onDone: (saved?: Transaction) => void
}

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Salary', 'Freelance', 'Other']
const quickAmounts = [
  { label: '+10rb', value: 10000 },
  { label: '+25rb', value: 25000 },
  { label: '+50rb', value: 50000 },
  { label: '+100rb', value: 100000 },
  { label: '+250rb', value: 250000 },
  { label: '+500rb', value: 500000 },
]

function predictCategory(text: string): string | null {
  const lower = text.toLowerCase()
  if (/kopi|makan|lunch|dinner|sarapan|snack|resto|cafe|food|mie|nasi|ayam|bakso|burger|roti|gofood|grabfood/i.test(lower)) {
    return 'Food'
  }
  if (/bensin|pertamax|pertalite|gojek|grab|maxim|parkir|tol|kereta|krl|mrt|busway|ojek|taxi|transport/i.test(lower)) {
    return 'Transport'
  }
  if (/listrik|pln|wifi|indihome|biznet|pulsa|kuota|air|pdam|tagihan|bpjs|iuran|sewa|kos|kontrakan/i.test(lower)) {
    return 'Bills'
  }
  if (/baju|sepatu|tokopedia|shopee|lazada|tiktok|belanja|mall|skincare|tas|celana/i.test(lower)) {
    return 'Shopping'
  }
  if (/obat|apotek|dokter|klinik|rumah sakit|vitamin|paracetamol/i.test(lower)) {
    return 'Health'
  }
  if (/gaji|salary|payroll|upah|bonus|thr/i.test(lower)) {
    return 'Salary'
  }
  if (/proyek|freelance|klien|side job|fee|desain|coding/i.test(lower)) {
    return 'Freelance'
  }
  return null
}

export function TransactionForm({ supabase, userId, initial, onDone }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || categories[0])
  const [date, setDate] = useState(initial?.transaction_date || isoDate(new Date()))
  const [desc, setDesc] = useState(initial?.description || '')
  const [note, setNote] = useState(initial?.note || '')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function addPreset(val: number) {
    const current = sanitizeNumericInput(amount)
    setAmount(String(current + val))
    setFormError(null)
  }

  function handleDescChange(val: string) {
    setDesc(val)
    setFormError(null)
    const predicted = predictCategory(val)
    if (predicted) {
      setCategory(predicted)
      if (predicted === 'Salary' || predicted === 'Freelance') {
        setType('income')
      } else if (type === 'income' && ['Food', 'Transport', 'Bills', 'Shopping', 'Health'].includes(predicted)) {
        setType('expense')
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!supabase || !userId) {
      toast.error('Hubungkan Supabase dan masuk untuk menyimpan.')
      return
    }

    const numericAmount = sanitizeNumericInput(amount)
    const rawPayload = {
      type,
      amount: numericAmount,
      category,
      transaction_date: date,
      description: desc,
      note: note || null,
    }

    const parsed = transactionSchema.safeParse(rawPayload)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Input tidak valid'
      setFormError(firstError)
      toast.error(firstError)
      return
    }

    setBusy(true)
    const payload = {
      user_id: userId,
      ...parsed.data,
    }

    const result = initial
      ? await supabase.from('transactions').update(payload).eq('id', initial.id).select().single()
      : await supabase.from('transactions').insert(payload).select().single()

    setBusy(false)

    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success(initial ? 'Transaksi diperbarui.' : 'Transaksi dicatat.')
      onDone(result.data as Transaction)
    }
  }

  const todayStr = isoDate(new Date())
  const yesterdayStr = isoDate(new Date(Date.now() - 86400000))

  return (
    <form className="transaction-form" onSubmit={submit}>
      <div className="segmented">
        <button
          type="button"
          className={type === 'expense' ? 'selected expense' : ''}
          onClick={() => setType('expense')}
        >
          <ArrowUpRight size={15} /> Pengeluaran
        </button>
        <button
          type="button"
          className={type === 'income' ? 'selected income' : ''}
          onClick={() => setType('income')}
        >
          <ArrowDownLeft size={15} /> Pemasukan
        </button>
      </div>

      <label>
        Nama / Deskripsi
        <input
          required
          value={desc}
          onChange={e => handleDescChange(e.target.value)}
          placeholder="Contoh: Makan siang atau Beli kopi"
          className="focus-visible:ring-2 focus-visible:ring-green focus-visible:outline-none"
        />
      </label>

      <label>
        Jumlah (Rp)
        <input
          type="text"
          inputMode="numeric"
          required
          value={amount}
          onChange={e => { setAmount(e.target.value); setFormError(null) }}
          placeholder="0"
          className="focus-visible:ring-2 focus-visible:ring-green focus-visible:outline-none font-semibold"
        />
      </label>

      {/* Quick Amount Chips */}
      <div className="flex flex-wrap gap-1.5 -mt-1 mb-2">
        {quickAmounts.map(q => (
          <button
            key={q.value}
            type="button"
            onClick={() => addPreset(q.value)}
            className="rounded-lg border border-line bg-paper px-2 py-1 text-[11px] font-bold text-muted hover:border-green/50 hover:bg-green-soft hover:text-green transition-all active:scale-95"
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="form-grid">
        <label>
          Kategori
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div>
          <label>
            Tanggal
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <div className="flex gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => setDate(todayStr)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                date === todayStr ? 'bg-green text-white' : 'bg-line/60 text-muted hover:text-ink'
              }`}
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={() => setDate(yesterdayStr)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                date === yesterdayStr ? 'bg-green text-white' : 'bg-line/60 text-muted hover:text-ink'
              }`}
            >
              Kemarin
            </button>
          </div>
        </div>
      </div>

      <label>
        Catatan <span className="optional">opsional</span>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Misal: Bayar pakai QRIS" />
      </label>

      {formError && (
        <p className="text-xs font-bold text-coral bg-coral/10 p-2.5 rounded-xl text-center">
          {formError}
        </p>
      )}

      <button className="button primary wide" disabled={busy}>
        {busy ? 'Menyimpan...' : initial ? 'Simpan perubahan' : 'Simpan transaksi'}
      </button>
    </form>
  )
}
