import { supabase } from "@/lib/supabase/client";

interface FriendProfilePreview {
  id: string;
  display_name: string | null;
  invite_code: string;
}

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

export function friendHueForUserId(id: string): number {
  return hueForId(id);
}

export interface FriendTile {
  h3Index: string;
  userId: string;
  visitCount: number;
  displayName: string | null;
}

export interface FriendInvite {
  id: string;
  userId: string;
  name: string;
  initials: string;
  inviteCode: string;
  createdAt: string;
}

export interface FriendInviteSnapshot {
  incoming: FriendInvite[];
  outgoing: FriendInvite[];
}

export async function fetchOwnInviteCode(currentUserId: string): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("invite_code")
    .eq("id", currentUserId)
    .single();
  if (error) throw error;
  return data.invite_code;
}

export async function sendFriendInviteByCode(inviteCode: string): Promise<void> {
  const normalized = inviteCode.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Invite code is required.");
  }
  const { error } = await supabase.rpc("send_friend_invite", {
    target_invite_code: normalized,
  });
  if (error) throw error;
}

export async function acceptFriendInvite(
  currentUserId: string,
  friendshipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId)
    .eq("addressee_id", currentUserId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function declineFriendInvite(
  currentUserId: string,
  friendshipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("addressee_id", currentUserId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function cancelOutgoingInvite(
  currentUserId: string,
  friendshipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .eq("requester_id", currentUserId)
    .eq("status", "pending");
  if (error) throw error;
}

export async function fetchFriendInvites(
  currentUserId: string,
): Promise<FriendInviteSnapshot> {
  const { data: edges, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, created_at")
    .eq("status", "pending")
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const counterpartIds = Array.from(
    new Set(
      (edges ?? []).map((edge) =>
        edge.requester_id === currentUserId ? edge.addressee_id : edge.requester_id,
      ),
    ),
  );

  let profileById = new Map<string, FriendProfilePreview>();
  if (counterpartIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, invite_code")
      .in("id", counterpartIds);
    if (profilesError) throw profilesError;
    profileById = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile as FriendProfilePreview]),
    );
  }

  const incoming: FriendInvite[] = [];
  const outgoing: FriendInvite[] = [];

  (edges ?? []).forEach((edge) => {
    const fromRequester = edge.requester_id === currentUserId;
    const counterpartId = fromRequester ? edge.addressee_id : edge.requester_id;
    const profile = profileById.get(counterpartId);
    const name = profile?.display_name ?? "Trace walker";
    const invite = {
      id: edge.id,
      userId: counterpartId,
      name,
      initials: initialsFor(name),
      inviteCode: profile?.invite_code ?? "",
      createdAt: edge.created_at,
    } satisfies FriendInvite;
    if (fromRequester) {
      outgoing.push(invite);
    } else {
      incoming.push(invite);
    }
  });

  return { incoming, outgoing };
}

async function fetchAcceptedFriendIds(currentUserId: string): Promise<string[]> {
  const { data: edges, error } = await supabase
    .from("friendships")
    .select("requester_id,addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);
  if (error) throw error;

  const ids = new Set<string>();
  (edges ?? []).forEach((edge) => {
    if (edge.requester_id === currentUserId) ids.add(edge.addressee_id);
    if (edge.addressee_id === currentUserId) ids.add(edge.requester_id);
  });
  return Array.from(ids);
}

export async function fetchFriendTilesInCells(
  currentUserId: string,
  h3Indexes: string[],
): Promise<FriendTile[]> {
  if (h3Indexes.length === 0) return [];
  const friendIds = await fetchAcceptedFriendIds(currentUserId);
  if (friendIds.length === 0) return [];

  const { data, error } = await supabase
    .from("stomped_tiles")
    .select("h3_index, user_id, visit_count")
    .in("h3_index", h3Indexes)
    .in("user_id", friendIds)
    .neq("user_id", currentUserId)
    .limit(1200);
  if (error) throw error;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", friendIds);
  const profileById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.display_name]),
  );

  return (data ?? []).map((row) => ({
    h3Index: row.h3_index,
    userId: row.user_id,
    visitCount: row.visit_count,
    displayName: profileById.get(row.user_id) ?? null,
  }));
}

export async function fetchFriendsLeaderboard(
  currentUserId: string,
  you: { tiles: number; streak: number; name: string },
): Promise<FriendLeaderboardEntry[]> {
  const idList = [currentUserId, ...(await fetchAcceptedFriendIds(currentUserId))];

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
