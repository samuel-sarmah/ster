-- Enable pgcrypto for token encryption
create extension if not exists pgcrypto;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('creator', 'brand', 'admin')),
  display_name text,
  avatar_url text,
  stripe_account_id text,      -- Stripe Connect Express (creators)
  stripe_customer_id text,     -- Stripe Customer (brands)
  is_suspended boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read/update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Admins can read/update all profiles
create policy "profiles_admin_all" on public.profiles
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'creator'),
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- BRAND PROFILES
-- ============================================================
create table public.brand_profiles (
  id uuid primary key references public.profiles on delete cascade,
  company_name text not null,
  website text,
  industry text
);

alter table public.brand_profiles enable row level security;

create policy "brand_profiles_select_own" on public.brand_profiles
  for select using (auth.uid() = id);

create policy "brand_profiles_insert_own" on public.brand_profiles
  for insert with check (auth.uid() = id);

create policy "brand_profiles_update_own" on public.brand_profiles
  for update using (auth.uid() = id);

create policy "brand_profiles_admin_all" on public.brand_profiles
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- CREATOR PROFILES
-- ============================================================
create table public.creator_profiles (
  id uuid primary key references public.profiles on delete cascade,
  bio text,
  niche text[] not null default '{}'
);

alter table public.creator_profiles enable row level security;

create policy "creator_profiles_select_own" on public.creator_profiles
  for select using (auth.uid() = id);

create policy "creator_profiles_insert_own" on public.creator_profiles
  for insert with check (auth.uid() = id);

create policy "creator_profiles_update_own" on public.creator_profiles
  for update using (auth.uid() = id);

create policy "creator_profiles_admin_all" on public.creator_profiles
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- SOCIAL ACCOUNTS
-- ============================================================
create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles on delete cascade,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube', 'x')),
  platform_user_id text not null,
  handle text not null,
  access_token text,           -- stored encrypted at app layer
  refresh_token text,          -- stored encrypted at app layer
  token_expires_at timestamptz,
  follower_count int,
  is_active boolean not null default true,
  connected_at timestamptz not null default now(),
  unique (creator_id, platform)
);

alter table public.social_accounts enable row level security;

create policy "social_accounts_select_own" on public.social_accounts
  for select using (auth.uid() = creator_id);

create policy "social_accounts_insert_own" on public.social_accounts
  for insert with check (auth.uid() = creator_id);

create policy "social_accounts_update_own" on public.social_accounts
  for update using (auth.uid() = creator_id);

create policy "social_accounts_delete_own" on public.social_accounts
  for delete using (auth.uid() = creator_id);

create policy "social_accounts_admin_all" on public.social_accounts
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles on delete restrict,
  title text not null,
  description text,
  guidelines text,
  target_cpm numeric(10,4) not null check (target_cpm > 0),
  total_budget numeric(12,2) not null check (total_budget > 0),
  spent_budget numeric(12,2) not null default 0,
  platforms text[] not null default '{}',
  content_requirements text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  stripe_payment_intent_id text,
  escrow_released boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

-- Brands see their own campaigns
create policy "campaigns_select_brand" on public.campaigns
  for select using (auth.uid() = brand_id);

-- Creators see active/paused campaigns for discovery
create policy "campaigns_select_creator" on public.campaigns
  for select using (
    status in ('active', 'paused')
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'creator')
  );

create policy "campaigns_insert_brand" on public.campaigns
  for insert with check (
    auth.uid() = brand_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'brand')
  );

create policy "campaigns_update_brand" on public.campaigns
  for update using (auth.uid() = brand_id);

create policy "campaigns_admin_all" on public.campaigns
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- CAMPAIGN APPLICATIONS
-- ============================================================
create table public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns on delete cascade,
  creator_id uuid not null references public.profiles on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (campaign_id, creator_id)
);

alter table public.campaign_applications enable row level security;

create policy "applications_select_creator" on public.campaign_applications
  for select using (auth.uid() = creator_id);

create policy "applications_select_brand" on public.campaign_applications
  for select using (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth.uid())
  );

create policy "applications_insert_creator" on public.campaign_applications
  for insert with check (
    auth.uid() = creator_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'creator')
  );

create policy "applications_update_brand" on public.campaign_applications
  for update using (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth.uid())
  );

create policy "applications_admin_all" on public.campaign_applications
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- SUBMISSIONS
-- ============================================================
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns on delete restrict,
  creator_id uuid not null references public.profiles on delete restrict,
  social_account_id uuid not null references public.social_accounts on delete restrict,
  platform text not null check (platform in ('tiktok', 'instagram', 'youtube', 'x')),
  post_url text not null,
  post_platform_id text,       -- native post ID for API polling
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'tracking', 'paid', 'rejected')),
  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  rejection_reason text
);

alter table public.submissions enable row level security;

create policy "submissions_select_creator" on public.submissions
  for select using (auth.uid() = creator_id);

create policy "submissions_select_brand" on public.submissions
  for select using (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth.uid())
  );

create policy "submissions_insert_creator" on public.submissions
  for insert with check (
    auth.uid() = creator_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'creator')
  );

create policy "submissions_admin_all" on public.submissions
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- VIEW SNAPSHOTS (append-only)
-- ============================================================
create table public.view_snapshots (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  view_count bigint not null check (view_count >= 0),
  fetched_at timestamptz not null default now()
);

create index view_snapshots_submission_fetched on public.view_snapshots (submission_id, fetched_at desc);

alter table public.view_snapshots enable row level security;

create policy "view_snapshots_select_creator" on public.view_snapshots
  for select using (
    exists (select 1 from public.submissions where id = submission_id and creator_id = auth.uid())
  );

create policy "view_snapshots_select_brand" on public.view_snapshots
  for select using (
    exists (
      select 1 from public.submissions s
      join public.campaigns c on c.id = s.campaign_id
      where s.id = submission_id and c.brand_id = auth.uid()
    )
  );

create policy "view_snapshots_admin_all" on public.view_snapshots
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- EARNINGS
-- ============================================================
create table public.earnings (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete restrict unique,
  creator_id uuid not null references public.profiles on delete restrict,
  campaign_id uuid not null references public.campaigns on delete restrict,
  verified_views bigint not null default 0,
  amount_usd numeric(12,4) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'paid')),
  stripe_transfer_id text,
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.earnings enable row level security;

create policy "earnings_select_creator" on public.earnings
  for select using (auth.uid() = creator_id);

create policy "earnings_select_brand" on public.earnings
  for select using (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth.uid())
  );

create policy "earnings_admin_all" on public.earnings
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ============================================================
-- ADMIN FLAGS
-- ============================================================
create table public.admin_flags (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  flagged_by uuid not null references public.profiles on delete restrict,
  reason text not null,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.admin_flags enable row level security;

create policy "admin_flags_admin_all" on public.admin_flags
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
