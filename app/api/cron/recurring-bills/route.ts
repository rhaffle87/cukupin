import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDueBillsToAutoLog } from '@/lib/recurringBillsWorker'
import { RecurringBill } from '@/lib/database.types'

/**
 * Automated Cron Endpoint for Recurring Bills
 *
 * Triggered by:
 * - Vercel Cron (configured in vercel.json)
 * - GitHub Actions or external cron curl request
 *
 * Security:
 * - Validates Authorization: Bearer ${process.env.CRON_SECRET} if CRON_SECRET is set.
 */
export async function GET(req: NextRequest) {
  return handleRecurringCron(req)
}

export async function POST(req: NextRequest) {
  return handleRecurringCron(req)
}

async function handleRecurringCron(req: NextRequest) {
  // 1. Secret authorization check
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron bearer secret' },
      { status: 401 }
    )
  }

  // 2. Initialize Supabase Admin / Service Role Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return NextResponse.json({
      success: true,
      message:
        'Supabase cloud credentials not detected or using placeholder. Client bootstrap worker handles local dev and offline PWA auto-logging.',
      processedCount: 0,
      bills: [],
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const now = new Date()
  const currentDay = now.getDate()
  const currentMonth = now.toISOString().slice(0, 7) // 'YYYY-MM'
  const todayStr = now.toISOString().slice(0, 10) // 'YYYY-MM-DD'

  try {
    // 3. Fetch all active recurring bills
    const { data: bills, error: fetchError } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('is_active', true)

    if (fetchError) {
      console.error('Cron: Failed to fetch recurring bills:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch bills', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!bills || bills.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active recurring bills found.',
        processedCount: 0,
        bills: [],
      })
    }

    // 4. Filter due bills using our deterministic worker logic
    const dueBills = getDueBillsToAutoLog(bills as RecurringBill[], currentDay, currentMonth)

    if (dueBills.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All active recurring bills for this month have already been processed.',
        processedCount: 0,
        bills: [],
      })
    }

    const processedBills: Array<{ id: string; name: string; amount: number; user_id: string }> =
      []

    // 5. Process each due bill sequentially
    for (const bill of dueBills) {
      // Insert expense transaction
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: bill.user_id,
        type: 'expense',
        description: bill.name,
        amount: bill.amount,
        category: bill.category,
        transaction_date: todayStr,
        note: `Pembayaran tagihan rutin bulanan (Otomatis: ${bill.name})`,
        payment_method: bill.payment_method || 'Transfer Bank',
      })

      if (txError) {
        console.error(`Cron: Failed to log transaction for bill ${bill.id}:`, txError)
        continue
      }

      // Update last_logged_month on the bill to prevent duplicate logging
      const { error: billUpdateError } = await supabase
        .from('recurring_bills')
        .update({ last_logged_month: currentMonth })
        .eq('id', bill.id)

      if (billUpdateError) {
        console.error(`Cron: Failed to update last_logged_month for bill ${bill.id}:`, billUpdateError)
      }

      // If category is Tabungan or Investasi, find matching saving goal and increment amount
      const isSavingsBill = bill.category === 'Tabungan' || bill.category === 'Investasi'
      if (isSavingsBill) {
        const cleanBillName = bill.name
          .toLowerCase()
          .replace('tabungan:', '')
          .replace('alokasi:', '')
          .trim()

        const { data: userGoals } = await supabase
          .from('saving_goals')
          .select('*')
          .eq('user_id', bill.user_id)

        if (userGoals && userGoals.length > 0) {
          const matchingGoal = userGoals.find((g) => {
            const gName = g.name.toLowerCase().trim()
            return cleanBillName.includes(gName) || gName.includes(cleanBillName)
          })

          if (matchingGoal) {
            const newAmount = Number(matchingGoal.current_amount || 0) + bill.amount
            await supabase
              .from('saving_goals')
              .update({ current_amount: newAmount })
              .eq('id', matchingGoal.id)
          }
        }
      }

      processedBills.push({
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        user_id: bill.user_id,
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      currentMonth,
      currentDay,
      processedCount: processedBills.length,
      bills: processedBills,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown cron error'
    console.error('Cron Execution Exception:', err)
    return NextResponse.json(
      { error: 'Internal server error during cron execution', details: message },
      { status: 500 }
    )
  }
}
