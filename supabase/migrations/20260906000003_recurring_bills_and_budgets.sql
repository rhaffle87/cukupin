-- ==============================================================================
-- Cukupin Production Database Schema Migration
-- Features: Recurring Bills (Tagihan Rutin) & Category Budget Limits
-- Author: Antigravity Agentic Engineer
-- Date: 2026-09-06
-- ==============================================================================

-- 1. Recurring Bills (Pengeluaran Rutin / Tagihan Bulanan)
create table if not exists public.recurring_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  amount numeric(12,2) not null check (amount > 0),
  category text not null check (char_length(category) between 1 and 40),
  due_day integer not null check (due_day between 1 and 31),
  frequency text not null default 'monthly' check (frequency in ('monthly', 'yearly')),
  payment_method text default 'Transfer Bank',
  is_active boolean not null default true,
  last_logged_month text, -- e.g. '2026-09'
  created_at timestamptz not null default now()
);

-- Performance Indexes for Recurring Bills
create index if not exists recurring_bills_user_idx on public.recurring_bills(user_id);
create index if not exists recurring_bills_due_day_idx on public.recurring_bills(user_id, due_day);

-- RLS for Recurring Bills
alter table public.recurring_bills enable row level security;

do $$ begin
  create policy "Users can view their own recurring bills" 
    on public.recurring_bills for select to authenticated 
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own recurring bills" 
    on public.recurring_bills for insert to authenticated 
    with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own recurring bills" 
    on public.recurring_bills for update to authenticated 
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their own recurring bills" 
    on public.recurring_bills for delete to authenticated 
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;


-- 2. Category Budget Limits (Pagu Anggaran Belanja per Kategori)
create table if not exists public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (char_length(category) between 1 and 40),
  monthly_limit numeric(12,2) not null check (monthly_limit > 0),
  created_at timestamptz not null default now(),
  constraint unique_user_category_budget unique(user_id, category)
);

-- Performance Indexes for Category Budgets
create index if not exists category_budgets_user_idx on public.category_budgets(user_id);
create index if not exists category_budgets_user_cat_idx on public.category_budgets(user_id, category);

-- RLS for Category Budgets
alter table public.category_budgets enable row level security;

do $$ begin
  create policy "Users can view their own category budgets" 
    on public.category_budgets for select to authenticated 
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own category budgets" 
    on public.category_budgets for insert to authenticated 
    with check ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update their own category budgets" 
    on public.category_budgets for update to authenticated 
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can delete their own category budgets" 
    on public.category_budgets for delete to authenticated 
    using ((select auth.uid()) = user_id);
exception when duplicate_object then null; end $$;


-- 3. Realtime Publication Replication Setup
alter table public.recurring_bills replica identity full;
alter table public.category_budgets replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.recurring_bills;
exception when others then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.category_budgets;
exception when others then null; end $$;
