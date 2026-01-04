import type { PuzzleType } from "./ScrambleGenerator";

type Props = {
  value: PuzzleType;
  onChange: (p: PuzzleType) => void;
};

const puzzles: PuzzleType[] = ["2x2", "3x3", "4x4", "5x5", "Pyraminx", "Skewb"];

export default function PuzzleSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PuzzleType)}
      className="text-black p-2 rounded-md"
    >
      {puzzles.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
