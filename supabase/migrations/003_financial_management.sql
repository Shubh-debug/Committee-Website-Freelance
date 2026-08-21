-- Funds and expenses ledger.
--
-- 2025 is the fixed baseline year. The only manually entered balance is the
-- 2025 closing balance. Financial transactions begin in 2026; opening and
-- closing balances for every later year are derived from these source rows.

create table if not exists public.financial_settings (
  id boolean primary key default true check (id = true),
  initial_year integer not null default 2025 check (initial_year = 2025),
  initial_closing_balance numeric(14,2)
    check (initial_closing_balance is null or initial_closing_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_contributions (
  id uuid primary key default gen_random_uuid(),
  contribution_date date not null
    check (contribution_date >= date '2026-01-01'),
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(14,2) not null check (amount > 0),
  type text not null check (type in ('people', 'mandal_member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null
    check (expense_date >= date '2026-01-01'),
  purpose text not null check (char_length(trim(purpose)) > 0),
  amount numeric(14,2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.financial_settings enable row level security;
alter table public.financial_contributions enable row level security;
alter table public.financial_expenses enable row level security;

drop policy if exists "Admins read financial settings" on public.financial_settings;
drop policy if exists "Admins insert financial settings" on public.financial_settings;
drop policy if exists "Admins update financial settings" on public.financial_settings;
create policy "Admins read financial settings"
  on public.financial_settings for select using (public.is_admin());
create policy "Admins insert financial settings"
  on public.financial_settings for insert with check (public.is_admin());
create policy "Admins update financial settings"
  on public.financial_settings for update using (public.is_admin());

drop policy if exists "Admins read contributions" on public.financial_contributions;
drop policy if exists "Admins insert contributions" on public.financial_contributions;
drop policy if exists "Admins update contributions" on public.financial_contributions;
drop policy if exists "Admins delete contributions" on public.financial_contributions;
create policy "Admins read contributions"
  on public.financial_contributions for select using (public.is_admin());
create policy "Admins insert contributions"
  on public.financial_contributions for insert with check (public.is_admin());
create policy "Admins update contributions"
  on public.financial_contributions for update using (public.is_admin());
create policy "Admins delete contributions"
  on public.financial_contributions for delete using (public.is_admin());

drop policy if exists "Admins read expenses" on public.financial_expenses;
drop policy if exists "Admins insert expenses" on public.financial_expenses;
drop policy if exists "Admins update expenses" on public.financial_expenses;
drop policy if exists "Admins delete expenses" on public.financial_expenses;
create policy "Admins read expenses"
  on public.financial_expenses for select using (public.is_admin());
create policy "Admins insert expenses"
  on public.financial_expenses for insert with check (public.is_admin());
create policy "Admins update expenses"
  on public.financial_expenses for update using (public.is_admin());
create policy "Admins delete expenses"
  on public.financial_expenses for delete using (public.is_admin());

create index if not exists financial_contributions_date_idx
  on public.financial_contributions (contribution_date, created_at, id);
create index if not exists financial_contributions_type_idx
  on public.financial_contributions (type);
create index if not exists financial_expenses_date_idx
  on public.financial_expenses (expense_date, created_at, id);

drop trigger if exists financial_settings_set_updated_at on public.financial_settings;
create trigger financial_settings_set_updated_at
  before update on public.financial_settings
  for each row execute function public.set_updated_at();

drop trigger if exists financial_contributions_set_updated_at on public.financial_contributions;
create trigger financial_contributions_set_updated_at
  before update on public.financial_contributions
  for each row execute function public.set_updated_at();

drop trigger if exists financial_expenses_set_updated_at on public.financial_expenses;
create trigger financial_expenses_set_updated_at
  before update on public.financial_expenses
  for each row execute function public.set_updated_at();

-- Every financial mutation takes the same transaction-scoped lock. Locking
-- contributions as well as expenses is required: deleting or reducing a
-- contribution must not race an expense insert/update.
create or replace function public.lock_financial_ledger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('financial-ledger', 0));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists financial_settings_lock on public.financial_settings;
create trigger financial_settings_lock
  before insert or update or delete on public.financial_settings
  for each row execute function public.lock_financial_ledger();

drop trigger if exists financial_contributions_lock on public.financial_contributions;
create trigger financial_contributions_lock
  before insert or update or delete on public.financial_contributions
  for each row execute function public.lock_financial_ledger();

drop trigger if exists financial_expenses_lock on public.financial_expenses;
create trigger financial_expenses_lock
  before insert or update or delete on public.financial_expenses
  for each row execute function public.lock_financial_ledger();

-- Validate the complete post-change ledger. This deliberately derives every
-- year from the 2025 baseline, so historical edits automatically affect all
-- subsequent opening and closing balances without stored duplicate balances.
create or replace function public.validate_financial_ledger()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  initial_balance numeric(14,2);
  baseline_year integer;
  first_year integer;
  last_year integer;
  year_row record;
  opening_balance numeric(14,2);
  total_funds numeric(14,2);
  total_expenses numeric(14,2);
begin
  select initial_closing_balance
       , initial_year
     into initial_balance
       , baseline_year
    from public.financial_settings
    where id = true;

  -- The empty singleton row is allowed before the administrator initializes
  -- the system. Once financial transactions exist, initialization is required.
  if initial_balance is null then
    if exists (select 1 from public.financial_contributions)
       or exists (select 1 from public.financial_expenses) then
      raise exception using
        errcode = 'P0001',
        message = 'Financial system is not initialized';
    end if;
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  first_year := baseline_year + 1;

  select greatest(
    first_year,
    coalesce((select max(extract(year from contribution_date)::integer)
              from public.financial_contributions), first_year),
    coalesce((select max(extract(year from expense_date)::integer)
              from public.financial_expenses), first_year)
  ) into last_year;

  for year_row in
    select generate_series(first_year, last_year) as year
  loop
    select initial_balance
      + coalesce((
          select sum(c.amount)
          from public.financial_contributions c
          where extract(year from c.contribution_date)::integer < year_row.year
        ), 0)
      - coalesce((
          select sum(e.amount)
          from public.financial_expenses e
          where extract(year from e.expense_date)::integer < year_row.year
        ), 0)
      into opening_balance;

    select opening_balance
      + coalesce((
          select sum(c.amount)
          from public.financial_contributions c
          where extract(year from c.contribution_date)::integer = year_row.year
        ), 0)
      into total_funds;

    select coalesce((
        select sum(e.amount)
        from public.financial_expenses e
        where extract(year from e.expense_date)::integer = year_row.year
      ), 0)
      into total_expenses;

    if total_expenses > total_funds then
      raise exception using
        errcode = 'P0001',
        message = format(
          'Insufficient balance for %s. Resulting balance: %s.',
          year_row.year,
          to_char(total_funds - total_expenses, 'FM999999999999990.00')
        );
    end if;
  end loop;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists financial_settings_validate on public.financial_settings;
create constraint trigger financial_settings_validate
  after insert or update or delete on public.financial_settings
  deferrable initially immediate
  for each row execute function public.validate_financial_ledger();

drop trigger if exists financial_contributions_validate on public.financial_contributions;
create constraint trigger financial_contributions_validate
  after insert or update or delete on public.financial_contributions
  deferrable initially immediate
  for each row execute function public.validate_financial_ledger();

drop trigger if exists financial_expenses_validate on public.financial_expenses;
create constraint trigger financial_expenses_validate
  after insert or update or delete on public.financial_expenses
  deferrable initially immediate
  for each row execute function public.validate_financial_ledger();

-- Create the singleton setup row without initializing the baseline amount.
-- The administrator enters 2025's closing balance through the application.
insert into public.financial_settings (id, initial_year)
values (true, 2025)
on conflict (id) do nothing;
