import React, { useMemo } from 'react'
import type { Transaction } from '@/lib/database.types'
import { ArrowDownLeft, ArrowUpRight, BarChart3, ChevronRight, CircleDollarSign, Plus, Wallet, Receipt, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionRow } from './TransactionRow'
import { categoryBreakdown, currency, dailySeries, monthBounds, monthLabel, shortCurrency, totals, calculateDailySafeSpend } from '@/lib/finance'
import { useFinanceData } from '@/hooks/useFinanceData'

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
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
            CATATAN TERBARU
          </p>
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
  user: { email?: string } | null
}

export function DashboardView({ data, user }: DashboardViewProps) {
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
          <h1 className="mt-2.5 font-display text-[2.45rem] font-bold leading-tight tracking-tight md:text-[clamp(2.1rem,4vw,3.55rem)]">
            Halo, {firstName}.<br />
            <em className="text-[#BEE6CF] not-italic">Cek uangmu bulan ini.</em>
          </h1>
          <p className="mt-5 max-w-[320px] text-xs leading-relaxed text-[#C0CBC4] md:max-w-[420px]">
            Pantau pengeluaran hari ini biar tetap santai sampai akhir bulan.
          </p>
        </div>
        
        {/* Sleek compact balance card container matching Image 2 */}
        <div className="relative z-10 flex h-[140px] w-full max-w-[260px] flex-col justify-center rounded-[20px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.2)] backdrop-blur-md md:mr-1">
          <div className="flex flex-col items-end text-right">
            <span className="block text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase">
              {stats.balance >= 0 ? 'MASIH AMAN' : 'PERLU DICEK'}
            </span>
            <strong className="my-1.5 block font-display text-[32px] md:text-[36px] font-bold leading-none tracking-tight text-[#BEE6CF]">
              {shortCurrency(Math.abs(stats.balance))}
            </strong>
            <small className="block text-[11px] text-[#BAC9C0]">
              {stats.balance >= 0 ? 'sisa uang bulan ini' : 'pengeluaran melebihi pemasukan'}
            </small>
            {stats.balance > 0 && (
              <span className="mt-1.5 inline-flex items-center rounded-full bg-white/[0.08] px-2 py-0.5 text-[9px] font-semibold text-[#BEE6CF]">
                Aman: {shortCurrency(safeSpend.dailyAllowance)}/hr
              </span>
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
      <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-line bg-card p-4 shadow-[0_2px_12px_rgba(30,50,73,0.02)] animate-in slide-in-from-bottom-2 duration-500 delay-100">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-soft text-green">
          <Sparkles size={16} />
        </div>
        <p className="text-xs leading-relaxed text-muted">
          <strong className="text-ink font-bold">Catatan Cukupin: </strong>
          {insight}
        </p>
      </div>
      
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.55fr)_minmax(270px,0.85fr)]">
        <section className="min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
                GRAFIK HARIAN
              </p>
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
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
                PENGELUARAN
              </p>
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
      <RecentTransactions transactions={monthTx.slice(0, 5)} />
    </>
  )
}
