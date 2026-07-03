import {
  parseAvatar,
  serializeAvatar,
  type AvatarPreset,
} from "@/lib/auth/avatar-presets";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  displayName: string | null;
  avatarUrl: string | null;
  avatar: AvatarPreset;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    avatar: parseAvatar(data.avatar_url),
  };
}

export async function updateProfile(
  userId: string,
  patch: { displayName?: string; avatar?: AvatarPreset },
): Promise<void> {
  const row: { display_name?: string; avatar_url?: string } = {};
  if (patch.displayName !== undefined) {
    row.display_name = patch.displayName.trim() || undefined;
  }
  if (patch.avatar !== undefined) {
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
