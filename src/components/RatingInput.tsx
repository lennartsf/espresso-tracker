import { useTheme } from '../lib/ThemeContext'
import { ratingHex, ratingInk, intensityBadge } from '../utils/ratingColor'

/** Welche Skala die Zahlenreihe meint.
 *
 *  `quality` — gut/schlecht (Flavor, Gesamtbewertung): die rot→grüne
 *  Rating-Rampe, dieselbe wie auf Karten und in den Charts.
 *  `intensity` — stark/schwach (Body, Säure, Bitterness): blass→satt, ohne
 *  Wertung. Eine rote 2 bei „Bitterness" hieße „schlecht", gemeint ist aber
 *  nur „wenig".
 *
 *  Bewusst ein PFLICHT-Prop: die Skalen sehen unterschiedlich aus, aber ein
 *  falsch gewählter Default fiele nirgends auf — er würde nur still das
 *  Falsche behaupten. */
export type RatingScale = 'quality' | 'intensity'

interface Props {
  value: number | null
  onChange: (value: number) => void
  scale: RatingScale
}

export function RatingInput({ value, onChange, scale }: Props) {
  const { theme } = useTheme()

  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
        const selected = value === n
        const style = !selected
          ? undefined
          : scale === 'quality'
            ? { backgroundColor: ratingHex(n), color: ratingInk(n) }
            : intensityBadge(n, theme)

        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={selected}
            style={style}
            className={`flex-1 rounded py-2 text-sm font-semibold transition-colors ${
              selected
                // Der Ring trennt die gewählte Stufe von ihren Nachbarn. Die
                // Füllung allein reicht dafür nicht: sie hält 3:1 gegen die
                // Karte, aber nicht gegen die Fläche der Nachbar-Knöpfe.
                ? 'ring-2 ring-coffee-accent ring-offset-1 ring-offset-coffee-surface'
                : 'bg-coffee-surface2 text-coffee-muted hover:bg-coffee-surface'
            }`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
