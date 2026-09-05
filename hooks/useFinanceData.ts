import { useCallback, useEffect, useState } from 'react'
import type { Transaction, SavingGoal, WishlistItem } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

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

export function useFinanceData(supabase: SupabaseClient | null, userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(Boolean(userId))

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    if (userId === 'local-dev-user') {
      try {
        const storedTx = localStorage.getItem('cukupin_local_transactions')
        const storedGoals = localStorage.getItem('cukupin_local_goals')
        const storedWish = localStorage.getItem('cukupin_local_wishlist')

        const txList = storedTx ? JSON.parse(storedTx) : DEFAULT_LOCAL_TRANSACTIONS
        const gList = storedGoals ? JSON.parse(storedGoals) : DEFAULT_LOCAL_GOALS
        const wList = storedWish ? JSON.parse(storedWish) : DEFAULT_LOCAL_WISHLIST

        if (!storedTx) localStorage.setItem('cukupin_local_transactions', JSON.stringify(txList))
        if (!storedGoals) localStorage.setItem('cukupin_local_goals', JSON.stringify(gList))
        if (!storedWish) localStorage.setItem('cukupin_local_wishlist', JSON.stringify(wList))

        setTransactions(txList)
        setGoals(gList)
        setWishlist(wList)
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

    const [t, g, w] = await Promise.all([
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
    ])

    if (!t.error) setTransactions((t.data || []) as Transaction[])
    if (!g.error) setGoals((g.data || []) as SavingGoal[])
    if (!w.error) setWishlist((w.data || []) as WishlistItem[])
    setLoading(false)
  }, [userId, supabase])

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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, refresh, supabase])

  return { transactions, setTransactions, goals, setGoals, wishlist, setWishlist, loading, refresh }
}
