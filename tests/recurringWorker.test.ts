/// <reference types="vitest/globals" />
import {
  getDueBillsToAutoLog,
  isAutoRecurringLoggingEnabled,
  setAutoRecurringLoggingEnabled,
  executeBatchAutoLog,
  AUTO_RECURRING_CONFIG_KEY,
} from '@/lib/recurringBillsWorker'
import { RecurringBill } from '@/lib/database.types'

describe('Recurring Bills Background Worker & Pure Filtering Engine', () => {
  const sampleBills: RecurringBill[] = [
    {
      id: 'bill-1',
      user_id: 'user-1',
      name: 'WiFi Indihome',
      amount: 350000,
      category: 'Bills',
      due_day: 5,
      frequency: 'monthly',
      payment_method: 'Transfer Bank',
      is_active: true,
      last_logged_month: '2026-08',
      created_at: '2026-08-01T00:00:00Z',
    },
    {
      id: 'bill-2',
      user_id: 'user-1',
      name: 'Netflix Premium',
      amount: 186000,
      category: 'Bills',
      due_day: 15,
      frequency: 'monthly',
      payment_method: 'Kartu Kredit',
      is_active: true,
      last_logged_month: '2026-09', // Already logged in current month!
      created_at: '2026-08-01T00:00:00Z',
    },
    {
      id: 'bill-3',
      user_id: 'user-1',
      name: 'Listrik PLN',
      amount: 500000,
      category: 'Bills',
      due_day: 20, // Future due date if currentDay < 20
      frequency: 'monthly',
      payment_method: 'Transfer Bank',
      is_active: true,
      last_logged_month: '2026-08',
      created_at: '2026-08-01T00:00:00Z',
    },
    {
      id: 'bill-4',
      user_id: 'user-1',
      name: 'Gym Inactive',
      amount: 250000,
      category: 'Health',
      due_day: 1,
      frequency: 'monthly',
      payment_method: 'Transfer Bank',
      is_active: false, // Inactive bill!
      last_logged_month: '2026-08',
      created_at: '2026-08-01T00:00:00Z',
    },
    {
      id: 'bill-5',
      user_id: 'user-1',
      name: 'Tabungan Dana Darurat',
      amount: 1000000,
      category: 'Tabungan',
      due_day: 10,
      frequency: 'monthly',
      payment_method: 'Transfer Bank',
      is_active: true,
      last_logged_month: null, // Never logged
      created_at: '2026-08-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    localStorage.clear()
  })

  describe('getDueBillsToAutoLog', () => {
    it('filters due bills when today is day 12 of 2026-09', () => {
      const currentDay = 12
      const currentMonth = '2026-09'

      const due = getDueBillsToAutoLog(sampleBills, currentDay, currentMonth)

      // bill-1 (due 5 <= 12, last logged 2026-08) -> DUE
      // bill-2 (due 15 > 12, already logged 2026-09) -> NOT DUE
      // bill-3 (due 20 > 12) -> NOT DUE
      // bill-4 (inactive) -> NOT DUE
      // bill-5 (due 10 <= 12, last logged null) -> DUE

      expect(due).toHaveLength(2)
      expect(due.map((b) => b.id)).toEqual(['bill-1', 'bill-5'])
    })

    it('returns all active bills if today is day 31 and none logged this month', () => {
      const bills: RecurringBill[] = [
        { ...sampleBills[0], last_logged_month: '2026-08' },
        { ...sampleBills[1], last_logged_month: '2026-08' },
        { ...sampleBills[2], last_logged_month: '2026-08' },
      ]

      const due = getDueBillsToAutoLog(bills, 31, '2026-09')
      expect(due).toHaveLength(3)
    })

    it('returns empty array when all bills have already been logged this month', () => {
      const bills: RecurringBill[] = [
        { ...sampleBills[0], last_logged_month: '2026-09' },
        { ...sampleBills[1], last_logged_month: '2026-09' },
      ]

      const due = getDueBillsToAutoLog(bills, 25, '2026-09')
      expect(due).toHaveLength(0)
    })

    it('handles empty bills array safely', () => {
      expect(getDueBillsToAutoLog([], 15, '2026-09')).toEqual([])
      // @ts-expect-error test null safety
      expect(getDueBillsToAutoLog(null, 15, '2026-09')).toEqual([])
    })
  })

  describe('Auto-Logging User Preference Flag', () => {
    it('defaults to true when preference is not yet saved', () => {
      expect(isAutoRecurringLoggingEnabled()).toBe(true)
    })

    it('toggles preference correctly between true and false', () => {
      setAutoRecurringLoggingEnabled(false)
      expect(isAutoRecurringLoggingEnabled()).toBe(false)
      expect(localStorage.getItem(AUTO_RECURRING_CONFIG_KEY)).toBe('false')

      setAutoRecurringLoggingEnabled(true)
      expect(isAutoRecurringLoggingEnabled()).toBe(true)
      expect(localStorage.getItem(AUTO_RECURRING_CONFIG_KEY)).toBe('true')
    })
  })

  describe('executeBatchAutoLog', () => {
    it('sequentially executes logging callback and records success count', async () => {
      const mockLogFn = vi.fn().mockResolvedValue(true)
      const billsToProcess = [sampleBills[0], sampleBills[4]]

      const result = await executeBatchAutoLog(billsToProcess, mockLogFn)

      expect(mockLogFn).toHaveBeenCalledTimes(2)
      expect(mockLogFn).toHaveBeenNthCalledWith(1, sampleBills[0])
      expect(mockLogFn).toHaveBeenNthCalledWith(2, sampleBills[4])

      expect(result.loggedCount).toBe(2)
      expect(result.failedCount).toBe(0)
      expect(result.loggedBills).toEqual(billsToProcess)
    })

    it('handles failures and exceptions gracefully without throwing', async () => {
      const mockLogFn = vi
        .fn()
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('Network error'))

      const billsToProcess = [sampleBills[0], sampleBills[2]]

      const result = await executeBatchAutoLog(billsToProcess, mockLogFn)

      expect(result.loggedCount).toBe(1)
      expect(result.failedCount).toBe(1)
      expect(result.loggedBills).toEqual([sampleBills[0]])
    })
  })
})
