import "./LoginPage.css"

export default function LoginPage() {
  const redirectTo = `${window.location.origin}/wca-callback`

  const login = (provider: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`
    window.location.href = url
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
