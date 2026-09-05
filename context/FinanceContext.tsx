'use client'

import React, { createContext, useContext } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { useFinanceData } from '@/hooks/useFinanceData'
import type { Transaction, SavingGoal, WishlistItem } from '@/lib/database.types'

interface FinanceContextType {
  supabase: SupabaseClient | null
  user: { id: string; email?: string } | null
  transactions: Transaction[]
  goals: SavingGoal[]
  wishlist: WishlistItem[]
  loading: boolean
  refresh: () => Promise<void>
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
  setGoals: React.Dispatch<React.SetStateAction<SavingGoal[]>>
  setWishlist: React.Dispatch<React.SetStateAction<WishlistItem[]>>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({
  supabase,
  user,
  children,
}: {
  supabase: SupabaseClient | null
  user: { id: string; email?: string } | null
  children: React.ReactNode
}) {
  const financeData = useFinanceData(supabase, user?.id)

  const value: FinanceContextType = {
    supabase,
    user,
    ...financeData,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
