import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { NewShot } from './pages/NewShot'
import { ShotHistory } from './pages/ShotHistory'
import { CoffeeManager } from './pages/CoffeeManager'
import { Analysis } from './pages/Analysis'

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
            <Route path="analyse" element={<Analysis />} />
            <Route path="kaffee" element={<CoffeeManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
