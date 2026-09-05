import React, { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Download, FileSpreadsheet, FileText, PieChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionRow } from './TransactionRow'
import { useFinanceData } from '@/hooks/useFinanceData'
import { budgetRule503020, comparator, currency, monthBounds, totals } from '@/lib/finance'
import { MonthlyExpenseTemplate } from './MonthlyExpenseTemplate'

export function ReportsView({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [showTemplate, setShowTemplate] = useState(false)
  const [from, setFrom] = useState(monthBounds().start)
  const [to, setTo] = useState(monthBounds().end)

  const { filtered, stats, comp, rule503020 } = useMemo(() => {
    const f = data.transactions.filter(t => t.transaction_date >= from && t.transaction_date <= to)
    const s = totals(f)
    const c = comparator(
      data.transactions.filter(t => t.transaction_date >= monthBounds().start && t.transaction_date <= monthBounds().end),
      data.transactions.filter(t => t.transaction_date >= monthBounds(-1).start && t.transaction_date <= monthBounds(-1).end)
    )
    const b50 = budgetRule503020(f)
    return { filtered: f, stats: s, comp: c, rule503020: b50 }
  }, [data.transactions, from, to])

  function exportPdf() {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF()
      doc.setTextColor('#1E3249')
      doc.setFontSize(24)
      doc.text('cukupin', 20, 24)
      doc.setFontSize(10)
      doc.setTextColor('#718078')
      doc.text(`Laporan ${from} — ${to}`, 20, 33)
      doc.setFontSize(12)
      doc.setTextColor('#1E3249')
      doc.text(`Pemasukan: ${currency(stats.income)}`, 20, 52)
      doc.text(`Pengeluaran: ${currency(stats.expense)}`, 20, 61)
      doc.text(`Saldo akhir: ${currency(stats.balance)}`, 20, 70)
      
      let y = 88
      filtered.slice(0, 22).forEach(t => {
        doc.setTextColor('#1E3249')
        doc.text(`${t.transaction_date}  ${t.category}`, 20, y)
        doc.text(`${t.type === 'income' ? '+' : '-'} ${currency(Number(t.amount))}`, 145, y)
        y += 8
      })
      
      doc.save(`cukupin-${from}-${to}.pdf`)
      toast.success('Laporan PDF diunduh.')
    })
  }

  return (
    <>
      <PageHeader
        eyebrow="RINGKASAN"
        title="Laporan"
        subtitle="Cek ringkasan dan perbandingan pengeluaranmu."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTemplate(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink shadow-xs transition-all hover:bg-[#EFF3F0] hover:text-green active:scale-95"
            >
              <FileSpreadsheet size={15} className="text-green" /> Template Bulanan
            </button>
            <button
              onClick={exportPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95"
            >
              <Download size={15} /> Export PDF
            </button>
          </div>
        }
      />
      
      {/* Date Filter Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_4px_16px_rgba(30,50,73,0.02)]">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
            RENTANG TANGGAL
          </p>
          <strong className="mt-1 block font-display text-lg font-bold text-ink">Pilih periode laporan</strong>
        </div>
        <div className="flex items-center gap-2.5">
          <label className="flex flex-col text-[11px] font-bold text-muted">
            Dari
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="mt-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            />
          </label>
          <span className="self-end pb-2 text-muted">—</span>
          <label className="flex flex-col text-[11px] font-bold text-muted">
            Sampai
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="mt-1 rounded-lg border border-line bg-paper px-3 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            />
          </label>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
        <StatCard label="Pemasukan" value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Periode ini" />
        <StatCard label="Pengeluaran" value={currency(stats.expense)} tone="coral" icon={ArrowUpRight} note="Periode ini" />
        <StatCard label="Saldo akhir" value={currency(stats.balance)} tone="blue" icon={Wallet} note="Sisa uang periode ini" />
      </div>

      {/* 50/30/20 Budget Rule Breakdown */}
      {rule503020.totalExpense > 0 && (
        <section className="mb-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
                POLA PENGELUARAN (50/30/20)
              </p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-ink">Kebutuhan vs Keinginan</h2>
            </div>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-[10px] font-bold text-muted">
              Total {currency(rule503020.totalExpense)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line/60 bg-paper/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-xs font-bold text-ink">Kebutuhan Pokok</strong>
                <span className="text-xs font-bold text-blue">{rule503020.needsPct}% (ideal: 50%)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${Math.min(100, rule503020.needsPct)}%` }} />
              </div>
              <small className="mt-2 block text-[10px] text-muted">
                {currency(rule503020.needs)} · Makan, Transport, Tagihan, Kesehatan
              </small>
            </div>

            <div className="rounded-xl border border-line/60 bg-paper/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-xs font-bold text-ink">Keinginan & Lifestyle</strong>
                <span className="text-xs font-bold text-coral">{rule503020.wantsPct}% (ideal: 30%)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${Math.min(100, rule503020.wantsPct)}%` }} />
              </div>
              <small className="mt-2 block text-[10px] text-muted">
                {currency(rule503020.wants)} · Belanja, Hiburan & Lainnya
              </small>
            </div>
          </div>
        </section>
      )}
      
      {/* Month-over-Month Comparator */}
      <section className="mb-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
              PERBANDINGAN
            </p>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink">Bulan ini vs bulan lalu</h2>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold text-muted">
            hitung otomatis
          </span>
        </div>
        
        {comp.length ? (
          <div className="flex flex-col gap-4">
            {comp.map(item => (
              <div className="grid grid-cols-[140px_minmax(100px,1fr)_70px] sm:grid-cols-[180px_minmax(100px,1fr)_80px] items-center gap-3.5" key={item.category}>
                <div>
                  <strong className="block text-xs font-bold text-ink">{item.category}</strong>
                  <span className="block text-[10px] text-muted">{currency(item.current)} vs {currency(item.previous)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-blue transition-all"
                    style={{ width: `${Math.min(100, Math.max(4, (item.current / Math.max(item.current, item.previous || 1)) * 100))}%` }}
                  />
                </div>
                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${item.change > 0 ? 'text-coral' : 'text-green'}`}>
                  {item.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(item.change).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={TrendingDown}
            title="Belum ada data perbandingan"
            body="Catat pengeluaran di minimal dua bulan berbeda buat lihat perbandingannya."
          />
        )}
      </section>
      
      {/* Filtered Transactions Table */}
      <section className="rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
        <div className="mb-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
            DAFTAR TRANSAKSI
          </p>
          <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink">Rincian transaksi</h2>
        </div>
        {filtered.length ? (
          <div className="flex flex-col">
            {filtered.map(t => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </div>
        ) : (
          <EmptyState icon={FileText} title="Nggak ada transaksi" body="Coba ganti pilihan tanggal laporanmu." />
        )}
      </section>

      {showTemplate && (
        <MonthlyExpenseTemplate
          transactions={data.transactions}
          onClose={() => setShowTemplate(false)}
        />
      )}
    </>
  )
}
