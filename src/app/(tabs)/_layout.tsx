import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Fragment } from "react";

import { ConfettiCelebration } from "@/components/ui/confetti-celebration";
import { useAchievementUnlocks } from "@/hooks/use-achievement-unlocks";
import { useTheme } from "@/hooks/use-theme";

export default function TabLayout() {
  const { colors } = useTheme();
  const { celebration, dismissCelebration } = useAchievementUnlocks();

  return (
    <Fragment>
      <NativeTabs
        backgroundColor={colors.bg}
        iconColor={colors.textMuted}
        tintColor={colors.ember}
        labelStyle={{ color: colors.textMuted }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: "map", selected: "map.fill" }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="activities">
          <NativeTabs.Trigger.Label>Activities</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "figure.run", selected: "figure.run.circle.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="progress">
          <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="friends">
          <NativeTabs.Trigger.Label>Friends</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person.2", selected: "person.2.fill" }}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
      <ConfettiCelebration
        achievement={celebration}
        onDismiss={dismissCelebration}
      />
    </Fragment>
  );
}
