import React, { useEffect, useState } from 'react'
import { Brand } from '@/components/ui/Brand'
import { Bell, FileText, Home as HomeIcon, LogOut, Menu, Plus, Receipt, ShoppingBag, Sparkles, Target, WifiOff, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DailyReminderModal } from '@/components/finance/DailyReminderModal'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { syncOfflineQueue } from '@/lib/offlineQueue'
import { useFinance } from '@/context/FinanceContext'
import { toast } from 'sonner'

interface AppShellProps {
  children: React.ReactNode
  user: { id?: string; email?: string } | null
  onSignOut: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Ringkasan', icon: HomeIcon },
  { href: '/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/reports', label: 'Laporan', icon: FileText },
  { href: '/goals', label: 'Target tabungan', icon: Target },
  { href: '/wishlist', label: 'Keinginan', icon: ShoppingBag },
]

export function AppShell({ children, user, onSignOut }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { supabase, refresh } = useFinance()

  const handleOpenNewTx = () => {
    if (pathname === '/transactions') {
      window.dispatchEvent(new CustomEvent('cukupin:open-new-tx'))
    } else {
      router.push('/transactions?new=1')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOffline(!navigator.onLine)

    const handleOnline = async () => {
      setIsOffline(false)
      if (supabase && user?.id && user.id !== 'local-dev-user') {
        const { syncedCount } = await syncOfflineQueue(supabase, user.id)
        if (syncedCount > 0) {
          toast.success(`Koneksi kembali! ${syncedCount} transaksi offline berhasil disinkronkan.`)
          refresh()
        } else {
          toast.success('Koneksi internet kembali normal.')
        }
      } else {
        toast.success('Koneksi internet kembali normal.')
      }
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast.warning('Mode Offline aktif. Transaksi baru tetap tersimpan di perangkat.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [supabase, user?.id, refresh])

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
      }
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        window.dispatchEvent(new CustomEvent('cukupin:open-new-tx'))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper font-sans text-ink selection:bg-green-soft selection:text-green">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-paper p-6 transition-transform duration-300 md:static md:w-[280px] md:translate-x-0 md:border-r md:border-line lg:w-[300px] ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between">
          <Brand />
          <button 
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-black/5 md:hidden" 
            onClick={() => setOpen(false)} 
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        {isOffline && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-500/20">
            <WifiOff size={14} className="shrink-0 text-amber-700" />
            <span>Mode Offline aktif</span>
          </div>
        )}
        
        <div className="mb-4 px-3 text-[10px] font-bold tracking-widest text-muted uppercase">
          MENU UTAMA
        </div>
        
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${isActive ? 'bg-card text-ink shadow-[0_5px_18px_rgba(30,50,73,0.05)] font-bold' : 'text-muted font-normal hover:bg-black/5 hover:text-ink'}`}
              >
                <Icon size={18} className={isActive ? 'text-green' : 'text-muted group-hover:text-ink transition-colors'} />
                <span>{item.label}</span>
                {isActive && <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-green shadow-[0_0_8px_rgba(62,143,104,0.6)]" />}
              </Link>
            )
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-line">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/10 font-display text-sm font-bold text-blue">
              {user?.email?.slice(0, 1).toUpperCase() || 'C'}
            </div>
            <div className="flex min-w-0 flex-col text-left">
              <strong className="truncate text-sm leading-tight text-ink">
                {user?.email?.split('@')[0] || 'User'}
              </strong>
              <small className="truncate text-[11px] text-muted">
                {user?.email || 'Belum terhubung'}
              </small>
            </div>
          </div>
          <button 
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted transition-colors hover:bg-black/5 hover:text-ink" 
            onClick={() => setShowReminderModal(true)}
          >
            <Bell size={15} className="text-green" /> Pengingat Harian
          </button>
          <button 
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-coral transition-colors hover:bg-coral/10 hover:text-coral-dark" 
            onClick={onSignOut}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden md:m-3 md:rounded-3xl md:border md:border-line md:bg-card md:shadow-sm">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-line bg-card p-4 md:hidden">
          <div className="flex items-center gap-2">
            <button 
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5" 
              onClick={() => setOpen(true)} 
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <Brand compact />
            {isOffline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-800 border border-amber-500/20">
                <WifiOff size={10} /> Offline
              </span>
            )}
          </div>
          <button 
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-ink !text-white shadow-xs transition-transform active:scale-95 cursor-pointer" 
            onClick={handleOpenNewTx}
            aria-label="Tambah catatan baru"
            title="Tambah catatan baru"
          >
            <Plus size={20} />
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="pb-28 md:pb-0">
            {children}
          </div>
        </main>
        
        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-line bg-card/90 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-2.5 backdrop-blur-md md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[44px] min-w-[48px] flex-col items-center justify-center gap-1 transition-colors"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${isActive ? 'bg-green/10 text-green' : 'text-muted'}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[9px] ${isActive ? 'font-bold text-ink' : 'font-medium text-muted'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Mobile Scrim */}
      {open && (
        <div 
          className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm transition-opacity md:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}

      {showReminderModal && (
        <DailyReminderModal onClose={() => setShowReminderModal(false)} />
      )}

      <InstallPrompt />
    </div>
  )
}
