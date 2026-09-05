// Quiet Ledger: deterministic aggregation helpers; no AI or external service involved.
import type { Transaction } from '@/lib/database.types'

export const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
export const shortCurrency = (value: number) => value >= 1000000 ? `Rp ${(value / 1000000).toFixed(1)} jt` : value >= 1000 ? `Rp ${(value / 1000).toFixed(0)} rb` : currency(value)
export const monthLabel = (date = new Date()) => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date)
export const isoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthBounds(offset = 0) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)
  return { start: isoDate(start), end: isoDate(end) }
}

export function totals(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  return { income, expense, balance: income - expense }
}

export function dailySeries(transactions: Transaction[], days = 30) {
  const result: { label: string; income: number; expense: number }[] = []
  const end = new Date(); end.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(end); day.setDate(end.getDate() - i)
    const key = isoDate(day)
    const dayTx = transactions.filter(t => t.transaction_date === key)
    result.push({ label: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(day), income: dayTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0), expense: dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) })
  }
  return result
}

export function categoryBreakdown(transactions: Transaction[]) {
  const grouped = transactions.filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Number(t.amount); return acc }, {})
  return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

export function comparator(current: Transaction[], previous: Transaction[]) {
  const now = categoryBreakdown(current)
  const old = categoryBreakdown(previous)
  const names = Array.from(new Set([...now.map(x => x.name), ...old.map(x => x.name)]))
  return names.map(category => {
    const currentValue = now.find(x => x.name === category)?.value || 0
    const previousValue = old.find(x => x.name === category)?.value || 0
    const change = previousValue === 0 ? currentValue > 0 ? 100 : 0 : ((currentValue - previousValue) / previousValue) * 100
    return { category, current: currentValue, previous: previousValue, change }
  }).sort((a, b) => b.current - a.current)
}
