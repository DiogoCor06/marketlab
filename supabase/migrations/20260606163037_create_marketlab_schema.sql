-- MarketLab core schema: profiles, markets, positions, ledger_entries

-- Fake starting balance for new users: $1,000.00
create or replace function public.marketlab_starting_balance_cents()
returns bigint
language sql
immutable
set search_path = public
as $$
  select 100000::bigint;
$$;

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (one row per auth user)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  first_name text not null default '',
  last_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Binary Yes/No markets
create table public.markets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'open' check (status in ('open', 'closed', 'resolved')),
  close_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger markets_set_updated_at
before update on public.markets
for each row
execute function public.set_updated_at();

-- One position row per user per market (1 cent spent = 1 share cent)
create table public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  market_id uuid not null references public.markets (id) on delete cascade,
  yes_shares_cents bigint not null default 0 check (yes_shares_cents >= 0),
  no_shares_cents bigint not null default 0 check (no_shares_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, market_id)
);

create index positions_user_id_idx on public.positions (user_id);
create index positions_market_id_idx on public.positions (market_id);

create trigger positions_set_updated_at
before update on public.positions
for each row
execute function public.set_updated_at();

-- Ledger of balance changes (market_id nullable for non-market entries)
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  market_id uuid references public.markets (id) on delete set null,
  amount_cents bigint not null,
  entry_type text not null,
  description text,
  created_at timestamptz not null default now()
);

create index ledger_entries_user_id_idx on public.ledger_entries (user_id);
create index ledger_entries_market_id_idx on public.ledger_entries (market_id);

-- Create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, balance_cents)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    public.marketlab_starting_balance_cents()
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Trigger-only function: block direct RPC calls from the browser
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.markets enable row level security;
alter table public.positions enable row level security;
alter table public.ledger_entries enable row level security;

-- Public market data is readable by everyone
create policy "Markets are publicly readable"
on public.markets
for select
to anon, authenticated
using (true);

-- Users can read their own profile (no client write policies)
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Users can read their own positions
create policy "Users can read own positions"
on public.positions
for select
to authenticated
using (auth.uid() = user_id);

-- Users can read their own ledger entries
create policy "Users can read own ledger entries"
on public.ledger_entries
for select
to authenticated
using (auth.uid() = user_id);
