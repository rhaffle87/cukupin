/**
 * Common configuration & helper utilities for Cukupin™ k6 Load & Stress Tests
 */

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const DEFAULT_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'User-Agent': 'k6-load-runner/1.0 (Cukupin Load Testing Suite)',
};

export const API_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'k6-load-runner/1.0 (Cukupin Load Testing Suite)',
};

/**
 * Common threshold profiles aligned with Cukupin™ SLOs
 */
export const THRESHOLDS = {
  // Strict SLO for standard production traffic
  STRICT_SLO: {
    http_req_duration: ['p(95)<200', 'p(99)<400'], // 95% < 200ms, 99% < 400ms
    http_req_failed: ['rate<0.001'],               // Less than 0.1% HTTP 5xx errors
  },
  // Stress threshold allowing slight degradation under extreme spikes
  STRESS_SLO: {
    http_req_duration: ['p(95)<500', 'p(99)<1200'],
    http_req_failed: ['rate<0.01'],                // Less than 1% errors
  },
  // Rate limit validation threshold (expects HTTP 429 status)
  RATE_LIMIT_SLO: {
    http_req_duration: ['p(95)<100'],
  },
};

/**
 * Standard summary text formatter for terminal output
 */
export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const p95 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A';
  const p99 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'].toFixed(2) : 'N/A';
  const rps = data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(2) : 'N/A';
  const failedRate = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : '0.00';

  return `
================================================================================
                    CUKUPIN™ K6 LOAD TEST SUMMARY
================================================================================
Target URL         : ${BASE_URL}
Throughput (RPS)   : ${rps} req/s
Latency p(95)      : ${p95} ms
Latency p(99)      : ${p99} ms
Failed Requests    : ${failedRate} %
================================================================================
`;
}
