import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/fraunces/index.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import '../index.css'
import { ThemeProvider } from '../lib/ThemeContext'
import { ThemePreview } from './ThemePreview'

// Theme aus ?theme=light|dark, damit der Screenshot-Runner beide Seiten
// nacheinander laden kann.
const params = new URLSearchParams(location.search)
const theme = params.get('theme') === 'light' ? 'light' : 'dark'

// Ueber localStorage steuern statt data-theme direkt zu setzen: der
// ThemeProvider stempelt beim Mount ohnehin neu und wuerde ein direkt
// gesetztes Attribut sofort ueberschreiben.
localStorage.setItem('espresso-theme', theme)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemePreview theme={theme} />
    </ThemeProvider>
  </React.StrictMode>,
)
