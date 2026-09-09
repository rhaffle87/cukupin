import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, DEFAULT_HEADERS, THRESHOLDS } from './common.js';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<150'], // 95% of requests must finish within 150ms
    http_req_failed: ['rate==0'],      // 0% failures allowed during smoke test
  },
};

export default function () {
  group('Smoke Test - Core Pages Navigation', () => {
    // 1. Landing Page
    const homeRes = http.get(`${BASE_URL}/`, { headers: DEFAULT_HEADERS });
    check(homeRes, {
      'Home status is 200': (r) => r.status === 200,
      'Home has security headers': (r) => r.headers['X-Frame-Options'] === 'DENY',
    });

    sleep(1);

    // 2. Auth Login Page
    const loginRes = http.get(`${BASE_URL}/auth/login`, { headers: DEFAULT_HEADERS });
    check(loginRes, {
      'Login status is 200': (r) => r.status === 200,
    });

    sleep(1);

    // 3. Legal Privacy Page
    const privacyRes = http.get(`${BASE_URL}/legal/privacy`, { headers: DEFAULT_HEADERS });
    check(privacyRes, {
      'Privacy status is 200': (r) => r.status === 200,
    });

    sleep(1);

    // 4. Web Manifest
    const manifestRes = http.get(`${BASE_URL}/manifest.webmanifest`, { headers: DEFAULT_HEADERS });
    check(manifestRes, {
      'Manifest status is 200': (r) => r.status === 200,
    });

    sleep(1);
  });
}
