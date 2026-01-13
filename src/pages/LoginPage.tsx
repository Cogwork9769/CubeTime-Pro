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

  const loginWithWca = () => {
    const redirectTo = `${window.location.origin}/wca-callback`
    const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=wca&redirect_to=${encodeURIComponent(redirectTo)}`
    window.location.href = url
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
