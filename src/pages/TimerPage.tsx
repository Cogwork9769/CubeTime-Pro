import { useEffect, useState } from "react";
import PuzzleSelector from "../components/timer/PuzzleSelector";
import ScrambleDisplay from "../components/timer/ScrambleDisplay";
import TimerDisplay from "../components/timer/TimerDisplay";
import InspectionTimer from "../components/timer/InspectionTimer";
import ScrambleSettings from "../components/timer/ScrambleSettings";
// ✅ ScrambleGenerator: value + types split
import { generateScramble } from "../components/timer/ScrambleGenerator";
import type {
  PuzzleType,
  ScrambleSettingsType,
} from "../components/timer/ScrambleGenerator";

// ✅ SolveList: default value + types split
import SolveList from "../components/timer/SolveList";
import type { Solve, SolvePenalty } from "../components/timer/SolveList";

<div className="test-box">Tailwind is working</div>

const STORAGE_SOLVES_KEY = "cubeTimer_solves";
const STORAGE_SETTINGS_KEY = "cubeTimer_scrambleSettings";

import StatsPanel from "./StatsPanel";

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

export default function TimerPage() {
  const [puzzle, setPuzzle] = useState<PuzzleType>("3x3");
  const [scramble, setScramble] = useState<string>("");
  const [settings, setSettings] = useState<ScrambleSettingsType>(
    loadSettings()
  );

  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [inspectionActive, setInspectionActive] = useState(false);
  const [inspectionStart, setInspectionStart] = useState<number | null>(null);
  const [inspectionTimeLeft, setInspectionTimeLeft] = useState<number>(15);
  const [inspectionPenalty, setInspectionPenalty] =
    useState<SolvePenalty>("OK");

  const [solves, setSolves] = useState<Solve[]>(loadSolves);

  // Generate scramble
  function regenerateScramble() {
    const s = generateScramble(puzzle, settings);
    setScramble(s);
  }

  useEffect(() => {
    regenerateScramble();
  }, [puzzle, settings]);

  // Save solves when they change
  useEffect(() => {
    saveSolves(solves);
  }, [solves]);

  // Save settings when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Timer loop
  useEffect(() => {
    if (!isRunning || startTime === null) return;

    let frame: number;
    const tick = () => {
      const now = performance.now();
      setTimeMs(now - startTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isRunning, startTime]);

  // Inspection loop
  useEffect(() => {
    if (!inspectionActive || inspectionStart === null) return;

    let frame: number;
    const tick = () => {
      const now = performance.now();
      const elapsed = (now - inspectionStart) / 1000;
      const left = 15 - elapsed;
      setInspectionTimeLeft(left);

      if (left <= -2) {
        // DNF threshold
        setInspectionPenalty("DNF");
      } else if (left <= 0) {
        setInspectionPenalty("+2");
      } else {
        setInspectionPenalty("OK");
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [inspectionActive, inspectionStart]);

  // Desktop: spacebar hold-to-start, release-to-go, press-to-stop
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        if (!isRunning && !inspectionActive) {
          setIsReady(true);
        }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();

        // If ready but not running: start inspection
        if (isReady && !isRunning) {
          setIsReady(false);
          setInspectionActive(true);
          setInspectionStart(performance.now());
          setInspectionTimeLeft(15);
          return;
        }

        // If inspection active: start solve
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

        // If running: stop solve
        if (isRunning) {
          stopSolve();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning, isReady, inspectionActive, inspectionStart, inspectionPenalty]);

  // Mobile / click: tap to start inspection, tap again to start, tap to stop
  function handleTap() {
    // If running: stop
    if (isRunning) {
      stopSolve();
      return;
    }

    // If inspection active: start solve
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

    // If idle: start inspection
    if (!isRunning && !inspectionActive) {
      setInspectionActive(true);
      setInspectionStart(performance.now());
      setInspectionTimeLeft(15);
    }
  }

  function stopSolve() {
    if (!isRunning || startTime === null) return;

    const now = performance.now();
    const rawTime = now - startTime;
    let finalTime = rawTime;

    if (inspectionPenalty === "+2") {
      finalTime += 2000;
    }

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
    setIsRunning(false);
    setStartTime(null);
    setTimeMs(0);
    setInspectionPenalty("OK");
    regenerateScramble();
  }

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

        <SolveList solves={solves} onUpdatePenalty={handleUpdatePenalty} />
      </div>
    </div>
  );
}



