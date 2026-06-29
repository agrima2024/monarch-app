-- Allow explorers to publish locations and manage their own claims.

create policy "Authenticated users can insert locations"
  on public.locations for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update own claims"
  on public.claims for update
  using (auth.uid() = user_id);

create policy "Users can delete own claims"
  on public.claims for delete
  using (auth.uid() = user_id);

alter table public.friendships
  add column if not exists invite_message text;
