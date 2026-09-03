import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'

/**
 * Standbild, das beim Hovern zu laufen beginnt („Live-Bild").
 *
 * **Ohne Videodatei passiert nichts Schlimmes.** Das Bild wird immer gerendert;
 * das Video liegt darüber und blendet erst ein, wenn der Browser meldet, dass
 * es abspielbar ist. Fehlt die Datei oder scheitert das Laden, bleibt es beim
 * Standbild — und der Play-Hinweis erscheint gar nicht erst, statt etwas zu
 * versprechen, was nicht kommt.
 *
 * **Auf dem Telefon gibt es kein Hover.** Dort wäre ein reiner Hover-Auslöser
 * ein Feature, das die Hälfte der Besucher nie sieht. Deshalb: auf Zeigegeräten
 * mit Hover läuft es beim Überfahren, auf Touch startet ein Tippen.
 *
 * **`muted` + `playsInline` sind Pflicht, nicht Geschmack.** Ohne beides
 * verweigern Safari und Chrome das automatische Abspielen, und iOS würde das
 * Video zusätzlich in den Vollbild-Player reißen.
 */
export function HoverVideo({
  poster,
  sources,
  alt,
  className = '',
  style,
}: {
  /** Standbild. Wird immer gezeigt — auch als Poster des Videos. */
  poster: string
  /** Videoquellen, beste zuerst (z. B. webm vor mp4). */
  sources: { src: string; type: string }[]
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [canHover, setCanHover] = useState(true)

  useEffect(() => {
    // `hover: hover` trennt Maus/Trackpad von Touch zuverlässiger als eine
    // Breiten-Abfrage — ein Tablet mit Maus soll den Hover bekommen.
    const mq = window.matchMedia?.('(hover: hover) and (pointer: fine)')
    if (!mq) return
    setCanHover(mq.matches)
    const onChange = () => setCanHover(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const reduced =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  function start() {
    if (!ready || reduced) return
    // `play()` liefert ein Promise, das der Browser ablehnen darf (Autoplay-
    // Regeln, Energiesparmodus). Unbehandelt wäre das ein Konsolenfehler bei
    // jedem Überfahren.
    video.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  function stop() {
    const v = video.current
    if (!v) return
    v.pause()
    // Zurück auf den Anfang, damit das nächste Überfahren wieder von vorn
    // beginnt statt mitten in der Extraktion.
    v.currentTime = 0
    setPlaying(false)
  }

  const interactive = ready && !reduced

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={canHover ? start : undefined}
      onMouseLeave={canHover ? stop : undefined}
      onClick={canHover ? undefined : () => (playing ? stop() : start())}
    >
      <img src={poster} alt={alt} className={className} style={style} />

      <video
        ref={video}
        // `poster` verhindert ein kurzes Schwarz, falls das Video doch einmal
        // vor dem Bild sichtbar wird.
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
        className={`${className} transition-opacity duration-500 ${playing ? 'opacity-100' : 'opacity-0'}`}
        style={style}
      >
        {sources.map(s => <source key={s.src} src={s.src} type={s.type} />)}
      </video>

      {interactive && !playing && (
        <span
          className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
        >
          <Play size={12} fill="currentColor" />
          {canHover ? 'Hover to play' : 'Tap to play'}
        </span>
      )}
    </div>
  )
}
