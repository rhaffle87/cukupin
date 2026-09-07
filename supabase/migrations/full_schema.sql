-- ==============================================================================
-- CUKUPIN - CONSOLIDATED DATABASE SCHEMA (IDEMPOTENT)
-- Version: 2.0 (Includes recurring_bills, category_budgets, & payment_method)
-- Target: Supabase PostgreSQL 15+
-- Compatible with: 1-Click Execution in Supabase SQL Editor
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABLE: transactions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    note TEXT,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'debit', 'credit', 'qris', 'transfer', 'ewallet')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If table existed before payment_method migration, ensure column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'transactions' 
          AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN payment_method TEXT DEFAULT 'cash' 
        CHECK (payment_method IN ('cash', 'debit', 'credit', 'qris', 'transfer', 'ewallet'));
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLE: saving_goals
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saving_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: wishlist
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL CHECK (price > 0),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    url TEXT,
    is_bought BOOLEAN NOT NULL DEFAULT FALSE,
    bought_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: recurring_bills
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL DEFAULT 'Tagihan',
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: category_budgets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    monthly_limit NUMERIC(15, 2) NOT NULL CHECK (monthly_limit > 0),
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_category_month UNIQUE (user_id, category, month_year)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 5 tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saving_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

-- Helper to safely recreate RLS policies idempotently
DO $$
BEGIN
    -- transactions policies
    DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
    CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
    CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
    CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
    CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

    -- saving_goals policies
    DROP POLICY IF EXISTS "Users can view their own saving goals" ON public.saving_goals;
    CREATE POLICY "Users can view their own saving goals" ON public.saving_goals FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can insert their own saving goals" ON public.saving_goals;
    CREATE POLICY "Users can insert their own saving goals" ON public.saving_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can update their own saving goals" ON public.saving_goals;
    CREATE POLICY "Users can update their own saving goals" ON public.saving_goals FOR UPDATE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can delete their own saving goals" ON public.saving_goals;
    CREATE POLICY "Users can delete their own saving goals" ON public.saving_goals FOR DELETE USING (auth.uid() = user_id);

    -- wishlist policies
    DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
    CREATE POLICY "Users can view their own wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can insert their own wishlist" ON public.wishlist;
    CREATE POLICY "Users can insert their own wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can update their own wishlist" ON public.wishlist;
    CREATE POLICY "Users can update their own wishlist" ON public.wishlist FOR UPDATE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can delete their own wishlist" ON public.wishlist;
    CREATE POLICY "Users can delete their own wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

    -- recurring_bills policies
    DROP POLICY IF EXISTS "Users can view their own recurring bills" ON public.recurring_bills;
    CREATE POLICY "Users can view their own recurring bills" ON public.recurring_bills FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can insert their own recurring bills" ON public.recurring_bills;
    CREATE POLICY "Users can insert their own recurring bills" ON public.recurring_bills FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can update their own recurring bills" ON public.recurring_bills;
    CREATE POLICY "Users can update their own recurring bills" ON public.recurring_bills FOR UPDATE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can delete their own recurring bills" ON public.recurring_bills;
    CREATE POLICY "Users can delete their own recurring bills" ON public.recurring_bills FOR DELETE USING (auth.uid() = user_id);

    -- category_budgets policies
    DROP POLICY IF EXISTS "Users can view their own category budgets" ON public.category_budgets;
    CREATE POLICY "Users can view their own category budgets" ON public.category_budgets FOR SELECT USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can insert their own category budgets" ON public.category_budgets;
    CREATE POLICY "Users can insert their own category budgets" ON public.category_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can update their own category budgets" ON public.category_budgets;
    CREATE POLICY "Users can update their own category budgets" ON public.category_budgets FOR UPDATE USING (auth.uid() = user_id);
    DROP POLICY IF EXISTS "Users can delete their own category budgets" ON public.category_budgets;
    CREATE POLICY "Users can delete their own category budgets" ON public.category_budgets FOR DELETE USING (auth.uid() = user_id);
END $$;

-- ==============================================================================
-- PERFORMANCE & COMPOSITE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
    ON public.transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type_cat 
    ON public.transactions(user_id, type, category);

CREATE INDEX IF NOT EXISTS idx_saving_goals_user 
    ON public.saving_goals(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_bought 
    ON public.wishlist(user_id, is_bought);

CREATE INDEX IF NOT EXISTS idx_recurring_bills_user_active 
    ON public.recurring_bills(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_category_budgets_user_month 
    ON public.category_budgets(user_id, month_year);

-- ==============================================================================
-- SUPABASE REALTIME SUBSCRIPTION CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.saving_goals;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_bills;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.category_budgets;
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
END $$;
