import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/** Was der User wählt. 'system' folgt der Betriebssystem-Einstellung. */
export type ThemePreference = 'system' | 'light' | 'dark'
/** Was am Ende gerendert wird — 'system' ist hier bereits aufgelöst. */
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'espresso-theme'

/** Paket C1a: Default ist bewusst 'dark', NICHT 'system'.
 *  Solange der Light-Feinschliff (C1b) läuft, soll niemand ungefragt in einem
 *  halbfertigen Light-Theme landen — auch nicht, wenn sein Mac auf Hell steht.
 *  Beim Abschluss von C1b wird der Default auf 'system' gedreht. */
export const DEFAULT_PREFERENCE: ThemePreference = 'dark'

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
    document.documentElement.setAttribute('data-theme', resolved)
  }, [preference])

  // Nur bei 'system' auf OS-Wechsel hören.
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia?.('(prefers-color-scheme: light)')
    if (!mq) return
    const onChange = () => {
      const resolved = systemTheme()
      setTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
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
