/**
 * Cukupin™ Resource Budget & Free-Tier Capacity Optimization Utility
 * 
 * Provides deterministic pagination math, date-filtering range generators,
 * payload sizing measurements, and egress budget modeling to strictly
 * safeguard Vercel Hobby (100GB / 10s timeout) and Supabase Free (5GB egress / 500MB DB) quotas.
 */

export const FREE_TIER_LIMITS = {
  vercel: {
    bandwidthBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    edgeRequests: 1_000_000,
    functionInvocations: 1_000_000,
    functionTimeoutMs: 10_000, // 10s hard cap
    activeCpuHours: 4,
    provisionedMemoryGbHours: 360,
    concurrentBuilds: 1,
    buildMinutes: 6_000,
  },
  supabase: {
    databaseStorageBytes: 500 * 1024 * 1024, // 500 MB
    databaseEgressBytes: 5 * 1024 * 1024 * 1024, // 5 GB (Critical Bottleneck)
    fileStorageBytes: 1024 * 1024 * 1024, // 1 GB
    monthlyActiveUsers: 50_000,
    edgeFunctionInvocations: 500_000,
    realtimeConnections: 200,
    realtimeMessages: 2_000_000,
    inactivityAutoPauseDays: 7, // Auto-pauses after 7 days idle
  }
} as const;

/**
 * Calculates Supabase .range(from, to) bounds for standard zero-indexed pagination.
 * @param page 1-indexed page number (e.g. 1, 2, 3)
 * @param pageSize Number of rows per page (default: 25)
 */
export function calculatePaginationRange(page: number, pageSize: number = 25) {
  const safePage = Math.max(1, Math.floor(page || 1));
  const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize || 25)));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  return {
    from,
    to,
    limit: safePageSize,
    offset: from,
    page: safePage,
    pageSize: safePageSize,
  };
}

/**
 * Generates ISO string bounds for filtering queries by month.
 * Reduces database payload by 80-90% compared to full-table scans.
 */
export function getMonthlyFilterBounds(year: number, month: number) {
  // month is 1-indexed (1 = January, 12 = December)
  const safeYear = Math.floor(year);
  const safeMonth = Math.max(1, Math.min(12, Math.floor(month)));

  const start = new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(safeYear, safeMonth, 0, 23, 59, 59, 999));

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

/**
 * Estimates payload size in bytes for a JavaScript object/array when serialized to JSON.
 */
export function calculatePayloadBytes(data: unknown): number {
  if (data === null || data === undefined) return 0;
  const jsonString = JSON.stringify(data);
  // Using TextEncoder to count accurate UTF-8 byte length
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(jsonString).length;
  }
  return Buffer.from(jsonString).length;
}

export interface MonthlyEgressSimulationParams {
  monthlyActiveUsers: number;
  sessionsPerUserPerMonth: number;
  queriesPerSession?: number; // average queries/refetches per session (default: 1)
  avgTotalTxCount: number;
  isPaginated: boolean;
  pageSize?: number;
  avgTxByteSize?: number; // default ~220 bytes
  avgMetaByteSize?: number; // goals, wishlist, bills, budgets ~4000 bytes
}

export interface MonthlyEgressSimulationResult {
  totalPayloadPerSessionBytes: number;
  totalMonthlyEgressBytes: number;
  totalMonthlyEgressMB: number;
  totalMonthlyEgressGB: number;
  quotaPercentage: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  savingsRatioPercentage: number;
}

/**
 * Deterministically projects monthly database egress against Supabase's 5 GB free tier quota.
 */
export function estimateMonthlyEgress(params: MonthlyEgressSimulationParams): MonthlyEgressSimulationResult {
  const {
    monthlyActiveUsers,
    sessionsPerUserPerMonth,
    queriesPerSession = 1,
    avgTotalTxCount,
    isPaginated,
    pageSize = 25,
    avgTxByteSize = 220,
    avgMetaByteSize = 3500,
  } = params;

  const deliveredTxCount = isPaginated ? Math.min(pageSize, avgTotalTxCount) : avgTotalTxCount;
  const txPayloadBytes = deliveredTxCount * avgTxByteSize;
  const singleQueryPayloadBytes = txPayloadBytes + avgMetaByteSize;
  const sessionPayloadBytes = singleQueryPayloadBytes * Math.max(1, queriesPerSession);

  const totalSessions = monthlyActiveUsers * sessionsPerUserPerMonth;
  const totalEgressBytes = totalSessions * sessionPayloadBytes;

  const totalMonthlyEgressMB = Number((totalEgressBytes / (1024 * 1024)).toFixed(2));
  const totalMonthlyEgressGB = Number((totalEgressBytes / (1024 * 1024 * 1024)).toFixed(3));
  const quotaPercentage = Number(((totalEgressBytes / FREE_TIER_LIMITS.supabase.databaseEgressBytes) * 100).toFixed(2));


  // Compute savings compared to unpaginated
  const unpaginatedSingleQueryBytes = (avgTotalTxCount * avgTxByteSize) + avgMetaByteSize;
  const unpaginatedSessionBytes = unpaginatedSingleQueryBytes * Math.max(1, queriesPerSession);
  const unpaginatedTotalBytes = totalSessions * unpaginatedSessionBytes;
  const savingsRatioPercentage = unpaginatedTotalBytes > 0 
    ? Number((((unpaginatedTotalBytes - totalEgressBytes) / unpaginatedTotalBytes) * 100).toFixed(1))
    : 0;

  let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
  if (quotaPercentage >= 90) {
    status = 'CRITICAL';
  } else if (quotaPercentage >= 60) {
    status = 'WARNING';
  }

  return {
    totalPayloadPerSessionBytes: sessionPayloadBytes,
    totalMonthlyEgressBytes: totalEgressBytes,
    totalMonthlyEgressMB,
    totalMonthlyEgressGB,
    quotaPercentage,
    status,
    savingsRatioPercentage: Math.max(0, savingsRatioPercentage),
  };
}

/**
 * Validates that an operation will not exceed Vercel's 10-second serverless execution ceiling.
 */
export function assertWithinFunctionTimeout(durationMs: number) {
  const maxAllowed = FREE_TIER_LIMITS.vercel.functionTimeoutMs;
  if (durationMs > maxAllowed) {
    throw new Error(`Execution duration ${durationMs}ms exceeds Vercel Hobby 10-second timeout ceiling (${maxAllowed}ms)`);
  }
  return true;
}
