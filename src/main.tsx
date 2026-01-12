import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import  { AppRouter } from "./router"
import "./index.css"   // ← YES, include your CSS here

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
)
