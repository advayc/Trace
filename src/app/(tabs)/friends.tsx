import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { LeaderboardRow } from "@/components/friends/leaderboard-row";
import { PillButton } from "@/components/ui/pill-button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { fonts, radius, spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useStats } from "@/hooks/use-stats";
import {
  acceptFriendInvite,
  declineFriendInvite,
  fetchFriendInvites,
  fetchFriendsLeaderboard,
  fetchOwnInviteCode,
  friendHueForUserId,
  sendFriendInviteByCode,
  type FriendInvite,
  type FriendLeaderboardEntry,
} from "@/lib/friends/friends-service";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function FriendsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const stats = useStats();
  const { user, loading: authLoading } = useAuthUser();

  const [board, setBoard] = useState<FriendLeaderboardEntry[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<FriendInvite[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<FriendInvite[]>([]);
  const [ownInviteCode, setOwnInviteCode] = useState<string | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    if (!user) {
      setBoard([]);
      setIncomingInvites([]);
      setOutgoingInvites([]);
      setOwnInviteCode(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [entries, invites, inviteCode] = await Promise.all([
        fetchFriendsLeaderboard(user.id, {
          tiles: stats.totalTiles,
          streak: stats.currentStreak,
          name: user.displayName ?? "You",
        }),
        fetchFriendInvites(user.id),
        fetchOwnInviteCode(user.id),
      ]);

      setBoard(entries);
      setIncomingInvites(invites.incoming);
      setOutgoingInvites(invites.outgoing);
      setOwnInviteCode(inviteCode);
    } catch {
      setError("Couldn't load friends right now. Pull to refresh later.");
      setBoard([]);
      setIncomingInvites([]);
      setOutgoingInvites([]);
    } finally {
      setLoading(false);
    }
  }, [stats.currentStreak, stats.totalTiles, user]);

  useEffect(() => {
    if (authLoading) return;
    loadFriends().catch(() => {});
  }, [authLoading, loadFriends]);

  const refreshFriends = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFriends();
    } finally {
      setRefreshing(false);
    }
  }, [loadFriends]);

  const shareInvite = useCallback(() => {
    if (!ownInviteCode) return;
    Share.share({
      message: `Join me on Trace. Add friend code: ${ownInviteCode}`,
    }).catch(() => {});
  }, [ownInviteCode]);

  const sendInvite = useCallback(async () => {
    if (!user || sending) return;
    const code = inviteCodeInput.trim().toLowerCase();
    if (!code) {
      setError("Enter a friend code to send an invite.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await sendFriendInviteByCode(code);
      setInviteCodeInput("");
      await loadFriends();
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "Couldn't send invite.";
      setError(message);
    } finally {
      setSending(false);
    }
  }, [inviteCodeInput, loadFriends, sending, user]);

  const runInviteAction = useCallback(
    async (friendshipId: string, action: "accept" | "decline") => {
      if (!user) return;
      setBusyInviteId(friendshipId);
      setError(null);
      try {
        if (action === "accept") {
          await acceptFriendInvite(user.id, friendshipId);
        } else {
          await declineFriendInvite(user.id, friendshipId);
        }
        await loadFriends();
      } catch {
        setError("Invite action failed. Please try again.");
      } finally {
        setBusyInviteId(null);
      }
    },
    [loadFriends, user],
  );

  const hasFriends = board.some((entry) => !entry.isYou);
  const youRow =
    board.find((entry) => entry.isYou) ??
    (user
      ? {
          id: user.id,
          name: user.displayName ?? "You",
          initials: initialsFor(user.displayName ?? "You"),
          tiles: stats.totalTiles,
          hue: friendHueForUserId(user.id),
          isYou: true,
          streak: stats.currentStreak,
        }
      : null);
  const youRank = youRow ? Math.max(1, board.findIndex((entry) => entry.id === youRow.id) + 1) : 1;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            refreshFriends().catch(() => {});
          }}
          tintColor={colors.ember}
        />
      }
      contentContainerStyle={{
        padding: spacing.screen,
        gap: spacing.section,
        paddingTop: 72,
        paddingBottom: 32,
      }}
    >
      <ScreenHeader
        title="Friends"
        subtitle="Leaderboard first. Add friends with a code, then accept invites."
      />

      {!authLoading && !user ? (
        <Animated.View
          entering={FadeInDown.duration(400).delay(80)}
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.accentBorder,
            padding: 22,
            gap: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.emberDim,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source="sf:person.2.fill"
                style={{ width: 18, height: 18 }}
                tintColor={colors.ember}
              />
            </View>
            <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}>
              Sign in to add friends
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textMuted,
              lineHeight: 21,
            }}
          >
            Connect with Apple, Google, or email to send and accept friend invites.
          </Text>
          <PillButton
            label="Sign in or create account"
            onPress={() => router.push("/sign-in")}
          />
        </Animated.View>
      ) : null}

      {user ? (
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 18,
            gap: 10,
          }}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>
            Leaderboard
          </Text>
          {loading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color={colors.ember} />
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {youRow ? (
                <LeaderboardRow
                  key={youRow.id}
                  rank={youRank}
                  name={youRow.name}
                  initials={youRow.initials}
                  tiles={youRow.tiles}
                  streak={youRow.streak ?? 0}
                  hue={youRow.hue}
                  isYou
                  index={0}
                />
              ) : null}
              {board
                .filter((row) => !row.isYou)
                .map((row, i) => (
                <LeaderboardRow
                  key={row.id}
                  rank={board.findIndex((entry) => entry.id === row.id) + 1}
                  name={row.name}
                  initials={row.initials}
                  tiles={row.tiles}
                  streak={row.streak ?? 0}
                  hue={row.hue}
                  isYou={row.isYou}
                  index={i + 1}
                />
                ))}
              {!hasFriends ? (
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    color: colors.textMuted,
                    textAlign: "center",
                  }}
                >
                  Add one friend code to start comparing tile counts.
                </Text>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {user ? (
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 18,
            gap: 12,
          }}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>
            Add friends
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}>
            Your code: {ownInviteCode ?? "..."}
          </Text>
          <PillButton label="Share my code" variant="outline" onPress={shareInvite} />
          <TextInput
            value={inviteCodeInput}
            onChangeText={setInviteCodeInput}
            autoCapitalize="none"
            placeholder="paste friend code"
            placeholderTextColor={colors.textFaint}
            onSubmitEditing={() => {
              sendInvite().catch(() => {});
            }}
            style={{
              borderWidth: 1,
              borderColor: colors.borderStrong,
              borderRadius: radius.md,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.text,
              fontFamily: fonts.medium,
              fontSize: 15,
              textTransform: "lowercase",
            }}
          />
          <PillButton
            label={sending ? "Sending invite..." : "Send invite"}
            onPress={() => {
              sendInvite().catch(() => {});
            }}
            disabled={sending}
          />
        </View>
      ) : null}

      {user && incomingInvites.length > 0 ? (
        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>
            Incoming invites
          </Text>
          {incomingInvites.map((invite) => (
            <View
              key={invite.id}
              style={{
                backgroundColor: colors.surfaceRaised,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
                gap: 10,
              }}
            >
              <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: colors.text }}>
                {invite.name}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <PillButton
                  label={busyInviteId === invite.id ? "Accepting..." : "Accept"}
                  disabled={busyInviteId === invite.id}
                  style={{ flex: 1 }}
                  onPress={() => {
                    runInviteAction(invite.id, "accept").catch(() => {});
                  }}
                />
                <PillButton
                  label="Decline"
                  variant="outline"
                  disabled={busyInviteId === invite.id}
                  style={{ flex: 1 }}
                  onPress={() => {
                    runInviteAction(invite.id, "decline").catch(() => {});
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {user && outgoingInvites.length > 0 ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            textAlign: "center",
          }}
        >
          Pending sent invites: {outgoingInvites.length}
        </Text>
      ) : null}

      {user && error ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.danger,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      ) : null}


      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textFaint,
          textAlign: "center",
        }}
      >
        Friends only see tile counts and public profile names - never your route path.
      </Text>
    </ScrollView>
  );
}
