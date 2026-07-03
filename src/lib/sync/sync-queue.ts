/**
 * Phase 2 stub — no network sync in v1.
 *
 * Privacy invariant: entries carry H3 cell indexes ONLY. Raw lat/lng must
 * never enter this queue or any future upload payload.
 */

export interface SyncQueueEntry {
  h3Index: string;
  stompedAt: number;
}

export interface SyncQueue {
  enqueue(entry: SyncQueueEntry): void;
  pending(): SyncQueueEntry[];
  markSynced(h3Indexes: string[]): void;
}

/** No-op implementation until a backend exists. */
export const syncQueue: SyncQueue = {
  enqueue() {},
  pending() {
    return [];
  },
  markSynced() {},
};
