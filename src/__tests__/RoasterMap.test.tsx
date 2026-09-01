import { render } from '@testing-library/react'
import { vi } from 'vitest'

// react-leaflet braucht ein echtes Layout; im Test reichen Platzhalter, die
// die uebergebenen Props sichtbar machen.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: ({ url }: any) => <div data-testid="tiles" data-url={url} />,
  Marker: ({ icon, children }: any) => (
    <div data-testid="marker" data-html={icon?.options?.html ?? ''}>{children}</div>
  ),
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn(), flyTo: vi.fn(), fitBounds: vi.fn(), getZoom: () => 6 }),
}))

import { RoasterMap } from '../components/RoasterMap'
import { ThemeProvider } from '../lib/ThemeContext'

const roaster = (over = {}) => ({
  id: 'r1', name: 'Five Elephant', address: 'Berlin', lat: 52.5, lng: 13.4,
  website: null, photo_url: null, created_at: '', ...over,
}) as any

const renderMap = (roasters: any[]) =>
  render(<ThemeProvider><RoasterMap roasters={roasters} /></ThemeProvider>)

test('roasters without coordinates are not placed on the map', () => {
  const { queryAllByTestId } = renderMap([
    roaster(),
    roaster({ id: 'r2', lat: null, lng: null }),
  ])
  expect(queryAllByTestId('marker')).toHaveLength(1)
})

test('a roaster with a photo gets it into the pin', () => {
  const { getByTestId } = renderMap([roaster({ photo_url: 'https://example.com/a.jpg' })])
  expect(getByTestId('marker').getAttribute('data-html')).toContain('https://example.com/a.jpg')
})

test('without a photo the pin falls back to the initial', () => {
  const { getByTestId } = renderMap([roaster()])
  const html = getByTestId('marker').getAttribute('data-html')!
  expect(html).toContain('>F<')
  expect(html).not.toContain('<image')
})

test('quotes in a roaster name cannot break out of the pin markup', () => {
  // Namen sind Nutzereingabe. Ohne Escape wuerde ein Anfuehrungszeichen das
  // Attribut sprengen.
  const { getByTestId } = renderMap([roaster({ name: '"><script>x</script>' })])
  const html = getByTestId('marker').getAttribute('data-html')!
  expect(html).not.toContain('<script>')
  expect(html).toContain('&quot;')
})

test('a roaster with an empty name does not crash the pin', () => {
  const { getByTestId } = renderMap([roaster({ name: '' })])
  expect(getByTestId('marker').getAttribute('data-html')).toContain('>?<')
})

test('tiles follow the theme', () => {
  const { getAllByTestId } = renderMap([roaster()])
  // Default ist dark (Paket C1a).
  expect(getAllByTestId('tiles')[0].getAttribute('data-url')).toContain('dark_all')
})
