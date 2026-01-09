import { useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function WcaCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      const code = new URLSearchParams(window.location.search).get('code')

      if (!code) return

      const { error } = await supabase.auth.exchangeCodeForSession({ code })

      if (!error) navigate('/')
    }

    run()
  }, [navigate])

  return <div>Signing you in…</div>
}
