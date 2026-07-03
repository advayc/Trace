import { useSyncExternalStore } from "react";

import { getTheme, type ColorScheme } from "@/constants/theme";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export function useTheme() {
  const scheme = useSyncExternalStore(
    (cb) => settings.subscribe(SETTINGS_KEYS.colorScheme, cb),
    () => settings.get<ColorScheme>(SETTINGS_KEYS.colorScheme, "dark"),
    () => "dark" as ColorScheme,
  );

  const setColorScheme = (next: ColorScheme) => {
    settings.set(SETTINGS_KEYS.colorScheme, next);
  };

  return { ...getTheme(scheme), setColorScheme };
}
