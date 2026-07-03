/**
 * Current streak = consecutive days with at least one new tile, counting back
 * from today (or yesterday, so an in-progress day doesn't break the streak).
 * Pure function over a newest-first list of YYYY-MM-DD strings.
 */
export function currentStreak(activeDaysDesc: string[], today: string): number {
  if (activeDaysDesc.length === 0) return 0;

  const days = new Set(activeDaysDesc);
  let cursor = today;
  if (!days.has(cursor)) {
    cursor = previousDay(cursor);
    if (!days.has(cursor)) return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = previousDay(cursor);
  }
  return streak;
}

export function bestStreak(activeDaysDesc: string[]): number {
  if (activeDaysDesc.length === 0) return 0;
  const asc = [...activeDaysDesc].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < asc.length; i++) {
    run = asc[i] === nextDay(asc[i - 1]) ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

function shiftDay(day: string, deltaDays: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d + deltaDays);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

const previousDay = (day: string) => shiftDay(day, -1);
const nextDay = (day: string) => shiftDay(day, 1);
