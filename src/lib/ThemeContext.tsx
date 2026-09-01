import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/** Was der User wählt. 'system' folgt der Betriebssystem-Einstellung. */
export type ThemePreference = 'system' | 'light' | 'dark'
/** Was am Ende gerendert wird — 'system' ist hier bereits aufgelöst. */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'espresso-theme'

/** Default ist 'light' (2026-09-01) — für App UND Marketing-Website.
 *
 *  Der Weg dahin: erst bewusst 'dark' (solange der Light-Feinschliff lief),
 *  dann kurz 'system'. 'system' klingt zwar am höflichsten, hat aber einen
 *  Haken: die Seite sieht bei jedem Besucher anders aus, je nachdem, wie sein
 *  Gerät eingestellt ist — für eine öffentliche Website heißt das, dass der
 *  erste Eindruck nicht mehr festgelegt ist. Ein fester Default legt ihn fest.
 *
 *  Das ist ausdrücklich nur der ANFANGSWERT. Wer in den Einstellungen Dark oder
 *  System wählt, überschreibt ihn; die Wahl liegt in localStorage und wird beim
 *  nächsten Start wieder gelesen. */
export const DEFAULT_PREFERENCE: ThemePreference = 'light'

function readStored(): ThemePreference {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // Private Mode / blockierte Site-Daten: Default statt Absturz.
  }
  return DEFAULT_PREFERENCE
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? systemTheme() : pref
}

/** Hintergrundfarbe der Statusleiste je Theme — muss zu `--coffee-bg` passen.
 *  Literale Werte, weil `<meta>` kein CSS aufloest. */
const THEME_COLOR: Record<ResolvedTheme, string> = { dark: '#171412', light: '#e6ddcf' }

/** Stempelt das aufgeloeste Theme an `<html>` und zieht die Statusleiste mit.
 *  Beides gehoert zusammen: ohne den zweiten Teil hat die iOS-PWA im Light-
 *  Theme einen schwarzen Balken ueber der hellen Seite. */
function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved])
}

interface ThemeValue {
  preference: ThemePreference
  theme: ResolvedTheme
  setPreference: (p: ThemePreference) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStored)
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(readStored()))

  // `data-theme` wird IMMER gesetzt — nie ein ungestempelter Zustand. Dadurch
  // braucht das CSS nur Attribut-Selektoren und keinen Media-Query-Zweig.
  useEffect(() => {
    const resolved = resolveTheme(preference)
    setTheme(resolved)
    applyTheme(resolved)
  }, [preference])

  // Nur bei 'system' auf OS-Wechsel hören.
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia?.('(prefers-color-scheme: light)')
    if (!mq) return
    const onChange = () => {
      const resolved = systemTheme()
      setTheme(resolved)
      applyTheme(resolved)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  function setPreference(p: ThemePreference) {
    setPreferenceState(p)
    try {
      localStorage.setItem(STORAGE_KEY, p)
    } catch {
      // Nicht speicherbar? Die Wahl gilt trotzdem für diese Sitzung.
    }
  }

  return (
    <ThemeContext.Provider value={{ preference, theme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
