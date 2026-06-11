-- Monarch: Initial schema
-- Locations are unnamed coordinates until a Monarch explores and names them.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

create table if not exists public.locations (
  id text primary key,
  latitude double precision not null,
  longitude double precision not null
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  location_id text not null references public.locations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_name text not null,
  photo_url text not null,
  review_text text not null,
  created_at timestamptz default now() not null,
  constraint claims_location_id_unique unique (location_id)
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')),
  constraint friendships_no_self check (user_id <> friend_id),
  constraint friendships_unique_pair unique (user_id, friend_id)
);

create index if not exists claims_user_id_idx on public.claims (user_id);
create index if not exists friendships_user_id_idx on public.friendships (user_id);
create index if not exists friendships_friend_id_idx on public.friendships (friend_id);

alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.claims enable row level security;
alter table public.friendships enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Locations are viewable by everyone"
  on public.locations for select using (true);

create policy "Claims are viewable by everyone"
  on public.claims for select using (true);

create policy "Authenticated users can create claims"
  on public.claims for insert
  with check (auth.uid() = user_id);

create policy "Users can view own friendships"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can create friendships"
  on public.friendships for insert
  with check (auth.uid() = user_id);

create policy "Users can update own friendships"
  on public.friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('claim-photos', 'claim-photos', true)
on conflict (id) do nothing;

create policy "Claim photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'claim-photos');

create policy "Authenticated users can upload claim photos"
  on storage.objects for insert
  with check (
    bucket_id = 'claim-photos'
    and auth.role() = 'authenticated'
  );
