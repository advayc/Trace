import { Image } from "expo-image";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { GlassCard } from "@/components/ui/glass-card";
import { fonts, radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatCompact } from "@/lib/stats/format";

interface MapSessionPillProps {
  sessionTiles: number;
}

/** Top-left walk session counter on the map. */
export function MapSessionPill({ sessionTiles }: MapSessionPillProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeInDown.duration(420).delay(120).springify()}>
      <GlassCard borderRadius={radius.pill}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
        >
          <Image
            source="sf:hexagon.fill"
            style={{ width: 16, height: 16 }}
            tintColor={colors.ember}
          />
          <Text
            selectable
            style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.text }}
          >
            {formatCompact(sessionTiles)}
          </Text>
          <Text
            style={{ fontFamily: fonts.body, fontSize: 13, color: colors.textMuted }}
          >
            tiles this session
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}
