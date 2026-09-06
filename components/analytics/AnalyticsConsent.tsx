'use client'

import React from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { STORAGE_KEYS } from '@/lib/constants/site'

export function AnalyticsConsent() {
  if (process.env.NODE_ENV !== 'production') return null

  return (
    <>
      <Analytics
        beforeSend={(event) => {
          if (typeof window !== 'undefined') {
            const consent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)
            if (consent === 'declined') {
              return null
            }
          }
          return event
        }}
      />
      <SpeedInsights
        beforeSend={(data) => {
          if (typeof window !== 'undefined') {
            const consent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)
            if (consent === 'declined') {
              return null
            }
          }
          return data
        }}
      />
    </>
  )
}
