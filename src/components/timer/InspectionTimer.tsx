type Props = {
  timeLeft: number; // seconds
};

export default function InspectionTimer({ timeLeft }: Props) {
  if (timeLeft <= -2) return null; // after DNF threshold, hide

  let color = "text-green-400";
  if (timeLeft <= 8 && timeLeft > 0) color = "text-yellow-400";
  if (timeLeft <= 0) color = "text-red-400";

  return (
    <div className={`text-3xl font-semibold ${color} select-none text-center`}>
      {timeLeft > 0 ? timeLeft.toFixed(1) : `+${Math.abs(timeLeft).toFixed(1)}`}
    </div>
  );
}
