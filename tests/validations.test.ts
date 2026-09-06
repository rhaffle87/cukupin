import { describe, it, expect } from 'vitest'
import {
  sanitizeNumericInput,
  formatRupiahInput,
  transactionSchema,
  goalSchema,
  wishlistSchema,
  recurringBillSchema,
  categoryBudgetSchema,
} from '@/lib/validations/finance'
import { escapeCsvField } from '@/lib/finance'

describe('Finance Validations & Input Sanitization', () => {
  describe('sanitizeNumericInput', () => {
    it('strips Rp prefix, thousand dots, spaces, and commas', () => {
      expect(sanitizeNumericInput('Rp 1.500.000')).toBe(1500000)
      expect(sanitizeNumericInput('25,000')).toBe(25000)
      expect(sanitizeNumericInput('   50000   ')).toBe(50000)
    })

    it('returns numeric values intact', () => {
      expect(sanitizeNumericInput(250000)).toBe(250000)
    })

    it('handles empty string or non-digit inputs gracefully', () => {
      expect(sanitizeNumericInput('')).toBe(0)
      expect(sanitizeNumericInput('invalid text')).toBe(0)
    })
  })

  describe('formatRupiahInput', () => {
    it('formats raw string or number into thousand dots representation', () => {
      expect(formatRupiahInput('1500000')).toBe('1.500.000')
      expect(formatRupiahInput(25000)).toBe('25.000')
    })

    it('strips invalid characters while formatting on keystroke', () => {
      expect(formatRupiahInput('Rp 100abc000')).toBe('100.000')
    })

    it('returns empty string for null, undefined, or empty values', () => {
      expect(formatRupiahInput(null)).toBe('')
      expect(formatRupiahInput(undefined)).toBe('')
      expect(formatRupiahInput('')).toBe('')
    })
  })

  describe('transactionSchema', () => {
    it('validates a correct transaction payload', () => {
      const valid = {
        type: 'expense',
        amount: 25000,
        category: 'Food',
        transaction_date: '2026-09-06',
        description: 'Makan Siang',
        note: '#kantor',
        payment_method: 'QRIS',
      }
      const result = transactionSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects 0 or negative amounts', () => {
      const invalid = {
        type: 'expense',
        amount: 0,
        category: 'Food',
        transaction_date: '2026-09-06',
        description: 'Makan',
      }
      const result = transactionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('rejects malformed transaction date formats', () => {
      const invalid = {
        type: 'income',
        amount: 1000000,
        category: 'Salary',
        transaction_date: '06/09/2026', // wrong format
        description: 'Gaji',
      }
      const result = transactionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('goalSchema', () => {
    it('validates a correct saving goal', () => {
      const valid = { name: 'Dana Darurat', target_amount: 10000000 }
      const result = goalSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects empty name and non-positive targets', () => {
      expect(goalSchema.safeParse({ name: '', target_amount: 1000 }).success).toBe(false)
      expect(goalSchema.safeParse({ name: 'Liburan', target_amount: -500 }).success).toBe(false)
    })
  })

  describe('wishlistSchema', () => {
    it('validates wishlist items with valid priorities', () => {
      const valid = { name: 'Mechanical Keyboard', price: 850000, priority: 'High' }
      const result = wishlistSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('rejects invalid priority types', () => {
      const invalid = { name: 'Mousepad', price: 150000, priority: 'Urgent' }
      const result = wishlistSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })

  describe('recurringBillSchema & categoryBudgetSchema', () => {
    it('validates recurring bill with due day between 1 and 31', () => {
      const validBill = {
        name: 'Internet IndiHome',
        amount: 350000,
        category: 'Bills',
        due_day: 15,
        frequency: 'monthly',
      }
      expect(recurringBillSchema.safeParse(validBill).success).toBe(true)

      const invalidBill = { ...validBill, due_day: 35 }
      expect(recurringBillSchema.safeParse(invalidBill).success).toBe(false)
    })

    it('validates category budget limit', () => {
      const validBudget = { category: 'Food', monthly_limit: 2000000 }
      expect(categoryBudgetSchema.safeParse(validBudget).success).toBe(true)

      const invalidBudget = { category: 'Food', monthly_limit: -100 }
      expect(categoryBudgetSchema.safeParse(invalidBudget).success).toBe(false)
    })
  })

  describe('escapeCsvField (OWASP CSV Injection Defense)', () => {
    it('handles normal strings and numbers', () => {
      expect(escapeCsvField('Kopi Janji Jiwa')).toBe('"Kopi Janji Jiwa"')
      expect(escapeCsvField(50000)).toBe('"50000"')
    })

    it('handles null and undefined gracefully', () => {
      expect(escapeCsvField(null)).toBe('""')
      expect(escapeCsvField(undefined)).toBe('""')
      expect(escapeCsvField('')).toBe('""')
    })

    it('escapes quotes within the field value', () => {
      expect(escapeCsvField('Catatan "spesial"')).toBe('"Catatan ""spesial"""')
    })

    it('neutralizes formula injection triggers (=, +, -, @, \\t, \\r)', () => {
      expect(escapeCsvField('=cmd|"/c calc"!A0')).toBe('"\'=cmd|""/c calc""!A0"')
      expect(escapeCsvField('+12345')).toBe('"\' +12345"'.replace(' ', ''))
      expect(escapeCsvField('-1000')).toBe('"\' -1000"'.replace(' ', ''))
      expect(escapeCsvField('@SUM(A1:B10)')).toBe('"\'@SUM(A1:B10)"')
      expect(escapeCsvField('\tTAB_PREFIX')).toBe('"\'\tTAB_PREFIX"')
      expect(escapeCsvField('\rCR_PREFIX')).toBe('"\'\rCR_PREFIX"')
    })
  })
})

