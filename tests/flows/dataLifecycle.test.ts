/// <reference types="vitest/globals" />
import { generateFullBackupPayload, validateBackupFile } from '@/lib/backup'
import { escapeCsvField } from '@/lib/finance'
import type { Transaction, SavingGoal, WishlistItem, RecurringBill, CategoryBudget } from '@/lib/database.types'

describe('Data Lifecycle & Disaster Recovery Flow Tests', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-101',
      user_id: 'user-abc',
      type: 'income',
      category: 'Gaji',
      amount: 10000000,
      transaction_date: '2026-09-01',
      description: 'Gaji Pokok',
      note: 'Transfer gaji awal bulan',
      payment_method: 'transfer',
      created_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'tx-102',
      user_id: 'user-abc',
      type: 'expense',
      category: 'Tagihan',
      amount: 450000,
      transaction_date: '2026-09-02',
      description: 'Listrik & Air',
      note: null,
      payment_method: 'debit',
      created_at: '2026-09-02T10:00:00Z',
    },
  ]

  const sampleGoals: SavingGoal[] = [
    {
      id: 'goal-1',
      user_id: 'user-abc',
      name: 'Dana Darurat 6 Bulan',
      target_amount: 30000000,
      current_amount: 15000000,
      deadline: '2027-12-31',
      created_at: '2026-01-01T00:00:00Z',
    },
  ]

  const sampleWishlist: WishlistItem[] = [
    {
      id: 'w-1',
      user_id: 'user-abc',
      name: 'Monitor 4K 27 Inch',
      price: 4500000,
      priority: 'High',
      url: 'https://tokopedia.com/monitor',
      created_at: '2026-08-15T00:00:00Z',
    },
  ]

  const sampleBills: RecurringBill[] = [
    {
      id: 'bill-1',
      user_id: 'user-abc',
      name: 'Langganan WiFi',
      amount: 350000,
      category: 'Tagihan',
      due_day: 15,
      frequency: 'monthly',
      is_active: true,
      created_at: '2026-01-01T00:00:00Z',
    },
  ]

  const sampleBudgets: CategoryBudget[] = [
    {
      id: 'b-1',
      user_id: 'user-abc',
      category: 'Tagihan',
      monthly_limit: 1000000,
      created_at: '2026-09-01T00:00:00Z',
    },
  ]

  it('executes full round-trip export, serialization, and Zod verification', () => {
    // 1. Generate standard v2.0 backup
    const backup = generateFullBackupPayload({
      transactions: sampleTransactions,
      goals: sampleGoals,
      wishlist: sampleWishlist,
      bills: sampleBills,
      budgets: sampleBudgets,
    })

    expect(backup.version).toBe('2.0')
    expect(backup.record_counts.transactions).toBe(2)
    expect(backup.record_counts.goals).toBe(1)
    expect(backup.record_counts.wishlist).toBe(1)
    expect(backup.record_counts.bills).toBe(1)
    expect(backup.record_counts.budgets).toBe(1)

    // 2. Serialize to JSON string (simulating file save)
    const serialized = JSON.stringify(backup, null, 2)

    // 3. Validate file against Zod schema from raw string
    const validation = validateBackupFile(serialized)
    expect(validation.success).toBe(true)
    expect(validation.data).toBeDefined()
    expect(validation.data?.transactions).toHaveLength(2)
    expect(validation.data?.transactions[0].description).toBe('Gaji Pokok')
  })

  it('rejects corrupt or invalid JSON strings with descriptive errors', () => {
    // Corrupted JSON string
    const validationCorrupted = validateBackupFile('{ "version": "2.0", broken json ...')
    expect(validationCorrupted.success).toBe(false)
    expect(validationCorrupted.error).toContain('rusak')

    // Empty string
    const validationEmpty = validateBackupFile('')
    expect(validationEmpty.success).toBe(false)
    expect(validationEmpty.error).toContain('kosong')

    // JSON array instead of object
    const validationArray = validateBackupFile('[]')
    expect(validationArray.success).toBe(false)
    expect(validationArray.error).toContain('Struktur JSON tidak valid')
  })

  it('formats CSV export rows with UTF-8 BOM and neutralizes spreadsheet formula attacks', () => {
    const maliciousTransactions: Transaction[] = [
      {
        id: 'tx-malicious-1',
        user_id: 'u1',
        type: 'expense',
        category: '=cmd|calc!A0',
        amount: 1000,
        transaction_date: '2026-09-01',
        description: '+HYPERLINK("http://evil.com")',
        note: '-2+5+cmd',
        created_at: '',
      },
    ]

    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Nominal', 'Catatan']
    const rows = maliciousTransactions.map((t) => [
      escapeCsvField(t.transaction_date),
      escapeCsvField(t.type),
      escapeCsvField(t.category),
      escapeCsvField(t.description),
      escapeCsvField(t.amount),
      escapeCsvField(t.note),
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    expect(csvContent.startsWith('\uFEFF')).toBe(true)
    expect(csvContent).toContain('"\'=cmd|')
    expect(csvContent).toContain('"\'+HYPERLINK')
    expect(csvContent).toContain('"\'-2+5+cmd"')
  })
})
