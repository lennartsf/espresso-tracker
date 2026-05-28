import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { RatingInput } from '../components/RatingInput'

describe('RatingInput', () => {
  test('renders 10 buttons labelled 1–10', () => {
    render(<RatingInput value={null} onChange={() => {}} />)
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument()
    }
  })

  test('calls onChange with the clicked number', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RatingInput value={null} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: '7' }))
    expect(onChange).toHaveBeenCalledWith(7)
  })

  test('highlights the selected button with orange class', () => {
    render(<RatingInput value={5} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '5' })).toHaveClass('bg-orange-500')
    expect(screen.getByRole('button', { name: '3' })).not.toHaveClass('bg-orange-500')
  })
})
