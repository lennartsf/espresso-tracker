import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CountUp } from '../../components/CountUp'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  { k: '01', t: 'Live-Druck & Timer', d: 'Pre-Infusion und Extraktion auf die Zehntelsekunde, 9-bar im Blick.' },
  { k: '02', t: 'Ratio & Mahlgrad', d: 'Brew-Ratio automatisch, Mahlgrad-Verlauf über alle Shots.' },
  { k: '03', t: 'Geschmacks-Log', d: 'Bewerte jeden Shot — sieh, welche Einstellung wirklich dialt.' },
]

/**
 * Zweite Sektion unter dem Hero — beweist GSAP ScrollTrigger:
 * Cards + Stats blenden gestaffelt beim Scrollen ein, Zahlen zählen hoch.
 */
export function FeatureTeasers() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) return
    gsap.from('.ft-card', {
      y: 48,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.ft-cards', start: 'top 80%' },
    })
    gsap.from('.ft-stat', {
      y: 28,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.ft-stats', start: 'top 85%' },
    })
  }, { scope: root })

  return (
    <div ref={root} className="border-t border-coffee-line bg-coffee-surface/40">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-xl font-display text-3xl font-semibold text-coffee-cream md:text-4xl">
          Alles zum Eindialen — an einem Ort.
        </h2>

        <div className="ft-cards mt-12 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.k}
              className="ft-card rounded-2xl border border-coffee-line bg-coffee-surface p-7"
            >
              <span className="text-sm font-semibold text-coffee-accent">{f.k}</span>
              <h3 className="mt-3 font-display text-xl font-semibold text-coffee-cream">{f.t}</h3>
              <p className="mt-2 text-sm text-coffee-muted">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="ft-stats mt-16 grid grid-cols-3 gap-5 border-t border-coffee-line pt-10">
          <Stat value={9} unit=" bar" label="Brüh-Druck" />
          <Stat value={25} unit="s" label="Ø Extraktion" />
          <Stat value={100} unit="%" label="nachvollziehbar" />
        </div>
      </section>
    </div>
  )
}

function Stat({ value, unit, label }: { value: number; unit: string; label: string }) {
  return (
    <div className="ft-stat">
      <p className="font-display text-4xl font-semibold text-coffee-accent md:text-5xl">
        <CountUp end={value} />
        {unit}
      </p>
      <p className="mt-1 text-sm text-coffee-muted">{label}</p>
    </div>
  )
}
