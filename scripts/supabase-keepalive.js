/**
 * Supabase Keep-Alive Ping Script
 * 
 * Prevents Supabase Free Tier projects from automatically pausing after 7 days of inactivity.
 * Executes a lightweight SELECT query against the public schema or a lightweight table.
 * 
 * Designed to be executed on a schedule (every 5-6 days) via GitHub Actions cron.
 */

const { createClient } = require('@supabase/supabase-js');

async function keepAlive() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Keep-Alive Error] Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or key in environment.');
    console.info('[Keep-Alive Hint] Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in your GitHub Repository Secrets.');
    process.exit(1);
  }

  console.log(`[Keep-Alive] Pinging Supabase project: ${supabaseUrl} ...`);
  const startTime = Date.now();

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Execute a lightweight query to wake up compute & reset the 7-day idle timer
    const { data, error, status } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);

    const duration = Date.now() - startTime;

    if (error && status !== 200 && status !== 406) {
      console.warn(`[Keep-Alive Warning] Query returned error:`, error.message);
      // Fallback: ping root auth health or storage
      const authRes = await supabase.auth.getSession();
      console.log(`[Keep-Alive Fallback] Auth ping status:`, authRes.error ? 'WARN' : 'OK');
    } else {
      console.log(`[Keep-Alive Success] Supabase active! Response received in ${duration}ms (status: ${status})`);
    }
  } catch (err) {
    console.error(`[Keep-Alive Fatal] Execution error:`, err);
    process.exit(1);
  }
}

keepAlive();
