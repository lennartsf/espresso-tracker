import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
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

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
