-- Friend invite workflow: invite codes, pending invites, and stricter friendship updates.

alter table public.profiles
  add column if not exists invite_code text;

update public.profiles
set invite_code = substring(replace(id::text, '-', '') from 1 for 10)
where invite_code is null;

alter table public.profiles
  alter column invite_code set not null;

create unique index if not exists profiles_invite_code_key
  on public.profiles (invite_code);

create unique index if not exists friendships_unique_pair_idx
  on public.friendships (
    least(requester_id, addressee_id),
    greatest(requester_id, addressee_id)
  );

drop policy if exists profiles_select_pending_connections on public.profiles;
create policy profiles_select_pending_connections
  on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.friendships f
      where f.status = 'pending'
        and (
          (f.requester_id = (select auth.uid()) and f.addressee_id = profiles.id)
          or (f.addressee_id = (select auth.uid()) and f.requester_id = profiles.id)
        )
    )
  );

drop policy if exists stomped_tiles_select_friends on public.stomped_tiles;
create policy stomped_tiles_select_friends
  on public.stomped_tiles for select to authenticated
  using (
    exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = (select auth.uid()) and f.addressee_id = stomped_tiles.user_id)
          or (f.addressee_id = (select auth.uid()) and f.requester_id = stomped_tiles.user_id)
        )
    )
  );

drop policy if exists friendships_update_participant on public.friendships;
create policy friendships_update_addressee
  on public.friendships for update to authenticated
  using (
    (select auth.uid()) = addressee_id
    and status = 'pending'
  )
  with check (
    (select auth.uid()) = addressee_id
    and status in ('accepted', 'blocked')
  );

create or replace function public.send_friend_invite(target_invite_code text)
returns public.friendships
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_code text := lower(trim(target_invite_code));
  target_user_id uuid;
  existing_row public.friendships%rowtype;
  result_row public.friendships%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if normalized_code is null or length(normalized_code) = 0 then
    raise exception 'Invite code is required.';
  end if;

  select p.id
  into target_user_id
  from public.profiles p
  where p.invite_code = normalized_code
  limit 1;

  if target_user_id is null then
    raise exception 'No user found for that invite code.';
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
