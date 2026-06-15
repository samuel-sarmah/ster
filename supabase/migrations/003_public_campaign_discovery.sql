-- Allow anonymous visitors to browse active campaigns (public marketplace)
create policy "campaigns_select_public" on public.campaigns
  for select using (status = 'active');

-- Allow anyone to read brand profiles linked to active campaigns
create policy "brand_profiles_select_public" on public.brand_profiles
  for select using (
    exists (
      select 1 from public.campaigns
      where brand_id = id and status = 'active'
    )
  );
