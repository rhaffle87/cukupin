'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFinanceData } from '@/hooks/useFinanceData'
import { ReportsView } from '@/components/finance/ReportsView'

export default function ReportsPage() {
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
      <ReportsView data={financeData} />
    </div>
  )
}
