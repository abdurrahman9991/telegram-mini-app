-- Create users table for Telegram Mini App
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  photo_url text,
  balance numeric(10, 2) default 0.00 not null,
  total_earned numeric(10, 2) default 0.00 not null,
  referral_code text unique not null,
  referred_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.users enable row level security;

-- RLS Policies for users table
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- Create index for faster lookups
create index if not exists users_telegram_id_idx on public.users(telegram_id);
create index if not exists users_referral_code_idx on public.users(referral_code);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function public.update_updated_at_column();
