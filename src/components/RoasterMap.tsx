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

// Custom orange pin icon (SVG-based, no external image dependency)
const orangePin = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#f97316"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
})

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], map.getZoom()) }, [lat, lng, map])
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
      {center && <RecenterMap lat={center.lat} lng={center.lng} />}
      {mapped.map(r => (
        <Marker key={r.id} position={[r.lat!, r.lng!]} icon={orangePin}>
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
