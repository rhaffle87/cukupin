'use client'

import React from 'react'
import { useFinance } from '@/context/FinanceContext'
import { GoalsView } from '@/components/finance/GoalsView'

export default function GoalsPage() {
  const finance = useFinance()
  return <GoalsView supabase={finance.supabase} data={finance} userId={finance.user?.id} />
}
