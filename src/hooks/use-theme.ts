import { useSyncExternalStore } from "react";

import { getTheme, type AccentPreset, type ColorScheme } from "@/constants/theme";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export function useTheme() {
  const scheme = useSyncExternalStore(
    (cb) => settings.subscribe(SETTINGS_KEYS.colorScheme, cb),
    () => settings.get<ColorScheme>(SETTINGS_KEYS.colorScheme, "dark"),
    () => "dark" as ColorScheme,
  );

  const accentPreset = useSyncExternalStore(
    (cb) => settings.subscribe(SETTINGS_KEYS.accentPreset, cb),
    () => settings.get<AccentPreset>(SETTINGS_KEYS.accentPreset, "ember"),
    () => "ember" as AccentPreset,
  );

  const setColorScheme = (next: ColorScheme) => {
    settings.set(SETTINGS_KEYS.colorScheme, next);
  };

  const setAccentPreset = (next: AccentPreset) => {
    settings.set(SETTINGS_KEYS.accentPreset, next);
  };

  return { ...getTheme(scheme, accentPreset), setColorScheme, setAccentPreset };
}
