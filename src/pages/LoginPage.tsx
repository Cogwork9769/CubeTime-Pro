import "./LoginPage.css"
import { supabase } from "../supabaseClient"

export default function LoginPage() {
  const login = async (provider: "google" | "github" | "wca") => {
    await supabase.auth.signInWithOAuth({
      provider,
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
