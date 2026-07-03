-- Trace Phase 2 initial schema
-- Privacy invariant: stomped_tiles stores H3 cell indexes ONLY — never lat/lng.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  provider text NOT NULL DEFAULT 'device'
    CHECK (provider IN ('device', 'apple', 'google')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, provider)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    CASE COALESCE(NEW.raw_app_meta_data->>'provider', '')
      WHEN 'apple' THEN 'apple'
      WHEN 'google' THEN 'google'
      ELSE 'device'
    END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.stomped_tiles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  h3_index text NOT NULL CHECK (h3_index ~ '^[0-9a-f]{15}$'),
  first_stomped_at timestamptz NOT NULL DEFAULT now(),
  visit_count integer NOT NULL DEFAULT 1 CHECK (visit_count > 0),
  last_stomped_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, h3_index)
);

CREATE INDEX stomped_tiles_h3_index_idx ON public.stomped_tiles (h3_index);
CREATE INDEX stomped_tiles_user_last_stomped_idx
  ON public.stomped_tiles (user_id, last_stomped_at DESC);

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX friendships_addressee_status_idx
  ON public.friendships (addressee_id, status);

CREATE TABLE public.neighborhood_stats (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  neighborhood_key text NOT NULL,
  display_label text,
  stomped_count integer NOT NULL DEFAULT 0 CHECK (stomped_count >= 0),
  total_cells integer NOT NULL DEFAULT 0 CHECK (total_cells >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, neighborhood_key),
  CHECK (total_cells = 0 OR stomped_count <= total_cells)
);

CREATE TRIGGER neighborhood_stats_updated_at
  BEFORE UPDATE ON public.neighborhood_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stomped_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhood_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY profiles_select_friends
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted'
        AND (
          (f.requester_id = (SELECT auth.uid()) AND f.addressee_id = profiles.id)
          OR (f.addressee_id = (SELECT auth.uid()) AND f.requester_id = profiles.id)
        )
    )
  );

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name, avatar_url) ON public.profiles TO authenticated;

CREATE POLICY stomped_tiles_select_own
  ON public.stomped_tiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY stomped_tiles_insert_own
  ON public.stomped_tiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY stomped_tiles_update_own
  ON public.stomped_tiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY stomped_tiles_delete_own
  ON public.stomped_tiles FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY friendships_select_participant
  ON public.friendships FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  );

CREATE POLICY friendships_insert_requester
  ON public.friendships FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = requester_id);

CREATE POLICY friendships_update_participant
  ON public.friendships FOR UPDATE TO authenticated
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  )
  WITH CHECK (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  );

CREATE POLICY friendships_delete_participant
  ON public.friendships FOR DELETE TO authenticated
  USING (
    (SELECT auth.uid()) = requester_id
    OR (SELECT auth.uid()) = addressee_id
  );

CREATE POLICY neighborhood_stats_select_own
  ON public.neighborhood_stats FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY neighborhood_stats_select_friends
  ON public.neighborhood_stats FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.friendships f
      WHERE f.status = 'accepted'
        AND (
          (f.requester_id = (SELECT auth.uid()) AND f.addressee_id = neighborhood_stats.user_id)
          OR (f.addressee_id = (SELECT auth.uid()) AND f.requester_id = neighborhood_stats.user_id)
        )
    )
  );

CREATE POLICY neighborhood_stats_insert_own
  ON public.neighborhood_stats FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY neighborhood_stats_update_own
  ON public.neighborhood_stats FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY neighborhood_stats_delete_own
  ON public.neighborhood_stats FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
