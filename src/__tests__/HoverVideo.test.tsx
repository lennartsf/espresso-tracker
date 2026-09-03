import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { HoverVideo } from '../marketing/components/HoverVideo'

const SOURCES = [{ src: '/hero.mp4', type: 'video/mp4' }]

/** matchMedia so stellen, dass Hover (Maus) bzw. kein Hover (Touch) gilt. */
function mockPointer({ hover, reduced = false }: { hover: boolean; reduced?: boolean }) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('prefers-reduced-motion') ? reduced : hover,
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }))
}

function renderVideo() {
  const r = render(
    <HoverVideo poster="/poster.jpg" sources={SOURCES} alt="Extraction" className="art" />,
  )
  return { ...r, video: document.querySelector('video')! }
}

beforeEach(() => {
  mockPointer({ hover: true })
  // jsdom implementiert play/pause nicht.
  HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve())
  HTMLMediaElement.prototype.pause = vi.fn()
})

test('the still image is always there, video or not', () => {
  renderVideo()
  expect(screen.getByAltText('Extraction')).toHaveAttribute('src', '/poster.jpg')
})

test('no play hint before the video can actually play', () => {
  // Sonst verspricht die Seite etwas, das nie kommt.
  renderVideo()
  expect(screen.queryByText(/to play/)).not.toBeInTheDocument()
})

test('hovering starts the video once it is ready', async () => {
  const user = userEvent.setup()
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  await user.hover(screen.getByAltText('Extraction'))
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
})

test('leaving rewinds, so the next hover starts from the beginning', async () => {
  const user = userEvent.setup()
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  await user.hover(screen.getByAltText('Extraction'))
  video.currentTime = 3
  await user.unhover(screen.getByAltText('Extraction'))
  expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  expect(video.currentTime).toBe(0)
})

test('a failed load leaves the still image and offers nothing', () => {
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  video.dispatchEvent(new Event('error'))
  expect(screen.queryByText(/to play/)).not.toBeInTheDocument()
})

test('on touch it says tap, not hover', async () => {
  mockPointer({ hover: false })
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  // `findBy*`, weil der State-Wechsel aus dem Event erst geflusht werden muss.
  expect(await screen.findByText('Tap to play')).toBeInTheDocument()
})

test('on a pointer device it says hover', async () => {
  mockPointer({ hover: true })
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  expect(await screen.findByText('Hover to play')).toBeInTheDocument()
})

test('tapping starts it where hovering would not', async () => {
  mockPointer({ hover: false })
  const user = userEvent.setup()
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  await screen.findByText('Tap to play')
  // Ohne diesen Zweig waere das Feature auf dem Telefon unerreichbar.
  await user.click(screen.getByAltText('Extraction'))
  expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()
})

test('reduced motion means it never plays by itself', async () => {
  // Ein Video, das beim Ueberfahren losspringt, ist genau das, was diese
  // Einstellung verhindern soll.
  mockPointer({ hover: true, reduced: true })
  const user = userEvent.setup()
  const { video } = renderVideo()
  video.dispatchEvent(new Event('canplay'))
  await user.hover(screen.getByAltText('Extraction'))
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled()
})

test('the video is muted and inline — browsers block autoplay otherwise', () => {
  const { video } = renderVideo()
  expect(video.muted).toBe(true)
  expect(video).toHaveAttribute('playsinline')
})
