import { Monitor, Moon, Sun } from 'lucide-react'
import { cardClasses, PageHeader } from '../components/ui'
import { NavEditor } from '../components/NavEditor'
import { useNavLayout, useSaveNavLayout } from '../hooks/useDashboardLayout'
import { useTheme, type ThemePreference } from '../lib/ThemeContext'

const OPTIONS: { value: ThemePreference; label: string; hint: string; Icon: typeof Sun }[] = [
  { value: 'light',  label: 'Light',  hint: 'Always the light theme',        Icon: Sun },
  { value: 'dark',   label: 'Dark',   hint: 'Always the dark theme',         Icon: Moon },
  { value: 'system', label: 'System', hint: 'Follow your device setting',    Icon: Monitor },
]

/** Einstellungen der App. Vorerst nur das Theme — die Seite existiert, weil
 *  Leute Einstellungen unter „Settings" suchen und nicht in der Seitenleiste. */
export function SettingsPage() {
  const { preference, theme, setPreference } = useTheme()

  const { data: navLayout = [] } = useNavLayout()
  const saveNav = useSaveNavLayout()

  return (
    <div>
      <PageHeader eyebrow="Preferences" title="Settings" />

      <div className={`${cardClasses} p-4`}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-coffee-muted">
          Appearance
        </p>
        <p className="mb-3 text-sm text-coffee-muted">
          Currently showing the <strong className="text-coffee-cream">{theme}</strong> theme.
        </p>

        <div role="radiogroup" aria-label="Theme" className="grid gap-2">
          {OPTIONS.map(({ value, label, hint, Icon }) => {
            const active = preference === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPreference(value)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent ${
                  active
                    ? 'border-coffee-accent bg-coffee-accent/15'
                    : 'border-coffee-line hover:bg-coffee-surface2'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={1.75}
                  className={active ? 'text-coffee-accent-soft' : 'text-coffee-muted'}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${active ? 'text-coffee-accent-soft' : 'text-coffee-cream'}`}>
                    {label}
                  </span>
                  <span className="block text-xs text-coffee-muted">{hint}</span>
                </span>
                {active && <span className="text-sm text-coffee-accent-soft">✓</span>}
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-coffee-muted">
          The choice is stored on this device — each device can differ.
        </p>
      </div>

      {/* Anders als das Theme wird die Navigation SERVERSEITIG gespeichert:
          Mac und iPhone sollen dieselbe Leiste zeigen. */}
      <div className="mt-4">
        <NavEditor layout={navLayout} onChange={l => saveNav.mutate(l)} />
        <p className="mt-2 text-xs text-coffee-muted">
          Synced across your devices.
          {saveNav.isError && (
            <span className="text-coffee-danger"> Could not save — are you offline?</span>
          )}
        </p>
      </div>
    </div>
  )
}
