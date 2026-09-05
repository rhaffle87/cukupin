'use client'

import React from 'react'
import { useFinance } from '@/context/FinanceContext'
import { ReportsView } from '@/components/finance/ReportsView'

export default function ReportsPage() {
  const finance = useFinance()
  return <ReportsView data={finance} />
}
