import type { Solve, SolvePenalty } from "./SolveListTypes"; // adjust if needed
import { formatTime } from "../../utils/stats";

type Props = {
  solves: Solve[];
  onUpdatePenalty: (id: string, penalty: SolvePenalty) => void;
  onDeleteSolve: (id: string) => void;   // ⭐ REQUIRED
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
          <div className="text-white">
            {formatTime(s.finalTimeMs)}
          </div>

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
            <option value="DNF">
