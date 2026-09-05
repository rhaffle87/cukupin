'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Cukupin PWA Service Worker registered:', reg.scope)
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Cukupin Service Worker registration skipped:', err)
          }
        })
    }
  }, [])

  return null
}
