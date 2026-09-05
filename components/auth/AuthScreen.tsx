import React, { useState } from 'react'
import { Brand } from '@/components/ui/Brand'
import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AuthScreenProps {
  supabase: SupabaseClient | null
}

export function AuthScreen({ supabase }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
      
    setBusy(false)
    
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success(mode === 'login' ? 'Selamat datang kembali.' : 'Akun berhasil dibuat.')
      router.push('/dashboard') // Redirect to dashboard
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-art">
        <Brand />
        <div className="auth-copy">
          <p className="eyebrow">PERSONAL FINANCE, SIMPLIFIED</p>
          <h1>Yang penting bukan banyaknya.<br /><em>Yang penting cukup.</em></h1>
          <p>Cukupin membantu kamu melihat uang dengan lebih jernih, satu bulan demi satu bulan.</p>
        </div>
        <div className="auth-art-note">
          <span>01</span>
          <span>Catat · Pahami · Atur</span>
        </div>
      </div>
      
      <div className="auth-panel">
        <div className="auth-form">
          <div className="mobile-brand">
            <Brand />
          </div>
          <p className="eyebrow">{mode === 'login' ? 'SELAMAT DATANG KEMBALI' : 'MULAI PERJALANANMU'}</p>
          <h2>{mode === 'login' ? 'Masuk ke ruang uangmu.' : 'Buat ruang uangmu.'}</h2>
          <p className="muted">{mode === 'login' ? 'Lanjutkan kebiasaan baikmu mengelola uang.' : 'Gratis, sederhana, dan dibuat untuk kamu.'}</p>
          
          <form onSubmit={submit}>
            <label>
              Email
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@email.com" />
            </label>
            <label>
              Password
              <input type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 karakter" />
            </label>
            <button className="button primary wide" disabled={busy}>
              {busy ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
            </button>
          </form>
          
          <button className="text-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  )
}
