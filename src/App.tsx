import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MarketingLayout } from './marketing/MarketingLayout'
import { Landing } from './marketing/Landing'
import { Try } from './marketing/Try'
import { Login } from './marketing/auth/Login'
import { Signup } from './marketing/auth/Signup'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { NewShot } from './pages/NewShot'
import { ShotHistory } from './pages/ShotHistory'
import { CoffeeManager } from './pages/CoffeeManager'
import { Analysis } from './pages/Analysis'
import { Roasters } from './pages/Roasters'
import { ShotDetail } from './pages/ShotDetail'
import { Equipment } from './pages/Equipment'
import { Brews } from './pages/Brews'
import { NewBrew } from './pages/NewBrew'
import { BrewDetail } from './pages/BrewDetail'
import { Guide } from './pages/Guide'
import { GuideDetail } from './pages/GuideDetail'
import { Glossary } from './pages/Glossary'
import { Animate } from './pages/Animate'
import { AnimateDetail } from './pages/AnimateDetail'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Öffentliche Website (Dark Premium) */}
          <Route element={<MarketingLayout />}>
            <Route index element={<Landing />} />
            <Route path="try" element={<Try />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          {/* App (Tracker) — alles unter /app/*, hinter Login */}
          <Route path="app" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="shots" element={<ShotHistory />} />
            <Route path="shots/new" element={<NewShot />} />
            <Route path="shots/:id" element={<ShotDetail />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="coffees" element={<CoffeeManager />} />
            <Route path="roasters" element={<Roasters />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="brews" element={<Brews />} />
            <Route path="brews/new" element={<NewBrew />} />
            <Route path="brews/:id" element={<BrewDetail />} />
            <Route path="guide" element={<Guide />} />
            <Route path="guide/:id" element={<GuideDetail />} />
            <Route path="glossary" element={<Glossary />} />
            <Route path="animate" element={<Animate />} />
            <Route path="animate/:id" element={<AnimateDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
