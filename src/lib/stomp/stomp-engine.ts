import { cellCenter, pointToCell } from "@/lib/h3";
import { tileRepository, type StompedTile } from "@/lib/storage/tile-db";
import {
  validateSample,
  type GpsSample,
  type SampleVerdict,
} from "@/lib/stomp/stomp-rules";

export interface StompEvents {
  "tile:new": StompedTile;
  "tile:revisit": StompedTile;
  "stats:changed": undefined;
}

type EventKey = keyof StompEvents;
type Handler<K extends EventKey> = (payload: StompEvents[K]) => void;

/**
 * Singleton pipeline: GPS sample -> anti-cheat rules -> H3 cell -> SQLite ->
 * events for the UI. Used by both the foreground watcher and the background task.
 */
class StompEngine {
  private lastAccepted: GpsSample | null = null;
  private handlers: { [K in EventKey]: Set<Handler<K>> } = {
    "tile:new": new Set(),
    "tile:revisit": new Set(),
    "stats:changed": new Set(),
  };

  on<K extends EventKey>(event: K, handler: Handler<K>): () => void {
    this.handlers[event].add(handler);
    return () => this.handlers[event].delete(handler);
  }

  private emit<K extends EventKey>(event: K, payload: StompEvents[K]): void {
    this.handlers[event].forEach((fn) => fn(payload));
  }

  processSample(sample: GpsSample): SampleVerdict {
    const verdict = validateSample(this.lastAccepted, sample);
    if (!verdict.ok) return verdict;

    this.lastAccepted = sample;
    if (verdict.distanceM > 0) {
      tileRepository.addDistance(verdict.distanceM, sample.timestamp);
    }

    const h3Index = pointToCell(sample.lat, sample.lng);
    const center = cellCenter(h3Index);
    const result = tileRepository.stomp(
      h3Index,
      center.latitude,
      center.longitude,
      sample.timestamp,
    );

    if (result.kind === "new") this.emit("tile:new", result.tile);
    if (result.kind === "revisit") this.emit("tile:revisit", result.tile);
    this.emit("stats:changed", undefined);
    return verdict;
  }

  /** Test/debug aid only — resets in-memory chain, not the DB. */
  resetSession(): void {
    this.lastAccepted = null;
  }
}

export const stompEngine = new StompEngine();
