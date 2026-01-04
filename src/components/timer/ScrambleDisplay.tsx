type Props = {
  scramble: string;
  onRegenerate?: () => void;
};

export default function ScrambleDisplay({ scramble, onRegenerate }: Props) {
  return (
    <div
      className="text-center text-xl text-white px-4 py-2 cursor-pointer select-none"
      onClick={onRegenerate}
      title={onRegenerate ? "Click to regenerate scramble" : undefined}
    >
      {scramble || "Generating..."}
    </div>
  );
}
