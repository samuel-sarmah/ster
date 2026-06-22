-- Transactional earnings accrual with a hard escrow budget cap.
--
-- Fixes three coupled problems:
--   1. earnings rows were never created anywhere (the payout pipeline was dead).
--   2. amount_usd grew unbounded with views, so a viral post could pay out more
--      than the brand deposited (platform eats the loss).
--   3. budget accounting was a non-atomic read-modify-write in worker code.
--
-- record_submission_views() snapshots the view count and creates/updates the
-- submission's earnings row, capping the amount so the campaign's TOTAL
-- committed payouts can never exceed its escrow (total_budget). It runs under a
-- campaign row lock so concurrent submissions on the same campaign serialize.

create or replace function public.record_submission_views(
  p_submission_id uuid,
  p_view_count bigint
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_creator_id uuid;
  v_target_cpm numeric;
  v_total_budget numeric;
  v_committed_others numeric;
  v_uncapped numeric;
  v_headroom numeric;
  v_amount numeric;
  v_status text;
  -- Keep in sync with the view-tracker's confirmation threshold.
  v_confirm_threshold constant bigint := 10000;
begin
  -- Lock the campaign so the budget math below is serialized across concurrent
  -- submissions on the same campaign.
  select s.campaign_id, s.creator_id, c.target_cpm, c.total_budget
    into v_campaign_id, v_creator_id, v_target_cpm, v_total_budget
  from public.submissions s
  join public.campaigns c on c.id = s.campaign_id
  where s.id = p_submission_id
  for update of c;

  if v_campaign_id is null then
    raise exception 'submission % not found', p_submission_id;
  end if;

  -- Snapshot the raw count for history + the velocity fraud check.
  insert into public.view_snapshots (submission_id, view_count)
  values (p_submission_id, p_view_count);

  -- Payouts already committed to OTHER submissions on this campaign.
  select coalesce(sum(amount_usd), 0)
    into v_committed_others
  from public.earnings
  where campaign_id = v_campaign_id
    and submission_id <> p_submission_id;

  v_uncapped  := (p_view_count::numeric / 1000) * v_target_cpm;
  v_headroom  := greatest(v_total_budget - v_committed_others, 0);
  v_amount    := least(v_uncapped, v_headroom);   -- the budget cap
  v_status    := case when p_view_count >= v_confirm_threshold
                      then 'confirmed' else 'pending' end;

  -- Create on first sighting, update thereafter. Never touch a paid-out row.
  insert into public.earnings
    (submission_id, creator_id, campaign_id, verified_views, amount_usd, status, updated_at)
  values
    (p_submission_id, v_creator_id, v_campaign_id, p_view_count, v_amount, v_status, now())
  on conflict (submission_id) do update
    set verified_views = excluded.verified_views,
        amount_usd     = excluded.amount_usd,
        status         = excluded.status,
        updated_at     = now()
  where public.earnings.status <> 'paid';

  return v_amount;
end;
$$;

-- Atomic budget increment for the payout worker (replaces read-modify-write).
create or replace function public.increment_campaign_spent(
  p_campaign_id uuid,
  p_amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.campaigns
  set spent_budget = spent_budget + p_amount
  where id = p_campaign_id;
end;
$$;

-- These are privileged accrual/accounting functions — only the workers
-- (service_role) may call them. Without this, any authenticated user could RPC
-- record_submission_views() and forge view counts / earnings.
revoke all on function public.record_submission_views(uuid, bigint) from public, anon, authenticated;
revoke all on function public.increment_campaign_spent(uuid, numeric) from public, anon, authenticated;
grant execute on function public.record_submission_views(uuid, bigint) to service_role;
grant execute on function public.increment_campaign_spent(uuid, numeric) to service_role;
