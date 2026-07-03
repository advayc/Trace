import { useCallback, useEffect, useState } from "react";

import { healthService } from "@/lib/health/health-service";
import { SETTINGS_KEYS, settings } from "@/lib/storage/settings";

export function useAppleHealth() {
  const [enabled, setEnabled] = useState(() => healthService.isEnabled());
  const [available, setAvailable] = useState(false);
  const [todaySteps, setTodaySteps] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshSteps = useCallback(async () => {
    if (!healthService.isEnabled()) {
      setTodaySteps(null);
      return;
    }
    const steps = await healthService.readTodaySteps();
    setTodaySteps(steps);
  }, []);

  useEffect(() => {
    void healthService.isAvailable().then(setAvailable);
  }, []);

  useEffect(() => {
    const onChange = () => setEnabled(healthService.isEnabled());
    return settings.subscribe(SETTINGS_KEYS.appleHealthEnabled, onChange);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setTodaySteps(null);
      return;
    }
    void refreshSteps();
    const interval = setInterval(() => {
      void refreshSteps();
    }, 60_000);
    return () => clearInterval(interval);
  }, [enabled, refreshSteps]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const ok = await healthService.enable();
      setEnabled(ok);
      if (ok) await refreshSteps();
      return ok;
    } finally {
      setBusy(false);
    }
  }, [refreshSteps]);

  const disable = useCallback(() => {
    healthService.disable();
    setEnabled(false);
    setTodaySteps(null);
  }, []);

  return {
    available,
    enabled,
    busy,
    todaySteps,
    enable,
    disable,
    refreshSteps,
  };
}
