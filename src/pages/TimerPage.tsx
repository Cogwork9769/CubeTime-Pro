import { useEffect, useState } from "react";

import PuzzleSelector from "../components/timer/PuzzleSelector";
import ScrambleDisplay from "../components/timer/ScrambleDisplay";
import TimerDisplay from "../components/timer/TimerDisplay";
import InspectionTimer from "../components/timer/InspectionTimer";
import ScrambleSettings from "../components/timer/ScrambleSettings";

import { generateScramble } from "../components/timer/ScrambleGenerator";
import type {
  PuzzleType,
  ScrambleSettingsType,
} from "../components/timer/ScrambleGenerator";

import SolveList from "../components/timer/SolveList";
import type { Solve, SolvePenalty } from "../utils/stats";

import StatsPanel from "../components/timer/StatsPanel";

const STORAGE_SOLVES_KEY = "cubeTimer_solves";
const STORAGE_SETTINGS_KEY = "cubeTimer_scrambleSettings";

// -------------------------------
// Load + Save Helpers
// -------------------------------
function loadSolves(): Solve[] {
  try {
    const raw = localStorage.getItem(STORAGE_SOLVES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSolves(solves: Solve[]) {
  try {
    localStorage.setItem(STORAGE_SOLVES_KEY, JSON.stringify(solves));
  } catch {}
}

function loadSettings(): ScrambleSettingsType {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) throw new Error();
    return JSON.parse(raw);
  } catch {
    return {
      length: 20,
      useDoubleMoves: true,
      usePrimeMoves: true,
      excludedMoves: [],
    };
  }
}

// -------------------------------
// Main Component
// -------------------------------
export default function TimerPage() {
  const [puzzle, setPuzzle] = useState<PuzzleType>("3x3");
  const [scramble, setScramble] = useState("");
  const [settings, setSettings] = useState<ScrambleSettingsType>(loadSettings);

  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [inspectionActive, setInspectionActive] = useState(false);
  const [inspectionStart, setInspectionStart] = useState<number | null>(null);
  const [inspectionTimeLeft, setInspectionTimeLeft] = useState(15);
  const [inspectionPenalty, setInspectionPenalty] =
    useState<SolvePenalty>("OK");

  const [solves, setSolves] = useState<Solve[]>(loadSolves);

  // Prevent double solves
  const [solveLocked, setSolveLocked] = useState(false);

  // -------------------------------
  // Scramble
  // -------------------------------
  function regenerateScramble() {
    const s = generateScramble(puzzle, settings);
    setScramble(s);
  }

  useEffect(() => {
    regenerateScramble();
  }, [puzzle, settings]);

  // -------------------------------
  // Save solves + settings
  // -------------------------------
  useEffect(() => saveSolves(solves), [solves]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // -------------------------------
  // Timer Loop
  // -------------------------------
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    let frame: number;
    const tick = () => {
      setTimeMs(performance.now() - startTime);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isRunning, startTime]);

  // -------------------------------
  // Inspection Loop
  // -------------------------------
  useEffect(() => {
    if (!inspectionActive || inspectionStart === null) return;

    let frame: number;
    const tick = () => {
      const elapsed = (performance.now() - inspectionStart) / 1000;
      const left = 15 - elapsed;
      setInspectionTimeLeft(left);

      if (left <= -2) setInspectionPenalty("DNF");
      else if (left <= 0) setInspectionPenalty("+2");
      else setInspectionPenalty("OK");

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inspectionActive, inspectionStart]);

  // -------------------------------
  // Stop Solve (bulletproof)
  // -------------------------------
  function stopSolve() {
    if (!isRunning || startTime === null) return;
    if (solveLocked) return;

    setSolveLocked(true);
    setTimeout(() => setSolveLocked(false), 200);

    setIsRunning(false);

    const now = performance.now();
    const rawTime = now - startTime;
    let finalTime = rawTime;

    if (inspectionPenalty === "+2") finalTime += 2000;

    const solve: Solve = {
      id: crypto.randomUUID(),
      timeMs: rawTime,
      finalTimeMs: finalTime,
      penalty: inspectionPenalty,
      puzzle,
      scramble,
      timestamp: Date.now(),
    };

    setSolves((prev) => [...prev, solve]);

    setStartTime(null);
    setTimeMs(0);
    setInspectionPenalty("OK");
    regenerateScramble();
  }

  // -------------------------------
  // Keyboard Controls
  // -------------------------------
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (!isRunning && !inspectionActive) {
        setIsReady(true);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (isReady && !isRunning) {
        setIsReady(false);
        setInspectionActive(true);
        setInspectionStart(performance.now());
        setInspectionTimeLeft(15);
        return;
      }

      if (inspectionActive) {
        setInspectionActive(false);
        setInspectionStart(null);
        setInspectionTimeLeft(15);

        const now = performance.now();
        setStartTime(now);
        setTimeMs(0);
        setIsRunning(true);
        return;
      }

      if (isRunning) stopSolve();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning, isReady, inspectionActive, inspectionStart, inspectionPenalty]);

  // -------------------------------
  // Mobile Tap Controls
  // -------------------------------
  function handleTap() {
    if (isRunning) {
      stopSolve();
      return;
    }

    if (inspectionActive) {
      setInspectionActive(false);
      setInspectionStart(null);
      setInspectionTimeLeft(15);

      const now = performance.now();
      setStartTime(now);
      setTimeMs(0);
      setIsRunning(true);
      return;
    }

    if (!isRunning && !inspectionActive) {
      setInspectionActive(true);
      setInspectionStart(performance.now());
      setInspectionTimeLeft(15);
    }
  }

  // -------------------------------
  // Penalty + Delete Handlers
  // -------------------------------
  function handleUpdatePenalty(id: string, penalty: SolvePenalty) {
    setSolves((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        let final = s.timeMs;
        if (penalty === "+2") final += 2000;
        if (penalty === "DNF") final = s.timeMs;

        return { ...s, penalty, finalTimeMs: final };
      })
    );
  }

  function handleDeleteSolve(id: string) {
    setSolves((prev) => prev.filter((s) => s.id !== id));
  }

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start py-6 px-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <PuzzleSelector value={puzzle} onChange={setPuzzle} />
          <div className="text-xs text-gray-400">
            Desktop: hold/release space • Mobile: tap
          </div>
        </div>

        <ScrambleDisplay scramble={scramble} onRegenerate={regenerateScramble} />

        <div onClick={handleTap} className="cursor-pointer select-none">
          <TimerDisplay
            timeMs={timeMs}
            isRunning={isRunning}
            isReady={isReady}
          />
          <InspectionTimer timeLeft={inspectionTimeLeft} />
        </div>

        <div className="mt-4 border border-gray-700 rounded-lg p-3">
          <ScrambleSettings value={settings} onChange={setSettings} />
        </div>

        <StatsPanel solves={solves} />

        <SolveList
          solves={solves}
          onUpdatePenalty={handleUpdatePenalty}
          onDeleteSolve={handleDeleteSolve}
        />
      </div>
    </div>
  );
}

