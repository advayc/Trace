-- Move friend invites from codes to editable usernames.

alter table public.profiles
  add column if not exists username text;

update public.profiles p
set username = left(
  coalesce(
    nullif(
      trim(both '_' from regexp_replace(
        lower(coalesce(nullif(trim(p.display_name), ''), 'walker')),
        '[^a-z0-9_]+',
        '_',
        'g'
      )),
      ''
    ),
    'walker'
  ),
  17
) || '_' || substring(replace(p.id::text, '-', '') from 1 for 6)
where p.username is null;

alter table public.profiles
  alter column username set not null;

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,24}$');

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

grant update (username) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_username text;
begin
  base_username := lower(
    coalesce(
      nullif(trim(NEW.raw_user_meta_data->>'preferred_username'), ''),
      nullif(trim(NEW.raw_user_meta_data->>'user_name'), ''),
      nullif(trim(NEW.raw_user_meta_data->>'name'), ''),
      split_part(NEW.email, '@', 1),
      'walker'
    )
  );

  base_username := trim(both '_' from regexp_replace(base_username, '[^a-z0-9_]+', '_', 'g'));
  if base_username is null or base_username = '' then
    base_username := 'walker';
  end if;

  insert into public.profiles (id, display_name, username, provider)
  values (
    NEW.id,
    coalesce(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    left(base_username, 17) || '_' || substring(replace(NEW.id::text, '-', '') from 1 for 6),
    case coalesce(NEW.raw_app_meta_data->>'provider', '')
      when 'apple' then 'apple'
      when 'google' then 'google'
      when 'email' then 'email'
      else 'device'
    end
  );
  return NEW;
end;
$$;

drop function if exists public.send_friend_invite(text);

create function public.send_friend_invite(target_username text)
returns public.friendships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_username text := lower(trim(both '@' from trim(target_username)));
  target_user_id uuid;
  existing_row public.friendships%rowtype;
  result_row public.friendships%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if normalized_username is null or length(normalized_username) = 0 then
    raise exception 'Username is required.';
  end if;

  select p.id
  into target_user_id
  from public.profiles p
  where lower(p.username) = normalized_username
  limit 1;

  if target_user_id is null then
    raise exception 'No user found for that username.';
  end if;

  if target_user_id = current_user_id then
    raise exception 'You cannot invite yourself.';
  end if;

  select *
  into existing_row
  from public.friendships f
  where least(f.requester_id, f.addressee_id) = least(current_user_id, target_user_id)
    and greatest(f.requester_id, f.addressee_id) = greatest(current_user_id, target_user_id)
  limit 1;

  if existing_row.id is null then
    insert into public.friendships (requester_id, addressee_id, status)
    values (current_user_id, target_user_id, 'pending')
    returning * into result_row;
    return result_row;
  end if;

  if existing_row.status = 'blocked' then
    raise exception 'This connection is blocked.';
  end if;

  if existing_row.status = 'accepted' then
    return existing_row;
  end if;

  if existing_row.addressee_id = current_user_id then
    update public.friendships
    set status = 'accepted', updated_at = now()
    where id = existing_row.id
    returning * into result_row;
    return result_row;
  end if;

  return existing_row;
end;
$$;

grant execute on function public.send_friend_invite(text) to authenticated;
revoke execute on function public.send_friend_invite(text) from public, anon;
