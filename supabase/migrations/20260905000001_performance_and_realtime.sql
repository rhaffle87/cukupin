-- Performance indexes for Cukupin (postgres-best-practices)
-- Speeds up category aggregations, monthly reports, and sorted goal/wishlist listings

-- 1. Index for category analytics (breakdown by category per user)
create index if not exists transactions_user_category_idx 
  on public.transactions(user_id, category);

-- 2. Index for type-filtered queries (income vs expense filtering)
create index if not exists transactions_user_type_date_idx 
  on public.transactions(user_id, type, transaction_date desc);

-- 3. Composite index for saving goals deadline sorting
create index if not exists saving_goals_user_deadline_idx 
  on public.saving_goals(user_id, deadline asc nulls last);

-- 4. Composite index for wishlist priority and recency
create index if not exists wishlist_user_priority_idx 
  on public.wishlist(user_id, priority, created_at desc);

-- 5. Enable real-time syncing for saving goals and wishlist across devices
alter table public.saving_goals replica identity full;
alter table public.wishlist replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.saving_goals;
    alter publication supabase_realtime add table public.wishlist;
  end if;
exception when duplicate_object then 
  null;
end $$;
