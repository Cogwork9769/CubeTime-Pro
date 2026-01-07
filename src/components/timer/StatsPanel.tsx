import type { Solve } from "../../types/solve";
import {
  best,
  worst,
  average,
  ao5,
  ao12,
  stdev,
  formatTime,
} from "../../utils/stats";

type Props = {
  solves: Solve[];
};

export default function StatsPanel({ solves }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mt-4">
      <h2 className="text-gray-300 text-sm font-semibold mb-3">Statistics</h2>

      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <Stat label="Best" value={formatTime(best(solves))} />
        <Stat label="Worst" value={formatTime(worst(solves))} />
        <Stat label="Average" value={formatTime(average(solves))} />
        <Stat label="Ao5" value={formatTime(ao5(solves))} />
        <Stat label="Ao12" value={formatTime(ao12(solves))} />
        <Stat label="Std Dev" value={formatTime(stdev(solves))} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="text-gray-400">{label}</div>
      <div className="text-white text-right tabular-nums">{value}</div>
    </>
  );
}
