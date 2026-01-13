import { supabase } from "../supabaseClient"

export default function LoginPage() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/wca-callback` }
    })
  }

  const loginWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/wca-callback` }
    })
  }

  const loginWithWca = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "wca",
      options: { redirectTo: `${window.location.origin}/wca-callback` }
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Select login method</h1>

      <button onClick={loginWithGoogle}>Login with Google</button>
      <button onClick={loginWithGithub}>Login with GitHub</button>
      <button onClick={loginWithWca}>Login with WCA</button>
    </div>
  )
}
