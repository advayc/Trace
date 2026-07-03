import { pointToCell } from "@/lib/h3";
import type { Activity } from "@/lib/activity/activity-types";
import { getDb } from "@/lib/storage/tile-db";

export interface SegmentPr {
  segmentId: string;
  elapsedMs: number;
  activityId: string;
  achievedAt: number;
}

interface SegmentPrRow {
  segment_id: string;
  elapsed_ms: number;
  activity_id: string;
  achieved_at: number;
}

/** Consecutive H3 cell pairs along a route form local segments. */
function segmentPairsFromRoute(
  activity: Activity,
): { segmentId: string; enteredAt: number }[] {
  if (activity.route.length < 2) return [];

  const pairs: { segmentId: string; enteredAt: number }[] = [];
  const elapsedPerPoint =
    activity.route.length > 1 ? activity.durationMs / (activity.route.length - 1) : 0;

  let prevCell = pointToCell(
    activity.route[0].latitude,
    activity.route[0].longitude,
  );

  for (let i = 1; i < activity.route.length; i++) {
    const cell = pointToCell(
      activity.route[i].latitude,
      activity.route[i].longitude,
    );
    if (cell !== prevCell) {
      const segmentId = `${prevCell}:${cell}`;
      pairs.push({
        segmentId,
        enteredAt: activity.startedAt + Math.round(i * elapsedPerPoint),
      });
      prevCell = cell;
    }
  }
  return pairs;
}

export const segmentRepository = {
  getPr(segmentId: string): SegmentPr | null {
    const row = getDb().getFirstSync<SegmentPrRow>(
      "SELECT * FROM segment_prs WHERE segment_id = ?",
      [segmentId],
    );
    if (!row) return null;
    return {
      segmentId: row.segment_id,
      elapsedMs: row.elapsed_ms,
      activityId: row.activity_id,
      achievedAt: row.achieved_at,
    };
  },

  upsertPr(pr: SegmentPr): boolean {
    const existing = this.getPr(pr.segmentId);
    if (existing && existing.elapsedMs <= pr.elapsedMs) return false;
    getDb().runSync(
      `INSERT INTO segment_prs (segment_id, elapsed_ms, activity_id, achieved_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(segment_id) DO UPDATE SET
         elapsed_ms = excluded.elapsed_ms,
         activity_id = excluded.activity_id,
         achieved_at = excluded.achieved_at
       WHERE excluded.elapsed_ms < segment_prs.elapsed_ms`,
      [pr.segmentId, pr.elapsedMs, pr.activityId, pr.achievedAt],
    );
    return !existing || pr.elapsedMs < existing.elapsedMs;
  },

  all(): SegmentPr[] {
    const rows = getDb().getAllSync<SegmentPrRow>(
      "SELECT * FROM segment_prs ORDER BY achieved_at DESC",
    );
    return rows.map((row) => ({
      segmentId: row.segment_id,
      elapsedMs: row.elapsed_ms,
      activityId: row.activity_id,
      achievedAt: row.achieved_at,
    }));
  },
};

/** Match route corridors and update local segment PRs. */
export function matchSegments(activity: Activity): SegmentPr[] {
  const pairs = segmentPairsFromRoute(activity);
  if (pairs.length === 0) return [];

  const newPrs: SegmentPr[] = [];
  for (let i = 1; i < pairs.length; i++) {
    const elapsedMs = pairs[i].enteredAt - pairs[i - 1].enteredAt;
    if (elapsedMs <= 0) continue;
    const pr: SegmentPr = {
      segmentId: pairs[i].segmentId,
      elapsedMs,
      activityId: activity.id,
      achievedAt: activity.endedAt,
    };
    if (segmentRepository.upsertPr(pr)) newPrs.push(pr);
  }
  return newPrs;
}
