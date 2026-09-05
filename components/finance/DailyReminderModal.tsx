'use client'

import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Check, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'

interface DailyReminderModalProps {
  onClose: () => void
}

export function DailyReminderModal({ onClose }: DailyReminderModalProps) {
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState('20:00')
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('cukupin_reminder_enabled') === 'true'
      const savedTime = localStorage.getItem('cukupin_reminder_time') || '20:00'
      setEnabled(savedEnabled)
      setTime(savedTime)

      if ('Notification' in window) {
        setPermission(Notification.permission)
      }
    }
  }, [])

  async function handleToggle() {
    if (!('Notification' in window)) {
      toast.error('Browser kamu tidak mendukung Web Notifications.')
      return
    }

    if (!enabled) {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res === 'granted') {
        setEnabled(true)
        localStorage.setItem('cukupin_reminder_enabled', 'true')
        localStorage.setItem('cukupin_reminder_time', time)
        toast.success(`Pengingat harian aktif setiap jam ${time}.`)
      } else {
        toast.error('Izin notifikasi tidak diberikan oleh peramban.')
      }
    } else {
      setEnabled(false)
      localStorage.setItem('cukupin_reminder_enabled', 'false')
      toast.success('Pengingat harian dinonaktifkan.')
    }
  }

  function handleSaveTime(newTime: string) {
    setTime(newTime)
    localStorage.setItem('cukupin_reminder_time', newTime)
    if (enabled) {
      toast.success(`Waktu pengingat diperbarui ke jam ${newTime}.`)
    }
  }

  function sendTestNotification() {
    if (!('Notification' in window)) {
      toast.error('Browser tidak mendukung Web Notifications.')
      return
    }

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(res => {
        setPermission(res)
        if (res === 'granted') {
          triggerNotification()
        } else {
          toast.error('Izinkan notifikasi di pengaturan browser terlebih dahulu.')
        }
      })
    } else {
      triggerNotification()
    }
  }

  function triggerNotification() {
    try {
      new Notification('cukupin: Catat Santai', {
        body: 'Halo! Jangan lupa catat pengeluaran hari ini biar tetap santai dan cukup sampai akhir bulan.',
        icon: '/icon-192.png',
        badge: '/icon.png',
      })
      toast.success('Notifikasi uji coba terkirim!')
    } catch (e) {
      toast.error('Gagal memunculkan notifikasi.')
    }
  }

  return (
    <Modal title="Pengingat Catat Harian" onClose={onClose}>
      <div className="flex flex-col gap-4 text-xs">
        <p className="text-muted leading-relaxed">
          Aktifkan notifikasi peramban untuk mengingatkanmu mencatat pengeluaran setiap malam agar tidak ada transaksi yang terlupa.
        </p>

        {/* Toggle Panel */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-paper/80 p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${enabled ? 'bg-green-soft text-green' : 'bg-black/5 text-muted'}`}>
              {enabled ? <Bell size={18} /> : <BellOff size={18} />}
            </div>
            <div>
              <strong className="block text-sm font-bold text-ink">
                {enabled ? 'Pengingat Aktif' : 'Pengingat Tidak Aktif'}
              </strong>
              <span className="text-[11px] text-muted">
                {enabled ? `Akan muncul setiap jam ${time}` : 'Klik tombol untuk mengaktifkan'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              enabled
                ? 'bg-coral-soft text-coral hover:bg-coral/20'
                : 'bg-ink text-white hover:bg-ink/90'
            }`}
          >
            {enabled ? 'Matikan' : 'Aktifkan'}
          </button>
        </div>

        {/* Time Selector */}
        <div className="flex items-center justify-between rounded-xl border border-line bg-card p-3.5">
          <div>
            <strong className="block text-xs font-bold text-ink">Waktu Pengingat</strong>
            <span className="text-[11px] text-muted">Direkomendasikan jam 20:00 malam</span>
          </div>
          <input
            type="time"
            value={time}
            onChange={e => handleSaveTime(e.target.value)}
            className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
          />
        </div>

        {/* Test Notification Button */}
        <div className="pt-2 border-t border-line/60 flex items-center justify-between">
          <span className="text-[11px] text-muted">Coba tes tampilan di browsermu:</span>
          <button
            type="button"
            onClick={sendTestNotification}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-[11px] font-bold text-ink hover:bg-paper active:scale-95 transition-all"
          >
            <Send size={12} className="text-blue" />
            <span>Kirim Notifikasi Tes</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
