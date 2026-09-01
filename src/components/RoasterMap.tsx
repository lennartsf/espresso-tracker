import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../lib/ThemeContext'
import type { Roaster } from '../types'

/** CartoDB-Kachelsätze. Der Pin bleibt in beiden Themes orange — er ist
 *  Funktionsfarbe (Standort), keine Dekoration. */
const TILES = {
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
} as const

/** Hält beim Theme-Wechsel den ALTEN Kachelsatz sichtbar, bis der neue geladen
 *  hat. Ohne das blitzt kurz der leere Kartenhintergrund durch, weil Leaflet
 *  beim URL-Wechsel alle Kacheln neu anfordert. */
function ThemedTiles({ theme }: { theme: 'light' | 'dark' }) {
  const [previous, setPrevious] = useState<'light' | 'dark' | null>(null)
  const [shown, setShown] = useState(theme)

  useEffect(() => {
    if (theme === shown) return
    setPrevious(shown)
    setShown(theme)
  }, [theme, shown])

  return (
    <>
      {previous && previous !== shown && (
        <TileLayer key={previous} url={TILES[previous]} />
      )}
      <TileLayer
        key={shown}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={TILES[shown]}
        eventHandlers={{ load: () => setPrevious(null) }}
      />
    </>
  )
}

/** HTML-Escape fuer Werte, die in das divIcon-Markup wandern.
 *  Roesternamen kommen aus Nutzereingaben; ohne Escape wuerde ein Name mit
 *  Anfuehrungszeichen das Attribut sprengen. */
function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** Pin mit dem Foto der Rösterei, wenn es eins gibt — sonst der Anfangs-
 *  buchstabe. Bei mehreren Röstereien auf einer Karte sind uniforme Punkte
 *  nicht zuzuordnen; das Foto macht sie auf einen Blick unterscheidbar.
 *  Die Pin-Farbe bleibt orange: sie ist Funktionsfarbe (Standort) und in
 *  beiden Themes dieselbe. */
function roasterPin(r: Roaster): L.DivIcon {
  const inner = r.photo_url
    ? `<image href="${esc(r.photo_url)}" x="5" y="5" width="18" height="18"
              clip-path="circle(9px at 9px 9px)" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="14" y="18" text-anchor="middle" font-size="11" font-weight="700"
             font-family="system-ui, sans-serif" fill="#f97316">${esc((r.name[0] ?? '?').toUpperCase())}</text>`

  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#f97316"/>
      <circle cx="14" cy="14" r="9.5" fill="white"/>
      ${inner}
    </svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38],
  })
}

/** Sanfter Flug statt Sprung: beim Auswählen einer Rösterei soll erkennbar
 *  bleiben, WOHIN die Karte sich bewegt. `prefers-reduced-motion` schaltet
 *  auf den harten Sprung zurück. */
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) map.setView([lat, lng], map.getZoom())
    else map.flyTo([lat, lng], map.getZoom(), { duration: 0.7 })
  }, [lat, lng, map])
  return null
}

/** Zoomt so, dass ALLE Pins ins Bild passen. Der feste Zoom 6 zeigte je nach
 *  Verteilung entweder halb Europa oder schnitt Röstereien ab. */
function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length < 2) return
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 })
    // Nur auf die Punkte reagieren, nicht auf jede Karteninteraktion — sonst
    // springt die Ansicht zurück, sobald der User selbst gezoomt hat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), map])
  return null
}

interface Props {
  roasters: Roaster[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
}

export function RoasterMap({ roasters, center, zoom = 12, height = '220px' }: Props) {
  const { theme } = useTheme()
  const mapped = roasters.filter(r => r.lat !== null && r.lng !== null)

  const defaultCenter = center
    ?? (mapped.length > 0
      ? { lat: mapped[0].lat!, lng: mapped[0].lng! }
      : { lat: 48.5, lng: 9.0 })

  return (
    <MapContainer
      center={[defaultCenter.lat, defaultCenter.lng]}
      zoom={mapped.length === 1 ? zoom : 6}
      style={{ height, width: '100%', borderRadius: '8px', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <ThemedTiles theme={theme} />
      {!center && mapped.length > 1 && (
        <FitToMarkers points={mapped.map(r => [r.lat!, r.lng!] as [number, number])} />
      )}
      {center && <RecenterMap lat={center.lat} lng={center.lng} />}
      {mapped.map(r => (
        <Marker key={r.id} position={[r.lat!, r.lng!]} icon={roasterPin(r)}>
          <Popup>
            <div className="text-sm">
              <strong>{r.name}</strong>
              {r.address && <p className="text-xs text-coffee-muted mt-0.5">{r.address}</p>}
              {r.website && (
                <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-xs text-coffee-accent mt-0.5 block">
                  Website ↗
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
