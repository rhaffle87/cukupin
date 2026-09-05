import React, { useMemo } from 'react'
import type { Transaction } from '@/lib/database.types'
import { ArrowDownLeft, ArrowUpRight, BarChart3, ChevronRight, CircleDollarSign, Plus, Wallet, Receipt } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionRow } from './TransactionRow'
import { categoryBreakdown, currency, dailySeries, monthBounds, monthLabel, shortCurrency, totals } from '@/lib/finance'
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
      <div className="relative flex h-[300px] flex-col overflow-hidden rounded-[24px] bg-ink p-6 md:h-[250px] md:p-11">
        <div className="mt-6 h-[22px] w-[75%] rounded-full bg-white/20 md:w-[38%]" />
        <div className="mt-4 h-[10px] w-[58%] rounded-full bg-white/20 md:w-[25%]" />
        <div className="absolute bottom-4 right-4 h-[90px] w-[175px] rounded-[15px] bg-white/10 md:top-10 md:right-11 md:h-[130px] md:w-[240px]" />
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
            AKTIVITAS TERBARU
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
          title="Belum ada transaksi"
          body="Semua catatanmu akan muncul di sini."
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
  const { monthTx, stats, series, breakdown } = useMemo(() => {
    const current = monthBounds()
    const tx = data.transactions.filter(t => t.transaction_date >= current.start && t.transaction_date <= current.end)
    return {
      monthTx: tx,
      stats: totals(tx),
      series: dailySeries(tx),
      breakdown: categoryBreakdown(tx)
    }
  }, [data.transactions])

  if (data.loading) return <DashboardSkeleton />

  const firstName = user?.email?.split('@')[0] || 'teman'

  return (
    <>
      <div className="relative mb-4 flex min-h-[300px] flex-col justify-between gap-6 overflow-hidden rounded-[24px] bg-ink p-7 text-white md:min-h-[250px] md:flex-row md:p-11 animate-in slide-in-from-bottom-2 duration-500">
        <div className="absolute -right-24 -top-24 h-[330px] w-[330px] rounded-full border border-white/10 shadow-[0_0_0_26px_rgba(255,255,255,0.025),0_0_0_52px_rgba(255,255,255,0.02)]" />
        
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase">{monthLabel().toUpperCase()}</p>
          <h1 className="mt-2.5 font-display text-[2.45rem] font-bold leading-tight tracking-tight md:text-[clamp(2.1rem,4vw,3.55rem)]">
            Halo, {firstName}.<br />
            <em className="text-[#BEE6CF] not-italic">Yuk lihat keadaanmu.</em>
          </h1>
          <p className="mt-5 max-w-[280px] text-xs leading-relaxed text-[#C0CBC4] md:max-w-[420px]">
            Sedikit kejelasan hari ini bisa bikin keputusan besok terasa lebih ringan.
          </p>
        </div>
        
        <div className="absolute bottom-4 right-4 z-10 flex h-[90px] w-[175px] items-end justify-end md:static md:w-[240px] md:self-stretch">
          <img src="/manus-storage/cukupin-texture-1_8ebb966d.png" alt="" className="absolute inset-0 h-full w-full rounded-2xl object-cover opacity-15 mix-blend-overlay" />
          <div className="relative p-1.5 text-right md:p-3.5">
            <span className="block text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase">{stats.balance >= 0 ? 'Ruang masih ada' : 'Perlu perhatian'}</span>
            <strong className="my-1.5 block font-display text-[23px] text-[#BEE6CF] md:text-[31px]">{shortCurrency(Math.abs(stats.balance))}</strong>
            <small className="block text-[11px] text-[#BAC9C0]">{stats.balance >= 0 ? 'sisa saldo bulan ini' : 'selisih pengeluaran'}</small>
          </div>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-50 fill-mode-both">
          <StatCard label="Pemasukan" value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Bulan berjalan" />
        </div>
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-75 fill-mode-both">
          <StatCard label="Pengeluaran" value={currency(stats.expense)} tone="coral" icon={ArrowUpRight} note="Bulan berjalan" />
        </div>
        <div className="animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <StatCard label="Sisa saldo" value={currency(stats.balance)} tone="blue" icon={Wallet} note={stats.balance >= 0 ? 'Masih terkendali' : 'Perlu ditinjau'} />
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.55fr)_minmax(270px,0.85fr)]">
        <section className="min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
                ARUS HARIAN
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
              title="Belum ada aliran uang"
              body="Tambahkan transaksi pertamamu untuk melihat pola harian."
              action={
                <Link href="/transactions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFF3F0] px-4 py-2.5 text-[11px] font-bold text-green transition-transform hover:scale-[0.98]">
                  <Plus size={15} /> Tambah transaksi
                </Link>
              }
            />
          )}
        </section>
        
        <section className="min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#89938A] uppercase before:block before:h-[1px] before:w-[19px] before:bg-blue after:block after:-ml-[5px] after:h-[4px] after:w-[4px] after:rounded-full after:bg-green">
                KE MANA PERGINYA?
              </p>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">Pengeluaran per kategori</h2>
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
            <EmptyState icon={CircleDollarSign} title="Belum ada kategori" body="Kategori akan muncul setelah ada pengeluaran." />
          )}
        </section>
      </div>
      <RecentTransactions transactions={monthTx.slice(0, 5)} />
    </>
  )
}
