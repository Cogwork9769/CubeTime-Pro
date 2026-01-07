import { useState, useEffect, useRef } from "react";
import type { Solve, SolvePenalty } from "../types/solve";
import type { Session } from "../types/session";
import type { ScrambleSettingsType } from "../types/scramble";

import ScrambleDisplay from "../components/timer/ScrambleDisplay";
import TimerDisplay from "../components/timer/TimerDisplay";
import InspectionTimer from "../components/timer/InspectionTimer";
import ScrambleSettings from "../components/timer/ScrambleSettings";
import StatsPanel from "../components/timer/StatsPanel";
import SolveList from "../components/timer/SolveList";
import SessionSelector from "../components/timer/SessionSelector";

// --------------------------------------
// Main Component
// --------------------------------------
export default function TimerPage() {
  // -------------------------------
  // Session state
  // -------------------------------
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // -------------------------------
  // Solve state
  // -------------------------------
  const [solves, setSolves] = useState<Solve[]>(loadSolves);

  // -------------------------------
  // Timer + inspection state
  // -------------------------------
  const [timeMs, setTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // inspection starts only after first press→release
  const [inspectionTimeLeft, setInspectionTimeLeft] = useState(15);
  const [inspectionActive, setInspectionActive] = useState(false);
  const [inspectionPenalty, setInspectionPenalty] = useState<"OK" | "+2" | "DNF">("OK");

  // -------------------------------
  // Scramble + settings
  // -------------------------------
  const [scramble, setScramble] = useState(regenerateScramble());
  const [settings, setSettings] = useState<ScrambleSettingsType>({
    length: 20,
    useDoubleMoves: true,
    usePrimeMoves: true,
    excludedMoves: [],
  });

  // -------------------------------
  // Effects
  // -------------------------------
  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => saveSolves(solves), [solves]);

  // --- Inspection countdown ---
  useEffect(() => {
    if (!inspectionActive) return;

    const id = setTimeout(() => {
      setInspectionTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [inspectionTimeLeft, inspectionActive]);

  // --- WCA inspection penalties ---
  useEffect(() => {
    if (!inspectionActive) return;

    if (inspectionTimeLeft === 0) {
      setInspectionPenalty("+2");
    }

    if (inspectionTimeLeft === -2) {
      setInspectionPenalty("DNF");
    }
  }, [inspectionTimeLeft, inspectionActive]);

  // --- Spacebar behavior ---
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      // If timer is running → stop timer
      if (isRunning) {
        stopTimer();
        return;
      }

      // Not running → show READY
      setIsReady(true);
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      // If timer is running → ignore
      if (isRunning) return;

      // Clear READY
      setIsReady(false);

      // Case 1: first press→release → start inspection
      if (!inspectionActive && inspectionTimeLeft === 15) {
        setInspectionActive(true);
        return;
      }

      // Case 2: inspection is running → start real timer
      if (inspectionActive) {
        setInspectionActive(false);
        startTimer();
        return;
      }

      // Fallback: if somehow neither, just start timer
      startTimer();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning, inspectionActive, inspectionTimeLeft]);

  // -------------------------------
  // Timer logic
  // -------------------------------
  const timerRef = useRef<number | null>(null);

  function startTimer() {
    setIsRunning(true);

    const start = performance.now();

    timerRef.current = requestAnimationFrame(function tick(now) {
      setTimeMs(now - start);
      timerRef.current = requestAnimationFrame(tick);
    });
  }

  function stopTimer() {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setIsRunning(false);

    const finalTime = timeMs;
    let final = finalTime;

    if (inspectionPenalty === "+2") {
      final += 2000;
    }

    const solve: Solve = {
      id: crypto.randomUUID(),
      timeMs: finalTime,
      finalTimeMs: final,
      penalty: inspectionPenalty,
      puzzle: "3x3",
      scramble,
      timestamp: Date.now(),
    };

    // Save solve
    setSolves((prev) => [...prev, solve]);

    // Attach to active session
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, solves: [...s.solves, solve.id] }
            : s
        )
      );
    }

    // Reset for next solve
    setInspectionActive(false);
    setInspectionTimeLeft(15);
    setInspectionPenalty("OK");
    setTimeMs(0);
    setScramble(regenerateScramble());
  }

  function handleTap() {
    if (!isRunning) {
      // Mirror keyboard behavior:
      if (!inspectionActive && inspectionTimeLeft === 15) {
        setInspectionActive(true);
      } else if (inspectionActive) {
        setInspectionActive(false);
        startTimer();
      } else {
        startTimer();
      }
    } else {
      stopTimer();
    }
  }

  // -------------------------------
  // Solve handlers
  // -------------------------------
  function handleUpdatePenalty(id: string, penalty: SolvePenalty) {
    setSolves((prev) =>
      prev.map((s) => (s.id === id ? { ...s, penalty } : s))
    );
  }

  function handleDeleteSolve(id: string) {
    setSolves((prev) => prev.filter((s) => s.id !== id));

    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((sess) =>
          sess.id === activeSessionId
            ? { ...sess, solves: sess.solves.filter((sid) => sid !== id) }
            : sess
        )
      );
    }
  }

  // -------------------------------
  // Derived: solves for active session
  // -------------------------------
  const activeSolves =
    activeSessionId &&
    sessions.find((s) => s.id === activeSessionId)?.solves.length
      ? solves.filter((s) =>
          sessions
            .find((sess) => sess.id === activeSessionId)
            ?.solves.includes(s.id)
        )
      : [];

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4">
      <SessionSelector
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onCreate={() => {
          const name = prompt("Session name?");
          if (!name) return;

          const newSession: Session = {
            id: crypto.randomUUID(),
            name,
            solves: [],
          };

          setSessions((prev) => [...prev, newSession]);
          setActiveSessionId(newSession.id);
        }}
      />

      <ScrambleDisplay
        scramble={scramble}
        onRegenerate={() => setScramble(regenerateScramble())}
      />

      <div onClick={handleTap} className="cursor-pointer select-none">
        <TimerDisplay timeMs={timeMs} isRunning={isRunning} isReady={isReady} />
        <InspectionTimer timeLeft={inspectionTimeLeft} />
      </div>

      <div className="border border-gray-700 rounded-lg p-3">
        <ScrambleSettings value={settings} onChange={setSettings} />
      </div>

      <StatsPanel solves={activeSolves} />

      <SolveList
        solves={activeSolves}
        onUpdatePenalty={handleUpdatePenalty}
        onDeleteSolve={handleDeleteSolve}
      />
    </div>
  );
}

// --------------------------------------
// Helper functions (outside component)
// --------------------------------------
const STORAGE_SESSIONS_KEY = "cubeTimer_sessions";
const STORAGE_SOLVES_KEY = "cubeTimer_solves";

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  try {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

function loadSolves(): Solve[] {
  try {
    const raw = localStorage.getItem(STORAGE_SOLVES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSolves(solves: Solve[]) {
  try {
    localStorage.setItem(STORAGE_SOLVES_KEY, JSON.stringify(solves));
  } catch {}
}

function regenerateScramble() {
  const moves = ["R", "L", "U", "D", "F", "B"];
  return Array.from({ length: 20 }, () =>
    moves[Math.floor(Math.random() * moves.length)]
  ).join(" ");
}
