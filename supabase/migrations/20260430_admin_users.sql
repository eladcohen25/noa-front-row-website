-- =============================================================
-- Team members: admin_users table + RLS + owner seed.
-- Run this AFTER the owner (info@thefrontrow.vegas) has been
-- created via Supabase Auth → Users → Add user.
-- =============================================================

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'team_member'
    check (role in ('owner', 'team_member')),
  permissions jsonb not null default '{
    "view_inquiries": true,
    "edit_inquiries": true,
    "view_content": true,
    "edit_content": true,
    "manage_team": false
  }'::jsonb,
  owner_notes text,
  created_at timestamptz default now(),
  last_sign_in_at timestamptz
);

create index if not exists admin_users_role_idx on public.admin_users (role);

-- Base privileges for the authenticated role
grant select, insert, update, delete on public.admin_users to authenticated;

alter table public.admin_users enable row level security;

drop policy if exists "read own admin row" on public.admin_users;
drop policy if exists "owners read all" on public.admin_users;
drop policy if exists "owners manage team" on public.admin_users;
drop function if exists public.is_admin_owner();

-- SECURITY DEFINER helper that lets us check "is the current user an owner?"
-- without triggering RLS recursion on public.admin_users itself.
create or replace function public.is_admin_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_admin_owner() from public;
grant execute on function public.is_admin_owner() to authenticated;

-- A user can always read their own admin_users row (so the app can
-- look up their role + permissions during navigation).
create policy "read own admin row"
  on public.admin_users for select
  to authenticated
  using (id = auth.uid());

-- Owners can read every row.
create policy "owners read all"
  on public.admin_users for select
  to authenticated
  using (public.is_admin_owner());

-- Only owners can insert, update, or delete other admin_users rows.
create policy "owners manage team"
  on public.admin_users for all
  to authenticated
  using (public.is_admin_owner())
  with check (public.is_admin_owner());

-- Seed the owner. Will be a no-op if the auth.users row doesn't exist yet
-- (i.e. the admin hasn't been created via the Supabase dashboard).
insert into public.admin_users (id, email, role, permissions)
  select id, email,
    'owner',
    '{"view_inquiries": true, "edit_inquiries": true, "view_content": true, "edit_content": true, "manage_team": true}'::jsonb
  from auth.users
  where email = 'info@thefrontrow.vegas'
on conflict (id) do update
  set role = excluded.role,
      permissions = excluded.permissions;
