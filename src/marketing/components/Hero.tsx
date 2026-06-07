import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ROUTES } from '../../lib/routes'
import heroImg from '../../assets/hero-extraction.jpg'

gsap.registerPlugin(ScrollTrigger)

const HEADLINE = ['Dial', 'in', 'the', 'perfect', 'shot.']

/**
 * Marketing-Hero (Referenz-Screen Phase 0). Dark Premium + GSAP-Mount-Reveal.
 * Bild-Slot ist Platzhalter — echtes Bild liefert der User in Phase 1.
 */
export function Hero() {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) return
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.6 })
      .from('.hero-word', { y: 64, opacity: 0, duration: 1, stagger: 0.08 }, '-=0.2')
      .from(['.hero-sub', '.hero-cta'], { y: 22, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.6')
      .from('.hero-art', { scale: 0.94, opacity: 0, duration: 1.1 }, '-=0.9')

    // Parallax: Foto scrollt langsamer (scrub) → Tiefe
    gsap.to('.hero-img', {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
    })
  }, { scope: root })

  return (
    <section ref={root} className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
      {/* Ambient-Glow hinter dem Text */}
      <div
        className="pointer-events-none absolute -left-32 top-4 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(201,163,94,0.22), transparent 70%)' }}
      />
      <div className="relative">
        <p className="hero-eyebrow text-xs font-semibold uppercase tracking-[0.18em] text-coffee-accent">
          Rancilio Silvia · Shot Tracker
        </p>
        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-coffee-cream md:text-7xl">
          {HEADLINE.map((w, i) => (
            <span key={i} className="hero-word mr-[0.25em] inline-block">
              {w}
            </span>
          ))}
        </h1>
        <p className="hero-sub mt-7 max-w-md text-lg text-coffee-muted">
          Mahlgrad, Druck, Ratio und Geschmack — präzise erfasst und analysiert.
          Dial dich ein wie ein Barista.
        </p>
        <div className="hero-cta mt-9 flex flex-wrap gap-3">
          <Link
            to={ROUTES.signup}
            className="rounded-full bg-coffee-accent px-6 py-3 font-semibold text-coffee-bg transition hover:bg-coffee-accent-soft"
          >
            Kostenlos starten →
          </Link>
          <Link
            to={ROUTES.try}
            className="rounded-full border border-coffee-line px-6 py-3 font-semibold text-coffee-cream transition hover:bg-coffee-surface"
          >
            Erst ausprobieren
          </Link>
        </div>
      </div>

      {/* Hero-Foto: Bottomless-Extraktion */}
      <div className="hero-art">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-coffee-line bg-coffee-surface shadow-2xl shadow-black/40">
          <img
            src={heroImg}
            alt="Bottomless-Portafilter — Espresso-Extraktion in Gold gegen dunklen Hintergrund"
            className="hero-img absolute left-0 h-[124%] w-full object-cover"
            style={{ top: '-12%' }}
          />
          {/* Gold-Glow oben + Vignette unten → Tiefe & Badge-Lesbarkeit */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(120% 70% at 72% 6%, rgba(201,163,94,0.28), transparent 55%)' }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(28,23,20,0.6), transparent 45%)' }}
          />
          <div className="absolute bottom-4 left-4 rounded-full border border-coffee-line bg-coffee-bg/70 px-3 py-1.5 text-xs font-medium text-coffee-cream backdrop-blur">
            Bottomless · 9&nbsp;bar Extraktion
          </div>
        </div>
      </div>
    </section>
  )
}
