-- Prevent privilege escalation via signup metadata.
--
-- The original handle_new_user() trigger trusted raw_user_meta_data->>'role'
-- verbatim. profiles.role allows 'creator' | 'brand' | 'admin', so any caller
-- of supabase.auth.signUp({ options: { data: { role: 'admin' } } }) — bypassing
-- the signup UI, which only ever sends 'creator' or 'brand' — could grant
-- themselves admin and gain full access to /admin/* (suspend users, override
-- verified view counts to manufacture payouts).
--
-- Fix: whitelist the metadata role to creator/brand only. 'admin' can never
-- be granted this way; admins must be promoted manually via direct SQL.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, display_name, avatar_url)
  values (
    new.id,
    case
      when new.raw_user_meta_data->>'role' = 'brand' then 'brand'
      else 'creator'
    end,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
