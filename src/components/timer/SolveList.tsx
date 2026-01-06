import type { PuzzleType } from "./ScrambleGenerator";

export type SolvePenalty = "OK" | "+2" | "DNF";

export type Solve = {
  id: string;
  timeMs: number;
  finalTimeMs: number;
  penalty: SolvePenalty;
  puzzle: PuzzleType;
  scramble: string;
  timestamp: number;
};

type Props = {
  solves: Solve[];
  onUpdatePenalty: (id: string, penalty: SolvePenalty) => void;
  onDeleteSolve: (id: string) => void;   // ⭐ add this
};
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centis = Math.floor((ms % 1000) / 10);

  const mm = minutes.toString();
  const ss = seconds.toString().padStart(2, "0");
  const cc = centis.toString().padStart(2, "0");

  return minutes > 0 ? `${mm}:${ss}.${cc}` : `${seconds}.${cc}`;
}

export default function SolveList({ solves, onUpdatePenalty }: Props) {
  if (!solves.length) {
    return (
      <div className="text-xs text-gray-400 text-center mt-4">
        No solves yet. Start timing to build your session.
      </div>
    );
  }

  return (
    <div className="mt-4 max-h-64 overflow-y-auto text-xs text-white">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-black/70">
          <tr>
            <th className="text-left p-1">#</th>
            <th className="text-left p-1">Puzzle</th>
            <th className="text-left p-1">Time</th>
            <th className="text-left p-1">Penalty</th>
            <th className="text-left p-1">Scramble</th>
          </tr>
        </thead>
        <tbody>
          {solves
            .slice()
            .reverse()
            .map((s, idx) => (
              <tr key={s.id} className="border-t border-gray-700">
                <td className="p-1">{solves.length - idx}</td>
                <td className="p-1">{s.puzzle}</td>
                <td className="p-1">
                  {s.penalty === "DNF"
                    ? "DNF"
                    : formatTime(s.finalTimeMs || s.timeMs)}
                </td>
                <td className="p-1">
                  <select
                    value={s.penalty}
                    onChange={(e) =>
                      onUpdatePenalty(s.id, e.target.value as SolvePenalty)
                    }
                    className="bg-black border border-gray-600 rounded px-1 py-0.5"
                  >
                    <option value="OK">OK</option>
                    <option value="+2">+2</option>
                    <option value="DNF">DNF</option>
                  </select>
                </td>
                <td className="p-1 max-w-[200px] truncate" title={s.scramble}>
                  {s.scramble}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

