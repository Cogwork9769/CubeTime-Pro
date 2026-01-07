import type { Solve, SolvePenalty } from "../../types/solve";
import { formatTime } from "../../utils/stats";

type Props = {
  solves: Solve[];
  onUpdatePenalty: (id: string, penalty: SolvePenalty) => void;
  onDeleteSolve: (id: string) => void;
};

export default function SolveList({
  solves,
  onUpdatePenalty,
  onDeleteSolve,
}: Props) {
  return (
    <div className="mt-4">
      <div className="text-gray-400 text-xs mb-1">Solves</div>

      <div className="rounded-lg overflow-hidden border border-gray-700">
        {solves.map((s, i) => (
          <div
            key={s.id}
            className={`
              flex items-center justify-between px-3 py-2
              ${i % 2 === 0 ? "bg-gray-800" : "bg-gray-850"}
              hover:bg-gray-700 transition-colors
            `}
          >
            {/* Time */}
            <div className="text-white font-medium tabular-nums">
              {formatTime(s.finalTimeMs)}
            </div>

            <div className="flex items-center gap-3">
              {/* Penalty dropdown */}
              <select
                value={s.penalty}
                onChange={(e) =>
                  onUpdatePenalty(s.id, e.target.value as SolvePenalty)
                }
                className="bg-gray-700 text-white text-xs rounded px-1 py-0.5 focus:outline-none"
              >
                <option value="OK">OK</option>
                <option value="+2">+2</option>
                <option value="DNF">DNF</option>
              </select>

              {/* Delete icon */}
              <button
                onClick={() => onDeleteSolve(s.id)}
                className="text-red-400 hover:text-red-200 text-sm"
                title="Delete solve"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {solves.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            No solves yet
          </div>
        )}
      </div>
    </div>
  );
}
