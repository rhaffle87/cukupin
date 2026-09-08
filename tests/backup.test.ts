/// <reference types="vitest/globals" />
import { generateFullBackupPayload, validateBackupFile } from '@/lib/backup'
import type { Transaction, SavingGoal, WishlistItem, RecurringBill, CategoryBudget } from '@/lib/database.types'

describe('Backup Systems & Disaster Recovery (lib/backup)', () => {
  const mockTransaction: Transaction = {
    id: 'tx-1',
    user_id: 'user-1',
    type: 'expense',
    amount: 50000,
    category: 'Food',
    transaction_date: '2026-09-07',
    description: 'Nasi Padang',
    note: null,
    created_at: new Date().toISOString(),
  }

  const mockGoal: SavingGoal = {
    id: 'goal-1',
    user_id: 'user-1',
    name: 'Dana Darurat',
    target_amount: 10000000,
    current_amount: 2500000,
    created_at: new Date().toISOString(),
  }

  describe('generateFullBackupPayload', () => {
    it('generates a v2.0 standardized backup payload with correct record counts', () => {
      const payload = generateFullBackupPayload({
        transactions: [mockTransaction],
        goals: [mockGoal],
        wishlist: [],
        bills: [],
        budgets: [],
      })

      expect(payload.app).toBe('cukupin')
      expect(payload.version).toBe('2.0')
      expect(payload.record_counts.transactions).toBe(1)
      expect(payload.record_counts.goals).toBe(1)
      expect(payload.record_counts.wishlist).toBe(0)
      expect(payload.transactions).toHaveLength(1)
      expect(payload.goals).toHaveLength(1)
      expect(payload.exported_at).toBeDefined()
    })

    it('handles empty input objects gracefully', () => {
      const payload = generateFullBackupPayload({})
      expect(payload.record_counts.transactions).toBe(0)
      expect(payload.transactions).toEqual([])
      expect(payload.goals).toEqual([])
    })
  })

  describe('validateBackupFile', () => {
    it('successfully validates a valid JSON backup string', () => {
      const payload = generateFullBackupPayload({
        transactions: [mockTransaction],
        goals: [mockGoal],
      })
      const jsonStr = JSON.stringify(payload)
      const result = validateBackupFile(jsonStr)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.transactions).toHaveLength(1)
      expect(result.data?.goals).toHaveLength(1)
    })

    it('supports backward compatibility with legacy v1.0 backup formats', () => {
      const legacyBackup = {
        app: 'cukupin',
        version: '1.0',
        exported_at: '2026-08-01T00:00:00.000Z',
        transactions: [mockTransaction],
        goals: [],
        wishlist: [],
        bills: [],
        budgets: [],
      }
      const jsonStr = JSON.stringify(legacyBackup)
      const result = validateBackupFile(jsonStr)

      expect(result.success).toBe(true)
      expect(result.data?.version).toBe('1.0')
      expect(result.data?.record_counts.transactions).toBe(1)
    })

    it('rejects invalid or corrupted JSON strings', () => {
      expect(validateBackupFile('').success).toBe(false)
      expect(validateBackupFile('{ malformed json }').success).toBe(false)
      expect(validateBackupFile('12345').success).toBe(false)
    })

    it('rejects JSON payloads with no financial data whatsoever', () => {
      const emptyPayload = {
        app: 'cukupin',
        version: '2.0',
        transactions: [],
        goals: [],
        wishlist: [],
        bills: [],
        budgets: [],
      }
      const result = validateBackupFile(JSON.stringify(emptyPayload))
      expect(result.success).toBe(false)
      expect(result.error).toContain('tidak berisi catatan keuangan apapun')
    })
  })
})
