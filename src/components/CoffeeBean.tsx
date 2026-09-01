import { useId } from 'react'
import { beanShades, beansToShow, type BeanSpecies } from '../utils/beanColor'

/**
 * Kaffeebohne, aus Röstgrad und Sortenmix gerechnet.
 *
 * **Warum 2D-SVG und nicht three.js:** das Bild erscheint in Listen als 40-px-
 * Thumbnail. Eine 3D-Runtime für ein Thumbnail zu laden, wäre grob
 * unverhältnismäßig. Der plastische Eindruck entsteht stattdessen aus
 * gerichtetem Licht: Radial-Verlauf mit oben-links liegender Lichtquelle,
 * eigener Glanzpunkt, weicher Kernschatten und eine Furche, die als eigene
 * Ebene mit heller Ober- und dunkler Unterkante sitzt.
 *
 * **Zur Laufzeit gerechnet, nicht gespeichert:** damit das Bild nie zum
 * hinterlegten Röstwert driften kann. Preis ist, dass es sich nicht
 * exportieren lässt.
 *
 * Sortenunterschied: Arabica ist länger und schlanker mit geschwungener,
 * S-förmiger Furche; Robusta runder mit gerader Furche. Das ist das echte
 * Unterscheidungsmerkmal, nicht bloß Dekoration.
 */
/** Der Teller, auf dem die Bohne liegt, und ihre Kontur.
 *
 *  **Warum ueberhaupt ein Teller.** Die Bohne lag vorher direkt auf der Karte.
 *  In Dark war die Karte warmes Braun (#25201b) — dieselbe Farbfamilie wie eine
 *  Bohne. Gemessen: eine dunkle Roestung erreicht dort 1.03–1.72:1. Die Bohne
 *  war schlicht nicht zu sehen, und ausgerechnet bei den Roestungen, die am
 *  haeufigsten vorkommen.
 *
 *  Ein dunkleres Theme loest das NICHT: fuer 3:1 gegen eine fast schwarze
 *  Bohne (L=0.011) muesste die Flaeche darunter L>=0.134 haben, also etwa
 *  #696969 — heller als jede Karte, die in einem dunklen Theme sein darf.
 *  Deshalb bekommt die Bohne ihre eigene helle Flaeche, in BEIDEN Themes
 *  gleich. Das ist auch inhaltlich richtig: der Teller vertritt das Produktfoto
 *  und die werden auf hellem Grund aufgenommen.
 *
 *  Die Werte sind literal und NICHT als Token gefuehrt: sie sind Teil des
 *  Motivs, nicht der Oberflaeche, und duerfen beim Theme-Wechsel nicht kippen.
 *  `CoffeeBean.test.tsx` prueft die Kontrastzusage fuer alle zehn Stufen. */
const PLATE_TOP = '#efe8dc'
const PLATE_BTM = '#ded4c2'
/** Kante des Tellers — sonst verschwimmt er in Light mit der Karte. */
const PLATE_EDGE = '#cabda6'
const BEAN_RIM = '#3a2c1e'

