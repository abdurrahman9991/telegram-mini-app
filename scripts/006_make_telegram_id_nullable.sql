-- Make telegram_id nullable to support email-based users
-- Email users won't have a telegram_id, only Telegram WebApp users will

alter table public.users 
  alter column telegram_id drop not null;

-- Update the unique constraint to allow multiple null values
-- (PostgreSQL allows multiple NULL values in a UNIQUE column by default)

-- Add a check constraint to ensure either telegram_id or username exists
alter table public.users
  add constraint users_has_identifier 
  check (telegram_id is not null or username is not null);

-- Create a partial unique index for telegram_id (only for non-null values)
drop index if exists users_telegram_id_idx;
create unique index users_telegram_id_unique_idx 
  on public.users(telegram_id) 
  where telegram_id is not null;

-- Update RLS policies to work with both auth types
drop policy if exists "Users can view their own data" on public.users;
drop policy if exists "Users can update their own data" on public.users;

create policy "Users can view their own data"
  on public.users for select
  using (
    auth.uid() = id 
    or telegram_id::text = auth.jwt()->>'telegram_id'
  );

create policy "Users can update their own data"
  on public.users for update
  using (
    auth.uid() = id 
    or telegram_id::text = auth.jwt()->>'telegram_id'
  );

-- Allow authenticated users to insert their own record
create policy "Users can insert their own data"
  on public.users for insert
  with check (auth.uid() = id);
