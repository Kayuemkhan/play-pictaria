/**
 * Work Life Balance break tracking.
 * The break goal is set on /work-life-balance and stored in localStorage;
 * each finished puzzle counts toward it. When the goal is reached the puzzle
 * screen shows the "let's both go back to work" send-off.
 */
const KEY = "pictaria:break";

export type BreakState = { goal: number; done: number; startedAt: number };

export function readBreak(): BreakState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BreakState>;
    if (typeof parsed?.goal !== "number") return null;
    return {
      goal: parsed.goal,
      done: typeof parsed.done === "number" ? parsed.done : 0,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function startBreak(goal: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({ goal, done: 0, startedAt: Date.now() } satisfies BreakState),
  );
}

export function clearBreak() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/**
 * Counts a finished puzzle toward an active break. Returns true only on the
 * puzzle that completes the goal — the break is then cleared, so later puzzles
 * played outside a Work Life Balance break never show the send-off again.
 */
export function completePuzzleInBreak(): boolean {
  const state = readBreak();
  if (!state) return false;
  const done = state.done + 1;
  if (done >= state.goal) {
    clearBreak();
    return true;
  }
  window.localStorage.setItem(KEY, JSON.stringify({ ...state, done }));
  return false;
}
