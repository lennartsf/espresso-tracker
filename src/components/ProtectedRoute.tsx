import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Layout } from './Layout'
import { ROUTES } from '../lib/routes'

/** Gate for /app/*: render the app shell only when logged in. */
export function ProtectedRoute() {
  const { session, loading } = useAuth()
  if (loading) {
    return <div className="min-h-screen bg-coffee-bg" />
  }
  if (!session) {
    return <Navigate to={ROUTES.login} replace />
  }
  return <Layout />
}
