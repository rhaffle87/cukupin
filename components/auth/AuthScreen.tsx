import React, { useState } from 'react'
import { Brand } from '@/components/ui/Brand'
import { SupabaseClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

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
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-paper text-ink selection:bg-green-soft selection:text-green">
      
      {/* Left Art Panel (Hidden on mobile for direct form ergonomics) */}
      <div className="relative hidden md:flex min-h-screen w-full flex-col overflow-hidden bg-ink p-8 text-white md:w-[55%] md:p-14 lg:w-[60%]">
        {/* Decorative Circles */}
        <div className="absolute -bottom-[150px] -right-[150px] h-[500px] w-[500px] rounded-full border border-white/10 shadow-[0_0_0_40px_rgba(255,255,255,0.02),0_0_0_80px_rgba(255,255,255,0.01)]" />
        <div className="absolute -left-[100px] top-[10%] h-[300px] w-[300px] rounded-full bg-green-soft/20 blur-[100px]" />
        
        <div className="hidden md:block">
          {/* We use a white version of the brand mark here manually for dark background contrast */}
          <div className="flex items-center gap-2.5 text-white">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white -rotate-9">
              <div className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-ink" />
              <span className="h-1 w-4 -rotate-45 translate-y-[3px] -translate-x-[1px] rounded bg-green" />
            </div>
            <div className="flex flex-col">
              <strong className="font-display text-[20px] leading-none tracking-tight">Cukupin</strong>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center max-w-lg mt-8 md:mt-0">
          <p className="mb-4 text-[10px] font-bold tracking-widest text-green-soft/80 uppercase">
            Catat santai, tahu arah uangmu
          </p>
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Yang penting bukan banyaknya.<br />
            <em className="text-green-soft not-italic">Yang penting cukup.</em>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/70">
            Bantu kamu pantau uang masuk dan keluar tiap bulan dengan santai.
          </p>
        </div>

        <div className="relative z-10 hidden justify-between text-[10px] font-bold tracking-widest text-white/40 uppercase md:flex">
          <span>01</span>
          <span>Catat · Pantau · Santai</span>
        </div>
      </div>
      
      {/* Right Auth Panel */}
      <div className="flex w-full flex-1 flex-col items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 md:hidden">
            <Brand />
          </div>
          
          <p className="mb-2 text-[10px] font-bold tracking-widest text-muted uppercase">
            {mode === 'login' ? 'HALO LAGI' : 'BUAT AKUN'}
          </p>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight">
            {mode === 'login' ? 'Masuk ke akunmu.' : 'Mulai catat keuanganmu.'}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted">
            {mode === 'login' ? 'Yuk lanjut cek dan catat pengeluaranmu.' : 'Simpel, gratis, dan nggak ribet.'}
          </p>
          
          <form onSubmit={submit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-xs font-bold text-ink">
              Email
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="kamu@email.com" 
                className="w-full rounded-xl border border-line bg-card p-3.5 text-sm font-normal text-ink outline-none transition-all focus:border-blue focus:ring-4 focus:ring-blue/10"
              />
            </label>
            
            <label className="flex flex-col gap-2 text-xs font-bold text-ink">
              Password
              <input 
                type="password" 
                minLength={6} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Min. 6 karakter" 
                className="w-full rounded-xl border border-line bg-card p-3.5 text-sm font-normal text-ink outline-none transition-all focus:border-blue focus:ring-4 focus:ring-blue/10"
              />
            </label>
            
            <button 
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-ink p-3.5 text-sm font-bold text-white shadow-lg shadow-ink/10 transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0" 
              disabled={busy}
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : mode === 'login' ? (
                <>
                  Masuk <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Daftar <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          <button 
            className="mt-8 text-xs font-bold text-blue hover:underline" 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>

          {typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1' ||
              window.location.hostname.endsWith('.local')) && (
              <div className="mt-8 rounded-2xl border border-dashed border-green/40 bg-green-soft/20 p-4 text-center">
                <p className="text-[11px] font-bold text-green uppercase tracking-wider">Mode Developer (Localhost)</p>
                <p className="mt-1 text-xs text-muted">Akses instan ke dashboard tanpa perlu konfigurasi auth Supabase.</p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('cukupin_dev_logged_out')
                    toast.success('Masuk sebagai developer lokal.')
                    router.push('/dashboard')
                  }}
                  className="mt-3 inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-green px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#327756] transition-all cursor-pointer"
                >
                  Masuk Instan (Mode Dev) <ArrowRight size={14} />
                </button>
              </div>
            )}
        </div>
      </div>
      
    </div>
  )
}
