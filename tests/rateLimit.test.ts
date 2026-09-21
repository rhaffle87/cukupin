/// <reference types="vitest/globals" />
import {
  checkRateLimit,
  resetRateLimit,
  RATE_LIMIT_PRESETS,
} from '@/lib/rateLimit'

describe('In-Memory Sliding-Window Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimit()
    vi.useRealTimers()
  })

  it('allows requests within limit and properly decrements remaining count', () => {
    const ip = '192.168.1.10'
    const opts = { limit: 3, windowMs: 10_000 }

    const res1 = checkRateLimit(ip, opts)
    expect(res1.success).toBe(true)
    expect(res1.limit).toBe(3)
    expect(res1.remaining).toBe(2)
    expect(res1.headers['X-RateLimit-Limit']).toBe('3')
    expect(res1.headers['X-RateLimit-Remaining']).toBe('2')

    const res2 = checkRateLimit(ip, opts)
    expect(res2.success).toBe(true)
    expect(res2.remaining).toBe(1)

    const res3 = checkRateLimit(ip, opts)
    expect(res3.success).toBe(true)
    expect(res3.remaining).toBe(0)
  })

  it('rejects requests when rate limit is exceeded with 429 semantics and Retry-After header', () => {
    const ip = '10.0.0.1'
    const opts = { limit: 2, windowMs: 5_000 }

    checkRateLimit(ip, opts) // hit 1
    checkRateLimit(ip, opts) // hit 2

    // hit 3 (should be blocked)
    const blockedRes = checkRateLimit(ip, opts)
    expect(blockedRes.success).toBe(false)
    expect(blockedRes.remaining).toBe(0)
    expect(blockedRes.headers['Retry-After']).toBeDefined()
    expect(Number(blockedRes.headers['Retry-After'])).toBeGreaterThanOrEqual(1)
  })

  it('isolates rate limit budgets across distinct client identifiers', () => {
    const clientA = 'user-alice'
    const clientB = 'user-bob'
    const opts = { limit: 2, windowMs: 5_000 }

    checkRateLimit(clientA, opts)
    checkRateLimit(clientA, opts)
    const blockedA = checkRateLimit(clientA, opts)
    expect(blockedA.success).toBe(false)

    // clientB should still have full quota
    const resB = checkRateLimit(clientB, opts)
    expect(resB.success).toBe(true)
    expect(resB.remaining).toBe(1)
  })

  it('resets quota when sliding window expires', () => {
    vi.useFakeTimers()
    const ip = '172.16.0.5'
    const opts = { limit: 2, windowMs: 2_000 }

    checkRateLimit(ip, opts)
    checkRateLimit(ip, opts)
    const blocked = checkRateLimit(ip, opts)
    expect(blocked.success).toBe(false)

    // Advance time past the 2s window
    vi.advanceTimersByTime(2_500)

    const freshRes = checkRateLimit(ip, opts)
    expect(freshRes.success).toBe(true)
    expect(freshRes.remaining).toBe(1)
  })

  it('provides well-defined presets for API, Auth, and Cron', () => {
    expect(RATE_LIMIT_PRESETS.API_DEFAULT.limit).toBe(60)
    expect(RATE_LIMIT_PRESETS.AUTH_STRICT.limit).toBe(5)
    expect(RATE_LIMIT_PRESETS.CRON_WEBHOOK.limit).toBe(12)
  })

  it('can reset individual or all buckets manually', () => {
    const ip1 = '1.1.1.1'
    const ip2 = '2.2.2.2'
    const opts = { limit: 1, windowMs: 5_000 }

    checkRateLimit(ip1, opts)
    checkRateLimit(ip2, opts)

    // Reset only ip1
    resetRateLimit(ip1)
    expect(checkRateLimit(ip1, opts).success).toBe(true)
    expect(checkRateLimit(ip2, opts).success).toBe(false)

    // Reset all
    resetRateLimit()
    expect(checkRateLimit(ip2, opts).success).toBe(true)
  })
})
