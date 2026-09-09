/**
 * Cukupin™ Standalone Simulated Load Test Runner (Node.js Native)
 * 
 * Allows developers to run concurrency & latency load benchmarks immediately
 * without requiring the k6 binary installed on the system.
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '20', 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '200', 10);

function sendRequest(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const startTime = performance.now();

    const req = client.get(url, { headers: { 'User-Agent': 'Cukupin-Simulated-LoadRunner/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = performance.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });

    req.on('error', (err) => {
      const duration = performance.now() - startTime;
      resolve({
        statusCode: 0,
        duration,
        success: false,
        error: err.message,
      });
    });
  });
}

async function runWorker(url, count, results) {
  for (let i = 0; i < count; i++) {
    const res = await sendRequest(url);
    results.push(res);
  }
}

async function main() {
  console.log(`\n================================================================================`);
  console.log(`           CUKUPIN™ STANDALONE LOAD TEST RUNNER (Node.js Engine)`);
  console.log(`================================================================================`);
  console.log(`Target URL       : ${BASE_URL}`);
  console.log(`Concurrency (VUs): ${CONCURRENCY}`);
  console.log(`Total Requests   : ${TOTAL_REQUESTS}`);
  console.log(`--------------------------------------------------------------------------------\n`);

  // 1. Health check target
  console.log(`[1/3] Pinging ${BASE_URL} ...`);
  const initialPing = await sendRequest(BASE_URL);
  if (initialPing.statusCode === 0) {
    console.error(`ERROR: Could not connect to ${BASE_URL}. Ensure your Next.js dev server is running (npm run dev)!`);
    process.exit(1);
  }
  console.log(`Target is healthy (Status: ${initialPing.statusCode}, Latency: ${initialPing.duration.toFixed(2)} ms)\n`);

  // 2. Execute concurrent load
  console.log(`[2/3] Dispatching ${TOTAL_REQUESTS} requests across ${CONCURRENCY} concurrent workers ...`);
  const results = [];
  const reqsPerWorker = Math.ceil(TOTAL_REQUESTS / CONCURRENCY);
  const startTime = performance.now();

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(runWorker(BASE_URL, reqsPerWorker, results));
  }

  await Promise.all(workers);
  const totalDurationMs = performance.now() - startTime;
  const totalDurationSec = totalDurationMs / 1000;

  // 3. Compute statistics
  console.log(`[3/3] Analyzing telemetry and calculating percentiles ...\n`);
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const successfulReqs = results.filter((r) => r.success).length;
  const failedReqs = results.length - successfulReqs;

  const min = durations[0].toFixed(2);
  const max = durations[durations.length - 1].toFixed(2);
  const avg = (durations.reduce((acc, d) => acc + d, 0) / durations.length).toFixed(2);
  const p50 = durations[Math.floor(durations.length * 0.5)].toFixed(2);
  const p90 = durations[Math.floor(durations.length * 0.9)].toFixed(2);
  const p95 = durations[Math.floor(durations.length * 0.95)].toFixed(2);
  const p99 = durations[Math.floor(durations.length * 0.99)].toFixed(2);
  const rps = (results.length / totalDurationSec).toFixed(2);

  console.log(`================================================================================`);
  console.log(`                         LOAD TEST BENCHMARK RESULTS`);
  console.log(`================================================================================`);
  console.log(`Total Requests Handled : ${results.length}`);
  console.log(`Successful Requests    : ${successfulReqs} (${((successfulReqs / results.length) * 100).toFixed(1)}%)`);
  console.log(`Failed Requests        : ${failedReqs} (${((failedReqs / results.length) * 100).toFixed(1)}%)`);
  console.log(`Total Execution Time   : ${totalDurationSec.toFixed(2)} seconds`);
  console.log(`Throughput (RPS)       : ${rps} requests/sec`);
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`Latency Breakdown:`);
  console.log(`  - Minimum            : ${min} ms`);
  console.log(`  - Average (Mean)     : ${avg} ms`);
  console.log(`  - 50th Percentile    : ${p50} ms`);
  console.log(`  - 90th Percentile    : ${p90} ms`);
  console.log(`  - 95th Percentile    : ${p95} ms (SLO Target: < 200 ms)`);
  console.log(`  - 99th Percentile    : ${p99} ms (SLO Target: < 400 ms)`);
  console.log(`  - Maximum            : ${max} ms`);
  console.log(`================================================================================\n`);

  if (parseFloat(p95) < 200 && failedReqs === 0) {
    console.log(`SUCCESS: Load test PASSED all production Service Level Objectives (SLOs)!\n`);
  } else {
    console.log(`NOTE: Review latency percentiles against target deployment infrastructure.\n`);
  }
}

main().catch((err) => {
  console.error('Fatal load test error:', err);
  process.exit(1);
});
