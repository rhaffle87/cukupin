import React, { useMemo, useState } from 'react'
import { AlertCircle, ArrowDownLeft, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, PieChart, Sparkles, Target, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { TransactionRow } from './TransactionRow'
import { useFinanceData } from '@/hooks/useFinanceData'
import dynamic from 'next/dynamic'
import { budgetRule503020, comparator, currency, isoDate, monthBounds, paymentMethodBreakdown, shortCurrency, totals } from '@/lib/finance'

const MonthlyExpenseTemplate = dynamic(
  () => import('./MonthlyExpenseTemplate').then(mod => mod.MonthlyExpenseTemplate),
  { ssr: false }
)
const FinancialWrappedModal = dynamic(
  () => import('./FinancialWrappedModal').then(mod => mod.FinancialWrappedModal),
  { ssr: false }
)

export function ReportsView({ data }: { data: ReturnType<typeof useFinanceData> }) {
  const [showTemplate, setShowTemplate] = useState(false)
  const [showWrapped, setShowWrapped] = useState(false)
  const [from, setFrom] = useState(monthBounds().start)
  const [to, setTo] = useState(monthBounds().end)

  const { filtered, stats, comp, rule503020, paymentMethods } = useMemo(() => {
    const f = data.transactions.filter(t => t.transaction_date >= from && t.transaction_date <= to)
    const s = totals(f)
    const c = comparator(
      data.transactions.filter(t => t.transaction_date >= monthBounds().start && t.transaction_date <= monthBounds().end),
      data.transactions.filter(t => t.transaction_date >= monthBounds(-1).start && t.transaction_date <= monthBounds(-1).end)
    )
    const b50 = budgetRule503020(f)
    const pm = paymentMethodBreakdown(f)
    return { filtered: f, stats: s, comp: c, rule503020: b50, paymentMethods: pm }
  }, [data.transactions, from, to])

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
              onClick={() => setShowWrapped(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-xs font-bold text-ink shadow-2xs transition-all hover:bg-black/5 active:scale-95 cursor-pointer"
            >
              <Sparkles size={15} className="text-green" /> Rapor Cukupin™
            </button>
            <button
              onClick={() => setShowTemplate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-mint" /> Format Bulanan (PDF/Cetak)
            </button>
          </div>
        }
      />
      
      {/* Date Filter Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 rounded-[18px] border border-line bg-card p-4 sm:p-5 shadow-[0_4px_16px_rgba(30,50,73,0.02)]">
        <div className="flex items-center justify-between sm:block">
          <div>
            <Eyebrow>RENTANG TANGGAL</Eyebrow>
            <strong className="mt-1 block font-display text-base sm:text-lg font-bold text-ink">Pilih periode laporan</strong>
          </div>
          {/* Mobile-only month buttons in header */}
          <div className="flex items-center gap-1 sm:hidden">
            <button
              type="button"
              onClick={() => stepMonth(-1)}
              title="Bulan Sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-paper text-muted hover:bg-black/5 hover:text-ink transition-colors cursor-pointer active:scale-95"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => stepMonth(1)}
              title="Bulan Berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-paper text-muted hover:bg-black/5 hover:text-ink transition-colors cursor-pointer active:scale-95"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end sm:gap-2">
          {/* Desktop-only month back button */}
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            title="Bulan Sebelumnya"
            className="hidden sm:inline-flex mb-1 rounded-lg border border-line bg-paper p-1.5 sm:p-2 text-muted hover:bg-black/5 hover:text-ink transition-colors cursor-pointer"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>
          <label className="flex flex-col text-[11px] font-bold text-muted min-w-0">
            Dari
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="mt-1 w-full sm:w-[130px] rounded-lg border border-line bg-paper px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            />
          </label>
          <span className="hidden sm:inline-block self-end pb-2 text-xs font-medium text-muted">s/d</span>
          <label className="flex flex-col text-[11px] font-bold text-muted min-w-0">
            Sampai
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="mt-1 w-full sm:w-[130px] rounded-lg border border-line bg-paper px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            />
          </label>
          {/* Desktop-only month forward button */}
          <button
            type="button"
            onClick={() => stepMonth(1)}
            title="Bulan Berikutnya"
            className="hidden sm:inline-flex mb-1 rounded-lg border border-line bg-paper p-1.5 sm:p-2 text-muted hover:bg-black/5 hover:text-ink transition-colors cursor-pointer"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Stat Cards — Bento: hero card full-width on mobile, 3-col sm+ */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Pemasukan" value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Periode ini" featured />
        </div>
        <StatCard label="Pengeluaran" value={currency(stats.expense)} tone="coral" icon={ArrowUpRight} note="Periode ini" />
        <StatCard label="Saldo akhir" value={currency(stats.balance)} tone="blue" icon={Wallet} note="Sisa uang periode ini" />
      </div>

      {/* 50/30/20 Budget Rule Breakdown */}
      {rule503020.totalExpense > 0 && (
        <section className="mb-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Eyebrow>POLA PENGELUARAN (50/30/20)</Eyebrow>
              <h2 className="mt-1 font-display text-lg sm:text-xl font-bold tracking-tight text-ink">Kebutuhan vs Keinginan</h2>
            </div>
            <span className="self-start sm:self-auto rounded-full border border-line bg-paper px-3 py-1 text-[10px] font-bold font-numeric tabular-nums text-muted">
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

      {/* Payment Method Distribution */}
      {paymentMethods.length > 0 && stats.expense > 0 && (
        <section className="mb-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Eyebrow>METODE PEMBAYARAN</Eyebrow>
              <h2 className="mt-1 font-display text-lg sm:text-xl font-bold tracking-tight text-ink">Distribusi Kanal Belanja</h2>
            </div>
            <span className="self-start sm:self-auto rounded-full border border-line bg-paper px-3 py-1 text-[10px] font-bold text-muted">
              {paymentMethods.length} Kanal Terpakai
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {paymentMethods.map(pm => (
              <div key={pm.method} className="rounded-xl border border-line/70 bg-paper/60 p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <strong className="text-xs font-bold text-ink">{pm.method}</strong>
                  <span className="text-xs font-bold text-blue">{pm.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-blue transition-all"
                    style={{ width: `${Math.min(100, Math.max(4, pm.percentage))}%` }}
                  />
                </div>
                <small className="mt-1.5 block text-[11px] font-numeric tabular-nums font-medium text-muted">
                  {currency(pm.amount)}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Month-over-Month Comparator */}
      <section className="mb-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <Eyebrow>PERBANDINGAN</Eyebrow>
            <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink">Bulan ini vs bulan lalu</h2>
          </div>
          <span className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold text-muted">
            hitung otomatis
          </span>
        </div>
        
        {comp.length ? (
          <div className="flex flex-col gap-3 sm:gap-4">
            {comp.map(item => (
              <div
                className="flex flex-col gap-2 rounded-xl border border-line/40 bg-paper/30 p-3 sm:border-0 sm:bg-transparent sm:p-0 sm:grid sm:grid-cols-[180px_minmax(100px,1fr)_80px] sm:items-center sm:gap-3.5"
                key={item.category}
              >
                <div className="flex items-center justify-between sm:block">
                  <div>
                    <strong className="block text-xs font-bold text-ink">{item.category}</strong>
                    <span className="block text-[10px] font-numeric tabular-nums text-muted">{currency(item.current)} vs {currency(item.previous)}</span>
                  </div>
                  {/* Mobile Percentage Badge */}
                  <div className={`sm:hidden flex items-center gap-1 text-xs font-bold font-numeric tabular-nums shrink-0 ${item.change > 0 ? 'text-coral' : 'text-green'}`}>
                    {item.change > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(item.change).toFixed(0)}%
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-blue transition-all"
                    style={{ width: `${Math.min(100, Math.max(4, (item.current / Math.max(item.current, item.previous || 1)) * 100))}%` }}
                  />
                </div>
                {/* Desktop Percentage */}
                <div className={`hidden sm:flex items-center justify-end gap-1 text-xs font-bold shrink-0 ${item.change > 0 ? 'text-coral' : 'text-green'}`}>
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
      
      {/* Target Tabungan & Rencana Masa Depan */}
      {data.goals && data.goals.length > 0 && (
        <section className="mb-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Eyebrow>TARGET TABUNGAN & RENCANA MASA DEPAN</Eyebrow>
              <h2 className="mt-1 font-display text-lg sm:text-xl font-bold tracking-tight text-ink">
                Progres & Estimasi Pencapaian
              </h2>
            </div>
            <span className="self-start sm:self-auto rounded-full border border-line bg-paper px-3 py-1 text-[10px] font-bold text-muted">
              {data.goals.filter(g => Number(g.current_amount) < Number(g.target_amount)).length} Target Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.goals.map((goal) => {
              const current = Number(goal.current_amount)
              const targetAmt = Number(goal.target_amount)
              const progress = targetAmt > 0 ? Math.min(100, (current / targetAmt) * 100) : 0
              const isCompleted = progress >= 100
              const diff = Math.max(0, targetAmt - current)
              const monthlyPace = diff > 0 ? Math.ceil(diff / 3) : 0

              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-line bg-paper/50 p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-line text-ink shrink-0">
                        <Target size={16} className="text-green" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-ink leading-tight">{goal.name}</h4>
                        <span className="text-[11px] font-numeric tabular-nums text-muted">
                          {currency(current)} dari {currency(targetAmt)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isCompleted ? 'bg-green-soft text-green' : 'bg-blue-soft text-blue'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={11} /> Tercapai
                        </>
                      ) : (
                        `${progress.toFixed(0)}%`
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted ? 'bg-green' : 'bg-blue'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Smart Monthly Pace Note - Strictly Icons, NO emojis */}
                  {!isCompleted && monthlyPace > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-line/60 bg-card px-2.5 py-1.5 text-[11px] text-muted">
                      <Sparkles size={13} className="text-green shrink-0" />
                      <span>
                        Nabung ~{shortCurrency(monthlyPace)}/bln untuk capai dalam 3 bulan
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Feasibility Highlight vs Period Net Surplus */}
          {(() => {
            const totalMonthlyPaceNeeded = data.goals
              .filter((g) => Number(g.current_amount) < Number(g.target_amount))
              .reduce((sum, g) => {
                const diff = Math.max(0, Number(g.target_amount) - Number(g.current_amount))
                return sum + (diff > 0 ? Math.ceil(diff / 3) : 0)
              }, 0)

            if (totalMonthlyPaceNeeded === 0) return null

            const isFeasible = stats.balance >= totalMonthlyPaceNeeded

            return (
              <div
                className={`mt-4 rounded-xl border p-3 flex items-start gap-2.5 text-xs ${
                  isFeasible
                    ? 'border-green/30 bg-green-soft/40 text-green'
                    : 'border-coral/30 bg-coral-soft/40 text-coral'
                }`}
              >
                {isFeasible ? (
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block text-xs font-bold text-ink">
                    {isFeasible
                      ? `Surplus Periode Ini Mencukupi (${currency(stats.balance)})`
                      : `Surplus Belum Mencukupi Target Bulanan (${currency(stats.balance)})`}
                  </strong>
                  <p className="mt-0.5 text-muted leading-relaxed">
                    {isFeasible
                      ? `Sisa bersih periode ini cukup untuk mendanai komitmen seluruh target tabungan aktif (~${shortCurrency(totalMonthlyPaceNeeded)}/bln). Pertahankan ritme ini!`
                      : `Kebutuhan tabungan terencana adalah ~${shortCurrency(totalMonthlyPaceNeeded)}/bln. Pertimbangkan untuk mengurangi belanja non-esensial.`}
                  </p>
                </div>
              </div>
            )
          })()}
        </section>
      )}

      {/* Filtered Transactions Table */}
      <section className="rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6">
        <div className="mb-4">
          <Eyebrow>DAFTAR TRANSAKSI</Eyebrow>
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
          goals={data.goals}
          defaultMonth={from.slice(0, 7)}
          onClose={() => setShowTemplate(false)}
        />
      )}

      {showWrapped && (
        <FinancialWrappedModal
          isOpen={showWrapped}
          onClose={() => setShowWrapped(false)}
          transactions={filtered}
        />
      )}
    </>
  )
}
