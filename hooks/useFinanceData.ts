import { useCallback, useEffect, useState } from 'react'
import type { Transaction, SavingGoal, WishlistItem } from '@/lib/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export function useFinanceData(supabase: SupabaseClient | null, userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(Boolean(userId))

  const refresh = useCallback(async () => {
    if (!supabase || !userId) return
    setLoading(true)
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
    if (!supabase || !userId) return
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
