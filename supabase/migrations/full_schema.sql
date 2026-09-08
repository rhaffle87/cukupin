-- ==============================================================================
-- CUKUPIN™ - CONSOLIDATED IDEMPOTENT DATABASE SCHEMA (PRODUCTION V2.0)
-- Target: Supabase PostgreSQL 15+
-- Compatible with: 1-Click Execution in Supabase SQL Editor
-- Synchronized with: 20260905000000..20260906000003 migrations & database.types.ts
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
    description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 120),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 40),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    payment_method TEXT DEFAULT 'Transfer Bank',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure payment_method column exists if table predated migration 2
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'transactions' 
          AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN payment_method TEXT DEFAULT 'Transfer Bank';
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. TABLE: saving_goals
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saving_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0 AND current_amount <= target_amount),
    deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: wishlist
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    url TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: recurring_bills
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 40),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'yearly')),
    payment_method TEXT DEFAULT 'Transfer Bank',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_logged_month TEXT, -- e.g. '2026-09'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: category_budgets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.category_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (char_length(category) BETWEEN 1 AND 40),
    monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_category_budget UNIQUE (user_id, category)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - STRICT TENANT ISOLATION
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
    -- 1. transactions policies
    DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
    DROP POLICY IF EXISTS "Users manage their transactions" ON public.transactions;
    CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

    -- 2. saving_goals policies
    DROP POLICY IF EXISTS "Users can view their own saving goals" ON public.saving_goals;
    DROP POLICY IF EXISTS "Users manage their goals" ON public.saving_goals;
    CREATE POLICY "Users can view their own saving goals" ON public.saving_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own saving goals" ON public.saving_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own saving goals" ON public.saving_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own saving goals" ON public.saving_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

    -- 3. wishlist policies
    DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
    DROP POLICY IF EXISTS "Users manage their wishlist" ON public.wishlist;
    CREATE POLICY "Users can view their own wishlist" ON public.wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own wishlist" ON public.wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own wishlist" ON public.wishlist FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own wishlist" ON public.wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id);

    -- 4. recurring_bills policies
    DROP POLICY IF EXISTS "Users can view their own recurring bills" ON public.recurring_bills;
    DROP POLICY IF EXISTS "Users manage their recurring bills" ON public.recurring_bills;
    CREATE POLICY "Users can view their own recurring bills" ON public.recurring_bills FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own recurring bills" ON public.recurring_bills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own recurring bills" ON public.recurring_bills FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own recurring bills" ON public.recurring_bills FOR DELETE TO authenticated USING (auth.uid() = user_id);

    -- 5. category_budgets policies
    DROP POLICY IF EXISTS "Users can view their own category budgets" ON public.category_budgets;
    DROP POLICY IF EXISTS "Users manage their category budgets" ON public.category_budgets;
    CREATE POLICY "Users can view their own category budgets" ON public.category_budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own category budgets" ON public.category_budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own category budgets" ON public.category_budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own category budgets" ON public.category_budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- ==============================================================================
-- PERFORMANCE & COMPOSITE INDEXES
-- ==============================================================================

-- transactions indexes
CREATE INDEX IF NOT EXISTS transactions_user_date_idx 
    ON public.transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS transactions_user_category_idx 
    ON public.transactions(user_id, category);

CREATE INDEX IF NOT EXISTS transactions_user_type_date_idx 
    ON public.transactions(user_id, type, transaction_date DESC);

CREATE INDEX IF NOT EXISTS transactions_user_payment_method_idx 
    ON public.transactions(user_id, payment_method);

-- saving_goals indexes
CREATE INDEX IF NOT EXISTS goals_user_idx 
    ON public.saving_goals(user_id);

CREATE INDEX IF NOT EXISTS saving_goals_user_deadline_idx 
    ON public.saving_goals(user_id, deadline ASC NULLS LAST);

-- wishlist indexes
CREATE INDEX IF NOT EXISTS wishlist_user_idx 
    ON public.wishlist(user_id);

CREATE INDEX IF NOT EXISTS wishlist_user_priority_idx 
    ON public.wishlist(user_id, priority, created_at DESC);

-- recurring_bills indexes
CREATE INDEX IF NOT EXISTS recurring_bills_user_idx 
    ON public.recurring_bills(user_id);

CREATE INDEX IF NOT EXISTS recurring_bills_due_day_idx 
    ON public.recurring_bills(user_id, due_day);

CREATE INDEX IF NOT EXISTS recurring_bills_user_active_idx 
    ON public.recurring_bills(user_id, is_active);

-- category_budgets indexes
CREATE INDEX IF NOT EXISTS category_budgets_user_idx 
    ON public.category_budgets(user_id);

CREATE INDEX IF NOT EXISTS category_budgets_user_cat_idx 
    ON public.category_budgets(user_id, category);

-- ==============================================================================
-- SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.saving_goals REPLICA IDENTITY FULL;
ALTER TABLE public.wishlist REPLICA IDENTITY FULL;
ALTER TABLE public.recurring_bills REPLICA IDENTITY FULL;
ALTER TABLE public.category_budgets REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.saving_goals;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.recurring_bills;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.category_budgets;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;
