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

/**
 * Sanitizes numeric strings by removing currency prefixes, commas, and dots.
 */
export function sanitizeNumericInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}
