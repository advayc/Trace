import * as Crypto from "expo-crypto";

import { activityRepository } from "@/lib/activity/activity-repository";
import { simplifyRoute } from "@/lib/activity/route-simplify";
import type {
  ActiveSession,
  Activity,
  ActivityRoutePoint,
  ActivityType,
} from "@/lib/activity/activity-types";
import { matchSegments } from "@/lib/activity/segment-matcher";
import { healthService } from "@/lib/health/health-service";
import {
  locationService,
  type ForegroundTrackingMode,
} from "@/lib/location/location-service";
import { stompEngine } from "@/lib/stomp/stomp-engine";

/** Tile dormant longer than this counts as a reclaim on revisit. */
export const DORMANT_RECLAIM_MS = 30 * 24 * 60 * 60 * 1000;

type RecorderEvents = {
  "session:updated": ActiveSession | null;
  "session:ended": Activity;
};

type EventKey = keyof RecorderEvents;
type Handler<K extends EventKey> = (payload: RecorderEvents[K]) => void;

class ActivityRecorder {
  private session: ActiveSession | null = null;
  private latest: Activity | null = null;
  private route: ActivityRoutePoint[] = [];
  private handlers: { [K in EventKey]: Set<Handler<K>> } = {
    "session:updated": new Set(),
    "session:ended": new Set(),
  };
  private unsubscribers: (() => void)[] = [];
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  on<K extends EventKey>(event: K, handler: Handler<K>): () => void {
    this.handlers[event].add(handler);
    return () => this.handlers[event].delete(handler);
  }

  private emit<K extends EventKey>(event: K, payload: RecorderEvents[K]): void {
    this.handlers[event].forEach((fn) => fn(payload));
  }

  getActiveSession(): ActiveSession | null {
    return this.session ? { ...this.session } : null;
  }

  latestActivity(): Activity | null {
    return this.latest ?? activityRepository.latest();
  }

  async start(type: Exclude<ActivityType, "passive">): Promise<void> {
    if (this.session) return;

    const startedAt = Date.now();
    this.session = {
      id: Crypto.randomUUID(),
      type,
      startedAt,
      distanceM: 0,
      durationMs: 0,
      avgPaceSPerKm: null,
      newTiles: 0,
      reclaimedTiles: 0,
    };
    this.route = [];
    this.attachListeners();
    await locationService.setForegroundMode(type as ForegroundTrackingMode);
    this.startTick();
    this.emit("session:updated", { ...this.session });
  }

  async stop(): Promise<Activity | null> {
    if (!this.session) return null;

    const endedAt = Date.now();
    const durationMs = endedAt - this.session.startedAt;
    const distanceM = this.session.distanceM;
    const avgPaceSPerKm =
      distanceM > 0 ? (durationMs / 1000 / distanceM) * 1000 : null;

    const activity: Activity = {
      id: this.session.id,
      type: this.session.type,
      startedAt: this.session.startedAt,
      endedAt,
      distanceM,
      durationMs,
      avgPaceSPerKm,
      newTiles: this.session.newTiles,
      reclaimedTiles: this.session.reclaimedTiles,
      route: simplifyRoute(this.route),
    };

    this.detachListeners();
    await locationService.setForegroundMode("passive");
    this.session = null;
    this.route = [];
    this.emit("session:updated", null);

    activityRepository.saveCompleted(activity);
    this.latest = activity;
    matchSegments(activity);
    void healthService.writeWorkout(activity);
    this.emit("session:ended", activity);

    return activity;
  }

  private startTick(): void {
    this.tickTimer = setInterval(() => {
      if (!this.session) return;
      const durationMs = Date.now() - this.session.startedAt;
      const avgPaceSPerKm =
        this.session.distanceM > 0
          ? (durationMs / 1000 / this.session.distanceM) * 1000
          : null;
      this.session = { ...this.session, durationMs, avgPaceSPerKm };
      this.emit("session:updated", { ...this.session });
    }, 1000);
  }

  private attachListeners(): void {
    const offSample = stompEngine.on("sample:accepted", ({ sample, distanceM }) => {
      if (!this.session) return;
      this.route.push({ latitude: sample.lat, longitude: sample.lng });
      if (distanceM > 0) {
        this.session = {
          ...this.session,
          distanceM: this.session.distanceM + distanceM,
        };
        this.emit("session:updated", { ...this.session });
      }
    });

    const offNew = stompEngine.on("tile:new", () => {
      if (!this.session) return;
      this.session = { ...this.session, newTiles: this.session.newTiles + 1 };
      this.emit("session:updated", { ...this.session });
    });

    const offRevisit = stompEngine.on("tile:revisit", ({ dormantMs }) => {
      if (!this.session) return;
      if (dormantMs >= DORMANT_RECLAIM_MS) {
        this.session = {
          ...this.session,
          reclaimedTiles: this.session.reclaimedTiles + 1,
        };
        this.emit("session:updated", { ...this.session });
      }
    });

    this.unsubscribers = [offSample, offNew, offRevisit];
  }

  private detachListeners(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }
}

export const activityRecorder = new ActivityRecorder();
