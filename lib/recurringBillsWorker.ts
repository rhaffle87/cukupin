/**
 * Recurring Bills Background Worker & Pure Filtering Engine
 *
 * Evaluates active recurring bills and determines which bills are due
 * for automated logging in the current calendar month.
 *
 * Rules:
 * - Bill must be active (is_active !== false).
 * - Bill's due_day must be <= currentDay (due date has arrived or passed).
 * - Bill's last_logged_month must NOT equal currentMonth (YYYY-MM), preventing duplicate logging.
 *
 * Note: Strictly NO raw unicode emojis.
 */

import { RecurringBill } from '@/lib/database.types'

export const AUTO_RECURRING_CONFIG_KEY = 'cukupin_auto_recurring_enabled'

/**
 * Filter recurring bills that are due for automatic logging in the current month
 */
export function getDueBillsToAutoLog(
  bills: RecurringBill[],
  currentDay: number = new Date().getDate(),
  currentMonth: string = new Date().toISOString().slice(0, 7)
): RecurringBill[] {
  if (!Array.isArray(bills) || bills.length === 0) return []

  return bills.filter((bill) => {
    // Skip inactive bills
    if (bill.is_active === false) return false

    // If bill was already logged in this month, skip
    if (bill.last_logged_month === currentMonth) return false

    // Check if the due day has arrived in the current month
    // E.g. due_day 5 is due if currentDay is 5, 6, 7...
    const dueDay = Number(bill.due_day)
    return dueDay <= currentDay
  })
}

/**
 * Check if the user has enabled automatic logging of recurring bills
 * Defaults to true unless explicitly toggled off
 */
export function isAutoRecurringLoggingEnabled(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return true
  const stored = window.localStorage.getItem(AUTO_RECURRING_CONFIG_KEY)
  if (stored === null) return true // Default enabled
  return stored !== 'false'
}

/**
 * Update user's preference for automatic recurring bill logging
 */
export function setAutoRecurringLoggingEnabled(enabled: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(AUTO_RECURRING_CONFIG_KEY, enabled ? 'true' : 'false')
}

/**
 * Execute sequential automated logging of due bills
 */
export async function executeBatchAutoLog(
  dueBills: RecurringBill[],
  logBillFn: (bill: RecurringBill) => Promise<boolean>
): Promise<{ loggedCount: number; failedCount: number; loggedBills: RecurringBill[] }> {
  let loggedCount = 0
  let failedCount = 0
  const loggedBills: RecurringBill[] = []

  for (const bill of dueBills) {
    try {
      const success = await logBillFn(bill)
      if (success) {
        loggedCount++
        loggedBills.push(bill)
      } else {
        failedCount++
      }
    } catch (err) {
      console.error(`Gagal mencatat otomatis tagihan ${bill.name}:`, err)
      failedCount++
    }
  }

  return { loggedCount, failedCount, loggedBills }
}
