import { render, screen } from '@testing-library/react'
import { PhotoUpload } from '../components/PhotoUpload'
import { vi } from 'vitest'

vi.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
      }),
    },
  },
}))

test('zeigt Initialen-Placeholder ohne Foto', () => {
  render(
    <PhotoUpload bucket="coffee-photos" value={null} onChange={vi.fn()} name="Ethiopia" />
  )
  expect(screen.getByText('E')).toBeInTheDocument()
})

test('zeigt Bild wenn value vorhanden', () => {
  render(
    <PhotoUpload bucket="coffee-photos" value="https://example.com/photo.jpg" onChange={vi.fn()} name="Ethiopia" />
  )
  const img = screen.getByRole('img')
  expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
})

test('zeigt Coffee-Icon-Placeholder wenn kein Name angegeben', () => {
  const { container } = render(
    <PhotoUpload bucket="coffee-photos" value={null} onChange={vi.fn()} />
  )
  expect(container.querySelector('svg.lucide-coffee')).toBeTruthy()
})