function Bean({
  species,
  roastLevel,
  x,
  rotate,
  scale = 1,
}: {
  species: BeanSpecies
  roastLevel: number
  x: number
  rotate: number
  /** Bei zwei Bohnen kleiner, sonst ueberlappen sie sich zu Brei. */
  scale?: number
}) {
  const uid = useId().replace(/:/g, '')
  const { base, light, shade, sheen } = beanShades(roastLevel)

  const arabica = species === 'arabica'
  // Proportionen sind das Sortenmerkmal: Arabica laenglich (Verhaeltnis ~0.68),
  // Robusta gedrungener (~0.84) — aber immer noch eine Bohne, keine Kugel.
  const rx = (arabica ? 25 : 27) * scale
  const ry = (arabica ? 37 : 32) * scale
  // Arabica: geschwungene Furche. Robusta: gerade.
  const bow = 9 * scale
  const crease = arabica
    ? `M ${x} ${50 - ry + 7 * scale} C ${x - bow} ${50 - 12 * scale}, ${x + bow} ${50 + 12 * scale}, ${x} ${50 + ry - 7 * scale}`
    : `M ${x} ${50 - ry + 6 * scale} L ${x} ${50 + ry - 6 * scale}`

  return (
    <g transform={`rotate(${rotate} ${x} 50)`}>
      <defs>
        {/* Lichtquelle oben links — dieselbe für beide Bohnen, sonst wirkt die
            Gruppe wie zwei Aufnahmen aus verschiedenen Räumen. */}
        <radialGradient id={`body-${uid}`} cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={base} />
          <stop offset="100%" stopColor={shade} />
        </radialGradient>
        <radialGradient id={`gloss-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16 + sheen * 0.34} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aufsetzschatten: etwas KLEINER als die Bohne und nach unten rechts
          versetzt. Gleich gross wuerde er als Halo rundum stehen — die Bohne
          saehe aus wie ausgeschnitten, nicht wie aufliegend. */}
      <ellipse
        cx={x + 3 * scale} cy={50 + 5 * scale}
        rx={rx * 0.93} ry={ry * 0.9}
        fill="#000" opacity="0.16"
      />

      <ellipse
        cx={x} cy={50} rx={rx} ry={ry}
        fill={`url(#body-${uid})`}
        // Die Kontur traegt die Silhouette, NICHT die Fuellung. Eine helle
        // Roestung (Stufe 1) erreicht auf dem Teller nur 2.1:1 — zu wenig, um
        // die Form zu erkennen. Die Kontur steht dagegen bei 11:1 gegen den
        // Teller, unabhaengig davon, welche Farbe die Bohne gerade hat. Damit
        // ist jede Roeststufe umrissen, von Zimt bis Italienisch.
        stroke={BEAN_RIM}
        strokeWidth={1.2 * scale}
      />

      {/* Furche: dunkle Rinne mit heller Oberkante darüber — das ist der
          Effekt, der die Bohne gewölbt aussehen lässt. */}
      <path d={crease} fill="none" stroke={shade} strokeWidth={(arabica ? 5 : 6) * scale} strokeLinecap="round" opacity="0.95" />
      <path
        d={crease} fill="none" stroke={light} strokeWidth={1.6 * scale} strokeLinecap="round"
        opacity="0.5" transform={`translate(${-1.6 * scale} ${-1.6 * scale})`}
      />

      {/* Glanzpunkt oben links, Stärke steigt mit dem Ölgehalt. */}
      <ellipse cx={x - rx * 0.34} cy={50 - ry * 0.4} rx={rx * 0.42} ry={ry * 0.3} fill={`url(#gloss-${uid})`} />
    </g>
  )
}

export function CoffeeBean({
  roastLevel,
  arabicaPct,
  robustaPct,
  size = 96,
  className = '',
}: {
  roastLevel: number | null
  arabicaPct: number | null
  robustaPct: number | null
  size?: number
  className?: string
}) {
  const plateId = useId().replace(/:/g, '')
  const species = beansToShow(arabicaPct, robustaPct)
  const level = roastLevel ?? 5
  const two = species.length === 2

  const label = `${species.map(s => (s === 'arabica' ? 'Arabica' : 'Robusta')).join(' and ')} bean, roast level ${level.toFixed(1)} of 10`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`plate-${plateId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PLATE_TOP} />
          <stop offset="100%" stopColor={PLATE_BTM} />
        </linearGradient>
      </defs>
      <rect
        x="0.6" y="0.6" width="98.8" height="98.8" rx="14"
        fill={`url(#plate-${plateId})`}
        stroke={PLATE_EDGE}
        strokeWidth="1.2"
      />

      {two ? (
        <>
          <Bean species={species[0]} roastLevel={level} x={33} rotate={-16} scale={0.68} />
          <Bean species={species[1]} roastLevel={level} x={67} rotate={14} scale={0.68} />
        </>
      ) : (
        <Bean species={species[0]} roastLevel={level} x={50} rotate={-8} />
      )}
    </svg>
  )
}
