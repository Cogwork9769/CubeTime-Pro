// Very solid pseudo-WCA scrambles for main events

const moves3x3 = ["R", "L", "U", "D", "F", "B"];
const moves2x2 = ["R", "L", "U", "D", "F", "B"];
const movesPyraminx = ["R", "L", "U", "B"];
const movesSkewb = ["R", "L", "U", "B"];

function generateLinearScramble(
  baseMoves: string[],
  length: number,
  useDoubleMoves: boolean,
  usePrimeMoves: boolean,
  excludedMoves: string[]
): string {
  const allowedMoves = baseMoves.filter((m) => !excludedMoves.includes(m));
  const scramble: string[] = [];
  let lastAxis: string | null = null;

  const axisMap: Record<string, string> = {
    R: "x",
    L: "x",
    U: "y",
    D: "y",
    F: "z",
    B: "z",
  };

  for (let i = 0; i < length; i++) {
    let move: string;
    let tries = 0;

    do {
      move = allowedMoves[Math.floor(Math.random() * allowedMoves.length)];
      tries++;
      if (tries > 10) break;
    } while (axisMap[move] && axisMap[move] === lastAxis);

    lastAxis = axisMap[move] || null;

    if (usePrimeMoves && Math.random() < 0.33) move += "'";
    else if (useDoubleMoves && Math.random() < 0.33) move += "2";

    scramble.push(move);
  }

  return scramble.join(" ");
}

export type PuzzleType =
  | "2x2"
  | "3x3"
  | "4x4"
  | "5x5"
  | "Pyraminx"
  | "Skewb";

export type ScrambleSettingsType = {
  length: number;
  useDoubleMoves: boolean;
  usePrimeMoves: boolean;
  excludedMoves: string[];
};

export function generateScramble(
  puzzleType: PuzzleType,
  settings: ScrambleSettingsType
): string {
  switch (puzzleType) {
    case "2x2":
      return generateLinearScramble(
        moves2x2,
        Math.max(9, settings.length),
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
    case "3x3":
      return generateLinearScramble(
        moves3x3,
        Math.max(20, settings.length),
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
    case "4x4":
      return generateLinearScramble(
        moves3x3,
        Math.max(40, settings.length),
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
    case "5x5":
      return generateLinearScramble(
        moves3x3,
        Math.max(60, settings.length),
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
    case "Pyraminx":
      return generateLinearScramble(
        movesPyraminx,
        Math.max(10, settings.length),
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
    case "Skewb":
      return generateLinearScramble(
        movesSkewb,
        Math.max(10, settings.length),
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
    default:
      return generateLinearScramble(
        moves3x3,
        settings.length,
        settings.useDoubleMoves,
        settings.usePrimeMoves,
        settings.excludedMoves
      );
  }
}

export function generateFromMoveset(
  moveset: string[],
  settings: { length: number; useDoubleMoves: boolean; usePrimeMoves: boolean }
): string {
  const scramble: string[] = [];

  for (let i = 0; i < settings.length; i++) {
    let move = moveset[Math.floor(Math.random() * moveset.length)];

    if (settings.usePrimeMoves && Math.random() < 0.33) move += "'";
    else if (settings.useDoubleMoves && Math.random() < 0.33) move += "2";

    scramble.push(move);
  }

  return scramble.join(" ");
}
