import React, { useMemo, useState } from 'react'
import type { Transaction } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Plus,
  Receipt,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { TransactionRow } from './TransactionRow'
import { TransactionForm } from './TransactionForm'
import { MonthlyExpenseTemplate } from './MonthlyExpenseTemplate'
import { CsvImportModal } from './CsvImportModal'
import { RestoreJsonModal } from './RestoreJsonModal'
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
  const [showJsonRestore, setShowJsonRestore] = useState(false)
  const [showManageMenu, setShowManageMenu] = useState(false)
  
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua kategori')
  const [typeFilter, setTypeFilter] = useState('Semua tipe')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(10)

  // Dynamic companion card tip index
  const [tipIndex, setTipIndex] = useState(0)

  // Listen for global shortcut 'N' and searchParam ?new=1
  React.useEffect(() => {
    function handleOpenNew() {
      setEditing(undefined)
      setShowForm(true)
    }
    window.addEventListener('cukupin:open-new-tx', handleOpenNew)

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('new') === '1') {
        handleOpenNew()
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }

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
    const list = data.transactions.filter(t => {
      const text = `${t.description || ''} ${t.note || ''} ${t.category}`.toLowerCase()
      const matchesQuery = !query || text.includes(query.toLowerCase())
      const matchesTag = !selectedTag || `${t.description || ''} ${t.note || ''}`.includes(selectedTag)
      
      const matchesCategory = categoryFilter === 'Semua kategori' || t.category === categoryFilter
      const matchesType = typeFilter === 'Semua tipe' || t.type === typeFilter
      const matchesFrom = !from || t.transaction_date >= from
      const matchesTo = !to || t.transaction_date <= to
      
      return matchesQuery && matchesTag && matchesCategory && matchesType && matchesFrom && matchesTo
    })

    return list.sort((a, b) => {
      if (sortBy === 'date-asc') return a.transaction_date.localeCompare(b.transaction_date)
      if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount)
      if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount)
      // default: date-desc
      return b.transaction_date.localeCompare(a.transaction_date)
    })
  }, [data.transactions, query, selectedTag, categoryFilter, typeFilter, sortBy, from, to])

  const filteredStats = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of filtered) {
      if (t.type === 'income') income += Number(t.amount)
      else expense += Number(t.amount)
    }
    return { income, expense, balance: income - expense }
  }, [filtered])

  // Contextual companion insights based on transaction history
  const companionInsights = useMemo(() => {
    const list: { badge: string; title: string; body: string; tone?: string }[] = []
    
    if (!data.transactions.length) {
      list.push({
        badge: '01 · MULAI DARI SINI',
        title: 'Catat santai aja.',
        body: 'Nggak perlu pusing atau merasa bersalah. Catat apa adanya biar kamu tahu uangmu kepakai buat apa aja.',
      })
      return list
    }

    // 1. Deficit or surplus
    if (filteredStats.balance < 0) {
      list.push({
        badge: '01 · ARUS KAS BULANAN',
        title: 'Pengeluaran melebihi pemasukan.',
        body: `Arus kas periode ini selisih ${currency(Math.abs(filteredStats.balance))}. Coba evaluasi pos belanja terbesar untuk menjaga saldo aman.`,
        tone: 'coral',
      })
    } else if (filteredStats.income > 0 && filteredStats.balance > 0) {
      const rate = Math.round((filteredStats.balance / filteredStats.income) * 100)
      list.push({
        badge: '01 · KEUANGAN SEHAT',
        title: `Tabungan aman ${rate}%.`,
        body: `Kamu berhasil mengamankan ${currency(filteredStats.balance)} dari total pemasukan. Pertahankan ritme ini sampai akhir bulan!`,
        tone: 'green',
      })
    }

    // 2. Top category
    const expenses = filtered.filter(t => t.type === 'expense')
    if (expenses.length > 0) {
      const catTotals: Record<string, number> = {}
      for (const e of expenses) catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.amount)
      const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1])
      if (sorted[0]) {
        const [topCat, topVal] = sorted[0]
        const pct = filteredStats.expense > 0 ? Math.round((topVal / filteredStats.expense) * 100) : 0
        list.push({
          badge: '02 · POS DOMINAN',
          title: `${topCat} menyerap ${pct}% belanja.`,
          body: `Sebesar ${currency(topVal)} dialokasikan untuk ${topCat}. Pastikan ini selaras dengan prioritas kebutuhanmu.`,
          tone: 'blue',
        })
      }
    }

    // 3. Habit & consistency
    list.push({
      badge: '03 · KONSISTENSI',
      title: `${data.transactions.length} transaksi tercatat.`,
      body: 'Kebiasaan mencatat secara teratur adalah fondasi ketenangan finansial. Kamu memegang kendali penuh atas keuanganmu.',
    })

    return list
  }, [data.transactions.length, filtered, filteredStats])

  const currentInsight = companionInsights[tipIndex % companionInsights.length] || companionInsights[0]

  function stepMonth(direction: -1 | 1) {
    let refDate = new Date()
    if (from) {
      const [y, m] = from.split('-').map(Number)
      if (!isNaN(y) && !isNaN(m)) {
        refDate = new Date(y, m - 1 + direction, 1)
      }
    } else {
      refDate = new Date(refDate.getFullYear(), refDate.getMonth() + direction, 1)
    }
    const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1)
    const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0)
    setFrom(isoDate(start))
    setTo(isoDate(end))
    setVisibleCount(10)
  }

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
    setVisibleCount(10)
  }

  function resetFilters() {
    setQuery('')
    setSelectedTag('')
    setCategoryFilter('Semua kategori')
    setTypeFilter('Semua tipe')
    setSortBy('date-desc')
    setFrom('')
    setTo('')
    setVisibleCount(10)
  }

  const isFilterActive = Boolean(
    query ||
    selectedTag ||
    categoryFilter !== 'Semua kategori' ||
    typeFilter !== 'Semua tipe' ||
    sortBy !== 'date-desc' ||
    from ||
    to
  )

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

  function exportJsonBackup() {
    const backupData = {
      app: 'cukupin',
      version: '1.0',
      exported_at: new Date().toISOString(),
      transactions: data.transactions,
      goals: data.goals,
      wishlist: data.wishlist,
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `cukupin-backup-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Backup data lengkap (JSON) berhasil diunduh.')
  }

  async function remove(t: Transaction) {
    if (!confirm('Hapus transaksi ini?')) return

    const previous = data.transactions
    data.setTransactions(prev => prev.filter(item => item.id !== t.id))

    if (userId === 'local-dev-user' || !supabase) {
      const stored = localStorage.getItem('cukupin_local_transactions')
      const localTxs: Transaction[] = stored ? JSON.parse(stored) : []
      const updated = localTxs.filter(item => item.id !== t.id)
      localStorage.setItem('cukupin_local_transactions', JSON.stringify(updated))
      toast.success('Transaksi dihapus.')
      return
    }

    const result = await supabase.from('transactions').delete().eq('id', t.id)
    if (result.error) {
      toast.error(result.error.message)
      data.setTransactions(previous)
    } else {
      toast.success('Transaksi dihapus.')
      data.refresh()
    }
  }

  // Displayed transactions with pagination
  const displayedTransactions = filtered.slice(0, visibleCount)

  return (
    <>
      <PageHeader
        eyebrow="CATATAN"
        title="Transaksi"
        subtitle="Catat pengeluaran dan pemasukan harianmu biar gampang dipantau."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditing(undefined); setShowForm(true) }}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> Tambah catatan
            </button>

            {/* Consolidated Data Management Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowManageMenu(prev => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all hover:bg-paper cursor-pointer"
              >
                <SlidersHorizontal size={14} className="text-muted" />
                <span>Kelola Data</span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {showManageMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowManageMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-2xl border border-line bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95">
                    <button
                      onClick={() => { setShowManageMenu(false); setShowCsvImport(true) }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors text-left cursor-pointer"
                    >
                      <Upload size={14} className="text-green" /> Impor CSV
                    </button>
                    <button
                      onClick={() => { setShowManageMenu(false); exportFilteredCsv() }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors text-left cursor-pointer"
                    >
                      <Download size={14} className="text-muted" /> Export CSV (Hasil Filter)
                    </button>
                    <button
                      onClick={() => { setShowManageMenu(false); setShowExportTemplate(true) }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors text-left cursor-pointer"
                    >
                      <FileSpreadsheet size={14} className="text-green" /> Format Bulanan (Ledger)
                    </button>
                    <div className="my-1 border-t border-line/60" />
                    <button
                      onClick={() => { setShowManageMenu(false); exportJsonBackup() }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink hover:bg-paper transition-colors text-left cursor-pointer"
                    >
                      <Archive size={14} className="text-muted" /> Backup JSON Lengkap
                    </button>
                    <button
                      onClick={() => { setShowManageMenu(false); setShowJsonRestore(true) }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-blue hover:bg-paper transition-colors text-left cursor-pointer"
                    >
                      <Upload size={14} className="text-blue" /> Pulihkan (Restore) JSON
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />
      
      {/* Polished & Structured Filter Panel (Solves Image 1 cluttering) */}
      <section className="mb-4 rounded-[20px] border border-line bg-card p-5 shadow-[0_4px_20px_rgba(30,50,73,0.03)]">
        {/* Row 1: Search + Jenis + Kategori + Urutkan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.6fr)_minmax(130px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)] gap-3">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Receipt size={16} className="absolute left-3.5 text-muted pointer-events-none" />
            <input
              id="transaction-search"
              value={query}
              onChange={e => { setQuery(e.target.value); setVisibleCount(10) }}
              placeholder="Cari kategori atau catatan..."
              className="w-full rounded-xl border border-line bg-paper pl-10 pr-9 py-2.5 text-xs text-ink placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-muted hover:text-ink transition-colors"
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Jenis Dropdown */}
          <div>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setVisibleCount(10) }}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green cursor-pointer"
            >
              <option value="Semua tipe">Semua tipe</option>
              <option value="income">Pemasukan (+)</option>
              <option value="expense">Pengeluaran (-)</option>
            </select>
          </div>

          {/* Kategori Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setVisibleCount(10) }}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green cursor-pointer"
            >
              <option value="Semua kategori">Semua kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Urutkan Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-xs font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green cursor-pointer"
            >
              <option value="date-desc">Terbaru (Tanggal)</option>
              <option value="date-asc">Terlama (Tanggal)</option>
              <option value="amount-desc">Nominal Terbesar</option>
              <option value="amount-asc">Nominal Terkecil</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Range + Month Steppers + Presets */}
        <div className="mt-4 pt-3.5 border-t border-line/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Picker with Month Stepper */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-0.5">Periode:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => stepMonth(-1)}
                title="Bulan Sebelumnya"
                className="rounded-lg border border-line bg-paper p-1.5 text-muted hover:bg-black/5 hover:text-ink transition-colors cursor-pointer"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft size={15} />
              </button>
              <input
                type="date"
                value={from}
                onChange={e => { setFrom(e.target.value); setVisibleCount(10) }}
                className="w-[125px] sm:w-auto rounded-lg border border-line bg-paper px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              />
              <span className="text-xs text-muted">s/d</span>
              <input
                type="date"
                value={to}
                onChange={e => { setTo(e.target.value); setVisibleCount(10) }}
                className="w-[125px] sm:w-auto rounded-lg border border-line bg-paper px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
              />
              <button
                type="button"
                onClick={() => stepMonth(1)}
                title="Bulan Berikutnya"
                className="rounded-lg border border-line bg-paper p-1.5 text-muted hover:bg-black/5 hover:text-ink transition-colors cursor-pointer"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">Preset:</span>
            <button
              type="button"
              onClick={() => setPreset('all')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                !from && !to ? 'bg-ink !text-white' : 'bg-paper border border-line/60 text-muted hover:text-ink'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setPreset('today')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                from === isoDate(new Date()) && to === isoDate(new Date())
                  ? 'bg-ink !text-white'
                  : 'bg-paper border border-line/60 text-muted hover:text-ink'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setPreset('month')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                from === monthBounds().start && to === monthBounds().end
                  ? 'bg-ink !text-white'
                  : 'bg-paper border border-line/60 text-muted hover:text-ink'
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => setPreset('7days')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                from === isoDate(new Date(Date.now() - 7 * 86400000)) && to === isoDate(new Date())
                  ? 'bg-ink !text-white'
                  : 'bg-paper border border-line/60 text-muted hover:text-ink'
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setPreset('30days')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                from === isoDate(new Date(Date.now() - 30 * 86400000)) && to === isoDate(new Date())
                  ? 'bg-ink !text-white'
                  : 'bg-paper border border-line/60 text-muted hover:text-ink'
              }`}
            >
              30 Hari
            </button>

            {isFilterActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-coral hover:underline cursor-pointer"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Custom Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-line/50 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">Tag:</span>
            <button
              type="button"
              onClick={() => { setSelectedTag(''); setVisibleCount(10) }}
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
                onClick={() => { setSelectedTag(selectedTag === tag ? '' : tag); setVisibleCount(10) }}
                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                  selectedTag === tag ? 'bg-green text-white' : 'bg-green-soft text-green hover:bg-green/20'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </section>
      
      <div className="transaction-layout">
        {/* Main List Panel */}
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
            <>
              <div className="transaction-list">
                {displayedTransactions.map(t => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    onEdit={() => { setEditing(t); setShowForm(true) }}
                    onDelete={() => remove(t)}
                  />
                ))}
              </div>

              {/* Pagination & Load More Controls (Solves Image 3) */}
              {filtered.length > 10 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 border-t border-line/60">
                  <span className="text-xs text-muted font-medium">
                    Menampilkan <strong>{displayedTransactions.length}</strong> dari <strong>{filtered.length}</strong> transaksi
                  </span>
                  <div className="flex items-center gap-2">
                    {displayedTransactions.length < filtered.length ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setVisibleCount(prev => prev + 10)}
                          className="rounded-xl border border-line bg-card px-3.5 py-1.5 text-xs font-bold text-ink shadow-2xs hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                        >
                          Muat 10 Lagi
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisibleCount(filtered.length)}
                          className="rounded-xl bg-ink px-3.5 py-1.5 text-xs font-bold !text-white shadow-2xs hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
                        >
                          Tampilkan Semua ({filtered.length})
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(10)}
                        className="rounded-xl border border-line bg-card px-3.5 py-1.5 text-xs font-bold text-blue hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                      >
                        Perkecil (Tampilkan 10)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
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

        {/* Dynamic Financial Companion Card (Solves Image 3 static card & Image 1 redundancy) */}
        <aside className="panel quick-note flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="note-number flex items-center gap-1">
                <Sparkles size={13} className="text-green" />
                {currentInsight.badge}
              </span>
              {/* Top-right next button removed per user request (redundant) */}
            </div>
            <h3 className="mt-6 font-display font-bold">{currentInsight.title}</h3>
            <p className="mt-3 text-xs leading-relaxed text-[#B9C6BD]">{currentInsight.body}</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
            <span>Wawasan Cukupin</span>
            {companionInsights.length > 1 && (
              <button
                type="button"
                onClick={() => setTipIndex(prev => prev + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-[#BEE6CF] hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Tips Berikutnya</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </aside>
      </div>

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

      {showJsonRestore && (
        <RestoreJsonModal
          supabase={supabase}
          userId={userId}
          onClose={() => setShowJsonRestore(false)}
          onRestored={data.refresh}
        />
      )}
    </>
  )
}

