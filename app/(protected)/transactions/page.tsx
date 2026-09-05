'use client'

import React from 'react'
import { useFinance } from '@/context/FinanceContext'
import { TransactionsView } from '@/components/finance/TransactionsView'

export default function TransactionsPage() {
  const finance = useFinance()
  return <TransactionsView supabase={finance.supabase} data={finance} userId={finance.user?.id} />
}
