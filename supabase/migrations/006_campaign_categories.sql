-- Niche/category tags on campaigns, mirroring creator_profiles.niche.
-- Lets creators filter the campaign list to the niches they signed up for.
-- Values come from the shared taxonomy in lib/niches.ts (e.g. 'Tech', 'Fashion').
alter table public.campaigns
  add column if not exists categories text[] not null default '{}';

-- GIN index so "campaigns whose categories overlap the creator's niches"
-- (the && array-overlap operator) stays fast as the table grows.
create index if not exists campaigns_categories_idx
  on public.campaigns using gin (categories);
