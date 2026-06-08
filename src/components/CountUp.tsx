import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface CountUpProps {
  /** Zielwert. NaN/Infinity wird als „—“ gerendert. */
  end: number
  decimals?: number
  duration?: number
}

/**
 * Zählt beim Mount (und bei Wertänderung) von 0 auf `end` hoch — GSAP-getrieben.
 * Respektiert prefers-reduced-motion und zeigt „—“ für nicht-endliche Werte.
 */
export function CountUp({ end, decimals = 0, duration = 1.1 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el) return

    if (!Number.isFinite(end)) {
      el.textContent = '—'
      return
    }

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) {
      el.textContent = end.toFixed(decimals)
      return
    }

    const obj = { v: 0 }
    gsap.to(obj, {
      v: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = obj.v.toFixed(decimals)
      },
    })
  }, { dependencies: [end, decimals] })

  return <span ref={ref}>{Number.isFinite(end) ? (0).toFixed(decimals) : '—'}</span>
}
