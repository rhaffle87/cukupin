'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFinanceData } from '@/hooks/useFinanceData'
import { TransactionsView } from '@/components/finance/TransactionsView'

export default function TransactionsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  
  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email })
      }
    })
  }, [supabase])

  const financeData = useFinanceData(supabase, user?.id)

  return (
    <div className="view-content">
      <TransactionsView supabase={supabase} data={financeData} userId={user?.id} />
    </div>
  )
}
