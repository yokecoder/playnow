import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import ThemeProvider from "./comps/theme"
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
)
