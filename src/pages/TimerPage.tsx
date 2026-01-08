import { useState, useEffect, useRef } from "react";
import type { Solve } from "../types/solve";
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
// Timer States
// --------------------------------------
type TimerState =
  | "IDLE"
  | "READY"
  | "INSPECTION"
  | "RUNNING"
  | "LOCKOUT";

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
  const [state, setState] = useState<TimerState>("IDLE");
  const [timeMs, setTimeMs] = useState(0);
  const [inspectionTimeLeft, setInspectionTimeLeft] = useState(15);
  const [inspectionPenalty, setInspectionPenalty] =
    useState<"OK" | "+2" | "DNF">("OK");

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
    if (state !== "INSPECTION") return;

    const id = setTimeout(() => {
      setInspectionTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [inspectionTimeLeft, state]);

  // --- WCA penalties ---
  useEffect(() => {
    if (state !== "INSPECTION") return;

    if (inspectionTimeLeft === 0) setInspectionPenalty("+2");
    if (inspectionTimeLeft === -2) setInspectionPenalty("DNF");
  }, [inspectionTimeLeft, state]);

  // -------------------------------
  // Timer logic
  // -------------------------------
  const timerRef = useRef<number | null>(null);

  function startTimer() {
    setState("RUNNING");

    const start = performance.now();

    timerRef.current = requestAnimationFrame(function tick(now) {
      setTimeMs(now - start);
      timerRef.current = requestAnimationFrame(tick);
    });
  }

  function stopTimer() {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    const raw = timeMs;
    let final = raw;

    if (inspectionPenalty === "+2") final += 2000;

    const solve: Solve = {
      id: crypto.randomUUID(),
      timeMs: raw,
      finalTimeMs: final,
      penalty: inspectionPenalty,
      puzzle: "3x3",
      scramble,
      timestamp: Date.now(),
    };

    // Save solve
    setSolves((prev) => [...prev, solve]);

    // Attach to session
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, solves: [...s.solves, solve.id] }
            : s
        )
      );
    }

    // Reset
    setState("LOCKOUT");
    setTimeMs(0);
    setInspectionTimeLeft(15);
    setInspectionPenalty("OK");
    setScramble(regenerateScramble());

    // Prevent accidental re-trigger
    setTimeout(() => setState("IDLE"), 150);
  }

  // -------------------------------
  // Key handling
  // -------------------------------
  useEffect(() => {
   function handleKeyDown(e: KeyboardEvent) {
  if (e.code !== "Space") return;
  e.preventDefault();

  if (state === "RUNNING") {
    stopTimer();
    return;
  }

  // IDLE → READY
  if (state === "IDLE") {
    setState("READY");
    return;
  }

  // INSPECTION → show READY but DO NOT leave INSPECTION
  if (state === "INSPECTION") {
    setState("READY");

    // Immediately restore INSPECTION so countdown continues
    requestAnimationFrame(() => {
      setState("INSPECTION");
    });

    return;
  }
}

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (state === "LOCKOUT") return;

      if (state === "READY") {
        // READY → INSPECTION
       if (inspectionTimeLeft === 15) {
          setState("INSPECTION");
          return;
        }

        // READY → RUNNING (skip inspection)
        if (state === "READY" && inspectionTimeLeft < 15) {
          setState("IDLE");
          startTimer();
          return;
        }
      }

      if (state === "INSPECTION") {
        // Release during inspection → start timer
        setState("IDLE");
        startTimer();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state, inspectionTimeLeft]);

  // -------------------------------
  // Tap handling (mobile)
  // -------------------------------
  function handleTap() {
    if (state === "RUNNING") {
      stopTimer();
      return;
    }

    if (state === "IDLE") {
      setState("INSPECTION");
      return;
    }

    if (state === "INSPECTION") {
      startTimer();
      return;
    }
  }

  // -------------------------------
  // Derived solves
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
       <TimerDisplay
  timeMs={timeMs}
  isRunning={state === "RUNNING"}
  isReady={state === "READY"}
/>

        <InspectionTimer timeLeft={inspectionTimeLeft} />
      </div>

      <div className="border border-gray-700 rounded-lg p-3">
        <ScrambleSettings value={settings} onChange={setSettings} />
      </div>

      <StatsPanel solves={activeSolves} />

      <SolveList
        solves={activeSolves}
        onUpdatePenalty={(id, p) =>
          setSolves((prev) =>
            prev.map((s) => (s.id === id ? { ...s, penalty: p } : s))
          )
        }
        onDeleteSolve={(id) => {
          setSolves((prev) => prev.filter((s) => s.id !== id));
          if (activeSessionId) {
            setSessions((prev) =>
              prev.map((sess) =>
                sess.id === activeSessionId
                  ? {
                      ...sess,
                      solves: sess.solves.filter((sid) => sid !== id),
                    }
                  : sess
              )
            );
          }
        }}
      />
    </div>
  );
}

// --------------------------------------
// Helpers
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



