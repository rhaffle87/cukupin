import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  shouldShowInstallPrompt,
  recordInstallPromptShown,
  recordInstallPromptDismissed,
  INSTALL_PROMPT_LAST_SHOWN_KEY,
  INSTALL_PROMPT_DISMISS_KEY,
  INSTALL_PROMPT_INSTALLED_KEY,
  SEVEN_DAYS_MS,
} from '@/components/pwa/InstallPrompt'

describe('PWA Install Prompt 7-Day Weekly Frequency Gate', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('allows prompt to show initially on clean device', () => {
    expect(shouldShowInstallPrompt()).toBe(true)
  })

  it('immediately suppresses prompt for 7 days after it is shown to prevent page transition spam', () => {
    const now = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    expect(shouldShowInstallPrompt()).toBe(true)

    // Prompt pops up
    recordInstallPromptShown()

    // Immediate check (e.g. user navigates between /transactions, /reports, or reloads)
    expect(shouldShowInstallPrompt()).toBe(false)
    expect(localStorage.getItem(INSTALL_PROMPT_LAST_SHOWN_KEY)).toBe(now.toString())
  })

  it('suppresses prompt on day 6 (less than 7 days)', () => {
    const startTime = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(startTime)

    recordInstallPromptShown()

    // Advance time by 6 days
    const sixDaysLater = startTime + 6 * 24 * 60 * 60 * 1000
    vi.spyOn(Date, 'now').mockReturnValue(sixDaysLater)

    expect(shouldShowInstallPrompt()).toBe(false)
  })

  it('allows prompt to show again once 7 full days have elapsed', () => {
    const startTime = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(startTime)

    recordInstallPromptShown()

    // Advance time by 7 days + 1 second
    const sevenDaysLater = startTime + SEVEN_DAYS_MS + 1000
    vi.spyOn(Date, 'now').mockReturnValue(sevenDaysLater)

    expect(shouldShowInstallPrompt()).toBe(true)
  })

  it('suppresses prompt when dismissed by user (Nanti saja / X)', () => {
    const startTime = 1700000000000
    vi.spyOn(Date, 'now').mockReturnValue(startTime)

    recordInstallPromptDismissed()

    expect(shouldShowInstallPrompt()).toBe(false)
    expect(localStorage.getItem(INSTALL_PROMPT_DISMISS_KEY)).toBe(startTime.toString())
    expect(localStorage.getItem(INSTALL_PROMPT_LAST_SHOWN_KEY)).toBe(startTime.toString())
  })

  it('permanently suppresses prompt once installed', () => {
    localStorage.setItem(INSTALL_PROMPT_INSTALLED_KEY, 'true')
    expect(shouldShowInstallPrompt()).toBe(false)
  })
})
