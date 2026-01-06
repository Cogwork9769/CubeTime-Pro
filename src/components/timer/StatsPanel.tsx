import { best, worst, average, ao5, ao12, stdev, formatTime } from "../../utils/stats";
import type { Solve } from "../../utils/stats";

type StatsPanelProps = {
  solves: Solve[];
};

export default function StatsPanel({ solves }: StatsPanelProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <div>Best: {formatTime(best(solves))}</div>
      <div>Worst: {formatTime(worst(solves))}</div>
      <div>Average: {formatTime(average(solves))}</div>
      <div>Ao5: {formatTime(ao5(solves))}</div>
      <div>Ao12: {formatTime(ao12(solves))}</div>
      <div>Std Dev: {formatTime(stdev(solves))}</div>
      <div>Best: {best(solves)}</div>
      <div>Worst: {worst(solves)}</div>
      <div>Average: {average(solves)}</div>
      <div>Ao5: {ao5(solves)}</div>
      <div>Ao12: {ao12(solves)}</div>
      <div>Std Dev: {stdev(solves)}</div>
    </div>
  );
}
