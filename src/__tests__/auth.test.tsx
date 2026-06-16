import { test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getCurrentUserId, setCurrentUserId } from '../lib/auth'
import { AuthProvider } from '../lib/AuthContext'
import { ProtectedRoute } from '../components/ProtectedRoute'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}))

beforeEach(() => setCurrentUserId(null))

test('getCurrentUserId reflects the last set id', () => {
  expect(getCurrentUserId()).toBeNull()
  setCurrentUserId('user-123')
  expect(getCurrentUserId()).toBe('user-123')
  setCurrentUserId(null)
  expect(getCurrentUserId()).toBeNull()
})

test('logged-out user hitting /app is redirected to /login', async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/app']}>
          <Routes>
            <Route path="/app" element={<ProtectedRoute />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
  await waitFor(() => expect(screen.getByText('Login Page')).toBeInTheDocument())
})
