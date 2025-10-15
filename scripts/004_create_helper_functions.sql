-- Function to generate unique referral code
create or replace function public.generate_referral_code()
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Function to add transaction and update user balance
create or replace function public.add_transaction(
  p_user_id uuid,
  p_type text,
  p_amount numeric,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_transaction_id uuid;
begin
  -- Insert transaction
  insert into public.transactions (user_id, type, amount, description, metadata)
  values (p_user_id, p_type, p_amount, p_description, p_metadata)
  returning id into v_transaction_id;
  
  -- Update user balance and total_earned
  update public.users
  set 
    balance = balance + p_amount,
    total_earned = case 
      when p_amount > 0 then total_earned + p_amount 
      else total_earned 
    end
  where id = p_user_id;
  
  return v_transaction_id;
end;
$$ language plpgsql security definer;
