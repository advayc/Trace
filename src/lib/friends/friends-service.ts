import { supabase } from "@/lib/supabase/client";

export interface FriendLeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  tiles: number;
  hue: number;
  isYou: boolean;
  streak?: number;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function hueForId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

export async function fetchFriendsLeaderboard(
  currentUserId: string,
  you: { tiles: number; streak: number; name: string },
): Promise<FriendLeaderboardEntry[]> {
  const { data: edges, error: edgesError } = await supabase
    .from("friendships")
    .select("requester_id,addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);
  if (edgesError) throw edgesError;

  const ids = new Set<string>([currentUserId]);
  (edges ?? []).forEach((edge) => {
    if (edge.requester_id === currentUserId) ids.add(edge.addressee_id);
    if (edge.addressee_id === currentUserId) ids.add(edge.requester_id);
  });
  const idList = Array.from(ids);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", idList);
  if (profilesError) throw profilesError;
  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.display_name]),
  );

  const counts = await Promise.all(
    idList.map(async (id) => {
      const { count, error } = await supabase
        .from("stomped_tiles")
        .select("h3_index", { count: "exact", head: true })
        .eq("user_id", id);
      if (error) throw error;
      return [id, count ?? 0] as const;
    }),
  );
  const countById = new Map(counts);

  return idList
    .map((id) => {
      if (id === currentUserId) {
        return {
          id,
          name: you.name,
          initials: initialsFor(you.name),
          tiles: you.tiles,
          hue: hueForId(id),
          isYou: true,
          streak: you.streak,
        } satisfies FriendLeaderboardEntry;
      }

      const name = profileById.get(id) ?? "Friend";
      return {
        id,
        name,
        initials: initialsFor(name),
        tiles: countById.get(id) ?? 0,
        hue: hueForId(id),
        isYou: false,
      } satisfies FriendLeaderboardEntry;
    })
    .sort((a, b) => b.tiles - a.tiles);
}
