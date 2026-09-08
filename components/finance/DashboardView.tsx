import React, { useMemo, useState, useRef } from 'react'
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
        <div className="h-[140px] w-full max-w-[320px] self-end ml-auto md:ml-0 md:self-auto rounded-[22px] border border-white/10 bg-white/5 md:h-[175px] md:w-[280px]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
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

interface CategoryPieChartProps {
  breakdown: Array<{ name: string; value: number }>
  totalExpense: number
  colors: string[]
}

function CategoryPieChart({ breakdown, totalExpense, colors }: CategoryPieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeItem, setActiveItem] = useState<{
    name: string
    value: number
    color: string
    percent: number
  } | null>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)

  const total = totalExpense || breakdown.reduce((sum, item) => sum + item.value, 0)

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCursorPos({ x, y })

    // Distance check from center: cy=110, cx=width/2
    const cx = rect.width / 2
    const cy = rect.height / 2
    const dist = Math.hypot(x - cx, y - cy)
    // If mouse moves into the donut center hole or outside outer radius, clear active item
    if (dist < 58 || dist > 108) {
      setActiveItem(null)
    }
  }

  const handleContainerMouseLeave = () => {
    setCursorPos(null)
    setActiveItem(null)
  }

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div
        ref={containerRef}
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
        onPointerLeave={handleContainerMouseLeave}
        className="relative h-[220px] w-full select-none"
      >
        {/* Center label */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <strong className="block font-display text-xl sm:text-2xl font-bold text-ink leading-none">
            {shortCurrency(totalExpense)}
          </strong>
          <small className="mt-1 block text-[10px] font-semibold text-muted tracking-wider uppercase">
            total
          </small>
        </div>

        {/* Floating cursor-following tooltip */}
        {activeItem && cursorPos && (
          <div
            className="pointer-events-none absolute z-30 transition-transform duration-75 ease-out"
            style={{
              left: 0,
              top: 0,
              transform: (() => {
                const width = containerRef.current?.clientWidth || 300
                const height = containerRef.current?.clientHeight || 220
                const tooltipW = 145
                const tooltipH = 52
                let tx = cursorPos.x + 12
                let ty = cursorPos.y + 12

                if (cursorPos.x + 12 + tooltipW > width - 6) {
                  tx = cursorPos.x - tooltipW - 12
                }

                if (cursorPos.y + 12 + tooltipH > height - 6) {
                  ty = cursorPos.y - tooltipH - 12
                }

                tx = Math.max(4, Math.min(tx, width - tooltipW - 4))
                ty = Math.max(4, Math.min(ty, height - tooltipH - 4))
                return `translate3d(${tx}px, ${ty}px, 0)`
              })(),
            }}
          >
            <div className="min-w-[145px] rounded-xl border border-line bg-card/95 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: activeItem.color }}
                />
                <span className="text-xs font-bold text-ink truncate max-w-[95px]">
                  {activeItem.name}
                </span>
                <span className="ml-auto text-[10px] font-semibold text-muted">
                  {activeItem.percent}%
                </span>
              </div>
              <div
                className="mt-1 font-numeric text-xs font-bold tabular-nums"
                style={{ color: activeItem.color }}
              >
                {currency(activeItem.value)}
              </div>
            </div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              innerRadius={68}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={500}
              onMouseEnter={(_, index) => {
                const item = breakdown[index]
                if (item) {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                  setActiveItem({
                    name: item.name,
                    value: item.value,
                    color: colors[index % colors.length],
                    percent: pct,
                  })
                }
              }}
              onMouseMove={(_, index, e) => {
                const item = breakdown[index]
                if (item && (!activeItem || activeItem.name !== item.name)) {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                  setActiveItem({
                    name: item.name,
                    value: item.value,
                    color: colors[index % colors.length],
                    percent: pct,
                  })
                }
                if (containerRef.current && e) {
                  const rect = containerRef.current.getBoundingClientRect()
                  setCursorPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  })
                }
              }}
              onMouseLeave={() => {
                setActiveItem(null)
              }}
            >
              {breakdown.map((_, i) => (
                <Cell
                  key={i}
                  fill={colors[i % colors.length]}
                  className="transition-all duration-200 cursor-pointer outline-none hover:opacity-90"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
        {breakdown.slice(0, 4).map((item, i) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-[11px] text-ink cursor-pointer rounded-lg px-2 py-1 -mx-2 transition-colors hover:bg-black/5"
            onMouseEnter={() => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
              setActiveItem({
                name: item.name,
                value: item.value,
                color: colors[i % colors.length],
                percent: pct,
              })
              setCursorPos({ x: 150, y: 110 })
            }}
            onMouseLeave={() => {
              setActiveItem(null)
              setCursorPos(null)
            }}
          >
            <span className="flex items-center gap-2">
              <i className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
              <span className="font-medium">{item.name}</span>
            </span>
            <strong
              className="font-bold tabular-nums"
              style={{ color: colors[i % colors.length] }}
            >
              {shortCurrency(item.value)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

interface DashboardViewProps {
  data: ReturnType<typeof useFinanceData>
  user: { id?: string; email?: string } | null
  supabase?: SupabaseClient | null
}

export function DashboardView({ data, user, supabase }: DashboardViewProps) {
  const [showWrapped, setShowWrapped] = useState(false)
  const [barRange, setBarRange] = useState<'30d' | '7d'>('30d')

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
      <div className="relative mb-4 flex min-h-[240px] flex-col justify-between gap-6 overflow-hidden rounded-[24px] bg-ink p-5 sm:p-7 md:px-8 lg:px-11 md:py-7 text-white md:min-h-[230px] md:flex-row md:items-center animate-in slide-in-from-bottom-2 duration-500">
        {/* Subtle circular arc in background matching Image 2 */}
        <div className="pointer-events-none absolute -right-14 -top-20 h-[380px] w-[380px] rounded-full border border-white/[0.08] shadow-[0_0_0_28px_rgba(255,255,255,0.018),0_0_0_64px_rgba(255,255,255,0.012)]" />

        <div className="relative z-10 max-w-[500px]">
          <p className="text-[11px] font-bold tracking-widest text-[#B9C6BD] uppercase">{monthLabel().toUpperCase()}</p>
          <h1 className="mt-2.5 font-display text-[1.85rem] xs:text-[2.15rem] sm:text-4xl md:text-[2.35rem] lg:text-[2.6rem] font-bold leading-tight tracking-tight">
            Halo, {firstName}.<br />
            <em className="text-mint not-italic">Cek uangmu bulan ini.</em>
          </h1>
          <p className="mt-4 sm:mt-5 max-w-[340px] text-[13px] sm:text-sm leading-relaxed text-[#C0CBC4] md:max-w-[420px]">
            Pantau pengeluaran hari ini biar tetap santai sampai akhir bulan.
          </p>
        </div>

        {/* Authentic Ultra-Premium ATM / Debit Card (Solves Image 4) */}
        <div className="relative z-10 w-full max-w-[320px] sm:max-w-[340px] aspect-[1.586/1] self-end ml-auto md:ml-0 md:self-auto rounded-[22px] border border-white/20 bg-gradient-to-br from-[#1E2E40] via-[#142230] to-[#0A131C] p-4 sm:p-5 shadow-[0_16px_38px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.25)] flex flex-col justify-between overflow-hidden group select-none transition-all duration-300 hover:border-mint/35 md:mr-1">
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
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-white/80 uppercase">
                Sisa Saldo
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase ${
                stats.balance >= 0 
                  ? 'bg-green/20 text-mint border border-mint/20' 
                  : 'bg-coral/20 text-coral-light border border-coral/30'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stats.balance >= 0 ? 'bg-mint animate-pulse' : 'bg-coral'}`} />
                {stats.balance >= 0 ? 'MASIH AMAN' : 'PERLU DICEK'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline">
              <strong className="font-numeric text-2xl sm:text-[27px] font-extrabold leading-none tracking-tight text-mint tabular-nums">
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
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-mint border border-white/10 font-numeric tabular-nums">
                  Aman: {shortCurrency(safeSpend.dailyAllowance)}/hr
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        <div className="col-span-2 sm:col-span-1 animate-in slide-in-from-bottom-2 duration-500 delay-50 fill-mode-both">
          <StatCard label="Pemasukan" featured value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Bulan ini" />
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
            <strong className="text-ink font-bold">Catatan Cukupin™: </strong>
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

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(270px,0.85fr)]">
        <section className="flex flex-col min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <Eyebrow>GRAFIK HARIAN</Eyebrow>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">Pemasukan vs pengeluaran</h2>
            </div>
            <div className="inline-flex items-center rounded-full border border-line bg-canvas/80 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setBarRange('7d')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                  barRange === '7d' ? 'bg-card text-ink shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                7 hari
              </button>
              <button
                type="button"
                onClick={() => setBarRange('30d')}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                  barRange === '30d' ? 'bg-card text-ink shadow-xs' : 'text-muted hover:text-ink'
                }`}
              >
                30 hari
              </button>
            </div>
          </div>
          {monthTx.length ? (
            <div className="flex-1 w-full min-h-[260px] h-[260px] lg:h-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barRange === '7d' ? series.slice(-7) : series}
                  barGap={barRange === '7d' ? 4 : 2}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#E8E7E0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    interval={barRange === '7d' ? 0 : 5}
                    tick={{ fill: '#829087', fontSize: 10 }}
                  />
                  <YAxis
                    width={44}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#829087', fontSize: 10 }}
                    tickFormatter={v => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(v: any) => currency(Number(v))}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E8E7E0',
                      boxShadow: '0 8px 24px rgba(30,50,73,0.08)',
                      fontSize: 12,
                      padding: '8px 12px',
                    }}
                  />
                  <Bar
                    dataKey="income"
                    name="Pemasukan"
                    fill="#3E8F68"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={barRange === '7d' ? 24 : 14}
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    fill="#D98362"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={barRange === '7d' ? 24 : 14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
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
            </div>
          )}
        </section>

        <section className="flex flex-col min-h-[320px] rounded-[18px] border border-line bg-card p-5 shadow-[0_5px_20px_rgba(30,50,73,0.025)] md:min-h-[347px] md:p-6 animate-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-both">
          <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
            <div>
              <Eyebrow>PENGELUARAN</Eyebrow>
              <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight">Berdasarkan kategori</h2>
            </div>
          </div>
          {breakdown.length ? (
            <CategoryPieChart
              breakdown={breakdown}
              totalExpense={stats.expense}
              colors={colors}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon={CircleDollarSign} title="Belum ada data belanja" body="Kategori bakal muncul otomatis kalau kamu udah catat pengeluaran." />
            </div>
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
