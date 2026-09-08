/**
 * In-Memory Sliding-Window Rate Limiter
 * 
 * Provides deterministic rate limiting, brute-force mitigation, and DDoS protection
 * for Next.js 16 Edge Proxy (proxy.ts) and Route Handlers (app/api/*).
 * 
 * Features:
 * - Zero external dependencies (Edge-compatible)
 * - Sliding window algorithm preventing burst exploitation at window boundaries
 * - Automatic background garbage collection preventing memory leaks
 * - Standardized RFC/IETF RateLimit headers generator
 */

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  headers: Record<string, string>;
}

// Preset rate limit configurations
export const RATE_LIMIT_PRESETS = {
  /** General public API endpoints (60 req / 60s) */
  API_DEFAULT: { limit: 60, windowMs: 60_000 },
  /** Sensitive auth & recovery endpoints (5 req / 60s) */
  AUTH_STRICT: { limit: 5, windowMs: 60_000 },
  /** Background cron & webhook endpoints (12 req / 60s) */
  CRON_WEBHOOK: { limit: 12, windowMs: 60_000 },
} as const;

// In-memory bucket store: identifier -> array of request timestamps
const requestBuckets = new Map<string, number[]>();

// Periodic garbage collection interval (every 5 minutes in long-lived environments)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 300_000;

function cleanupExpiredBuckets(now: number, maxWindowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, timestamps] of requestBuckets.entries()) {
    const validTimestamps = timestamps.filter((ts) => now - ts < maxWindowMs);
    if (validTimestamps.length === 0) {
      requestBuckets.delete(key);
    } else {
      requestBuckets.set(key, validTimestamps);
    }
  }
}

/**
 * Checks whether an identifier (e.g. client IP or user ID) has exceeded the rate limit.
 * 
 * @param identifier Unique client key (IP address, token, or session ID)
 * @param options Rate limit parameters (limit and window duration in ms)
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = RATE_LIMIT_PRESETS.API_DEFAULT
): RateLimitResult {
  const now = Date.now();
  const { limit, windowMs } = options;
  const windowStart = now - windowMs;

  cleanupExpiredBuckets(now, windowMs);

  const existingTimestamps = requestBuckets.get(identifier) || [];
  // Filter only timestamps within the current sliding window
  const activeTimestamps = existingTimestamps.filter((ts) => ts > windowStart);

  const isAllowed = activeTimestamps.length < limit;

  if (isAllowed) {
    activeTimestamps.push(now);
    requestBuckets.set(identifier, activeTimestamps);
  }

  const remaining = Math.max(0, limit - activeTimestamps.length);
  const oldestTimestamp = activeTimestamps[0] || now;
  const resetMs = Math.max(0, oldestTimestamp + windowMs - now);
  const resetSeconds = Math.ceil(resetMs / 1000);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(resetSeconds),
  };

  if (!isAllowed) {
    headers['Retry-After'] = String(resetSeconds);
  }

  return {
    success: isAllowed,
    limit,
    remaining,
    resetMs,
    headers,
  };
}

/**
 * Reset stored rate limit bucket for an identifier (useful in test teardown).
 */
export function resetRateLimit(identifier?: string) {
  if (identifier) {
    requestBuckets.delete(identifier);
  } else {
    requestBuckets.clear();
  }
}
