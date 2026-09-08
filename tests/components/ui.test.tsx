import React from 'react'
/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Brand } from '@/components/ui/Brand'
import { EmptyState } from '@/components/ui/EmptyState'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { StatCard } from '@/components/ui/StatCard'
import { Modal } from '@/components/ui/Modal'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { STORAGE_KEYS } from '@/lib/constants/site'
import { Wallet, HelpCircle } from 'lucide-react'

describe('UI Primitives Unit Tests', () => {
  describe('Brand component', () => {
    it('renders full brand identity by default', () => {
      render(<Brand />)
      expect(screen.getByText('Cukupin')).toBeDefined()
      expect(screen.getByText('catat santai')).toBeDefined()
    })

    it('renders compact logo without text when compact is true', () => {
      render(<Brand compact={true} />)
      expect(screen.queryByText('Cukupin')).toBeNull()
      expect(screen.queryByText('catat santai')).toBeNull()
    })
  })

  describe('EmptyState component', () => {
    it('renders title, description, icon, and optional action', () => {
      const handleAction = vi.fn()
      render(
        <EmptyState
          icon={HelpCircle}
          title="Belum Ada Transaksi"
          body="Mulai catat pengeluaran harianmu sekarang."
          action={<button onClick={handleAction}>Tambah Transaksi</button>}
        />
      )

      expect(screen.getByText('Belum Ada Transaksi')).toBeDefined()
      expect(screen.getByText('Mulai catat pengeluaran harianmu sekarang.')).toBeDefined()
      const button = screen.getByText('Tambah Transaksi')
      fireEvent.click(button)
      expect(handleAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Eyebrow component', () => {
    it('renders text with decorative styling classes', () => {
      const { container } = render(<Eyebrow variant="mint">Laporan Keuangan</Eyebrow>)
      expect(screen.getByText('Laporan Keuangan')).toBeDefined()
      expect(container.firstChild).toBeDefined()
    })
  })

  describe('StatCard component', () => {
    it('renders stat title, formatted amount, note, and icon', () => {
      render(
        <StatCard
          label="Total Saldo"
          value="Rp 5.250.000"
          tone="green"
          icon={Wallet}
          note="Aman hingga akhir bulan"
        />
      )

      expect(screen.getByText('Total Saldo')).toBeDefined()
      expect(screen.getByText('Rp 5.250.000')).toBeDefined()
      expect(screen.getByText('Aman hingga akhir bulan')).toBeDefined()
    })
  })

  describe('Modal component', () => {
    it('renders modal dialog with accessible title and triggers onClose on escape', () => {
      const handleClose = vi.fn()
      render(
        <Modal title="Pengaturan Anggaran" onClose={handleClose}>
          <p>Konten modal dialog</p>
        </Modal>
      )

      expect(screen.getByRole('dialog')).toBeDefined()
      expect(screen.getByText('Pengaturan Anggaran')).toBeDefined()
      expect(screen.getByText('Konten modal dialog')).toBeDefined()

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(handleClose).toHaveBeenCalled()
    })

    it('triggers onClose when close button is clicked', () => {
      const handleClose = vi.fn()
      render(
        <Modal title="Modal Test" onClose={handleClose}>
          <p>Test</p>
        </Modal>
      )

      const closeBtn = screen.getByLabelText('Tutup modal')
      fireEvent.click(closeBtn)
      expect(handleClose).toHaveBeenCalled()
    })
  })

  describe('CookieConsent component', () => {
    beforeEach(() => {
      localStorage.clear()
      vi.useFakeTimers()
    })

    it('shows banner after delay when consent is not stored', () => {
      render(<CookieConsent />)
      expect(screen.queryByText('Privasi & Cookie')).toBeNull()

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.getByText('Privasi & Cookie')).toBeDefined()
    })

    it('stores "accepted" in localStorage when Terima is clicked', () => {
      render(<CookieConsent />)
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      const acceptBtn = screen.getByText('Terima')
      fireEvent.click(acceptBtn)

      expect(localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)).toBe('accepted')
      expect(screen.queryByText('Privasi & Cookie')).toBeNull()
    })

    it('stores "declined" in localStorage when Tolak is clicked', () => {
      render(<CookieConsent />)
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      const declineBtn = screen.getByText('Tolak')
      fireEvent.click(declineBtn)

      expect(localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)).toBe('declined')
      expect(screen.queryByText('Privasi & Cookie')).toBeNull()
    })

    it('does not display banner if consent is already set', () => {
      localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'accepted')
      render(<CookieConsent />)
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.queryByText('Privasi & Cookie')).toBeNull()
    })
  })
})
