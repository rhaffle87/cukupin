'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthScreen } from '@/components/auth/AuthScreen'

export default function LoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setChecking(false)
      return
    }
    
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push('/')
      } else {
        setChecking(false)
      }
    })
  }, [supabase, router])

  if (checking) return null

  return (
    <div className="login-page-wrapper">
      <AuthScreen 
        supabase={supabase} 
        onSuccess={() => {
          router.push('/')
        }} 
      />
    </div>
  )
}
