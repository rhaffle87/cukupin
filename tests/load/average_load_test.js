import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, DEFAULT_HEADERS, THRESHOLDS } from './common.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp-up to 50 users
    { duration: '3m', target: 100 }, // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: THRESHOLDS.STRICT_SLO,
};

export default function () {
  group('User Flow: Browse Public Pages & PWA Assets', () => {
    // 1. Visit Landing Page
    const resHome = http.get(`${BASE_URL}/`, { headers: DEFAULT_HEADERS });
    check(resHome, {
      'Home loaded 200': (r) => r.status === 200,
      'CSP header present': (r) => r.headers['Content-Security-Policy'] !== undefined,
    });

    sleep(Math.random() * 2 + 1); // 1-3s think time

    // 2. Visit Terms & Privacy
    const resTerms = http.get(`${BASE_URL}/legal/terms`, { headers: DEFAULT_HEADERS });
    check(resTerms, {
      'Terms loaded 200': (r) => r.status === 200,
    });

    sleep(Math.random() * 1.5 + 0.5);

    // 3. Visit Auth Screen
    const resAuth = http.get(`${BASE_URL}/auth/login`, { headers: DEFAULT_HEADERS });
    check(resAuth, {
      'Auth loaded 200': (r) => r.status === 200,
    });

    sleep(Math.random() * 2 + 1);
  });
}
