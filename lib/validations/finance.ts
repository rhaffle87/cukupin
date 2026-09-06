import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .number({ message: 'Nominal harus berupa angka' })
    .positive('Nominal harus lebih dari 0')
    .max(10_000_000_000, 'Nominal terlalu besar'),
  category: z.string().min(1, 'Pilih kategori'),
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi')
    .max(120, 'Deskripsi maksimal 120 karakter')
    .trim(),
  note: z.string().max(300, 'Catatan maksimal 300 karakter').optional().nullable(),
  payment_method: z.string().max(50, 'Metode pembayaran maksimal 50 karakter').optional().nullable(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

export const goalSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama target wajib diisi')
    .max(80, 'Maksimal 80 karakter')
    .trim(),
  target_amount: z
    .number({ message: 'Nominal target harus berupa angka' })
    .positive('Target harus lebih dari 0')
    .max(100_000_000_000, 'Target terlalu besar'),
})

export type GoalInput = z.infer<typeof goalSchema>

export const wishlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama barang wajib diisi')
    .max(100, 'Maksimal 100 karakter')
    .trim(),
  price: z
    .number({ message: 'Harga harus berupa angka' })
    .positive('Harga harus lebih dari 0')
    .max(100_000_000_000, 'Harga terlalu besar'),
  priority: z.enum(['Low', 'Medium', 'High']),
})

export type WishlistInput = z.infer<typeof wishlistSchema>

export const recurringBillSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama tagihan wajib diisi')
    .max(120, 'Maksimal 120 karakter')
    .trim(),
  amount: z
    .number({ message: 'Nominal tagihan harus berupa angka' })
    .positive('Nominal harus lebih dari 0')
    .max(10_000_000_000, 'Nominal terlalu besar'),
  category: z.string().min(1, 'Pilih kategori tagihan'),
  due_day: z
    .number({ message: 'Tanggal jatuh tempo harus berupa angka' })
    .int('Tanggal harus bilangan bulat')
    .min(1, 'Minimal tanggal 1')
    .max(31, 'Maksimal tanggal 31'),
  frequency: z.enum(['monthly', 'yearly']).default('monthly'),
  payment_method: z.string().max(50, 'Metode pembayaran maksimal 50 karakter').optional().nullable(),
  is_active: z.boolean().default(true),
})

export type RecurringBillInput = z.infer<typeof recurringBillSchema>

export const categoryBudgetSchema = z.object({
  category: z.string().min(1, 'Pilih kategori pengeluaran'),
  monthly_limit: z
    .number({ message: 'Limit anggaran harus berupa angka' })
    .positive('Limit anggaran harus lebih dari 0')
    .max(100_000_000_000, 'Limit anggaran terlalu besar'),
})

export type CategoryBudgetInput = z.infer<typeof categoryBudgetSchema>

/**
 * Sanitizes numeric strings by removing currency prefixes, commas, and dots.
 */
export function sanitizeNumericInput(value: string | number): number {
  const cleaned = String(value).replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

/**
 * Formats a raw number or string with Indonesian thousand dots (e.g. 2500000 -> 2.500.000).
 * Strips all non-digit characters automatically so users cannot type invalid letters like 'p'.
 */
export function formatRupiahInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const digitsOnly = String(value).replace(/\D/g, '')
  if (!digitsOnly) return ''
  return new Intl.NumberFormat('id-ID').format(parseInt(digitsOnly, 10))
}
