import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from "react-native-reanimated";

import { PillButton } from "@/components/ui/pill-button";
import { colors, fonts, radius } from "@/constants/theme";
import { locationService } from "@/lib/location/location-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

interface Slide {
  key: string;
  sf: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    key: "fog",
    sf: "cloud.fog.fill",
    title: "Your city starts\nunder fog",
    body: "The whole map is dark until you move through it. Every street you walk, run, or roll down clears a tile — for good.",
  },
  {
    key: "reveal",
    sf: "hexagon.fill",
    title: "Walk it.\nReveal it. Keep it.",
    body: "Only real movement counts. No tapping, no shortcuts — your map becomes a record of everywhere you've actually been.",
  },
  {
    key: "streaks",
    sf: "flame.fill",
    title: "Streaks, stats,\nand bragging rights",
    body: "Watch your coverage climb, keep daily streaks alive, and unlock achievements as the blank spots disappear.",
  },
];

function OnboardingSlide({
  item,
  width,
  active,
}: {
  item: Slide;
  width: number;
  active: boolean;
}) {
  return (
    <View
      style={{
        width,
        alignItems: "center",
        justifyContent: "center",
        padding: 36,
        gap: 26,
      }}
    >
      <Animated.View
        key={active ? `${item.key}-on` : `${item.key}-off`}
        entering={active ? FadeInDown.duration(480).springify() : undefined}
        style={{ alignItems: "center", gap: 26 }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.emberDim,
            borderWidth: 1,
            borderColor: "rgba(232,160,76,0.35)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={`sf:${item.sf}`}
            style={{ width: 52, height: 52 }}
            tintColor={colors.ember}
          />
        </View>
        <Text
          style={{
            fontFamily: fonts.displayBold,
            fontSize: 36,
            lineHeight: 42,
            color: colors.text,
            textAlign: "center",
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            lineHeight: 24,
            color: colors.textMuted,
            textAlign: "center",
          }}
        >
          {item.body}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const listRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setPage(first.index);
    },
  );

  const isLast = page === SLIDES.length - 1;

  const advance = async () => {
    if (!isLast) {
      listRef.current?.scrollToIndex({ index: page + 1, animated: true });
      return;
    }
    setRequesting(true);
    try {
      await locationService.requestForegroundPermission();
    } finally {
      settings.set(SETTINGS_KEYS.onboarded, true);
      setRequesting(false);
      router.replace("/");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index }) => (
          <OnboardingSlide item={item} width={width} active={page === index} />
        )}
      />

      <Animated.View
        entering={FadeInUp.duration(500).delay(200)}
        style={{ padding: 28, gap: 20, paddingBottom: 52 }}
      >
        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}
        >
          {SLIDES.map((s, i) => (
            <Animated.View
              key={s.key}
              layout={LinearTransition.springify()}
              style={{
                width: i === page ? 22 : 8,
                height: 8,
                borderRadius: radius.pill,
                backgroundColor: i === page ? colors.ember : colors.fog,
              }}
            />
          ))}
        </View>
        <PillButton
          label={isLast ? "Allow location & start" : "Next"}
          onPress={advance}
          disabled={requesting}
        />
        {isLast ? (
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.textFaint,
              textAlign: "center",
            }}
          >
            Your precise location never leaves this device.
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
