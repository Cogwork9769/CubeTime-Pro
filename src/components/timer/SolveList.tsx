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
    <div className="space-y-2">
      {solves.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between bg-gray-800 p-2 rounded"
        >
          {/* Time */}
          <div className="text-white">{formatTime(s.finalTimeMs)}</div>

          {/* Penalty selector */}
          <select
            value={s.penalty}
            onChange={(e) =>
              onUpdatePenalty(s.id, e.target.value as SolvePenalty)
            }
            className="bg-gray-700 text-white text-sm rounded px-1"
          >
            <option value="OK">OK</option>
            <option value="+2">+2</option>
            <option value="DNF">DNF</option>
          </select>

          {/* Delete button */}
          <button
            onClick={() => onDeleteSolve(s.id)}
            className="text-red-400 hover:text-red-200 text-xs ml-3"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

