// vitest globals used
import {
  currency,
  shortCurrency,
  monthLabel,
  isoDate,
  monthBounds,
  totals,
  dailySeries,
  categoryBreakdown,
  comparator,
  calculateDailySafeSpend,
  budgetRule503020,
  paymentMethodBreakdown,
  escapeCsvField,
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

  describe('monthLabel', () => {
    it('formats Date into localized Indonesian month name and year', () => {
      const d = new Date(2026, 8, 1) // Sep 2026
      const label = monthLabel(d)
      expect(label.toLowerCase()).toContain('september')
      expect(label).toContain('2026')
    })

    it('defaults to current date when called with no arguments', () => {
      const label = monthLabel()
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
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

  describe('dailySeries', () => {
    it('aggregates income and expenses per day across given number of days', () => {
      const today = isoDate(new Date())
      const txs: Transaction[] = [
        { id: '1', user_id: 'u1', type: 'income', category: 'Gaji', amount: 1000000, transaction_date: today, description: 'Gaji', note: null, created_at: '' },
        { id: '2', user_id: 'u1', type: 'expense', category: 'Makan', amount: 50000, transaction_date: today, description: 'Makan', note: null, created_at: '' },
      ]
      const series = dailySeries(txs, 7)
      expect(series).toHaveLength(7)
      const lastDay = series[series.length - 1]
      expect(lastDay.income).toBe(1000000)
      expect(lastDay.expense).toBe(50000)
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

  describe('comparator', () => {
    const currentTxs: Transaction[] = [
      { id: '1', user_id: 'u1', type: 'expense', category: 'Food', amount: 600000, transaction_date: '2026-09-01', description: 'Makan', note: null, created_at: '' },
      { id: '2', user_id: 'u1', type: 'expense', category: 'Transport', amount: 200000, transaction_date: '2026-09-01', description: 'Bensin', note: null, created_at: '' },
    ]
    const previousTxs: Transaction[] = [
      { id: '3', user_id: 'u1', type: 'expense', category: 'Food', amount: 400000, transaction_date: '2026-08-01', description: 'Makan', note: null, created_at: '' },
      { id: '4', user_id: 'u1', type: 'expense', category: 'Utilities', amount: 300000, transaction_date: '2026-08-01', description: 'Listrik', note: null, created_at: '' },
    ]

    it('computes category comparison and percentage delta between two periods', () => {
      const comparison = comparator(currentTxs, previousTxs)
      expect(comparison).toHaveLength(3) // Food, Utilities, Transport

      const food = comparison.find(c => c.category === 'Food')
      expect(food).toBeDefined()
      expect(food?.current).toBe(600000)
      expect(food?.previous).toBe(400000)
      expect(food?.change).toBe(50) // +50%

      const transport = comparison.find(c => c.category === 'Transport')
      expect(transport?.current).toBe(200000)
      expect(transport?.previous).toBe(0)
      expect(transport?.change).toBe(100) // from 0 to positive -> 100%
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
      expect(result.needs).toBe(2000000)
      expect(result.wants).toBe(1000000)
      expect(result.totalExpense).toBe(3000000)
      expect(result.needsPct).toBe(67)
      expect(result.wantsPct).toBe(33)
    })
  })

  describe('paymentMethodBreakdown', () => {
    it('aggregates expenses by payment method and calculates percentages', () => {
      const txs: Transaction[] = [
        { id: '1', user_id: 'u1', type: 'expense', category: 'Food', amount: 50000, payment_method: 'qris', transaction_date: '2026-09-01', description: 'Bakso', note: null, created_at: '' },
        { id: '2', user_id: 'u1', type: 'expense', category: 'Food', amount: 150000, payment_method: 'qris', transaction_date: '2026-09-02', description: 'Resto', note: null, created_at: '' },
        { id: '3', user_id: 'u1', type: 'expense', category: 'Shopping', amount: 300000, payment_method: 'debit', transaction_date: '2026-09-03', description: 'Baju', note: null, created_at: '' },
        { id: '4', user_id: 'u1', type: 'income', category: 'Gaji', amount: 5000000, payment_method: 'transfer', transaction_date: '2026-09-01', description: 'Gaji', note: null, created_at: '' },
      ]
      const breakdown = paymentMethodBreakdown(txs)
      expect(breakdown).toHaveLength(2)
      expect(breakdown[0]).toEqual({ method: 'debit', amount: 300000, percentage: 60 })
      expect(breakdown[1]).toEqual({ method: 'qris', amount: 200000, percentage: 40 })
    })

    it('defaults unspecified payment method to "Lainnya / Tidak Ditentukan"', () => {
      const txs: Transaction[] = [
        { id: '1', user_id: 'u1', type: 'expense', category: 'Food', amount: 20000, transaction_date: '2026-09-01', description: 'Kopi', note: null, created_at: '' },
      ]
      const breakdown = paymentMethodBreakdown(txs)
      expect(breakdown[0].method).toBe('Lainnya / Tidak Ditentukan')
      expect(breakdown[0].amount).toBe(20000)
      expect(breakdown[0].percentage).toBe(100)
    })
  })

  describe('escapeCsvField (OWASP Anti-Formula Injection)', () => {
    it('neutralizes spreadsheet formula prefixes with a leading single quote', () => {
      expect(escapeCsvField('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)\"')
      expect(escapeCsvField('+12345')).toBe('"\'+12345\"')
      expect(escapeCsvField('-danger')).toBe('"\'-danger\"')
      expect(escapeCsvField('@HYPERLINK(\"http://evil.com\")')).toBe('"\'@HYPERLINK(\"\"http://evil.com\"\")\"')
      expect(escapeCsvField('\tcmd.exe')).toBe('"\'\tcmd.exe\"')
    })

    it('escapes internal quotes by doubling them per RFC 4180', () => {
      expect(escapeCsvField('Belanja "Bulanan" Pasar')).toBe('"Belanja ""Bulanan"" Pasar"')
    })

    it('wraps ordinary strings and numbers in safe quotes', () => {
      expect(escapeCsvField('Gaji Bulanan')).toBe('"Gaji Bulanan"')
      expect(escapeCsvField(5000000)).toBe('"5000000"')
    })

    it('handles null and undefined safely', () => {
      expect(escapeCsvField(null)).toBe('""')
      expect(escapeCsvField(undefined)).toBe('""')
    })
  })

  describe('Savings Pace & Recurring Allocation Logic', () => {
    it('calculates 3-month savings pace correctly', () => {
      const targetAmount = 5000000
      const currentAmount = 2000000
      const diff = Math.max(0, targetAmount - currentAmount)
      const monthlyPace = Math.ceil(diff / 3)
      expect(monthlyPace).toBe(1000000)
      expect(shortCurrency(monthlyPace)).toBe('Rp 1.0 jt')
    })

    it('identifies feasibility against monthly net surplus', () => {
      const statsBalance = 1500000
      const totalPaceNeeded = 1000000
      const isFeasible = statsBalance >= totalPaceNeeded
      expect(isFeasible).toBe(true)

      const deficitBalance = 800000
      expect(deficitBalance >= totalPaceNeeded).toBe(false)
    })

    it('correctly associates recurring savings bill with target goal by name', () => {
      const goals = [
        { id: 'g1', user_id: 'u1', name: 'Dana Darurat', target_amount: 10000000, current_amount: 2000000, created_at: '' },
        { id: 'g2', user_id: 'u1', name: 'Liburan Bali', target_amount: 3000000, current_amount: 1000000, created_at: '' },
      ]

      const bill = {
        id: 'b1',
        user_id: 'u1',
        name: 'Tabungan: Dana Darurat',
        amount: 1000000,
        category: 'Tabungan',
        due_day: 25,
        frequency: 'monthly' as const,
        is_active: true,
        created_at: '',
      }

      const cleanBillName = bill.name.toLowerCase().replace('tabungan:', '').trim()
      const matchingGoal = goals.find((g) => {
        const gName = g.name.toLowerCase().trim()
        return cleanBillName.includes(gName) || gName.includes(cleanBillName)
      })

      expect(matchingGoal).toBeDefined()
      expect(matchingGoal?.id).toBe('g1')

      // Simulated auto-increment
      const newAmount = Number(matchingGoal?.current_amount || 0) + bill.amount
      expect(newAmount).toBe(3000000)
    })
  })
})
