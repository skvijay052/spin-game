-- Spin Duel demo schema. No payments, cash balances, withdrawals, or redeemable prizes.
create extension if not exists pgcrypto;

create type public.match_status as enum ('waiting', 'ready', 'spinning', 'completed', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  avatar_url text,
  role text not null default 'player' check (role in ('player','admin')),
  demo_points integer not null default 1240 check (demo_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  status public.match_status not null default 'waiting',
  created_by uuid not null references public.profiles(id),
  winner_id uuid references public.profiles(id),
  result_seed text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint winner_must_be_player check (winner_id is null or winner_id in (select player_id from public.match_players where match_id = id))
);

create table if not exists public.match_players (
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  seat smallint not null check (seat in (1,2)),
  joined_at timestamptz not null default now(),
  primary key (match_id, player_id),
  unique (match_id, seat)
);

create table if not exists public.match_events (
  id bigint generated always as identity primary key,
  match_id uuid not null references public.matches(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null check (event_type in ('created','joined','spin_started','completed','cancelled')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.profiles(id),
  action text not null,
  target_match_id uuid references public.matches(id),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists matches_status_created_idx on public.matches(status, created_at desc);
create index if not exists match_players_player_idx on public.match_players(player_id, joined_at desc);
create index if not exists match_events_match_idx on public.match_events(match_id, created_at);

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_events enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "Profiles visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy "Users create own profile" on public.profiles for insert to authenticated with check (auth.uid() = id and role = 'player');
create policy "Players see matches they joined" on public.matches for select to authenticated using (exists (select 1 from public.match_players mp where mp.match_id = id and mp.player_id = auth.uid()) or status = 'waiting');
create policy "Players see match participants" on public.match_players for select to authenticated using (exists (select 1 from public.match_players mine where mine.match_id = match_id and mine.player_id = auth.uid()));
create policy "Players see match events" on public.match_events for select to authenticated using (exists (select 1 from public.match_players mp where mp.match_id = match_id and mp.player_id = auth.uid()));
create policy "Admins see audit logs" on public.admin_audit_logs for select to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1), 'Player'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_spin_duel on auth.users;
create trigger on_auth_user_created_spin_duel after insert on auth.users for each row execute procedure public.handle_new_user();

-- Server-authoritative demo result. This RPC never accepts or transfers money.
create or replace function public.spin_demo_match(p_match_id uuid)
returns table(match_id uuid, winner_id uuid, status public.match_status)
language plpgsql security definer set search_path = public
as $$
declare
  v_winner uuid;
  v_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform 1 from public.matches m where m.id = p_match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if not exists (select 1 from public.match_players mp where mp.match_id = p_match_id and mp.player_id = auth.uid()) then
    raise exception 'Only a match participant can spin';
  end if;
  select count(*) into v_count from public.match_players mp where mp.match_id = p_match_id;
  if v_count <> 2 then raise exception 'A demo match requires exactly two players'; end if;
  if (select m.status from public.matches m where m.id = p_match_id) = 'completed' then
    raise exception 'Match already completed';
  end if;
  select mp.player_id into v_winner
  from public.match_players mp
  where mp.match_id = p_match_id
  order by gen_random_uuid()
  limit 1;
  update public.matches set status='completed', winner_id=v_winner, completed_at=now(), result_seed=encode(gen_random_bytes(16),'hex') where id=p_match_id;
  insert into public.match_events(match_id,actor_id,event_type,details) values(p_match_id,auth.uid(),'completed',jsonb_build_object('winner_id',v_winner,'mode','demo'));
  return query select p_match_id, v_winner, 'completed'::public.match_status;
end;
$$;

revoke all on function public.spin_demo_match(uuid) from public, anon;
grant execute on function public.spin_demo_match(uuid) to authenticated;

-- Realtime is enabled for match updates; clients must still obey RLS.
do $$ begin
  alter publication supabase_realtime add table public.matches;
exception when duplicate_object then null;
when undefined_object then null;
end $$;
