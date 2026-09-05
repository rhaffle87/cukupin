import React, { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Download, FileSpreadsheet, FileText, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionRow } from './TransactionRow'
import { useFinanceData } from '@/hooks/useFinanceData'
import { comparator, currency, monthBounds, totals } from '@/lib/finance'
import { MonthlyExpenseTemplate } from './MonthlyExpenseTemplate'

export function ReportsView({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [showTemplate, setShowTemplate] = useState(false)
  const [from, setFrom] = useState(monthBounds().start)
  const [to, setTo] = useState(monthBounds().end)

  const { filtered, stats, comp } = useMemo(() => {
    const f = data.transactions.filter(t => t.transaction_date >= from && t.transaction_date <= to)
    const s = totals(f)
    const c = comparator(
      data.transactions.filter(t => t.transaction_date >= monthBounds().start && t.transaction_date <= monthBounds().end),
      data.transactions.filter(t => t.transaction_date >= monthBounds(-1).start && t.transaction_date <= monthBounds(-1).end)
    )
    return { filtered: f, stats: s, comp: c }
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
          <div className="flex items-center gap-2">
            <button className="button secondary" onClick={() => setShowTemplate(true)}>
              <FileSpreadsheet size={16} /> Template Bulanan
            </button>
            <button className="button primary" onClick={exportPdf}>
              <Download size={16} /> Export Ringkas
            </button>
          </div>
        }
      />
      
      <div className="report-filters panel">
        <div>
          <p className="eyebrow">RENTANG TANGGAL</p>
          <strong>Pilih periode laporan</strong>
        </div>
        <label>
          Dari
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <span>—</span>
        <label>
          Sampai
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
      </div>
      
      <div className="report-stats">
        <StatCard label="Pemasukan" value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Periode ini" />
        <StatCard label="Pengeluaran" value={currency(stats.expense)} tone="coral" icon={ArrowUpRight} note="Periode ini" />
        <StatCard label="Saldo akhir" value={currency(stats.balance)} tone="blue" icon={Wallet} note="Sisa uang periode ini" />
      </div>
      
      <section className="panel comparator-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PERBANDINGAN</p>
            <h2>Bulan ini vs bulan lalu</h2>
          </div>
          <div className="formula-chip">hitung otomatis</div>
        </div>
        
        {comp.length ? (
          <div className="compare-list">
            {comp.map(item => (
              <div className="compare-row" key={item.category}>
                <div className="compare-label">
                  <strong>{item.category}</strong>
                  <span>{currency(item.current)} vs {currency(item.previous)}</span>
                </div>
                <div className="compare-track">
                  <span style={{ width: `${Math.min(100, Math.max(4, (item.current / Math.max(item.current, item.previous || 1)) * 100))}%` }} />
                </div>
                <div className={`compare-change ${item.change > 0 ? 'up' : 'down'}`}>
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
      
      <section className="panel report-table">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">DAFTAR TRANSAKSI</p>
            <h2>Rincian transaksi</h2>
          </div>
        </div>
        {filtered.length ? (
          <div className="transaction-list">
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
