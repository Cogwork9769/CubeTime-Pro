// src/types/solve.ts

export type SolvePenalty = "OK" | "+2" | "DNF";

export type Solve = {
  id: string;
  timeMs: number;
  finalTimeMs: number;
  penalty: SolvePenalty;
  puzzle: string;
  scramble: string;
  timestamp: number;
};
