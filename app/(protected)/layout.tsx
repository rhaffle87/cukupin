'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/layout/AppShell'
import { Brand } from '@/components/ui/Brand'

import { FinanceProvider } from '@/context/FinanceContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setChecking(false)
      return
    }
    
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email })
      } else {
        router.push('/auth/login')
      }
      setChecking(false)
    })
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
      } else {
        setUser(null)
        router.push('/auth/login')
      }
    })
    
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase, router])

  if (checking) {
    return (
      <div className="loading-screen">
        <Brand />
        <span>Menyiapkan catatanmu...</span>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to /login
  }

  return (
    <FinanceProvider supabase={supabase} user={user}>
      <AppShell
        user={user}
        onSignOut={async () => {
          await supabase?.auth.signOut()
        }}
      >
        {children}
      </AppShell>
    </FinanceProvider>
  )
}
