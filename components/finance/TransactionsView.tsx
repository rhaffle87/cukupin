import React, { useMemo, useState } from 'react'
import type { Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { CalendarDays, Download, FileSpreadsheet, Plus, Receipt, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { TransactionRow } from './TransactionRow'
import { TransactionForm } from './TransactionForm'
import { MonthlyExpenseTemplate } from './MonthlyExpenseTemplate'
import { CsvImportModal } from './CsvImportModal'
import { useFinanceData } from '@/hooks/useFinanceData'
import { currency, isoDate, monthBounds } from '@/lib/finance'

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
  const [showCsvImport, setShowCsvImport] = useState(false)
  
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua kategori')
  const [typeFilter, setTypeFilter] = useState('Semua tipe')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Listen for global shortcut 'N'
  React.useEffect(() => {
    function handleOpenNew() {
      setEditing(undefined)
      setShowForm(true)
    }
    window.addEventListener('cukupin:open-new-tx', handleOpenNew)
    return () => window.removeEventListener('cukupin:open-new-tx', handleOpenNew)
  }, [])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const t of data.transactions) {
      const text = `${t.description || ''} ${t.note || ''}`
      const matches = text.match(/#[\w-]+/g)
      if (matches) {
        for (const m of matches) tagSet.add(m)
      }
    }
    return Array.from(tagSet)
  }, [data.transactions])

  const filtered = useMemo(() => {
    return data.transactions.filter(t => {
      const text = `${t.description || ''} ${t.note || ''} ${t.category}`.toLowerCase()
      const matchesQuery = !query || text.includes(query.toLowerCase())
      const matchesTag = !selectedTag || `${t.description || ''} ${t.note || ''}`.includes(selectedTag)
      
      const matchesCategory = categoryFilter === 'Semua kategori' || t.category === categoryFilter
      const matchesType = typeFilter === 'Semua tipe' || t.type === typeFilter
      const matchesFrom = !from || t.transaction_date >= from
      const matchesTo = !to || t.transaction_date <= to
      
      return matchesQuery && matchesTag && matchesCategory && matchesType && matchesFrom && matchesTo
    })
  }, [data.transactions, query, selectedTag, categoryFilter, typeFilter, from, to])

  const filteredStats = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of filtered) {
      if (t.type === 'income') income += Number(t.amount)
      else expense += Number(t.amount)
    }
    return { income, expense, balance: income - expense }
  }, [filtered])

  function setPreset(preset: 'all' | 'today' | 'month' | '7days' | '30days') {
    const today = new Date()
    const todayStr = isoDate(today)
    if (preset === 'all') {
      setFrom('')
      setTo('')
    } else if (preset === 'today') {
      setFrom(todayStr)
      setTo(todayStr)
    } else if (preset === 'month') {
      const bounds = monthBounds()
      setFrom(bounds.start)
      setTo(bounds.end)
    } else if (preset === '7days') {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      setFrom(isoDate(d))
      setTo(todayStr)
    } else if (preset === '30days') {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      setFrom(isoDate(d))
      setTo(todayStr)
    }
  }

  function exportFilteredCsv() {
    if (!filtered.length) {
      toast.error('Tidak ada transaksi untuk diekspor')
      return
    }
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah', 'Metode Pembayaran', 'Catatan']
    const rows = filtered.map(t => [
      t.transaction_date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.payment_method || '-').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `transaksi-cukupin-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('File CSV berhasil diunduh.')
  }

  async function remove(t: Transaction) {
    if (!supabase || !confirm('Hapus transaksi ini?')) return

    // Optimistic UI update
    const previous = data.transactions
    data.setTransactions(prev => prev.filter(item => item.id !== t.id))

    const result = await supabase.from('transactions').delete().eq('id', t.id)
    if (result.error) {
      toast.error(result.error.message)
      // Rollback on failure
      data.setTransactions(previous)
    } else {
      toast.success('Transaksi dihapus.')
      data.refresh()
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="CATATAN"
        title="Transaksi"
        subtitle="Catat pengeluaran dan pemasukan harianmu biar gampang dipantau."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button className="button secondary" onClick={() => setShowCsvImport(true)} title="Impor data transaksi dari file CSV">
              <Upload size={15} /> Impor CSV
            </button>
            <button className="button secondary" onClick={exportFilteredCsv} title="Unduh hasil filter ke CSV">
              <Download size={15} /> Export CSV
            </button>
            <button className="button secondary" onClick={() => setShowExportTemplate(true)}>
              <FileSpreadsheet size={15} /> Format Bulanan
            </button>
            <button className="button primary" onClick={() => { setEditing(undefined); setShowForm(true) }}>
              <Plus size={15} /> Tambah catatan
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

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">Preset:</span>
          <button
            type="button"
            onClick={() => setPreset('all')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${!from && !to ? 'bg-ink !text-white' : 'bg-black/5 hover:bg-black/10 text-muted'}`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setPreset('today')}
            className="rounded-lg bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-black/10 hover:text-ink transition-colors"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setPreset('month')}
            className="rounded-lg bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-black/10 hover:text-ink transition-colors"
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setPreset('7days')}
            className="rounded-lg bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-black/10 hover:text-ink transition-colors"
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setPreset('30days')}
            className="rounded-lg bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-black/10 hover:text-ink transition-colors"
          >
            30 Hari
          </button>
        </div>

        {/* Custom Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">Tag:</span>
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                !selectedTag ? 'bg-ink !text-white' : 'bg-black/5 hover:bg-black/10 text-muted'
              }`}
            >
              Semua Tag
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                  selectedTag === tag ? 'bg-green text-white' : 'bg-green-soft text-green hover:bg-green/20'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {(query || selectedTag || categoryFilter !== 'Semua kategori' || typeFilter !== 'Semua tipe' || from || to) && (
          <button
            className="reset-filters"
            onClick={() => { setQuery(''); setSelectedTag(''); setCategoryFilter('Semua kategori'); setTypeFilter('Semua tipe'); setFrom(''); setTo('') }}
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

          {/* Filtered KPI Summary Strip */}
          {filtered.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-paper/80 p-3 border border-line/60 text-xs shadow-2xs">
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase">Pemasukan</span>
                <strong className="text-green font-display text-sm">{currency(filteredStats.income)}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase">Pengeluaran</span>
                <strong className="text-coral font-display text-sm">{currency(filteredStats.expense)}</strong>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-muted uppercase">Net Sisa</span>
                <strong className={`font-display text-sm ${filteredStats.balance >= 0 ? 'text-blue' : 'text-coral'}`}>
                  {currency(filteredStats.balance)}
                </strong>
              </div>
            </div>
          )}
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
              title={data.transactions.length ? 'Nggak ada yang cocok' : 'Belum ada catatan'}
              body={data.transactions.length ? 'Coba cek lagi kata kunci atau tanggalnya.' : 'Mulai dari satu pemasukan atau pengeluaran pertamamu.'}
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
          <h3>Catat santai aja.</h3>
          <p>Nggak perlu pusing atau merasa bersalah. Catat apa adanya biar kamu tahu uangmu kepakai buat apa aja.</p>
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
            onDone={(saved) => {
              setShowForm(false)
              if (saved) {
                data.setTransactions(prev => {
                  const idx = prev.findIndex(x => x.id === saved.id)
                  if (idx >= 0) {
                    const next = [...prev]
                    next[idx] = saved
                    return next
                  }
                  return [saved, ...prev]
                })
              }
              data.refresh()
            }}
          />
        </Modal>
      )}

      {showExportTemplate && (
        <MonthlyExpenseTemplate
          transactions={data.transactions}
          onClose={() => setShowExportTemplate(false)}
        />
      )}

      {showCsvImport && (
        <CsvImportModal
          supabase={supabase}
          userId={userId}
          onClose={() => setShowCsvImport(false)}
          onSuccess={() => data.refresh()}
        />
      )}
    </>
  )
}
