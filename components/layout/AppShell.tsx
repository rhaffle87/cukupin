import React, { useState } from 'react'
import { Brand } from '@/components/ui/Brand'
import { FileText, Home as HomeIcon, LogOut, Menu, Receipt, ShoppingBag, Sparkles, Target, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AppShellProps {
  children: React.ReactNode
  user: { email?: string } | null
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
  const pathname = usePathname()

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Tutup menu">
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">RUANG UANGMU</div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '11px',
                  color: isActive ? 'var(--ink)' : '#748077',
                  background: isActive ? 'var(--card)' : 'transparent',
                  boxShadow: isActive ? '0 5px 18px rgba(30,50,73,.05)' : 'none',
                  fontWeight: isActive ? 700 : 'normal',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <span className="nav-dot" />}
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{user?.email?.slice(0, 1).toUpperCase() || 'C'}</div>
            <div style={{ textAlign: 'left' }}>
              <strong>{user?.email?.split('@')[0] || 'User'}</strong>
              <small>{user?.email || 'Belum terhubung'}</small>
            </div>
          </div>
          <button className="logout-button" onClick={onSignOut} style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={15} /> Keluar
          </button>
        </div>
      </aside>
      
      <div className="main-column">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setOpen(true)} aria-label="Buka menu">
            <Menu size={20} />
          </button>
          <Brand compact />
          <button className="icon-button" aria-label="Fitur AI">
            <Sparkles size={18} />
          </button>
        </header>
        
        <main className="page-content">{children}</main>
        
        <nav className="bottom-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '9px',
                  color: isActive ? 'var(--ink)' : 'var(--muted)',
                  fontWeight: isActive ? 700 : 'normal',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon size={19} color={isActive ? 'var(--green)' : 'inherit'} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
    </div>
  )
}
