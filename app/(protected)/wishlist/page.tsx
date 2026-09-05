'use client'

import React from 'react'
import { useFinance } from '@/context/FinanceContext'
import { WishlistView } from '@/components/finance/WishlistView'

export default function WishlistPage() {
  const finance = useFinance()
  return <WishlistView supabase={finance.supabase} data={finance} userId={finance.user?.id} />
}
