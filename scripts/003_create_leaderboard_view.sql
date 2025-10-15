-- Create a materialized view for leaderboard
create materialized view if not exists public.leaderboard as
select 
  u.id,
  u.telegram_id,
  u.username,
  u.first_name,
  u.last_name,
  u.photo_url,
  u.total_earned,
  row_number() over (order by u.total_earned desc) as rank
from public.users u
order by u.total_earned desc;

-- Create index on the materialized view
create unique index if not exists leaderboard_id_idx on public.leaderboard(id);

-- Function to refresh leaderboard
create or replace function public.refresh_leaderboard()
returns void as $$
begin
  refresh materialized view concurrently public.leaderboard;
end;
$$ language plpgsql security definer;

-- Grant access to the leaderboard view
grant select on public.leaderboard to authenticated;
grant select on public.leaderboard to anon;
