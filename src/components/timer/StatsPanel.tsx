import { best, worst, average, ao5, ao12, stdev } from "../utils/stats";

export default function StatsPanel({ solves }) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <div>Best: {best(solves)}</div>
      <div>Worst: {worst(solves)}</div>
      <div>Average: {average(solves)}</div>
      <div>Ao5: {ao5(solves)}</div>
      <div>Ao12: {ao12(solves)}</div>
      <div>Std Dev: {stdev(solves)}</div>
    </div>
  );
}
