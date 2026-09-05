'use client'

import React from 'react'
import { useFinance } from '@/context/FinanceContext'
import { DashboardView } from '@/components/finance/DashboardView'

export default function DashboardPage() {
  const finance = useFinance()
  return <DashboardView data={finance} user={finance.user} />
}
