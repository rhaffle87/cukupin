import React, { useMemo, useState } from 'react'
import type { Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { CalendarDays, FileSpreadsheet, Plus, Receipt, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { TransactionRow } from './TransactionRow'
import { TransactionForm } from './TransactionForm'
import { MonthlyExpenseTemplate } from './MonthlyExpenseTemplate'
import { useFinanceData } from '@/hooks/useFinanceData'

const categories = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Salary', 'Freelance', 'Other']

interface TransactionsViewProps {
  supabase: SupabaseClient | null
  data: ReturnType<typeof useFinanceData>
  userId?: string
}

export function TransactionsView({ supabase, data, userId }: TransactionsViewProps) {
  const [editing, setEditing] = useState<Transaction | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [showExportTemplate, setShowExportTemplate] = useState(false)
  
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua kategori')
  const [typeFilter, setTypeFilter] = useState('Semua tipe')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    return data.transactions.filter(t => {
      const matchesQuery = !query || 
        t.category.toLowerCase().includes(query.toLowerCase()) || 
        (t.description || '').toLowerCase().includes(query.toLowerCase()) || 
        (t.note || '').toLowerCase().includes(query.toLowerCase())
      
      const matchesCategory = categoryFilter === 'Semua kategori' || t.category === categoryFilter
      const matchesType = typeFilter === 'Semua tipe' || t.type === typeFilter
      const matchesFrom = !from || t.transaction_date >= from
      const matchesTo = !to || t.transaction_date <= to
      
      return matchesQuery && matchesCategory && matchesType && matchesFrom && matchesTo
    })
  }, [data.transactions, query, categoryFilter, typeFilter, from, to])

  async function remove(t: Transaction) {
    if (!supabase || !confirm('Hapus transaksi ini?')) return
    const result = await supabase.from('transactions').delete().eq('id', t.id)
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('Transaksi dihapus.')
      data.refresh()
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="CATATAN UANG"
        title="Transaksi"
        subtitle="Satu catatan kecil hari ini, satu gambaran besar di akhir bulan."
        action={
          <div className="flex items-center gap-2">
            <button className="button secondary" onClick={() => setShowExportTemplate(true)}>
              <FileSpreadsheet size={16} /> Format Bulanan
            </button>
            <button className="button primary" onClick={() => { setEditing(undefined); setShowForm(true) }}>
              <Plus size={16} /> Transaksi baru
            </button>
          </div>
        }
      />
      
      <section className="panel filters-panel">
        <div className="filter-search">
          <label htmlFor="transaction-search">Cari transaksi</label>
          <div className="search-input">
            <Receipt size={16} />
            <input
              id="transaction-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Kategori atau catatan..."
            />
            {query && (
              <button className="clear-search" onClick={() => setQuery('')} aria-label="Hapus pencarian">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="filter-controls">
          <label>
            Jenis
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option>Semua tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </label>
          <label>
            Kategori
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option>Semua kategori</option>
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Dari
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label>
            Sampai
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>
        {(query || categoryFilter !== 'Semua kategori' || typeFilter !== 'Semua tipe' || from || to) && (
          <button
            className="reset-filters"
            onClick={() => { setQuery(''); setCategoryFilter('Semua kategori'); setTypeFilter('Semua tipe'); setFrom(''); setTo('') }}
          >
            Reset filter
          </button>
        )}
      </section>
      
      <div className="transaction-layout">
        <section className="panel transaction-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">HASIL PENCARIAN</p>
              <h2>{filtered.length} transaksi ditemukan</h2>
            </div>
            <span className="period-pill">
              <CalendarDays size={13} /> {data.transactions.length} total
            </span>
          </div>
          {filtered.length ? (
            <div className="transaction-list">
              {filtered.map(t => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  onEdit={() => { setEditing(t); setShowForm(true) }}
                  onDelete={() => remove(t)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title={data.transactions.length ? 'Tidak ada yang cocok' : 'Ledger-mu masih kosong'}
              body={data.transactions.length ? 'Coba ubah kata kunci atau rentang tanggal.' : 'Mulai dengan satu pemasukan atau pengeluaran.'}
              action={
                !data.transactions.length ? (
                  <button className="button secondary small" onClick={() => setShowForm(true)}>
                    <Plus size={15} /> Tambah transaksi
                  </button>
                ) : undefined
              }
            />
          )}
        </section>
        <aside className="panel quick-note">
          <div className="note-number">01</div>
          <h3>Catat tanpa menghakimi.</h3>
          <p>Tujuan Cukupin bukan membuatmu merasa bersalah. Catatan yang jujur membantu kamu mengambil keputusan yang lebih tenang.</p>
        </aside>
      </div>
      
      <button className="mobile-fab" onClick={() => { setEditing(undefined); setShowForm(true) }} aria-label="Tambah transaksi">
        <Plus size={22} />
        <span>Tambah</span>
      </button>
      
      {showForm && (
        <Modal title={editing ? 'Edit transaksi' : 'Transaksi baru'} onClose={() => setShowForm(false)}>
          <TransactionForm
            supabase={supabase}
            userId={userId}
            initial={editing}
            onDone={() => { setShowForm(false); data.refresh() }}
          />
        </Modal>
      )}

      {showExportTemplate && (
        <MonthlyExpenseTemplate
          transactions={data.transactions}
          onClose={() => setShowExportTemplate(false)}
        />
      )}
    </>
  )
}
