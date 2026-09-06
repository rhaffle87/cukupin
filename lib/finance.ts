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

/**
 * Calculates remaining days in the current month and daily safe spend allowance.
 */
export function calculateDailySafeSpend(balance: number, referenceDate: Date = new Date()) {
  const now = referenceDate
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()
  const remainingDays = Math.max(1, lastDay - currentDay + 1)
  const dailyAllowance = balance > 0 ? Math.floor(balance / remainingDays) : 0

  return {
    remainingDays,
    totalDays: lastDay,
    dailyAllowance,
  }
}

/**
 * 50/30/20 Budget Rule breakdown for expenses.
 */
export function budgetRule503020(transactions: Transaction[]) {
  const needsCategories = ['Food', 'Transport', 'Bills', 'Health']

  let needs = 0
  let wants = 0

  for (const t of transactions) {
    if (t.type === 'expense') {
      const amt = Number(t.amount) || 0
      if (needsCategories.includes(t.category)) {
        needs += amt
      } else {
        wants += amt
      }
    }
  }

  const totalExpense = needs + wants
  const needsPct = totalExpense > 0 ? Math.round((needs / totalExpense) * 100) : 0
  const wantsPct = totalExpense > 0 ? Math.round((wants / totalExpense) * 100) : 0

  return {
    needs,
    wants,
    totalExpense,
    needsPct,
    wantsPct,
  }
}

/**
 * Breakdown of expenses by payment method.
 */
export function paymentMethodBreakdown(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0)

  const map: Record<string, number> = {}
  for (const t of expenses) {
    const method = t.payment_method || 'Lainnya / Tidak Ditentukan'
    map[method] = (map[method] || 0) + Number(t.amount)
  }

  return Object.entries(map)
    .map(([method, amount]) => ({
      method,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * OWASP CSV Injection (Formula Injection) sanitizer.
 * If a string begins with =, +, -, @, \t, or \r, spreadsheet software (Excel, Calc)
 * can interpret it as a formula or executable command.
 * Prepending a single quote (') disables formula execution and treats the field as pure text.
 */
export function escapeCsvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r']
  const sanitized = dangerousChars.includes(str.charAt(0)) ? `'${str}` : str
  return `"${sanitized.replace(/"/g, '""')}"`
}
