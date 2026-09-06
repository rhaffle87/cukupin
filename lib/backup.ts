import { z } from 'zod'
import type {
  Transaction,
  SavingGoal,
  WishlistItem,
  RecurringBill,
  CategoryBudget,
} from '@/lib/database.types'

/**
 * Zod Schema for robust validation of Cukupin backup files.
 * Supports current v2.0 backups as well as legacy v1.0 imports.
 */
export const backupPayloadSchema = z.object({
  app: z.string().optional().default('cukupin'),
  version: z.string().optional().default('2.0'),
  exported_at: z.string().optional(),
  record_counts: z
    .object({
      transactions: z.number().optional(),
      goals: z.number().optional(),
      wishlist: z.number().optional(),
      bills: z.number().optional(),
      budgets: z.number().optional(),
    })
    .optional(),
  transactions: z.array(z.any()).optional().default([]),
  goals: z.array(z.any()).optional().default([]),
  wishlist: z.array(z.any()).optional().default([]),
  bills: z.array(z.any()).optional().default([]),
  budgets: z.array(z.any()).optional().default([]),
})

export type BackupPayload = {
  app: string
  version: string
  exported_at: string
  record_counts: {
    transactions: number
    goals: number
    wishlist: number
    bills: number
    budgets: number
  }
  transactions: Transaction[]
  goals: SavingGoal[]
  wishlist: WishlistItem[]
  bills: RecurringBill[]
  budgets: CategoryBudget[]
}

export interface BackupInputData {
  transactions?: Transaction[]
  goals?: SavingGoal[]
  wishlist?: WishlistItem[]
  bills?: RecurringBill[]
  budgets?: CategoryBudget[]
}

/**
 * Generates a complete, verified Cukupin backup payload with metadata.
 */
export function generateFullBackupPayload(data: BackupInputData): BackupPayload {
  const txs = data.transactions || []
  const goals = data.goals || []
  const wishlist = data.wishlist || []
  const bills = data.bills || []
  const budgets = data.budgets || []

  return {
    app: 'cukupin',
    version: '2.0',
    exported_at: new Date().toISOString(),
    record_counts: {
      transactions: txs.length,
      goals: goals.length,
      wishlist: wishlist.length,
      bills: bills.length,
      budgets: budgets.length,
    },
    transactions: txs,
    goals: goals,
    wishlist: wishlist,
    bills: bills,
    budgets: budgets,
  }
}

/**
 * Validates raw JSON string from an uploaded backup file.
 * Returns either validated data or a user-friendly error message.
 */
export function validateBackupFile(fileContent: string): {
  success: boolean
  data?: BackupPayload
  error?: string
} {
  if (!fileContent || typeof fileContent !== 'string') {
    return { success: false, error: 'Berkas cadangan kosong atau tidak valid.' }
  }

  let rawJson: any
  try {
    rawJson = JSON.parse(fileContent)
  } catch {
    return { success: false, error: 'Format berkas JSON rusak atau tidak dapat diurai.' }
  }

  if (typeof rawJson !== 'object' || rawJson === null || Array.isArray(rawJson)) {
    return { success: false, error: 'Struktur JSON tidak valid untuk berkas cadangan Cukupin.' }
  }

  const parseResult = backupPayloadSchema.safeParse(rawJson)
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Format data cadangan tidak sesuai standar skema Cukupin.',
    }
  }

  const parsed = parseResult.data

  // Ensure at least one category contains data
  const hasData =
    parsed.transactions.length > 0 ||
    parsed.goals.length > 0 ||
    parsed.wishlist.length > 0 ||
    parsed.bills.length > 0 ||
    parsed.budgets.length > 0

  if (!hasData) {
    return {
      success: false,
      error: 'Berkas cadangan tidak berisi catatan keuangan apapun.',
    }
  }

  const fullPayload: BackupPayload = {
    app: parsed.app || 'cukupin',
    version: parsed.version || '1.0',
    exported_at: parsed.exported_at || new Date().toISOString(),
    record_counts: {
      transactions: parsed.transactions.length,
      goals: parsed.goals.length,
      wishlist: parsed.wishlist.length,
      bills: parsed.bills.length,
      budgets: parsed.budgets.length,
    },
    transactions: parsed.transactions,
    goals: parsed.goals,
    wishlist: parsed.wishlist,
    bills: parsed.bills,
    budgets: parsed.budgets,
  }

  return { success: true, data: fullPayload }
}

/**
 * Triggers safe browser download of backup JSON with memory leak prevention (revokeObjectURL).
 */
export function downloadBackupAsJson(payload: BackupPayload, filenamePrefix = 'cukupin-backup') {
  if (typeof window === 'undefined') return

  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `${filenamePrefix}-${dateStr}.json`
  const jsonContent = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  // Clean up DOM and revoke Blob object URL to prevent memory leaks
  document.body.removeChild(link)
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 150)
}
