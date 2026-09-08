'use client'

/**
 * Client-side Bootstrap Hook for Automated Recurring Bill Logging
 *
 * Runs on application mount, tab focus, and when recurring bills load.
 * Automatically evaluates due bills and logs them without requiring manual user clicks.
 *
 * Designed for PWA mobile offline/online resilience and dev mode.
 *
 * Note: Strictly NO raw unicode emojis. Uses Lucide SVG icons only.
 */

import React, { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { CalendarClock } from 'lucide-react'
import { RecurringBill } from '@/lib/database.types'
import {
  getDueBillsToAutoLog,
  isAutoRecurringLoggingEnabled,
  executeBatchAutoLog,
} from '@/lib/recurringBillsWorker'

interface UseAutoRecurringBillsParams {
  bills: RecurringBill[]
  logRecurringBillAsTransaction: (bill: RecurringBill) => Promise<boolean>
  loading?: boolean
}

export function useAutoRecurringBills({
  bills,
  logRecurringBillAsTransaction,
  loading = false,
}: UseAutoRecurringBillsParams) {
  const isProcessingRef = useRef<boolean>(false)
  const lastProcessedDayKeyRef = useRef<string>('')

  const checkAndLogDueBills = useCallback(async () => {
    if (loading || !bills || bills.length === 0) return
    if (isProcessingRef.current) return

    // Check if auto-logging is enabled by user
    if (!isAutoRecurringLoggingEnabled()) return

    const now = new Date()
    const currentDay = now.getDate()
    const currentMonth = now.toISOString().slice(0, 7) // 'YYYY-MM'
    const todayKey = now.toISOString().slice(0, 10) // 'YYYY-MM-DD'

    // If already verified today with no remaining due bills, skip redundant processing
    if (lastProcessedDayKeyRef.current === todayKey) return

    const dueBills = getDueBillsToAutoLog(bills, currentDay, currentMonth)
    if (dueBills.length === 0) {
      lastProcessedDayKeyRef.current = todayKey
      return
    }

    try {
      isProcessingRef.current = true
      const result = await executeBatchAutoLog(
        dueBills,
        logRecurringBillAsTransaction
      )

      if (result.loggedCount > 0) {
        lastProcessedDayKeyRef.current = todayKey
        toast.success(
          `Otomatisasi Tagihan: ${result.loggedCount} tagihan jatuh tempo berhasil dicatat secara otomatis ke transaksi bulan ini.`,
          {
            icon: React.createElement(CalendarClock, {
              className: 'w-5 h-5 text-emerald-600 shrink-0',
            }),
            duration: 6000,
          }
        )
      }
    } catch (err) {
      console.error('Error during auto recurring bills execution:', err)
    } finally {
      isProcessingRef.current = false
    }
  }, [bills, loading, logRecurringBillAsTransaction])

  // Run on mount or when bills change
  useEffect(() => {
    checkAndLogDueBills()
  }, [checkAndLogDueBills])

  // Run on tab visibility change or window focus
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleFocus = () => {
      checkAndLogDueBills()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [checkAndLogDueBills])

  return {
    triggerManualCheck: checkAndLogDueBills,
  }
}
