import { render, screen } from '@testing-library/react'
import { TargetGhost } from '../components/TargetGhost'

test('nothing renders without a target', () => {
  const { container } = render(<TargetGhost target={null} unit="g" />)
  expect(container).toBeEmptyDOMElement()
})

test('the target is shown even before anything is measured', () => {
  render(<TargetGhost target={36} unit="g" decimals={1} />)
  expect(screen.getByText('36.0 g')).toBeInTheDocument()
})

test('an exact hit shows no delta', () => {
  render(<TargetGhost target={36} actual={36} unit="g" decimals={1} />)
  expect(screen.queryByText(/[+−]/)).not.toBeInTheDocument()
})

test('overshooting shows a plus, undershooting a minus', () => {
  const { unmount } = render(<TargetGhost target={36} actual={38} unit="g" decimals={1} />)
  expect(screen.getByText('(+2.0)')).toBeInTheDocument()
  unmount()
  render(<TargetGhost target={36} actual={34.5} unit="g" decimals={1} />)
  expect(screen.getByText('(−1.5)')).toBeInTheDocument()
})

test('noise below the tolerance is not reported as a deviation', () => {
  render(<TargetGhost target={36} actual={36.01} unit="g" decimals={1} />)
  expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
})

test('an empty field (NaN) shows the target without a delta', () => {
  // parseFloat('') ist NaN — daraus darf kein "(NaN)" werden.
  render(<TargetGhost target={18} actual={NaN} unit="g" decimals={1} />)
  expect(screen.getByText('18.0 g')).toBeInTheDocument()
  expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
})

test('the target value is never written into a field — it is only text', () => {
  const { container } = render(<TargetGhost target={36} actual={30} unit="g" />)
  // Kein input/kein value: der Ghost ist Anzeige, keine Vorbelegung. Das ist
  // die ganze Idee von Paket B.
  expect(container.querySelector('input')).toBeNull()
})
