import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, API_HEADERS } from './common.js';

export const options = {
  vus: 5,
  duration: '15s',
  thresholds: {
    // We explicitly expect 429 responses during this flood test
    http_req_duration: ['p(95)<100'],
  },
};

export default function () {
  group('Rate Limiter & DDoS Mitigation Test', () => {
    // Send rapid burst of requests to API cron endpoint to test throttling (Limit: 12 req/min)
    const res = http.get(`${BASE_URL}/api/cron/recurring-bills`, {
      headers: {
        ...API_HEADERS,
        'X-Forwarded-For': '198.51.100.42', // Static simulated attacker IP
      },
    });

    check(res, {
      'Response is either Allowed (200/401) or Throttled (429)': (r) =>
        r.status === 200 || r.status === 401 || r.status === 429,
      'Rate limit headers are present': (r) =>
        r.headers['X-Ratelimit-Limit'] !== undefined ||
        r.headers['x-ratelimit-limit'] !== undefined,
    });

    if (res.status === 429) {
      check(res, {
        'Retry-After header is returned on 429': (r) =>
          r.headers['Retry-After'] !== undefined || r.headers['retry-after'] !== undefined,
      });
    }

    sleep(0.05); // High frequency flood (50ms interval)
  });
}
