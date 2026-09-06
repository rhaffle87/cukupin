import { useCallback, useEffect, useState } from 'react'
import type { Transaction, SavingGoal, WishlistItem, RecurringBill, CategoryBudget } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const DEFAULT_LOCAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    user_id: 'local-dev-user',
    type: 'expense',
    amount: 1000000,
    category: 'Shopping',
    description: 'Monitor Ultrawide',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: 'Dibeli dari Wishlist',
    payment_method: 'Transfer Bank',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'tx-2',
    user_id: 'local-dev-user',
    type: 'income',
    amount: 1000000,
    category: 'Bills',
    description: 'Bonus Projek Sampingan',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: 'Transfer masuk',
    payment_method: 'Transfer Bank',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'tx-3',
    user_id: 'local-dev-user',
    type: 'expense',
    amount: 83330,
    category: 'Bills',
    description: 'Listrik PLN',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: 'Token bulanan',
    payment_method: 'QRIS',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'tx-4',
    user_id: 'local-dev-user',
    type: 'expense',
    amount: 40000,
    category: 'Food',
    description: 'Makan siang resto',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: '',
    payment_method: 'QRIS',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'tx-5',
    user_id: 'local-dev-user',
    type: 'income',
    amount: 120000,
    category: 'Salary',
    description: 'Gajian bulanan',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: '',
    payment_method: 'Transfer Bank',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'tx-6',
    user_id: 'local-dev-user',
    type: 'expense',
    amount: 38000,
    category: 'Other',
    description: 'Kebutuhan harian',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: '',
    payment_method: 'Cash',
    created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: 'tx-7',
    user_id: 'local-dev-user',
    type: 'expense',
    amount: 5000,
    category: 'Other',
    description: 'Parkir & jajan',
    transaction_date: new Date().toISOString().slice(0, 10),
    note: '',
    payment_method: 'Cash',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
]

