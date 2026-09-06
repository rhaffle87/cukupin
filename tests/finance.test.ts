import { describe, it, expect } from 'vitest'
import {
  currency,
  shortCurrency,
  isoDate,
  monthBounds,
  totals,
  categoryBreakdown,
  calculateDailySafeSpend,
  budgetRule503020,
} from '@/lib/finance'
import type { Transaction } from '@/lib/database.types'

describe('Finance Library Utility Functions', () => {
  describe('currency formatting', () => {
    it('formats numbers into Indonesian Rupiah format with thousand separators', () => {
      const result = currency(1500000)
      expect(result).toContain('1.500.000')
      expect(result).toContain('Rp')
    })

    it('handles 0 correctly', () => {
      const result = currency(0)
      expect(result).toContain('0')
      expect(result).toContain('Rp')
    })

    it('handles negative values correctly', () => {
      const result = currency(-250000)
      expect(result).toContain('250.000')
    })
  })

  describe('shortCurrency', () => {
    it('formats millions with "jt" abbreviation', () => {
      expect(shortCurrency(2500000)).toBe('Rp 2.5 jt')
      expect(shortCurrency(10000000)).toBe('Rp 10.0 jt')
    })

    it('formats thousands with "rb" abbreviation', () => {
      expect(shortCurrency(75000)).toBe('Rp 75 rb')
      expect(shortCurrency(500000)).toBe('Rp 500 rb')
    })

    it('falls back to standard currency for values below 1000', () => {
      const result = shortCurrency(500)
      expect(result).toContain('500')
      expect(result).toContain('Rp')
    })
  })

  describe('isoDate', () => {
    it('formats JavaScript Date into YYYY-MM-DD string', () => {
      const d = new Date(2026, 8, 15) // Sep 15, 2026
      expect(isoDate(d)).toBe('2026-09-15')
    })
  })

  describe('monthBounds', () => {
    it('returns start and end dates for current month bounds', () => {
      const bounds = monthBounds(0)
      expect(bounds.start).toMatch(/^\d{4}-\d{2}-01$/)
      expect(bounds.end).toMatch(/^\d{4}-\d{2}-(28|29|30|31)$/)
    })
  })

  describe('totals', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        user_id: 'test-user',
        type: 'income',
        category: 'Gaji',
        amount: 5000000,
        transaction_date: '2026-09-01',
        description: 'Gaji Bulanan',
        note: null,
        created_at: '2026-09-01T08:00:00Z',
      },
      {
        id: '2',
        user_id: 'test-user',
        type: 'expense',
        category: 'Food',
        amount: 1500000,
        transaction_date: '2026-09-05',
        description: 'Makan',
        note: null,
        created_at: '2026-09-05T12:00:00Z',
      },
      {
        id: '3',
        user_id: 'test-user',
        type: 'expense',
        category: 'Transport',
        amount: 500000,
        transaction_date: '2026-09-06',
        description: 'Bensin & Tol',
        note: null,
        created_at: '2026-09-06T10:00:00Z',
      },
    ]

    it('calculates aggregate income, expense, and net balance correctly', () => {
      const result = totals(mockTransactions)
      expect(result.income).toBe(5000000)
      expect(result.expense).toBe(2000000)
      expect(result.balance).toBe(3000000)
    })

    it('returns zeroes when transactions array is empty', () => {
      const result = totals([])
      expect(result.income).toBe(0)
      expect(result.expense).toBe(0)
      expect(result.balance).toBe(0)
    })
  })

  describe('categoryBreakdown', () => {
    const mockExpenses: Transaction[] = [
      {
        id: '1',
        user_id: 'u1',
        type: 'expense',
        category: 'Food',
        amount: 300000,
        transaction_date: '2026-09-01',
        description: 'Makan Siang',
        note: null,
        created_at: '',
      },
      {
        id: '2',
        user_id: 'u1',
        type: 'expense',
        category: 'Food',
        amount: 200000,
        transaction_date: '2026-09-02',
        description: 'Makan Malam',
        note: null,
        created_at: '',
      },
      {
        id: '3',
        user_id: 'u1',
        type: 'expense',
        category: 'Transport',
        amount: 100000,
        transaction_date: '2026-09-03',
        description: 'Ojek Online',
        note: null,
        created_at: '',
      },
      {
        id: '4',
        user_id: 'u1',
        type: 'income',
        category: 'Bonus',
        amount: 1000000,
        transaction_date: '2026-09-01',
        description: 'Bonus Kinerja',
        note: null,
        created_at: '',
      },
    ]

    it('groups expenses by category and sorts them descending by amount', () => {
      const result = categoryBreakdown(mockExpenses)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ name: 'Food', value: 500000 })
      expect(result[1]).toEqual({ name: 'Transport', value: 100000 })
    })
  })

  describe('calculateDailySafeSpend', () => {
    it('calculates daily allowance based on remaining days in the month', () => {
      const fakeDate = new Date(2026, 8, 20) // Sep 20, Sep has 30 days -> 11 remaining days
      const result = calculateDailySafeSpend(1100000, fakeDate)
      expect(result.remainingDays).toBe(11)
      expect(result.dailyAllowance).toBe(100000)
      expect(result.totalDays).toBe(30)
    })

    it('returns zero daily allowance when balance is depleted or negative', () => {
      const fakeDate = new Date(2026, 8, 20)
      const result = calculateDailySafeSpend(-50000, fakeDate)
      expect(result.dailyAllowance).toBe(0)
    })
  })

  describe('budgetRule503020', () => {
    it('computes 50/30/20 category distributions and percentages', () => {
      const expenses: Transaction[] = [
        { id: '1', user_id: 'u1', type: 'expense', category: 'Food', amount: 2000000, transaction_date: '2026-09-01', description: 'Belanja', note: null, created_at: '' },
        { id: '2', user_id: 'u1', type: 'expense', category: 'Shopping', amount: 1000000, transaction_date: '2026-09-02', description: 'Baju', note: null, created_at: '' },
      ]
      const result = budgetRule503020(expenses)
      expect(result.needs).toBe(2000000) // Food is categorized as needs
      expect(result.wants).toBe(1000000) // Shopping is categorized as wants
      expect(result.totalExpense).toBe(3000000)
      expect(result.needsPct).toBe(67)
      expect(result.wantsPct).toBe(33)
    })
  })
})
