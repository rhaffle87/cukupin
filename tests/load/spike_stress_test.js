import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, DEFAULT_HEADERS, THRESHOLDS } from './common.js';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Baseline ramp
    { duration: '1m', target: 500 },   // Extreme traffic spike
    { duration: '1m', target: 500 },   // Sustained extreme load
    { duration: '30s', target: 100 },  // Recovery stage
    { duration: '30s', target: 0 },    // Cooldown
  ],
  thresholds: THRESHOLDS.STRESS_SLO,
};

export default function () {
  group('Spike Stress Traffic', () => {
    const urls = [
      `${BASE_URL}/`,
      `${BASE_URL}/auth/login`,
      `${BASE_URL}/legal/privacy`,
      `${BASE_URL}/manifest.webmanifest`,
    ];

    const targetUrl = urls[Math.floor(Math.random() * urls.length)];
    const res = http.get(targetUrl, { headers: DEFAULT_HEADERS });

    check(res, {
      'Response status is 200': (r) => r.status === 200,
      'No server 5xx errors': (r) => r.status < 500,
    });

    sleep(Math.random() * 1 + 0.2); // Fast bursts (0.2s - 1.2s)
  });
}
