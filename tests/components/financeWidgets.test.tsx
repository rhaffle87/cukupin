import React from 'react'
/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionRow } from '@/components/finance/TransactionRow'
import { CategoryBudgetWidget } from '@/components/finance/CategoryBudgetWidget'
import type { Transaction, CategoryBudget } from '@/lib/database.types'

describe('Finance Widgets Component Tests', () => {
  describe('TransactionRow component', () => {
    const expenseTx: Transaction = {
      id: 'tx-1',
      user_id: 'user-1',
      type: 'expense',
      category: 'Makanan & Minuman',
      amount: 45000,
      transaction_date: '2026-09-07',
      description: 'Makan Siang Soto',
      note: 'Makan siang enak bareng tim #kantor #makansiang',
      payment_method: 'qris',
      created_at: '2026-09-07T12:00:00Z',
    }

    const incomeTx: Transaction = {
      id: 'tx-2',
      user_id: 'user-1',
      type: 'income',
      category: 'Gaji',
      amount: 7500000,
      transaction_date: '2026-09-01',
      description: 'Gaji Bulanan',
      note: null,
      payment_method: 'transfer',
      created_at: '2026-09-01T09:00:00Z',
    }

    it('renders expense transaction with negative prefix and payment method', () => {
      render(<TransactionRow transaction={expenseTx} />)
      expect(screen.getByText('Makan Siang Soto')).toBeDefined()
      expect(screen.getByText((content) => content.includes('45.000'))).toBeDefined()
      expect(screen.getByText((content) => /qris/i.test(content))).toBeDefined()
    })

    it('extracts hashtags from transaction note as tags', () => {
      render(<TransactionRow transaction={expenseTx} />)
      expect(screen.getByText('#kantor')).toBeDefined()
      expect(screen.getByText('#makansiang')).toBeDefined()
    })

    it('renders income transaction with positive prefix', () => {
      render(<TransactionRow transaction={incomeTx} />)
      expect(screen.getByText('Gaji Bulanan')).toBeDefined()
      expect(screen.getByText((content) => content.includes('7.500.000'))).toBeDefined()
    })

    it('triggers onEdit and onDelete callbacks when buttons are clicked', () => {
      const handleEdit = vi.fn()
      const handleDelete = vi.fn()

      render(
        <TransactionRow
          transaction={expenseTx}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )

      const editBtn = screen.getByLabelText('Edit transaksi')
      const deleteBtn = screen.getByLabelText('Hapus transaksi')

      fireEvent.click(editBtn)
      expect(handleEdit).toHaveBeenCalledTimes(1)

      fireEvent.click(deleteBtn)
      expect(handleDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('CategoryBudgetWidget component', () => {
    it('renders empty state prompt when no active budgets exist', () => {
      render(
        <CategoryBudgetWidget
          budgets={[]}
          setBudgets={vi.fn()}
          transactions={[]}
          supabase={null}
        />
      )

      expect(screen.getByText('Batas Belanja Kategori')).toBeDefined()
      expect(screen.getByText(/Belum Ada Batas Budget Kategori/i)).toBeDefined()
      expect(screen.getByRole('button', { name: /Atur Budget Sekarang/i })).toBeDefined()
    })

    it('calculates progress and displays budget limits for categories', () => {
      const budgets: CategoryBudget[] = [
        {
          id: 'b-1',
          user_id: 'user-1',
          category: 'Makanan & Minuman',
          monthly_limit: 1000000,
          created_at: '',
        },
      ]

      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          user_id: 'user-1',
          type: 'expense',
          category: 'Makanan & Minuman',
          amount: 500000,
          transaction_date: '2026-09-01',
          description: 'Belanja Sayur',
          note: null,
          created_at: '',
        },
      ]

      render(
        <CategoryBudgetWidget
          budgets={budgets}
          setBudgets={vi.fn()}
          transactions={transactions}
          supabase={null}
        />
      )

      expect(screen.getByText('Makanan & Minuman')).toBeDefined()
      expect(screen.getByText('Terpakai')).toBeDefined()
      expect(screen.getByText('Batas Maksimal')).toBeDefined()
      expect(screen.getAllByText((c) => c.includes('500.000')).length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText((c) => c.includes('1.000.000'))).toBeDefined()
      expect(screen.getByText('Sisa budget bulan ini')).toBeDefined()
    })

    it('shows warning and danger indicators when budget is exceeded', () => {
      const budgets: CategoryBudget[] = [
        {
          id: 'b-1',
          user_id: 'user-1',
          category: 'Kebutuhan',
          monthly_limit: 200000,
          created_at: '',
        },
      ]

      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          user_id: 'user-1',
          type: 'expense',
          category: 'Kebutuhan',
          amount: 250000,
          transaction_date: '2026-09-05',
          description: 'Belanja Lebihan',
          note: null,
          created_at: '',
        },
      ]

      render(
        <CategoryBudgetWidget
          budgets={budgets}
          setBudgets={vi.fn()}
          transactions={transactions}
          supabase={null}
        />
      )

      expect(screen.getByText('Kebutuhan')).toBeDefined()
      expect(screen.getByText((c) => c.includes('Melebihi'))).toBeDefined()
      expect(screen.getByText('Defisit kategori')).toBeDefined()
    })
  })
})
