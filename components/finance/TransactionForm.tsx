import React, { useState } from 'react'
import type { Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { isoDate } from '@/lib/finance'
import { toast } from 'sonner'

interface TransactionFormProps {
  supabase: SupabaseClient | null
  userId?: string
  initial?: Transaction
  onDone: () => void
}

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Salary', 'Freelance', 'Other']

export function TransactionForm({ supabase, userId, initial, onDone }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || categories[0])
  const [date, setDate] = useState(initial?.transaction_date || isoDate(new Date()))
  const [desc, setDesc] = useState(initial?.description || '')
  const [note, setNote] = useState(initial?.note || '')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !userId) {
      toast.error('Hubungkan Supabase dan masuk untuk menyimpan.')
      return
    }
    
    setBusy(true)
    const payload = {
      user_id: userId,
      type,
      amount: Number(amount),
      category,
      transaction_date: date,
      description: desc,
      note: note || null,
    }
    
    const result = initial
      ? await supabase.from('transactions').update(payload).eq('id', initial.id)
      : await supabase.from('transactions').insert(payload)
      
    setBusy(false)
    
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success(initial ? 'Transaksi diperbarui.' : 'Transaksi tersimpan.')
      onDone()
    }
  }

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
        <input required value={desc} onChange={e => setDesc(e.target.value)} placeholder="Contoh: Makan siang" />
      </label>
      
      <label>
        Jumlah
        <input type="number" min="1" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
      </label>
      
      <div className="form-grid">
        <label>
          Kategori
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Tanggal
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
        </label>
      </div>
      
      <label>
        Catatan <span className="optional">opsional</span>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Info tambahan..." />
      </label>
      
      <button className="button primary wide" disabled={busy}>
        {busy ? 'Menyimpan...' : initial ? 'Simpan perubahan' : 'Simpan transaksi'}
      </button>
    </form>
  )
}
