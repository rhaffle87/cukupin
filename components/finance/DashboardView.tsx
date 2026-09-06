import React, { useMemo, useState } from 'react'
import type { Transaction } from '@/lib/database.types'
import { ArrowDownLeft, ArrowUpRight, BarChart3, ChevronRight, CircleDollarSign, Plus, Wallet, Receipt, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { TransactionRow } from './TransactionRow'
import { categoryBreakdown, currency, dailySeries, monthBounds, monthLabel, shortCurrency, totals, calculateDailySafeSpend } from '@/lib/finance'
import { useFinanceData } from '@/hooks/useFinanceData'
import { CategoryBudgetWidget } from './CategoryBudgetWidget'
import { SupabaseClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'

const FinancialWrappedModal = dynamic(
  () => import('./FinancialWrappedModal').then(mod => mod.FinancialWrappedModal),
  { ssr: false }
)

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const colors = ['#3E8F68', '#315DCB', '#D98362', '#8E9A8B', '#1E3249']

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-label="Memuat ringkasan keuangan">
      <div className="relative flex h-[300px] flex-col justify-between overflow-hidden rounded-[24px] bg-ink p-6 md:h-[250px] md:flex-row md:items-center md:p-11">
        <div className="flex-1">
          <div className="h-[10px] w-[120px] rounded-full bg-white/20" />
          <div className="mt-4 h-[32px] w-[75%] rounded-full bg-white/20 md:w-[48%]" />
          <div className="mt-4 h-[12px] w-[58%] rounded-full bg-white/20 md:w-[35%]" />
        </div>
        <div className="h-[140px] w-full rounded-[22px] border border-white/10 bg-white/5 md:h-[175px] md:w-[280px]" />
      </div>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {[1, 2, 3].map(i => (
          <div className="flex h-[116px] flex-col rounded-[18px] border border-line bg-card p-3 md:h-[150px] md:p-5" key={i}>
            <div className="h-[10px] w-[35%] rounded-full bg-line" />
            <div className="mt-[18px] h-[20px] w-[58%] rounded-full bg-line md:mt-[24px] md:h-[26px]" />
            <div className="mt-[13px] h-[7px] w-[25%] rounded-full bg-line" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.55fr_0.85fr]">
        <div className="flex h-[260px] flex-col rounded-[18px] border border-line bg-card p-5 md:h-[340px]">
          <div className="h-[10px] w-[25%] rounded-full bg-line" />
          <div className="mt-9 h-[180px] w-full bg-line/50 opacity-80" />
        </div>
        <div className="hidden h-[340px] flex-col rounded-[18px] border border-line bg-card p-5 md:flex">
          <div className="h-[10px] w-[25%] rounded-full bg-line" />
          <div className="mx-auto mt-14 h-[145px] w-[145px] rounded-full border-[20px] border-line/50" />
        </div>
      </div>
    </div>
  )
}

function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <section className="mt-4 rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-150 fill-mode-both">
      <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
        <div>
          <Eyebrow>CATATAN TERBARU</Eyebrow>
          <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">Transaksi bulan ini</h2>
        </div>
        <Link href="/transactions" className="flex items-center gap-1 bg-transparent text-[11px] font-bold text-blue">
          Lihat semua <ChevronRight size={14} />
        </Link>
      </div>
      {transactions.length ? (
        <div className="flex flex-col">
          {transactions.map(t => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Belum ada catatan"
          body="Transaksi yang kamu input bakal muncul di sini."
          action={
            <Link href="/transactions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFF3F0] px-4 py-2.5 text-[11px] font-bold text-green transition-transform hover:scale-[0.98]">
              <Plus size={15} /> Catat transaksi
            </Link>
          }
        />
      )}
    </section>
  )
}

interface DashboardViewProps {
  data: ReturnType<typeof useFinanceData>
  user: { id?: string; email?: string } | null
  supabase?: SupabaseClient | null
}

export function DashboardView({ data, user, supabase }: DashboardViewProps) {
  const [showWrapped, setShowWrapped] = useState(false)

  const { monthTx, stats, series, breakdown, insight, safeSpend } = useMemo(() => {
    const current = monthBounds()
    const tx = data.transactions.filter(t => t.transaction_date >= current.start && t.transaction_date <= current.end)
    const st = totals(tx)
    const bd = categoryBreakdown(tx)
    const safe = calculateDailySafeSpend(st.balance)

    let ins = 'Mulai catat transaksi pertamamu biar pola pengeluaranmu terlihat jelas.'
    if (bd.length > 0 && st.expense > 0) {
      const top = bd[0]
      const pct = Math.round((top.value / st.expense) * 100)
      if (st.balance >= 0) {
        ins = `Pengeluaran terbanyakmu ada di ${top.name} (${pct}%). Budget amanmu sekitar ${shortCurrency(safe.dailyAllowance)}/hari untuk ${safe.remainingDays} hari ke depan.`
      } else {
        ins = `Pengeluaran bulan ini sedikit melebihi pemasukan, paling besar di ${top.name} (${pct}%). Yuk atur pengeluaran berikutnya lebih santai.`
      }
    } else if (tx.length > 0 && st.expense === 0) {
      ins = 'Pemasukan bulan ini tercatat rapi. Belum ada pengeluaran yang dicatat.'
    }

    return {
      monthTx: tx,
      stats: st,
      series: dailySeries(data.transactions),
      breakdown: bd,
      insight: ins,
      safeSpend: safe,
    }
  }, [data.transactions])

  if (data.loading) return <DashboardSkeleton />

  const firstName = user?.email?.split('@')[0] || 'teman'

  return (
    <>
      <div className="relative mb-4 flex min-h-[240px] flex-col justify-between gap-6 overflow-hidden rounded-[24px] bg-ink p-7 text-white md:min-h-[230px] md:flex-row md:items-center md:px-11 md:py-8 animate-in slide-in-from-bottom-2 duration-500">
        {/* Subtle circular arc in background matching Image 2 */}
        <div className="pointer-events-none absolute -right-14 -top-20 h-[380px] w-[380px] rounded-full border border-white/[0.08] shadow-[0_0_0_28px_rgba(255,255,255,0.018),0_0_0_64px_rgba(255,255,255,0.012)]" />

        <div className="relative z-10 max-w-[500px]">
          <p className="text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase">{monthLabel().toUpperCase()}</p>
          <h1 className="mt-2.5 font-display text-[2.45rem] font-bold leading-tight tracking-tight">
            Halo, {firstName}.<br />
            <em className="text-mint not-italic">Cek uangmu bulan ini.</em>
          </h1>
          <p className="mt-5 max-w-[320px] text-xs leading-relaxed text-[#C0CBC4] md:max-w-[420px]">
            Pantau pengeluaran hari ini biar tetap santai sampai akhir bulan.
          </p>
        </div>

        {/* Authentic Ultra-Premium ATM / Debit Card (Solves Image 4) */}
        <div className="relative z-10 w-full max-w-[320px] sm:max-w-[340px] aspect-[1.586/1] rounded-[22px] border border-white/20 bg-gradient-to-br from-[#1E2E40] via-[#142230] to-[#0A131C] p-4 sm:p-5 shadow-[0_16px_38px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden group select-none transition-all duration-300 hover:border-mint/35 md:mr-1">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-mint/[0.08] blur-2xl" />
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-500/[0.06] blur-xl" />

          {/* Top Bar: EMV Chip + NFC Wave + Brand & Status */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* EMV Gold Micro-Chip with Circuit Traces */}
              <div className="relative h-6 w-8 sm:h-7 sm:w-9 rounded-md bg-gradient-to-br from-[#F5D77F] via-[#D4AF37] to-[#996515] p-0.5 shadow-inner border border-[#E6C760]/70 flex flex-col justify-between overflow-hidden">
                <div className="h-[1px] w-full bg-black/30 mt-1" />
                <div className="flex justify-between h-full py-0.5">
                  <div className="w-[1px] h-full bg-black/30 ml-2" />
                  <div className="w-[1px] h-full bg-black/30 mr-2" />
                </div>
                <div className="h-[1px] w-full bg-black/30 mb-1" />
              </div>
              {/* Contactless NFC Wave */}
              <svg className="w-4 h-4 text-white/45 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M8.5 15.5a6 6 0 0 1 7 0" />
                <path d="M12 18.5a1 1 0 0 1 0 0" />
              </svg>
            </div>

            {/* Brand Pill */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold tracking-widest text-white/90 uppercase font-sans">
                CUKUPIN <span className="text-mint font-bold text-[8px] px-1 py-0.5 rounded bg-white/10 ml-0.5">DEBIT</span>
              </span>
            </div>
          </div>

          {/* Middle Section: Balance & Live Status */}
          <div className="relative z-10 my-auto py-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold tracking-widest text-white/60 uppercase">
                Sisa Saldo
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${
                stats.balance >= 0 
                  ? 'bg-green/20 text-mint border border-mint/20' 
                  : 'bg-coral/20 text-coral-light border border-coral/30'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stats.balance >= 0 ? 'bg-mint animate-pulse' : 'bg-coral'}`} />
                {stats.balance >= 0 ? 'MASIH AMAN' : 'PERLU DICEK'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline">
              <strong className="font-mono text-2xl sm:text-[27px] font-extrabold leading-none tracking-tight text-mint tabular-nums">
                {currency(stats.balance)}
              </strong>
            </div>
          </div>

          {/* Bottom Bar: Masked Card Number, Name, & Safe Daily Spend */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-end justify-between text-white/70">
            <div>
              <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-white/60">
                •••• •••• •••• 2026
              </p>
              <p className="mt-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-white/80 font-sans truncate max-w-[130px]">
                {firstName.toUpperCase()}
              </p>
            </div>
            {stats.balance > 0 && (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-mint border border-white/10 font-mono tabular-nums">
                  Aman: {shortCurrency(safeSpend.dailyAllowance)}/hr
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-50 fill-mode-both">
          <StatCard label="Pemasukan" value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Bulan ini" />
        </div>
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both">
          <StatCard label="Pengeluaran" value={currency(stats.expense)} tone="coral" icon={ArrowUpRight} note="Bulan ini" />
        </div>
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <StatCard label="Sisa saldo" value={currency(stats.balance)} tone="blue" icon={Wallet} note={stats.balance >= 0 ? 'Masih aman' : 'Mulai menipis'} />
        </div>
      </div>

      {/* Smart Contextual Spending Insight Banner */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[18px] border border-line bg-card p-4 shadow-[0_2px_12px_rgba(30,50,73,0.02)] animate-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-soft text-green">
            <Sparkles size={16} />
          </div>
          <p className="text-xs leading-relaxed text-muted">
            <strong className="text-ink font-bold">Catatan Cukupin: </strong>
            {insight}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowWrapped(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-green hover:underline cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <span>Lihat Rapor Keuangan</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Pending Recurring Bills Alert */}
      {(() => {
        const currentMonthStr = new Date().toISOString().slice(0, 7)
        const pendingBills = (data.bills || []).filter(
          (b) => b.is_active && b.last_logged_month !== currentMonthStr
        )
        if (pendingBills.length === 0) return null
        const totalPending = pendingBills.reduce((s, b) => s + b.amount, 0)
        return (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[18px] border border-amber-500/20 bg-amber-500/5 p-4 shadow-2xs animate-in slide-in-from-bottom-2 duration-500 delay-120">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800">
                <Receipt size={16} />
              </div>
              <div>
                <p className="text-xs text-ink font-semibold">
                  Ada {pendingBills.length} tagihan rutin belum dicatat bulan ini ({currency(totalPending)})
                </p>
                <p className="text-[11px] text-muted">
                  {pendingBills.slice(0, 3).map((b) => b.name).join(', ')}
                  {pendingBills.length > 3 ? '...' : ''}
                </p>
              </div>
            </div>
            <Link
              href="/transactions?tab=bills"
              className="shrink-0 inline-flex items-center justify-center gap-1 rounded-xl bg-card border border-line px-3 py-1.5 text-xs font-bold text-ink hover:bg-black/5 active:scale-95 transition-all"
            >
              <span>Catat Sekarang</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        )
      })()}

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.55fr)_minmax(270px,0.85fr)]">
        <section className="min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <Eyebrow>GRAFIK HARIAN</Eyebrow>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">Pemasukan vs pengeluaran</h2>
            </div>
            <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-1.5 text-[9px] text-muted md:text-[10px]">
              30 hari terakhir <ChevronRight size={13} />
            </span>
          </div>
          {monthTx.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={series} barGap={2}>
                <CartesianGrid vertical={false} stroke="#E8E7E0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} interval={4} tick={{ fill: '#829087', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#829087', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: any) => currency(Number(v))} contentStyle={{ borderRadius: 10, border: '1px solid #E8E7E0', boxShadow: '0 8px 24px #1e324912' }} />
                <Bar dataKey="income" name="Pemasukan" fill="#3E8F68" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#D98362" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Belum ada data grafik"
              body="Catat pemasukan atau pengeluaranmu dulu yuk buat lihat grafiknya."
              action={
                <Link href="/transactions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFF3F0] px-4 py-2.5 text-[11px] font-bold text-green transition-transform hover:scale-[0.98]">
                  <Plus size={15} /> Tambah catatan
                </Link>
              }
            />
          )}
        </section>

        <section className="min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <Eyebrow>PENGELUARAN</Eyebrow>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">Berdasarkan kategori</h2>
            </div>
          </div>
          {breakdown.length ? (
            <>
              <div className="relative h-[190px]">
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <strong className="block font-display text-[18px] text-ink">{shortCurrency(stats.expense)}</strong>
                  <small className="mt-1 block text-[10px] text-muted">total</small>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie data={breakdown} innerRadius={58} outerRadius={78} paddingAngle={3} dataKey="value">
                      {breakdown.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => currency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                {breakdown.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] text-ink">
                    <span className="flex items-center gap-2">
                      <i className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                      {item.name}
                    </span>
                    <strong className="font-bold">{shortCurrency(item.value)}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={CircleDollarSign} title="Belum ada data belanja" body="Kategori bakal muncul otomatis kalau kamu udah catat pengeluaran." />
          )}
        </section>
      </div>

      <CategoryBudgetWidget
        budgets={data.budgets || []}
        setBudgets={data.setBudgets}
        transactions={monthTx}
        supabase={supabase || null}
        userId={user?.id}
      />

      <RecentTransactions transactions={monthTx.slice(0, 5)} />

      {showWrapped && (
        <FinancialWrappedModal
          isOpen={showWrapped}
          onClose={() => setShowWrapped(false)}
          transactions={data.transactions}
          userName={firstName}
        />
      )}
    </>
  )
}
