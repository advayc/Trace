import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo } from "react";
import { Modal, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, fonts, radius } from "@/constants/theme";
import type { AchievementDef } from "@/lib/achievements/definitions";

const PIECE_COLORS = [colors.ember, colors.emberLight, colors.mint, colors.mintLight];
const PIECE_COUNT = 26;

interface PieceSpec {
  delay: number;
  startX: number;
  drift: number;
  size: number;
  color: string;
  rotation: number;
}

function ConfettiPiece({ spec, height }: { spec: PieceSpec; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 1700 + spec.delay,
      easing: Easing.out(Easing.quad),
    });
  }, [progress, spec.delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: spec.startX + spec.drift * progress.value },
      { translateY: -40 + (height + 80) * progress.value },
      { rotate: `${spec.rotation * progress.value}deg` },
    ],
    opacity: 1 - progress.value * 0.9,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          width: spec.size,
          height: spec.size * 0.45,
          borderRadius: 2,
          backgroundColor: spec.color,
        },
        style,
      ]}
    />
  );
}

interface ConfettiCelebrationProps {
  achievement: AchievementDef | null;
  onDismiss: () => void;
}

export function ConfettiCelebration({
  achievement,
  onDismiss,
}: ConfettiCelebrationProps) {
  const { width, height } = useWindowDimensions();
  const achievementId = achievement?.id;
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (!achievementId) return;
    if (process.env.EXPO_OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    cardScale.value = 0.88;
    cardOpacity.value = 0;
    cardScale.value = withSpring(1, { damping: 16, stiffness: 220 });
    cardOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [achievementId, cardOpacity, cardScale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const pieces = useMemo<PieceSpec[]>(() => {
    if (!achievementId) return [];
    return Array.from({ length: PIECE_COUNT }, (_, i) => ({
      delay: (i % 8) * 90,
      startX: Math.random() * width,
      drift: (Math.random() - 0.5) * 140,
      size: 8 + Math.random() * 8,
      color: PIECE_COLORS[i % PIECE_COLORS.length],
      rotation: (Math.random() - 0.5) * 720,
    }));
  }, [achievementId, width]);

  if (!achievement) return null;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        {pieces.map((spec, i) => (
          <ConfettiPiece
            key={`${achievement.id}-${i}`}
            spec={spec}
            height={height}
          />
        ))}
        <Animated.View
          style={[
            {
              backgroundColor: colors.surfaceRaised,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.accentBorder,
              padding: 28,
              alignItems: "center",
              gap: 14,
              width: "100%",
              maxWidth: 340,
            },
            cardStyle,
          ]}
        >
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: colors.emberDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={`sf:${achievement.sf}`}
              style={{ width: 40, height: 40 }}
              tintColor={colors.ember}
            />
          </View>
          <Text
            style={{
              fontFamily: fonts.semibold,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.mint,
            }}
          >
            Achievement unlocked
          </Text>
          <Text
            style={{
              fontFamily: fonts.displayBold,
              fontSize: 26,
              color: colors.text,
              textAlign: "center",
            }}
          >
            {achievement.title}
          </Text>
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              color: colors.textMuted,
              textAlign: "center",
            }}
          >
            {achievement.description}
          </Text>
          <Text
            style={{
              fontFamily: fonts.medium,
              fontSize: 14,
              color: colors.textFaint,
              marginTop: 6,
            }}
          >
            Tap anywhere to keep going
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
