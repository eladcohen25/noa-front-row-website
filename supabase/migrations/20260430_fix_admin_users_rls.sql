-- Fix RLS recursion on admin_users.
--
-- The original "owners read all" / "owners manage team" policies queried
-- public.admin_users from inside a public.admin_users policy, which triggers
-- RLS again and recurses. Postgres aborts and returns no rows, so the app
-- thinks the user has no admin profile.
--
-- Replace the recursive subquery with a SECURITY DEFINER helper that
-- bypasses RLS for the ownership check. This is the standard pattern.

drop policy if exists "owners read all" on public.admin_users;
drop policy if exists "owners manage team" on public.admin_users;
drop function if exists public.is_admin_owner();

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

create policy "owners read all"
  on public.admin_users for select
  to authenticated
  using (public.is_admin_owner());

create policy "owners manage team"
  on public.admin_users for all
  to authenticated
  using (public.is_admin_owner())
  with check (public.is_admin_owner());
