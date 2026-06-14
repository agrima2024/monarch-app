-- Monarch: Reputation-based dethroning
-- net_score = upvotes minus downvotes; 30-day grace after first falling below zero.

alter table public.claims
  add column if not exists net_score integer not null default 0,
  add column if not exists disgraced_at timestamptz;

create table if not exists public.claim_votes (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz default now() not null,
  constraint claim_votes_unique_voter unique (claim_id, user_id)
);

create index if not exists claim_votes_claim_id_idx on public.claim_votes (claim_id);
create index if not exists claims_disgraced_at_idx on public.claims (disgraced_at)
  where disgraced_at is not null;

alter table public.claim_votes enable row level security;

create policy "Claim votes are viewable by everyone"
  on public.claim_votes for select using (true);

create policy "Authenticated users can vote"
  on public.claim_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.claim_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.claim_votes for delete
  using (auth.uid() = user_id);

-- Recalculate net_score and manage disgraced_at when votes change.
create or replace function public.recalculate_claim_reputation(p_claim_id uuid)
returns void as $$
declare
  v_net_score integer;
  v_disgraced_at timestamptz;
begin
  select
    coalesce(sum(case when vote_type = 'up' then 1 when vote_type = 'down' then -1 end), 0)
  into v_net_score
  from public.claim_votes
  where claim_id = p_claim_id;

  select disgraced_at into v_disgraced_at
  from public.claims
  where id = p_claim_id;

  if v_net_score < 0 and v_disgraced_at is null then
    v_disgraced_at := now();
  elsif v_net_score >= 0 then
    v_disgraced_at := null;
  end if;

  update public.claims
  set net_score = v_net_score,
      disgraced_at = v_disgraced_at
  where id = p_claim_id;
end;
$$ language plpgsql security definer;

create or replace function public.on_claim_vote_changed()
returns trigger as $$
begin
  perform public.recalculate_claim_reputation(
    coalesce(new.claim_id, old.claim_id)
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger claim_votes_reputation_trigger
  after insert or update or delete on public.claim_votes
  for each row execute function public.on_claim_vote_changed();

-- Remove claims disgraced for more than 30 days (run via pg_cron or edge scheduler).
create or replace function public.expire_disgraced_claims()
returns integer as $$
declare
  v_deleted integer;
begin
  with expired as (
    delete from public.claims
    where disgraced_at is not null
      and disgraced_at < now() - interval '30 days'
    returning id
  )
  select count(*) into v_deleted from expired;

  return v_deleted;
end;
$$ language plpgsql security definer;
