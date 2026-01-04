import { useEffect, useState } from "react";
import { Label } from "/src/components/ui/label";
import { Switch } from "../ui/switch";
import type { ScrambleSettingsType } from "./ScrambleGenerator";

type Props = {
  value: ScrambleSettingsType;
  onChange: (v: ScrambleSettingsType) => void;
};

const STORAGE_KEY = "cubeTimer_scrambleSettings";

export default function ScrambleSettings({ value, onChange }: Props) {
  const [local, setLocal] = useState<ScrambleSettingsType>(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
    } catch {}
  }, [local]);

  function update(partial: Partial<ScrambleSettingsType>) {
    const next = { ...local, ...partial };
    setLocal(next);
    onChange(next);
  }

  function toggleExcluded(move: string) {
    const excluded = local.excludedMoves.includes(move)
      ? local.excludedMoves.filter((m) => m !== move)
      : [...local.excludedMoves, move];

    update({ excludedMoves: excluded });
  }

  const allMoves = ["R", "L", "U", "D", "F", "B"];

  return (
    <div className="text-white text-sm space-y-3">
      <div className="flex items-center justify-between">
        <Label>Use prime moves (')</Label>
        <Switch
          checked={local.usePrimeMoves}
          onCheckedChange={(v: boolean) => update({ usePrimeMoves: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Use double moves (2)</Label>
        <Switch
          checked={local.useDoubleMoves}
          onCheckedChange={(v: boolean) => update({ useDoubleMoves: v })}
        />
      </div>

      <div>
        <Label>Scramble length</Label>
        <input
          type="number"
          min={1}
          max={100}
          value={local.length}
          onChange={(e) => update({ length: Number(e.target.value) || 1 })}
          className="mt-1 w-full rounded-md px-2 py-1 text-black"
        />
      </div>

      <div>
        <Label>Exclude moves</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {allMoves.map((m) => {
            const active = local.excludedMoves.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleExcluded(m)}
                className={`px-2 py-1 rounded-md border text-xs ${
                  active
                    ? "bg-red-500 border-red-500"
                    : "bg-transparent border-gray-500"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
