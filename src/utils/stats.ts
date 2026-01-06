// Use the same Solve type your TimerPage uses
export type Solve = {
  finalTimeMs: number;
  penalty: "OK" | "+2" | "DNF";
};

// Convert a solve to a usable numeric time
export function effectiveTime(solve: Solve): number | null {
  if (solve.penalty === "DNF") return null;
  return solve.finalTimeMs;
}

// Filter out DNFs for stats that require valid times
export function validTimes(solves: Solve[]): number[] {
  return solves
    .map(effectiveTime)
    .filter((t): t is number => t !== null);
}

// Best single
export function best(solves: Solve[]): number | null {
  const times = validTimes(solves);
  if (times.length === 0) return null;
  return Math.min(...times);
}

// Worst single
export function worst(solves: Solve[]): number | null {
  const times = validTimes(solves);
  if (times.length === 0) return null;
  return Math.max(...times);
}

// Mean of all solves
export function average(solves: Solve[]): number | null {
  const times = validTimes(solves);
  if (times.length === 0) return null;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

// WCA-style rolling average (AoN)
export function aoN(solves: Solve[], N: number): number | null {
  if (solves.length < N) return null;

  const window = solves.slice(-N);
  const times = window.map(effectiveTime);

  // If 2 or more DNFs → DNF average
  const dnfCount = times.filter(t => t === null).length;
  if (dnfCount >= 2) return null;

  // Remove best and worst
  const numeric = times.filter((t): t is number => t !== null);
  numeric.sort((a, b) => a - b);

  if (numeric.length <= 2) return null;

  const trimmed = numeric.slice(1, numeric.length - 1);
  const sum = trimmed.reduce((a, b) => a + b, 0);

  return sum / trimmed.length;
}

export function ao5(solves: Solve[]): number | null {
  return aoN(solves, 5);
}

export function ao12(solves: Solve[]): number | null {
  return aoN(solves, 12);
}

// Standard deviation
export function stdev(solves: Solve[]): number | null {
  const times = validTimes(solves);
  if (times.length === 0) return null;

  const avg = average(solves)!;
  const variance =
    times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) /
    times.length;

  return Math.sqrt(variance);
}
export function formatTime(ms: number | null): string {
  if (ms === null) return "DNF";
  return (ms / 1000).toFixed(3);
}
