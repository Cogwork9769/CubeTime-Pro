// --------------------------------------
// Imports
// --------------------------------------
import { useState, useEffect } from "react";
import type { Solve, SolvePenalty } from "../types/solve";
import type { Session } from "../types/session";

import ScrambleDisplay from "../components/timer/ScrambleDisplay";
import TimerDisplay from "../components/timer/TimerDisplay";
import InspectionTimer from "../components/timer/InspectionTimer";
import ScrambleSettings from "../components/timer/ScrambleSettings";
import StatsPanel from "../components/timer/StatsPanel";
import SolveList from "../components/timer/SolveList";
import SessionSelector from "../components/timer/SessionSelector";


// --------------------------------------
// Component
// --------------------------------------
export default function TimerPage() {

  // -------------------------------
  // Session state (MUST be first)
  // -------------------------------
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // -------------------------------
  // Timer + solve state
  // -------------------------------
  const [solves, setSolves] = useState<Solve[]>(loadSolves);
  const [settings, setSettings] = useState({ /* your settings */ });

  // -------------------------------
  // Effects
  // -------------------------------
  useEffect(() => saveSessions(sessions), [sessions]);
  useEffect(() => saveSolves(solves), [solves]);

  // -------------------------------
  // Handlers
  // -------------------------------
  function handleUpdatePenalty(id: string, penalty: SolvePenalty) {
    setSolves(prev =>
      prev.map(s => s.id === id ? { ...s, penalty } : s)
    );
  }

  function handleDeleteSolve(id: string) {
    setSolves(prev => prev.filter(s => s.id !== id));

    // also remove from session
    if (activeSessionId) {
      setSessions(prev =>
        prev.map(sess =>
          sess.id === activeSessionId
            ? { ...sess, solves: sess.solves.filter(sid => sid !== id) }
            : sess
        )
      );
    }
  }

  // -------------------------------
  // Derived values
  // -------------------------------
  const activeSolves = activeSessionId
    ? solves.filter(s =>
        sessions
          .find(sess => sess.id === activeSessionId)
          ?.solves.includes(s.id)
      )
    : [];

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="min-h-screen bg-black text-white p-4">

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
            solves: []
          };

          setSessions(prev => [...prev, newSession]);
          setActiveSessionId(newSession.id);
        }}
      />

      <ScrambleDisplay scramble={scramble} onRegenerate={regenerateScramble} />

      <div onClick={handleTap} className="cursor-pointer select-none">
        <TimerDisplay timeMs={timeMs} isRunning={isRunning} isReady={isReady} />
        <InspectionTimer timeLeft={inspectionTimeLeft} />
      </div>

      <div className="mt-4 border border-gray-700 rounded-lg p-3">
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
// Helper functions (OUTSIDE component)
// --------------------------------------
const STORAGE_SESSIONS_KEY = "cubeTimer_sessions";

function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
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
  // your existing logic
}

function saveSolves(solves: Solve[]) {
  // your existing logic
}

function regenerateScramble() {
  // your existing logic
}

function handleTap() {
  // your existing logic
}

