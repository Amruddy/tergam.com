alter table if exists public.accounts add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.transactions add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.transfers add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.budgets add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.goals add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.recurring add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table if exists public.settings add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.custom_categories (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null,
  color text not null,
  type text not null check (type in ('income', 'expense', 'both'))
);

create unique index if not exists settings_user_id_idx on public.settings(user_id);
create index if not exists accounts_user_id_idx on public.accounts(user_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transfers_user_id_idx on public.transfers(user_id);
create index if not exists budgets_user_id_idx on public.budgets(user_id);
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists recurring_user_id_idx on public.recurring(user_id);
create index if not exists custom_categories_user_id_idx on public.custom_categories(user_id);

alter table if exists public.accounts enable row level security;
alter table if exists public.transactions enable row level security;
alter table if exists public.transfers enable row level security;
alter table if exists public.budgets enable row level security;
alter table if exists public.goals enable row level security;
alter table if exists public.recurring enable row level security;
alter table if exists public.settings enable row level security;
alter table if exists public.custom_categories enable row level security;

drop policy if exists "accounts_select_own" on public.accounts;
drop policy if exists "accounts_insert_own" on public.accounts;
drop policy if exists "accounts_update_own" on public.accounts;
drop policy if exists "accounts_delete_own" on public.accounts;
create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

drop policy if exists "transfers_select_own" on public.transfers;
drop policy if exists "transfers_insert_own" on public.transfers;
drop policy if exists "transfers_update_own" on public.transfers;
drop policy if exists "transfers_delete_own" on public.transfers;
create policy "transfers_select_own" on public.transfers for select using (auth.uid() = user_id);
create policy "transfers_insert_own" on public.transfers for insert with check (auth.uid() = user_id);
create policy "transfers_update_own" on public.transfers for update using (auth.uid() = user_id);
create policy "transfers_delete_own" on public.transfers for delete using (auth.uid() = user_id);

drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

drop policy if exists "recurring_select_own" on public.recurring;
drop policy if exists "recurring_insert_own" on public.recurring;
drop policy if exists "recurring_update_own" on public.recurring;
drop policy if exists "recurring_delete_own" on public.recurring;
create policy "recurring_select_own" on public.recurring for select using (auth.uid() = user_id);
create policy "recurring_insert_own" on public.recurring for insert with check (auth.uid() = user_id);
create policy "recurring_update_own" on public.recurring for update using (auth.uid() = user_id);
create policy "recurring_delete_own" on public.recurring for delete using (auth.uid() = user_id);

drop policy if exists "settings_select_own" on public.settings;
drop policy if exists "settings_insert_own" on public.settings;
drop policy if exists "settings_update_own" on public.settings;
drop policy if exists "settings_delete_own" on public.settings;
create policy "settings_select_own" on public.settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings for update using (auth.uid() = user_id);
create policy "settings_delete_own" on public.settings for delete using (auth.uid() = user_id);

drop policy if exists "custom_categories_select_own" on public.custom_categories;
drop policy if exists "custom_categories_insert_own" on public.custom_categories;
drop policy if exists "custom_categories_update_own" on public.custom_categories;
drop policy if exists "custom_categories_delete_own" on public.custom_categories;
create policy "custom_categories_select_own" on public.custom_categories for select using (auth.uid() = user_id);
create policy "custom_categories_insert_own" on public.custom_categories for insert with check (auth.uid() = user_id);
create policy "custom_categories_update_own" on public.custom_categories for update using (auth.uid() = user_id);
create policy "custom_categories_delete_own" on public.custom_categories for delete using (auth.uid() = user_id);
