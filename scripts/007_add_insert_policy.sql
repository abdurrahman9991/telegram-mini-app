-- Add INSERT policy to allow authenticated users to create their own user record
create policy "Users can insert their own data"
  on public.users for insert
  with check (auth.uid() = id);

-- Also add a policy to allow service role to insert (for server-side operations)
create policy "Service role can insert users"
  on public.users for insert
  to service_role
  with check (true);
