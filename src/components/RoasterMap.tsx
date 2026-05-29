import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Roaster } from '../types'

// Fix Leaflet default marker icons broken by Vite's asset handling
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <RecenterMap lat={center.lat} lng={center.lng} />}
      {mapped.map(r => (
        <Marker key={r.id} position={[r.lat!, r.lng!]}>
          <Popup>
            <div className="text-sm">
              <strong>{r.name}</strong>
              {r.address && <p className="text-xs text-slate-500 mt-0.5">{r.address}</p>}
              {r.website && (
                <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-500 mt-0.5 block">
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
