import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Share,
  Text,
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
  fetchFriendsLeaderboard,
  type FriendLeaderboardEntry,
} from "@/lib/friends/friends-service";
import { buildSmsUrl, getInviteMessage } from "@/lib/friends/invite";
import {
  loadInviteContacts,
  type InviteContact,
} from "@/lib/friends/load-invite-contacts";

export default function FriendsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const stats = useStats();
  const { user, loading: authLoading } = useAuthUser();
  const [board, setBoard] = useState<FriendLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteContacts, setInviteContacts] = useState<InviteContact[]>([]);
  const [contactsBusy, setContactsBusy] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    if (!user) {
      setBoard([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const entries = await fetchFriendsLeaderboard(user.id, {
        tiles: stats.totalTiles,
        streak: stats.currentStreak,
        name: user.displayName ?? "You",
      });
      setBoard(entries);
    } catch {
      setError("Couldn't load friends. Pull to refresh later.");
      setBoard([]);
    } finally {
      setLoading(false);
    }
  }, [user, stats.totalTiles, stats.currentStreak]);

  useEffect(() => {
    if (authLoading) return;
    loadLeaderboard();
  }, [authLoading, loadLeaderboard]);

  const openMessagesInvite = useCallback(async (phone?: string | null) => {
    setInviteBusy(true);
    try {
      await Linking.openURL(buildSmsUrl(phone));
    } catch {
      await Share.share({ message: getInviteMessage() });
    } finally {
      setInviteBusy(false);
    }
  }, []);

  const refreshInviteContacts = useCallback(async () => {
    setContactsBusy(true);
    setContactsError(null);
    try {
      const picks = await loadInviteContacts();
      setInviteContacts(picks);
      if (picks.length === 0) {
        setContactsError(
          "No contacts with phone numbers found. You can still invite via Messages below.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't load contacts right now.";
      setContactsError(message);
      setInviteContacts([]);
    } finally {
      setContactsBusy(false);
    }
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: spacing.screen,
        gap: spacing.section,
        paddingTop: 72,
        paddingBottom: 32,
      }}
    >
      <ScreenHeader
        title="Friends"
        subtitle="Compare coverage with people you walk with."
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
            <Text
              style={{ fontFamily: fonts.semibold, fontSize: 17, color: colors.text }}
            >
              Sign in to see friends
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
            Connect with Apple, Google, or email to sync tiles and compete with friends.
          </Text>
          <PillButton
            label="Sign in or create account"
            onPress={() => router.push("/sign-in")}
          />
        </Animated.View>
      ) : null}

      {user ? (
        <Animated.View
          entering={FadeInDown.duration(360).delay(80)}
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.successBorder,
            padding: 16,
            gap: 8,
          }}
        >
          <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: colors.text }}>
            Leaderboard unlocked
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              lineHeight: 19,
            }}
          >
            You're signed in, so this leaderboard updates automatically.
          </Text>
        </Animated.View>
      ) : null}

      {user && (authLoading || loading) ? (
        <View style={{ paddingVertical: 32, alignItems: "center" }}>
          <ActivityIndicator color={colors.ember} />
        </View>
      ) : null}

      {user && error ? (
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.textMuted,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      ) : null}

      {user && !loading && board.length === 0 && !error ? (
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 24,
            gap: 8,
            alignItems: "center",
          }}
        >
          <Image
            source="sf:person.2"
            style={{ width: 32, height: 32 }}
            tintColor={colors.textFaint}
          />
          <Text
            style={{
              fontFamily: fonts.semibold,
              fontSize: 16,
              color: colors.text,
              textAlign: "center",
            }}
          >
            No friends yet
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 14,
              color: colors.textMuted,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Add friends to compare tile counts. Only coverage stats are shared — never
            routes.
          </Text>
        </View>
      ) : null}

      {user && board.length > 0 ? (
        <View style={{ gap: 10 }}>
          {board.map((row, i) => (
            <LeaderboardRow
              key={row.id}
              rank={i + 1}
              name={row.name}
              initials={row.initials}
              tiles={row.tiles}
              streak={row.streak ?? 0}
              hue={row.hue}
              isYou={row.isYou}
              index={i}
            />
          ))}
        </View>
      ) : null}

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
          Invite friends
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 19,
          }}
        >
          Open Messages with a ready-to-send beta invite, or pick someone from your contacts.
        </Text>

        <PillButton
          label={inviteBusy ? "Opening Messages…" : "Invite via Messages"}
          disabled={inviteBusy}
          onPress={() => {
            openMessagesInvite().catch(() => {});
          }}
        />

        <PillButton
          label="Share invite link"
          variant="outline"
          onPress={() => {
            Share.share({ message: getInviteMessage() }).catch(() => {});
          }}
        />

        {contactsBusy ? <ActivityIndicator color={colors.ember} /> : null}

        {!contactsBusy && inviteContacts.length === 0 ? (
          <PillButton
            label="Find contacts"
            variant="outline"
            onPress={() => {
              refreshInviteContacts().catch(() => {});
            }}
          />
        ) : null}

        {contactsError ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.danger }}>
              {contactsError}
            </Text>
            <PillButton
              label="Try again"
              variant="outline"
              style={{ paddingVertical: 8, paddingHorizontal: 14 }}
              onPress={() => {
                refreshInviteContacts().catch(() => {});
              }}
            />
          </View>
        ) : null}

        {inviteContacts.map((contact) => (
          <View
            key={contact.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.text }}>
                {contact.name}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.textFaint }}>
                {contact.phone}
              </Text>
            </View>
            <PillButton
              label="Invite"
              variant="outline"
              style={{ paddingVertical: 8, paddingHorizontal: 14 }}
              onPress={() => {
                openMessagesInvite(contact.phone).catch(() => {});
              }}
            />
          </View>
        ))}
      </View>

      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 12,
          color: colors.textFaint,
          textAlign: "center",
        }}
      >
        Friends only see tile counts — never your routes.
      </Text>
    </ScrollView>
  );
}