const DEFAULT_LOCAL_GOALS: SavingGoal[] = [
  {
    id: 'goal-1',
    user_id: 'local-dev-user',
    name: 'Dana Darurat 3 Bulan',
    target_amount: 5000000,
    current_amount: 2500000,
    deadline: null,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'goal-2',
    user_id: 'local-dev-user',
    name: 'Liburan Akhir Tahun',
    target_amount: 3000000,
    current_amount: 1200000,
    deadline: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
]

const DEFAULT_LOCAL_WISHLIST: WishlistItem[] = [
  {
    id: 'wish-1',
    user_id: 'local-dev-user',
    name: 'Keyboard Mechanical Numpad',
    price: 450000,
    url: null,
    priority: 'Medium',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'wish-2',
    user_id: 'local-dev-user',
    name: 'Sepatu Lari Road Running',
    price: 850000,
    url: null,
    priority: 'High',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
]

const DEFAULT_LOCAL_BILLS: RecurringBill[] = [
  {
    id: 'bill-1',
    user_id: 'local-dev-user',
    name: 'WiFi Indihome / Biznet',
    amount: 385000,
    category: 'Bills',
    due_day: 15,
    frequency: 'monthly',
    payment_method: 'Transfer Bank',
    is_active: true,
    last_logged_month: null,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'bill-2',
    user_id: 'local-dev-user',
    name: 'Listrik PLN Pasca/Token',
    amount: 250000,
    category: 'Bills',
    due_day: 20,
    frequency: 'monthly',
    payment_method: 'QRIS',
    is_active: true,
    last_logged_month: new Date().toISOString().slice(0, 7),
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'bill-3',
    user_id: 'local-dev-user',
    name: 'Langganan Streaming & Cloud',
    amount: 186000,
    category: 'Bills',
    due_day: 5,
    frequency: 'monthly',
    payment_method: 'Kartu Kredit',
    is_active: true,
    last_logged_month: null,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
]

const DEFAULT_LOCAL_BUDGETS: CategoryBudget[] = [
  {
    id: 'bud-1',
    user_id: 'local-dev-user',
    category: 'Food',
    monthly_limit: 1500000,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'bud-2',
    user_id: 'local-dev-user',
    category: 'Bills',
    monthly_limit: 1000000,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'bud-3',
    user_id: 'local-dev-user',
    category: 'Shopping',
    monthly_limit: 800000,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
]

export function useFinanceData(supabase: SupabaseClient | null, userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [loading, setLoading] = useState(Boolean(userId))

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    if (userId === 'local-dev-user') {
      try {
        const storedTx = localStorage.getItem('cukupin_local_transactions')
        const storedGoals = localStorage.getItem('cukupin_local_goals')
        const storedWish = localStorage.getItem('cukupin_local_wishlist')
        const storedBills = localStorage.getItem('cukupin_local_bills')
        const storedBudgets = localStorage.getItem('cukupin_local_budgets')

        const txList = storedTx ? JSON.parse(storedTx) : DEFAULT_LOCAL_TRANSACTIONS
        const gList = storedGoals ? JSON.parse(storedGoals) : DEFAULT_LOCAL_GOALS
        const wList = storedWish ? JSON.parse(storedWish) : DEFAULT_LOCAL_WISHLIST
        const bList = storedBills ? JSON.parse(storedBills) : DEFAULT_LOCAL_BILLS
        const budList = storedBudgets ? JSON.parse(storedBudgets) : DEFAULT_LOCAL_BUDGETS

        if (!storedTx) localStorage.setItem('cukupin_local_transactions', JSON.stringify(txList))
        if (!storedGoals) localStorage.setItem('cukupin_local_goals', JSON.stringify(gList))
        if (!storedWish) localStorage.setItem('cukupin_local_wishlist', JSON.stringify(wList))
        if (!storedBills) localStorage.setItem('cukupin_local_bills', JSON.stringify(bList))
        if (!storedBudgets) localStorage.setItem('cukupin_local_budgets', JSON.stringify(budList))

        setTransactions(txList)
        setGoals(gList)
        setWishlist(wList)
        setBills(bList)
        setBudgets(budList)
      } catch (err) {
        console.error('Failed to load local data:', err)
      }
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const [t, g, w, b, bud] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('saving_goals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('recurring_bills')
          .select('*')
          .eq('user_id', userId)
          .order('due_day', { ascending: true }),
        supabase
          .from('category_budgets')
          .select('*')
          .eq('user_id', userId),
      ])

      if (!t.error) setTransactions((t.data || []) as Transaction[])
      if (!g.error) setGoals((g.data || []) as SavingGoal[])
      if (!w.error) setWishlist((w.data || []) as WishlistItem[])
      
      // Resilient fallback for tables pending migration
      if (!b.error) {
        setBills((b.data || []) as RecurringBill[])
      } else {
        const storedBills = localStorage.getItem('cukupin_local_bills')
        setBills(storedBills ? JSON.parse(storedBills) : [])
      }

      if (!bud.error) {
        setBudgets((bud.data || []) as CategoryBudget[])
      } else {
        const storedBudgets = localStorage.getItem('cukupin_local_budgets')
        setBudgets(storedBudgets ? JSON.parse(storedBudgets) : [])
      }
    } catch (err) {
      console.error('Error refreshing data from Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  const logRecurringBillAsTransaction = useCallback(
    async (bill: RecurringBill) => {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const newTxPayload = {
        user_id: userId || 'local-dev-user',
        type: 'expense' as const,
        description: bill.name,
        amount: bill.amount,
        category: bill.category,
        transaction_date: new Date().toISOString().slice(0, 10),
        note: `Pembayaran tagihan rutin bulanan (${bill.name})`,
        payment_method: bill.payment_method || 'Transfer Bank',
      }

      if (userId === 'local-dev-user' || !supabase) {
        // Save transaction to local storage
        const storedTx = localStorage.getItem('cukupin_local_transactions')
        const currentTx: Transaction[] = storedTx ? JSON.parse(storedTx) : []
        const savedTx: Transaction = {
          id: 'tx-' + Date.now(),
          created_at: new Date().toISOString(),
          ...newTxPayload,
        }
        const updatedTx = [savedTx, ...currentTx]
        localStorage.setItem('cukupin_local_transactions', JSON.stringify(updatedTx))
        setTransactions(updatedTx)

        // Update bill's last_logged_month
        const storedBills = localStorage.getItem('cukupin_local_bills')
        const currentBills: RecurringBill[] = storedBills ? JSON.parse(storedBills) : DEFAULT_LOCAL_BILLS
        const updatedBills = currentBills.map((b) =>
          b.id === bill.id ? { ...b, last_logged_month: currentMonth } : b
        )
        localStorage.setItem('cukupin_local_bills', JSON.stringify(updatedBills))
        setBills(updatedBills)

        toast.success(`Tagihan "${bill.name}" berhasil dicatat ke transaksi!`)
        return true
      }

      try {
        // Save to Supabase
        const txRes = await supabase.from('transactions').insert(newTxPayload).select().single()
        if (txRes.error) throw txRes.error

        await supabase
          .from('recurring_bills')
          .update({ last_logged_month: currentMonth })
          .eq('id', bill.id)

        toast.success(`Tagihan "${bill.name}" berhasil dicatat ke transaksi!`)
        await refresh()
        return true
      } catch (err: any) {
        toast.error(`Gagal mencatat tagihan: ${err?.message || 'Terjadi kesalahan'}`)
        return false
      }
    },
    [userId, supabase, refresh]
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!supabase || !userId || userId === 'local-dev-user') return
    const channel = supabase
      .channel(`cukupin-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saving_goals', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_bills', filter: `user_id=eq.${userId}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'category_budgets', filter: `user_id=eq.${userId}` }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, refresh, supabase])

  return {
    transactions,
    setTransactions,
    goals,
    setGoals,
    wishlist,
    setWishlist,
    bills,
    setBills,
    budgets,
    setBudgets,
    logRecurringBillAsTransaction,
    loading,
    refresh,
  }
}
