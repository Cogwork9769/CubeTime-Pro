import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import type { Session } from "@supabase/supabase-js"
import TimerPage from "../pages/TimerPage"
import LoginPage from "../pages/LoginPage"

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    load()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <div>Loading…</div>

  return session ? <TimerPage /> : <LoginPage />
}
