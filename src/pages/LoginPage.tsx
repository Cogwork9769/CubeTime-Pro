import "./LoginPage.css"
import { supabase } from "../supabaseClient"

export default function LoginPage() {
  const login = async (provider: "google" | "github" | "wca") => {
    if (provider === "wca") {
      // WCA is not a typed provider, so we manually redirect
      const redirectTo = `${window.location.origin}/auth/v1/callback`
      const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=wca&redirect_to=${encodeURIComponent(redirectTo)}`
      window.location.href = url
      return
    }

    // Google + GitHub use the typed OAuth flow
    await supabase.auth.signInWithOAuth({
      provider, // TS is happy because provider is now narrowed
      options: {
        redirectTo: `${window.location.origin}/auth/v1/callback`
      }
    })
  }

  return (
    <div className="login-container">
      <h1>Select login method</h1>
      <div className="login-buttons">
        <button onClick={() => login("google")}>Login with Google</button>
        <button onClick={() => login("github")}>Login with GitHub</button>
        <button onClick={() => login("wca")}>Login with WCA</button>
      </div>
    </div>
  )
}
