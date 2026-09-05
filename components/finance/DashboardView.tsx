import React, { useMemo } from 'react'
import type { Transaction } from '@/lib/database.types'
import { ArrowDownLeft, ArrowUpRight, BarChart3, ChevronRight, CircleDollarSign, Plus, Wallet } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionRow } from './TransactionRow'
import { categoryBreakdown, currency, dailySeries, monthBounds, monthLabel, shortCurrency, totals } from '@/lib/finance'
import { useFinanceData } from '@/hooks/useFinanceData'

// Lazy load Recharts for performance optimization
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })

const colors = ['#3E8F68', '#315DCB', '#D98362', '#8E9A8B', '#1E3249']

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-label="Memuat ringkasan keuangan">
      <div className="skeleton-hero">
        <div className="skeleton-line wide" />
        <div className="skeleton-line medium" />
        <div className="skeleton-box" />
      </div>
      <div className="skeleton-stats">
        {[1, 2, 3].map(i => (
          <div className="skeleton-card" key={i}>
            <div className="skeleton-line small" />
            <div className="skeleton-line value" />
            <div className="skeleton-line tiny" />
          </div>
        ))}
      </div>
      <div className="skeleton-panels">
        <div className="skeleton-card tall">
          <div className="skeleton-line medium" />
          <div className="skeleton-chart" />
        </div>
        <div className="skeleton-card tall">
          <div className="skeleton-line medium" />
          <div className="skeleton-donut" />
        </div>
      </div>
    </div>
  )
}

function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <section className="panel recent-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AKTIVITAS TERBARU</p>
          <h2>Transaksi bulan ini</h2>
        </div>
        <Link href="/transactions" className="text-link">
          Lihat semua <ChevronRight size={14} />
        </Link>
      </div>
      {transactions.length ? (
        <div className="transaction-list">
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
            <Link href="/transactions" className="button secondary small">
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
      <div className="hero-band">
        <div>
          <p className="eyebrow">{monthLabel().toUpperCase()}</p>
          <h1>
            Halo, {firstName}.<br />
            <em>Yuk lihat keadaanmu.</em>
          </h1>
          <p className="hero-desc">Sedikit kejelasan hari ini bisa bikin keputusan besok terasa lebih ringan.</p>
        </div>
        <div className="hero-mark">
          <img src="/manus-storage/cukupin-texture-1_8ebb966d.png" alt="Cukupin Hero Background Texture" />
          <div>
            <span className="hero-mark-number">{stats.balance >= 0 ? 'Ruang masih ada' : 'Perlu perhatian'}</span>
            <strong>{shortCurrency(Math.abs(stats.balance))}</strong>
            <small>{stats.balance >= 0 ? 'sisa saldo bulan ini' : 'selisih pengeluaran'}</small>
          </div>
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard label="Pemasukan" value={currency(stats.income)} tone="green" icon={ArrowDownLeft} note="Bulan berjalan" />
        <StatCard label="Pengeluaran" value={currency(stats.expense)} tone="coral" icon={ArrowUpRight} note="Bulan berjalan" />
        <StatCard label="Sisa saldo" value={currency(stats.balance)} tone="blue" icon={Wallet} note={stats.balance >= 0 ? 'Masih terkendali' : 'Perlu ditinjau'} />
      </div>
      
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ARUS HARIAN</p>
              <h2>Pemasukan vs pengeluaran</h2>
            </div>
            <span className="period-pill">
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
                <Link href="/transactions" className="button secondary small">
                  <Plus size={15} /> Tambah transaksi
                </Link>
              }
            />
          )}
        </section>
        
        <section className="panel category-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">KE MANA PERGINYA?</p>
              <h2>Pengeluaran per kategori</h2>
            </div>
          </div>
          {breakdown.length ? (
            <>
              <div className="donut-wrap">
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
                <div className="donut-center">
                  <strong>{shortCurrency(stats.expense)}</strong>
                  <small>total</small>
                </div>
              </div>
              <div className="legend-list">
                {breakdown.slice(0, 4).map((item, i) => (
                  <div key={item.name}>
                    <span>
                      <i style={{ background: colors[i % colors.length] }} />
                      {item.name}
                    </span>
                    <strong>{shortCurrency(item.value)}</strong>
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
