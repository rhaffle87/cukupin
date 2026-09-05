-- Add payment_method column to transactions table
alter table public.transactions 
  add column if not exists payment_method text;

create index if not exists transactions_user_payment_method_idx 
  on public.transactions(user_id, payment_method);
