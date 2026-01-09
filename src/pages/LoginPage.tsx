import { useState } from 'react'
import { supabase } from '../supabaseClient'

const WCA_AUTH_URL = `https://www.worldcubeassociation.org/oauth/authorize?client_id=${
  import.meta.env.VITE_WCA_CLIENT_ID
}&redirect_uri=${encodeURIComponent(import.meta.env.VITE_WCA_REDIRECT_URL)}&response_type=code&scope=public`

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const loginWithEmail = async () => {
    await supabase.auth.signInWithPassword({ email, password })
  }

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const loginWithGithub = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  const loginWithWca = () => {
    window.location.href = WCA_AUTH_URL
  }

  return (
    <div>
      <h1>Login</h1>

      {/* Email login */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={loginWithEmail}>Sign in with Email</button>

      {/* OAuth providers */}
      <button onClick={loginWithGoogle}>Sign in with Google</button>
      <button onClick={loginWithGithub}>Sign in with GitHub</button>
      <button onClick={loginWithWca}>Sign in with WCA</button>
    </div>
  )
}
