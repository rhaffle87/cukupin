'use client'

import { track } from '@vercel/analytics'
import { STORAGE_KEYS } from '@/lib/constants/site'

/**
 * Custom telemetry tracking helper for user-initiated actions.
 * Automatically respects GDPR / UU PDP cookie consent preference.
 */
export function trackCustomEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return

  try {
    const consent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)
    if (consent === 'declined') {
      return
    }

    if (process.env.NODE_ENV === 'production') {
      track(event, properties)
    } else {
      // In development, log to console for debugging telemetry flow
      console.log(`[Analytics Event: ${event}]`, properties)
    }
  } catch {
    // Fail silently so analytics errors never disrupt core financial actions
  }
}
