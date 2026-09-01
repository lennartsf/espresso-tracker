import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemePreference } from '../lib/ThemeContext'

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
]

/** Drei-Wege-Schalter: Light · Dark · System.
 *  `radiogroup`, weil genau eine Option gilt — mit drei losen Buttons müsste
 *  ein Screenreader raten, dass sie zusammengehören. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { preference, setPreference } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`flex gap-1 rounded-lg border border-coffee-line p-1 ${compact ? '' : 'w-full'}`}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPreference(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-coffee-accent ${
              active
                ? 'bg-coffee-accent/15 text-coffee-accent-soft'
                : 'text-coffee-muted hover:bg-coffee-surface2 hover:text-coffee-cream'
            }`}
          >
            <Icon size={15} strokeWidth={1.75} />
            {!compact && label}
          </button>
        )
      })}
    </div>
  )
}
