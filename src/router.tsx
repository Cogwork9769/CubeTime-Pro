import { Routes, Route } from "react-router-dom"
import AuthGate from "./components/AuthGate"
import WcaCallback from "./pages/WcaCallback"

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthGate />} />
      <Route path="/wca-callback" element={<WcaCallback />} />
    </Routes>
  )
}
