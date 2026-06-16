-- System-generated flags (e.g. the view-tracker's velocity-anomaly check)
-- have no human flagger. The column was previously not-null, forcing the
-- worker to misuse the submission's creator_id as the flagger — which makes
-- it look like creators flag themselves. Allow null for system flags.
alter table public.admin_flags alter column flagged_by drop not null;
