/**
 * Work Life Balance break tracking.
 * The break goal is set on /work-life-balance and stored in localStorage;
 * each finished puzzle counts toward it. When the goal is reached the puzzle
 * screen shows the "let's both go back to work" send-off.
 */
const KEY = "pictaria:break";

/**
 * A break only counts while it is fresh. Anything older than this is treated
 * as abandoned, so an old, forgotten break can never surprise someone with the
 * "back to work" send-off during ordinary play.
 */
const MAX_AGE_MS = 3 * 60 * 60 * 1000; // 3 hours

export type BreakState = {
  goal: number;
  done: number;
  startedAt: number;
  /** Which puzzles already counted, so one puzzle can never count twice. */
  ids: string[];
};

export function readBreak(): BreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BreakState>;
    // Only an explicitly started break (goal >= 1 with a start time) qualifies.
    if (typeof parsed?.goal !== "number" || parsed.goal < 1) {
      clearBreak();
      return null;
    }
    if (typeof parsed.startedAt !== "number" || Date.now() - parsed.startedAt > MAX_AGE_MS) {
      clearBreak();
      return null;
    }
    const ids = Array.isArray(parsed.ids)
      ? parsed.ids.filter((i): i is string => typeof i === "string")
      : [];
    return {
      goal: Math.max(1, Math.round(parsed.goal)),
      done: ids.length
        ? ids.length
        : typeof parsed.done === "number" && parsed.done > 0
          ? parsed.done
          : 0,
      startedAt: parsed.startedAt,
      ids,
    };
  } catch {
    clearBreak();
    return null;
  }
}

export function startBreak(goal: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      goal: Math.max(1, Math.round(goal)),
      done: 0,
      startedAt: Date.now(),
      ids: [],
    } satisfies BreakState),
  );
}

export function clearBreak() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/**
 * Counts a finished puzzle toward an active break. `id` identifies that exact
 * solve, so a re-render, replay, or remount of the same puzzle can never count
 * twice. Returns true only on the solve that completes the goal — the break is
 * then cleared, so later puzzles never show the send-off again.
 */
export function completePuzzleInBreak(id: string): boolean {
  const state = readBreak();
  if (!state) return false;
  if (state.ids.includes(id)) return false;
  const ids = [...state.ids, id];
  if (ids.length >= state.goal) {
    clearBreak();
    return true;
  }
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ ...state, ids, done: ids.length } satisfies BreakState),
  );
  return false;
}

