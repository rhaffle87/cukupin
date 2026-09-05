'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useFinanceData } from '@/hooks/useFinanceData'
import { WishlistView } from '@/components/finance/WishlistView'

export default function WishlistPage() {
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

  return <WishlistView supabase={supabase} data={financeData} userId={user?.id} />
}
