import type { User as SupabaseUser } from "@supabase/supabase-js";

import {
  parseAvatar,
  serializeAvatar,
  isRemoteAvatarUrl,
  type AvatarPreset,
} from "@/lib/auth/avatar-presets";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
  avatar: AvatarPreset;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    displayName: data.display_name,
    username: data.username,
    avatarUrl: data.avatar_url,
    avatar: parseAvatar(data.avatar_url),
  };
}

export async function updateProfile(
  userId: string,
  patch: {
    displayName?: string;
    username?: string;
    avatar?: AvatarPreset;
    avatarUrl?: string | null;
  },
): Promise<void> {
  const row: { display_name?: string; username?: string; avatar_url?: string | null } = {};
  if (patch.displayName !== undefined) {
    row.display_name = patch.displayName.trim() || undefined;
  }
  if (patch.username !== undefined) {
    row.username = patch.username.trim().toLowerCase() || undefined;
  }
  if (patch.avatarUrl !== undefined) {
    row.avatar_url = patch.avatarUrl;
  } else if (patch.avatar !== undefined) {
    row.avatar_url = serializeAvatar(patch.avatar);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", userId);
  if (profileError) throw profileError;

  if (patch.displayName !== undefined) {
    await supabase.auth.updateUser({
      data: { full_name: patch.displayName.trim() || undefined },
    });
  }
}

/** Persist Google/Apple profile photo from OAuth metadata when the user has no custom avatar. */
export async function syncOAuthAvatarFromMetadata(
  supabaseUser: SupabaseUser,
): Promise<void> {
  const meta = supabaseUser.user_metadata ?? {};
  const picture =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined);
  if (!isRemoteAvatarUrl(picture)) return;

  const existing = await fetchProfile(supabaseUser.id);
  if (existing?.avatarUrl && !isRemoteAvatarUrl(existing.avatarUrl)) return;

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: picture })
    .eq("id", supabaseUser.id);
  if (error) throw error;
}
