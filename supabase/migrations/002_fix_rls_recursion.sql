-- The profiles_admin_all policy contained:
--   exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
-- which queries the profiles table from within a policy ON profiles, triggering
-- infinite recursion whenever the short-circuit (auth.uid() = id) can't fire.
--
-- Fix: a security definer helper that reads profiles bypassing RLS, used by
-- every admin policy across all tables.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- Revoke public execute; only the DB itself needs to call this via RLS.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ── profiles ──────────────────────────────────────────────────────────────────
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  using (public.is_admin());

-- ── brand_profiles ────────────────────────────────────────────────────────────
drop policy if exists "brand_profiles_admin_all" on public.brand_profiles;
create policy "brand_profiles_admin_all" on public.brand_profiles
  using (public.is_admin());

-- ── creator_profiles ──────────────────────────────────────────────────────────
drop policy if exists "creator_profiles_admin_all" on public.creator_profiles;
create policy "creator_profiles_admin_all" on public.creator_profiles
  using (public.is_admin());

-- ── social_accounts ───────────────────────────────────────────────────────────
drop policy if exists "social_accounts_admin_all" on public.social_accounts;
create policy "social_accounts_admin_all" on public.social_accounts
  using (public.is_admin());

-- ── campaigns ────────────────────────────────────────────────────────────────
drop policy if exists "campaigns_admin_all" on public.campaigns;
create policy "campaigns_admin_all" on public.campaigns
  using (public.is_admin());

-- ── campaign_applications ────────────────────────────────────────────────────
drop policy if exists "applications_admin_all" on public.campaign_applications;
create policy "applications_admin_all" on public.campaign_applications
  using (public.is_admin());

-- ── submissions ───────────────────────────────────────────────────────────────
drop policy if exists "submissions_admin_all" on public.submissions;
create policy "submissions_admin_all" on public.submissions
  using (public.is_admin());

-- ── view_snapshots ────────────────────────────────────────────────────────────
drop policy if exists "view_snapshots_admin_all" on public.view_snapshots;
create policy "view_snapshots_admin_all" on public.view_snapshots
  using (public.is_admin());

-- ── earnings ─────────────────────────────────────────────────────────────────
drop policy if exists "earnings_admin_all" on public.earnings;
create policy "earnings_admin_all" on public.earnings
  using (public.is_admin());

-- ── admin_flags ───────────────────────────────────────────────────────────────
drop policy if exists "admin_flags_admin_all" on public.admin_flags;
create policy "admin_flags_admin_all" on public.admin_flags
  using (public.is_admin());
