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

type TimerState = "IDLE" | "INSPECTION" | "RUNNING" | "LOCKOUT";

export default function TimerPage() {
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [solves, setSolves] = useState<Solve[]>(loadSolves);

  const [state, setState] = useState<TimerState>("IDLE");
  const [timeMs, setTimeMs] = useState(0);

  const [isReady, setIsReady] = useState(false);

  const [inspectionTimeLeft, setInspectionTimeLeft] = useState(15);
  const [inspectionPenalty, setInspectionPenalty] =
    useState<"OK" | "+2" | "DNF">("OK");

  const [scramble, setScramble] = useState(regenerateScramble());
  const [settings, setSettings] = useState<ScrambleSettingsType>({
    length: 20,
    useDoubleMoves: true,
    usePrimeMoves: true,
    excludedMoves: [],
  });

  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => saveSolves(solves), [solves]);

  // Timer refs
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const runningRef = useRef(false);

  // --------------------------------------
  // Inspection countdown
  // --------------------------------------
  useEffect(() => {
    if (state !== "INSPECTION") return;

    const id = setTimeout(() => {
      setInspectionTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [inspectionTimeLeft, state]);

  useEffect(() => {
    if (state !== "INSPECTION") return;

    if (inspectionTimeLeft === 0) setInspectionPenalty("+2");
    if (inspectionTimeLeft === -2) setInspectionPenalty("DNF");
  }, [inspectionTimeLeft, state]);

  // --------------------------------------
  // Timer logic (correct, stable)
  // --------------------------------------
  function startTimer() {
    runningRef.current = true;
    startTimeRef.current = performance.now();
    setState("RUNNING");

    function tick(now: number) {
      if (!runningRef.current) return;
      setTimeMs(now - startTimeRef.current);
      timerRef.current = requestAnimationFrame(tick);
    }

    timerRef.current = requestAnimationFrame(tick);
  }

  function stopTimer() {
    runningRef.current = false;
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    // Compute final time directly (never trust stale state)
    const raw = performance.now() - startTimeRef.current;
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

    setSolves((prev) => [...prev, solve]);

    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, solves: [...s.solves, solve.id] }
            : s
        )
      );
    }

    setState("LOCKOUT");
    setInspectionTimeLeft(15);
    setInspectionPenalty("OK");
    setScramble(regenerateScramble());
    setIsReady(false);

    setTimeout(() => setState("IDLE"), 150);
  }

  // --------------------------------------
  // Key handling
  // --------------------------------------
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      if (state === "RUNNING") {
        stopTimer();
        return;
      }

      setIsReady(true);
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();

      setIsReady(false);

      if (state === "LOCKOUT") return;

      if (state === "IDLE") {
        setTimeMs(0); // csTimer reset
        setInspectionTimeLeft(15);
        setInspectionPenalty("OK");
        setState("INSPECTION");
        return;
      }

      if (state === "INSPECTION") {
        startTimer();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state]);

  // --------------------------------------
  // Tap handling (mobile)
  // --------------------------------------
  function handleTap() {
    if (state === "RUNNING") {
      stopTimer();
      return;
    }

    if (state === "IDLE") {
      setTimeMs(0);
      setInspectionTimeLeft(15);
      setInspectionPenalty("OK");
      setState("INSPECTION");
      return;
    }

    if (state === "INSPECTION") {
      startTimer();
      return;
    }
  }

  // --------------------------------------
  // Active solves
  // --------------------------------------
  const activeSolves = activeSessionId
    ? solves.filter((s) =>
        sessions
          .find((sess) => sess.id === activeSessionId)
          ?.solves.includes(s.id)
      )
    : solves;

  // --------------------------------------
  // JSX
  // --------------------------------------
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
          isReady={isReady}
        />
        <InspectionTimer
          timeLeft={inspectionTimeLeft}
          penalty={inspectionPenalty}
        />
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
    const raw = local.localStorage.getItem(STORAGE_SESSIONS_KEY);
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
