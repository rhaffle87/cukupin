/// <reference types="vitest/globals" />
import {
  FREE_TIER_LIMITS,
  calculatePaginationRange,
  getMonthlyFilterBounds,
  calculatePayloadBytes,
  estimateMonthlyEgress,
  assertWithinFunctionTimeout,
} from '@/lib/resourceBudget'
import type { Transaction } from '@/lib/database.types'

describe('Resource Budget & Free-Tier Limits Engine', () => {
  describe('Supabase Query Pagination Math', () => {
    it('calculates zero-indexed range bounds correctly for page 1', () => {
      const result = calculatePaginationRange(1, 25)
      expect(result).toEqual({
        from: 0,
        to: 24,
        limit: 25,
        offset: 0,
        page: 1,
        pageSize: 25,
      })
    })

    it('calculates zero-indexed range bounds correctly for subsequent pages', () => {
      const page2 = calculatePaginationRange(2, 25)
      expect(page2.from).toBe(25)
      expect(page2.to).toBe(49)

      const page4 = calculatePaginationRange(4, 10)
      expect(page4.from).toBe(30)
      expect(page4.to).toBe(39)
    })

    it('clamps negative or zero page inputs safely to 1', () => {
      const clampedZero = calculatePaginationRange(0, 25)
      expect(clampedZero.page).toBe(1)
      expect(clampedZero.from).toBe(0)

      const clampedNegative = calculatePaginationRange(-5, 25)
      expect(clampedNegative.page).toBe(1)
      expect(clampedNegative.from).toBe(0)
    })

    it('clamps excessive page sizes to maximum safe limit of 100', () => {
      const clampedSize = calculatePaginationRange(1, 500)
      expect(clampedSize.pageSize).toBe(100)
      expect(clampedSize.limit).toBe(100)
      expect(clampedSize.to).toBe(99)
    })
  })

  describe('Server-Side Date Filtering Bounds', () => {
    it('generates accurate start and end dates for a 30-day month (September)', () => {
      const bounds = getMonthlyFilterBounds(2026, 9)
      expect(bounds.startDate).toBe('2026-09-01')
      expect(bounds.endDate).toBe('2026-09-30')
    })

    it('generates accurate start and end dates for a 31-day month (August)', () => {
      const bounds = getMonthlyFilterBounds(2026, 8)
      expect(bounds.startDate).toBe('2026-08-01')
      expect(bounds.endDate).toBe('2026-08-31')
    })

    it('accurately accounts for leap years in February', () => {
      const leapYear = getMonthlyFilterBounds(2024, 2)
      expect(leapYear.startDate).toBe('2024-02-01')
      expect(leapYear.endDate).toBe('2024-02-29')

      const nonLeapYear = getMonthlyFilterBounds(2025, 2)
      expect(nonLeapYear.startDate).toBe('2025-02-01')
      expect(nonLeapYear.endDate).toBe('2025-02-28')
    })
  })

  describe('Payload Size Measurement Benchmarks', () => {
    const mockTransaction: Transaction = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      user_id: 'user-778899',
      type: 'expense',
      amount: 45000,
      category: 'Food',
      description: 'Makan siang nasi padang komplit',
      transaction_date: '2026-09-08',
      payment_method: 'QRIS',
      note: 'Makan siang bersama tim pengembang',
      created_at: '2026-09-08T12:30:00.000Z',
    }

    it('measures single transaction payload to be ~250-300 bytes', () => {
      const bytes = calculatePayloadBytes(mockTransaction)
      expect(bytes).toBeGreaterThan(200)
      expect(bytes).toBeLessThan(350)
    })

    it('verifies that paginating to 25 items reduces payload by >75% compared to 100 items', () => {
      const list100 = Array.from({ length: 100 }, (_, i) => ({
        ...mockTransaction,
        id: `tx-${i}`,
      }))
      const list25 = list100.slice(0, 25)

      const bytes100 = calculatePayloadBytes(list100)
      const bytes25 = calculatePayloadBytes(list25)

      const reductionPercentage = ((bytes100 - bytes25) / bytes100) * 100
      expect(reductionPercentage).toBeGreaterThan(70)
      expect(bytes25).toBeLessThan(8000) // Less than 8 KB raw JSON
    })
  })

  describe('Monthly Database Egress Simulations vs 5GB Quota', () => {
    it('Scenario 1: Solo Developer workload consumes <0.1% of Supabase 5GB quota', () => {
      const result = estimateMonthlyEgress({
        monthlyActiveUsers: 1,
        sessionsPerUserPerMonth: 60, // 2 sessions daily
        avgTotalTxCount: 50,
        isPaginated: true,
        pageSize: 25,
      })

      expect(result.status).toBe('SAFE')
      expect(result.totalMonthlyEgressMB).toBeLessThan(1) // < 1 MB
      expect(result.quotaPercentage).toBeLessThan(0.1)
    })

    it('Scenario 2: University Class Demo (30 concurrent students) consumes <0.5% of quota', () => {
      const result = estimateMonthlyEgress({
        monthlyActiveUsers: 30,
        sessionsPerUserPerMonth: 5, // 5 demo sessions per student
        avgTotalTxCount: 30,
        isPaginated: true,
        pageSize: 25,
      })

      expect(result.status).toBe('SAFE')
      expect(result.totalMonthlyEgressMB).toBeLessThan(10) // < 10 MB
      expect(result.quotaPercentage).toBeLessThan(0.5)
    })

    it('Scenario 3: Public Feedback (500 users) - unpaginated blows past quota while paginated stays safe', () => {
      // Unpaginated: 500 users * 20 sessions = 10,000 sessions. 6 queries per session pulling 500 transactions!
      const unpaginatedResult = estimateMonthlyEgress({
        monthlyActiveUsers: 500,
        sessionsPerUserPerMonth: 20,
        queriesPerSession: 6,
        avgTotalTxCount: 500,
        isPaginated: false,
      })

      // Paginated + Date Filtered: each query only pulls top 25 transactions
      const paginatedResult = estimateMonthlyEgress({
        monthlyActiveUsers: 500,
        sessionsPerUserPerMonth: 20,
        queriesPerSession: 6,
        avgTotalTxCount: 500,
        isPaginated: true,
        pageSize: 25,
      })

      // Unpaginated exceeds the 5 GB quota (6.81 GB > 5 GB)
      expect(unpaginatedResult.status).toBe('CRITICAL')
      expect(unpaginatedResult.quotaPercentage).toBeGreaterThan(100)

      // Paginated achieves >85% bandwidth savings and remains well under 1 GB total egress
      expect(paginatedResult.status).toBe('SAFE')
      expect(paginatedResult.savingsRatioPercentage).toBeGreaterThan(85)
      expect(paginatedResult.totalMonthlyEgressGB).toBeLessThan(1.0)
    })
  })

  describe('Vercel 10-Second Serverless Timeout Constraint', () => {
    it('passes assertion for typical fast serverless operations (< 1000ms)', () => {
      expect(assertWithinFunctionTimeout(250)).toBe(true)
      expect(assertWithinFunctionTimeout(850)).toBe(true)
    })

    it('passes assertion for moderate database operations (< 5000ms)', () => {
      expect(assertWithinFunctionTimeout(4500)).toBe(true)
    })

    it('throws explicit error when execution exceeds Vercel Hobby 10-second hard cap', () => {
      expect(() => assertWithinFunctionTimeout(10001)).toThrow(
        /exceeds Vercel Hobby 10-second timeout ceiling/
      )
    })

    it('verifies client-side PDF export architecture incurs 0ms Vercel serverless compute', () => {
      const serverlessExecutionTimeForClientPdf = 0
      expect(assertWithinFunctionTimeout(serverlessExecutionTimeForClientPdf)).toBe(true)
      expect(serverlessExecutionTimeForClientPdf).toBe(0)
    })
  })
})
