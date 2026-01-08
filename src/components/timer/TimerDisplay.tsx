type Props = {
  timeMs: number;
  isRunning: boolean;
  isReady: boolean;
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Three decimal places (000–999)
  const millis = Math.floor(ms % 1000)
    .toString()
    .padStart(3, "0");

  const mm = minutes.toString();
  const ss = seconds.toString().padStart(2, "0");

  return minutes > 0 ? `${mm}:${ss}.${millis}` : `${seconds}.${millis}`;
}


export default function TimerDisplay({ timeMs, isRunning, isReady }: Props) {
  let color = "text-white";

  if (isReady && !isRunning) color = "text-green-400";
  if (isRunning) color = "text-red-400";

  return (
    <div
      className={`text-6xl md:text-7xl font-bold ${color} select-none text-center`}
    >
      {formatTime(timeMs)}
    </div>
  );
}

