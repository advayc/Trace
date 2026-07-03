-- Allow 'email' as a first-class provider (used by the admin login).
alter table public.profiles drop constraint if exists profiles_provider_check;
alter table public.profiles add constraint profiles_provider_check
  check (provider in ('device', 'apple', 'google', 'email'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  insert into public.profiles (id, display_name, provider)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    case coalesce(new.raw_app_meta_data->>'provider', '')
      when 'apple' then 'apple'
      when 'google' then 'google'
      when 'email' then 'email'
      else 'device'
    end
  );
  return new;
end;
$$;

-- Backfill existing email users (the seeded admin).
update public.profiles p
set provider = 'email'
from auth.users u
where u.id = p.id and u.raw_app_meta_data->>'provider' = 'email';
